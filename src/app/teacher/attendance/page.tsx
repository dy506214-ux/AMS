import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentsByTeacherId } from '@/lib/services/student';
import AttendanceClient from './AttendanceClient';

export const revalidate = 0; // Fresh registers on load

export default async function TeacherAttendancePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    redirect('/login');
  }

  // Get students assigned to this teacher
  const assignedStudents = await getStudentsByTeacherId(user.id);

  return (
    <AttendanceClient assignedStudents={assignedStudents} initialRecordsByClass={{}} />
  );
}
