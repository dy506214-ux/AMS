import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/services/auth';
import { prisma } from '@/lib/db/prisma';
import { softDeleteAttendanceSlot } from '@/lib/services/attendanceSlot';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slotId } = await params;
    if (!slotId) return NextResponse.json({ error: 'Missing slot ID' }, { status: 400 });

    // Ensure the slot belongs to the logged-in teacher
    const slot = await prisma.attendanceSlot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      return NextResponse.json({ error: 'Attendance slot not found.' }, { status: 404 });
    }

    if (slot.teacherId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this slot.' }, { status: 401 });
    }

    await softDeleteAttendanceSlot(slotId, user.id, user.name);

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
