import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/services/auth';
import { createAttendanceSlot, getTodaySlotsForTeacher } from '@/lib/services/attendanceSlot';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
    const slots = await getTodaySlotsForTeacher(user.id, date);
    return NextResponse.json(slots);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { classId, sectionId, date, time, duration, type } = body;

    if (!classId || !sectionId || !date || !time || !duration || !type) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    const slot = await createAttendanceSlot({
      teacherId: user.id,
      classId,
      sectionId,
      date,
      time,
      duration: parseInt(duration),
      type
    });

    return NextResponse.json(slot);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Failed to create slot.' }, { status: 400 });
  }
}
