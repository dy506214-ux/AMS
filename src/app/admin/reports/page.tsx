import React from 'react';
import { getTeachers } from '@/lib/services/teacher';
import { getStudents } from '@/lib/services/student';
import ReportsClient from '@/app/admin/reports/ReportsClient';

export const revalidate = 0; // Force live data on load

export default async function AdminReportsPage() {
  const teachers = await getTeachers();
  const students = await getStudents();

  return (
    <ReportsClient teachers={teachers} students={students} />
  );
}
