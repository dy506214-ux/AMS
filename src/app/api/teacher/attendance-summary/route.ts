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
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 });

  try {
    // Get teacher's students
    const students = await prisma.student.findMany({
      where: { teacherId: user.id },
      select: { id: true }
    });
    const studentIds = students.map(s => s.id);

    // Get attendance records
    const records = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date
      }
    });

    const total = studentIds.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return NextResponse.json({
      total,
      present,
      absent,
      rate,
      isMarked: records.length > 0
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
