import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/services/auth';
import { restoreAttendanceSlot } from '@/lib/services/attendanceSlot';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slotId } = await params;
    if (!slotId) return NextResponse.json({ error: 'Missing slot ID' }, { status: 400 });

    await restoreAttendanceSlot(slotId, user.id, user.name);

    return NextResponse.json({ success: true, message: 'Slot restored successfully.' });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
