'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import * as studentService from '../services/student';

export async function updateStudentProfileAction(data: {
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  password?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') {
    return { error: 'Unauthorized.' };
  }

  try {
    const result = await studentService.updateStudent(user.id, data);
    revalidatePath('/student');
    return { success: true, student: result };
  } catch (error: any) {
    return { error: error.message || 'Failed to update profile.' };
  }
}
