import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentById } from '@/lib/services/student';
import ProfileClient from './ProfileClient';

export const revalidate = 0; // Fresh details on load

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') {
    redirect('/login');
  }

  const student = await getStudentById(user.id);
  if (!student) {
    redirect('/login');
  }

  return (
    <ProfileClient student={student} />
  );
}
