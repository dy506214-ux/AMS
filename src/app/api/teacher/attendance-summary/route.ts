import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/services/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const month = searchParams.get('month'); // e.g. "2026-07"
  if (!date && !month) return NextResponse.json({ error: 'Missing date or month' }, { status: 400 });

  try {
    // 1. Get classes and sections where this teacher is assigned
    const homeroomStudents = await prisma.student.findMany({
      where: { teacherId: user.id },
      select: { class: true, section: true }
    });

    const uniqueClassesAndSections = homeroomStudents.reduce((acc: { class: string; section: string }[], current) => {
      const exists = acc.some(item => item.class === current.class && item.section === current.section);
      if (!exists) {
        acc.push({ class: current.class, section: current.section });
      }
      return acc;
    }, []);

    // 2. Fetch all students in those classes and sections
    let studentIds: string[] = [];
    if (uniqueClassesAndSections.length > 0) {
      const allStudents = await prisma.student.findMany({
        where: {
          OR: uniqueClassesAndSections.map(cs => ({ class: cs.class, section: cs.section }))
        },
        select: { id: true }
      });
      studentIds = allStudents.map(s => s.id);
    }

    if (month) {
      // Fetch monthly records
      const records = await prisma.attendance.findMany({
        where: {
          studentId: { in: studentIds },
          date: {
            startsWith: month // Matches "2026-07-XX"
          }
        }
      });

      const recordsByDate = records.reduce((acc: { [key: string]: any[] }, record) => {
        if (!acc[record.date]) acc[record.date] = [];
        acc[record.date].push(record);
        return acc;
      }, {});

      const dailySummaries: { [key: string]: { rate: number; isMarked: boolean; present: number; absent: number; late: number; total: number } } = {};
      
      Object.keys(recordsByDate).forEach(d => {
        const dayRecs = recordsByDate[d];
        const present = dayRecs.filter(r => r.status === 'present').length;
        const absent = dayRecs.filter(r => r.status === 'absent').length;
        const late = dayRecs.filter(r => r.status === 'late').length;
        const rate = studentIds.length > 0 ? Math.round(((present + late) / studentIds.length) * 100) : 0;
        dailySummaries[d] = {
          rate,
          isMarked: true,
          present,
          absent,
          late,
          total: studentIds.length
        };
      });

      return NextResponse.json({ dailySummaries });
    }

    // Single Date fallback
    const records = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: date as string
      }
    });

    const total = studentIds.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return NextResponse.json({
      total,
      present,
      absent,
      late,
      rate,
      isMarked: records.length > 0
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
