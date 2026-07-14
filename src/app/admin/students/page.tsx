import React from 'react';
import { getStudents } from '@/lib/services/student';
import { getTeachers } from '@/lib/services/teacher';
import StudentListClient from './StudentListClient';

export const revalidate = 0; // Fresh data on load

export default async function AdminStudentsPage() {
  const students = await getStudents();
  const teachers = await getTeachers();

  return (
    <StudentListClient initialStudents={students} teachers={teachers} />
  );
}
