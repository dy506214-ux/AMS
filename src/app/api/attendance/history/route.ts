import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/services/auth';
import { prisma } from '@/lib/db/prisma';
import { getLocalDateString } from '@/lib/services/attendance';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() || '';
  const status = searchParams.get('status') || 'all'; // all, present, absent, late, leave, archived, locked
  const classId = searchParams.get('classId') || '';
  const sectionId = searchParams.get('sectionId') || '';
  const range = searchParams.get('range') || 'today'; // today, yesterday, 7days, monthly, custom
  const page = parseInt(searchParams.get('page') || '1') || 1;
  const limit = parseInt(searchParams.get('limit') || '20') || 20;

  const todayStr = getLocalDateString();
  const todayDate = new Date(todayStr);

  let startDateStr = searchParams.get('startDate') || todayStr;
  let endDateStr = searchParams.get('endDate') || todayStr;

  if (range === 'today') {
    startDateStr = todayStr;
    endDateStr = todayStr;
  } else if (range === 'yesterday') {
    const y = new Date(todayDate);
    y.setDate(y.getDate() - 1);
    startDateStr = y.toISOString().split('T')[0];
    endDateStr = startDateStr;
  } else if (range === '7days') {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - 6);
    startDateStr = d.toISOString().split('T')[0];
    endDateStr = todayStr;
  } else if (range === 'monthly') {
    const d = new Date(todayDate);
    d.setDate(1);
    startDateStr = d.toISOString().split('T')[0];
    endDateStr = todayStr;
  }

  try {
    const whereCondition: Record<string, unknown> = {};

    if (status === 'archived') {
      whereCondition.isArchived = true;
    } else {
      whereCondition.isArchived = false;
      if (status !== 'all') {
        whereCondition.status = status;
      }
    }

    if (range !== 'all') {
      whereCondition.date = {
        gte: startDateStr,
        lte: endDateStr
      };
    }

    if (search) {
      whereCondition.student = {
        OR: [
          { name: { contains: search } },
          { rollNumber: { contains: search } }
        ]
      };
    }

    if (classId || sectionId) {
      whereCondition.student = {
        ...(whereCondition.student as object || {}),
        ...(classId ? { class: classId } : {}),
        ...(sectionId ? { section: sectionId } : {})
      };
    }

    const total = await prisma.attendance.count({
      where: whereCondition
    });

    const records = await prisma.attendance.findMany({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            class: true,
            section: true,
            photoUrl: true
          }
        },
        markedByTeacher: {
          select: {
            name: true
          }
        },
        slot: {
          select: {
            id: true,
            type: true,
            time: true,
            duration: true,
            status: true,
            isLocked: true,
            isArchived: true
          }
        }
      }
    });

    // Also fetch audit logs for recent activity
    const auditLogs = await prisma.attendanceAudit.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      records,
      auditLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Failed to fetch history' }, { status: 500 });
  }
}
