import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/services/auth';
import { createAttendanceSlot, getTodaySlotsForTeacher } from '@/lib/services/attendanceSlot';
import { getLocalDateString } from '@/lib/services/attendance';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || getLocalDateString();

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

    // Server-side validation: slot date must be current server date
    const d = new Date();
    const serverDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (date !== serverDate) {
      return NextResponse.json(
        { error: "Attendance can only be created and saved for today's date." },
        { status: 403 }
      );
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
    const isConflict = err.message.includes('Attendance already exists');
    return NextResponse.json(
      { error: err.message || 'Failed to create slot.' },
      { status: isConflict ? 409 : 400 }
    );
  }
}
