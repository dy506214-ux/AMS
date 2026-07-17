import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentsByTeacherId } from '@/lib/services/student';
import MarksEntryClient from '@/app/teacher/marks/MarksEntryClient';

export const revalidate = 0; // Fresh details on load

export default async function TeacherMarksPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    redirect('/login');
  }

  // Get students assigned to this teacher
  const assignedStudents = await getStudentsByTeacherId(user.id);

  return (
    <MarksEntryClient assignedStudents={assignedStudents} />
  );
}
