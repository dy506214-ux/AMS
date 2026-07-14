import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/services/auth';
import { getAttendanceForClass } from '@/lib/services/attendance';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const className = searchParams.get('class');
  const sectionName = searchParams.get('section');
  const date = searchParams.get('date');

  if (!className || !sectionName || !date) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const records = await getAttendanceForClass(className, sectionName, date);
    return NextResponse.json(records);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
