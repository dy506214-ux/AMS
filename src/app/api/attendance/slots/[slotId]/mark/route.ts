import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/services/auth';
import { markAttendanceForSlot } from '@/lib/services/attendance';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
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

    const slot = await prisma.attendanceSlot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      return NextResponse.json({ error: 'Attendance slot not found.' }, { status: 404 });
    }

    // Server-side validation: Attendance Date == Current Server Date
    const d = new Date();
    const serverDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (slot.date !== serverDate) {
      return NextResponse.json(
        { error: "Attendance can only be created and saved for today's date." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { records } = body;

    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid or missing records payload.' }, { status: 400 });
    }

    await markAttendanceForSlot(slotId, records, user.id);

    // Audit Trail Generation
    const ipAddress = request.headers.get('x-forwarded-for') || (request as any).ip || 'unknown';
    const deviceId = request.headers.get('user-agent') || 'unknown';
    const serverTimeStr = d.toTimeString().split(' ')[0]; // E.g., HH:MM:SS

    await prisma.attendanceAudit.create({
      data: {
        teacherId: user.id,
        classId: slot.classId,
        sectionId: slot.sectionId,
        slotType: slot.type,
        attendanceDate: slot.date,
        serverTime: serverTimeStr,
        createdAt: slot.createdAt,
        savedAt: d,
        ipAddress,
        deviceId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
