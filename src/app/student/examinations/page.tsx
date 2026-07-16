import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentById } from '@/lib/services/student';
import ExaminationsClient from '@/app/student/examinations/ExaminationsClient';

export const revalidate = 0; // Fresh details on load

export default async function StudentExaminationsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') {
    redirect('/login');
  }

  const student = await getStudentById(user.id);
  if (!student) {
    redirect('/login');
  }

  const serializedStudent = {
    id: student.id,
    rollNumber: student.rollNumber,
    name: student.name,
    class: student.class,
    section: student.section,
    photoUrl: student.photoUrl
  };

  return (
    <ExaminationsClient student={serializedStudent} />
  );
}
