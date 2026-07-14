'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import * as attendanceService from '../services/attendance';
import * as teacherService from '../services/teacher';

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
