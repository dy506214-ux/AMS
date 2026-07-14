import React from 'react';
import { getTeachers } from '@/lib/services/teacher';
import TeacherListClient from './TeacherListClient';

export const revalidate = 0; // Fresh data on load

export default async function AdminTeachersPage() {
  const teachers = await getTeachers();

  return (
    <TeacherListClient initialTeachers={teachers} />
  );
}
