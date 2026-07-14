'use server';

import { revalidatePath } from 'next/cache';
import * as teacherService from '../services/teacher';
import * as studentService from '../services/student';

// Teacher Actions
export async function createTeacherAction(data: {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  password?: string;
}) {
  try {
    const result = await teacherService.createTeacher(data);
    revalidatePath('/admin');
    return { success: true, teacher: result };
  } catch (error: any) {
    return { error: error.message || 'Failed to create teacher.' };
  }
}

export async function updateTeacherAction(
  id: string,
  data: {
    employeeId?: string;
    name?: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
    password?: string;
  }
) {
  try {
    const result = await teacherService.updateTeacher(id, data);
    revalidatePath('/admin');
    return { success: true, teacher: result };
  } catch (error: any) {
    return { error: error.message || 'Failed to update teacher.' };
  }
}

export async function deleteTeacherAction(id: string) {
  try {
    await teacherService.deleteTeacher(id);
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete teacher.' };
  }
}

// Student Actions
export async function createStudentAction(data: {
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  teacherId: string;
  photoUrl?: string;
  password?: string;
}) {
  try {
    const result = await studentService.createStudent(data);
    revalidatePath('/admin');
    return { success: true, student: result };
  } catch (error: any) {
    return { error: error.message || 'Failed to create student.' };
  }
}

export async function updateStudentAction(
  id: string,
  data: {
    rollNumber?: string;
    name?: string;
    email?: string;
    phone?: string;
    class?: string;
    section?: string;
    teacherId?: string;
    photoUrl?: string;
    password?: string;
  }
) {
  try {
    const result = await studentService.updateStudent(id, data);
    revalidatePath('/admin');
    return { success: true, student: result };
  } catch (error: any) {
    return { error: error.message || 'Failed to update student.' };
  }
}

export async function deleteStudentAction(id: string) {
  try {
    await studentService.deleteStudent(id);
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete student.' };
  }
}

export async function assignStudentAction(studentId: string, teacherId: string) {
  try {
    const result = await studentService.assignStudentToTeacher(studentId, teacherId);
    revalidatePath('/admin');
    return { success: true, student: result };
  } catch (error: any) {
    return { error: error.message || 'Failed to assign teacher.' };
  }
}
