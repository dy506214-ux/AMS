'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { prisma } from '../db/prisma';
import * as attendanceService from '../services/attendance';
import * as teacherService from '../services/teacher';
import * as attendanceSlotService from '../services/attendanceSlot';

export async function markAttendanceAction(
  records: { studentId: string; status: 'present' | 'absent' }[],
  date: string
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    await attendanceService.markAttendance(records, date, user.id);
    revalidatePath('/teacher');
    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to save attendance.' };
  }
}

export async function updateTeacherProfileAction(data: {
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  password?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    const result = await teacherService.updateTeacher(user.id, data);
    revalidatePath('/teacher');
    return { success: true, teacher: result };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to update profile.' };
  }
}

export async function createAnnouncementAction(data: {
  title: string;
  content: string;
  category: string;
  dateInfo: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        dateInfo: data.dateInfo,
      }
    });
    revalidatePath('/teacher');
    revalidatePath('/teacher/announcements');
    return { success: true, announcement };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to create announcement.' };
  }
}

export async function createAttendanceSlotAction(data: {
  classId: string;
  sectionId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    const slot = await attendanceSlotService.createAttendanceSlot({
      teacherId: user.id,
      classId: data.classId,
      sectionId: data.sectionId,
      date: data.date,
      time: data.time,
      duration: data.duration,
      type: data.type
    });
    revalidatePath('/teacher');
    revalidatePath('/teacher/attendance');
    return { success: true, slot };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to create slot.' };
  }
}

export async function markSlotAttendanceAction(
  slotId: string,
  records: { studentId: string; status: 'present' | 'absent' }[]
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    await attendanceService.markAttendanceForSlot(slotId, records, user.id);
    revalidatePath('/teacher');
    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to save attendance.' };
  }
}

export async function deleteAttendanceSlotAction(slotId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    const slot = await prisma.attendanceSlot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      return { error: 'Attendance slot not found.' };
    }

    if (slot.teacherId !== user.id) {
      return { error: 'Unauthorized to delete this slot.' };
    }

    await prisma.attendanceSlot.delete({
      where: { id: slotId }
    });

    revalidatePath('/teacher');
    revalidatePath('/teacher/attendance');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to delete slot.' };
  }
}
