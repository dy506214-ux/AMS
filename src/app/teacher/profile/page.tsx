import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getTeacherById } from '@/lib/services/teacher';
import ProfileClient from './ProfileClient';

export const revalidate = 0; // Fresh details on load

export default async function TeacherProfilePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    redirect('/login');
  }

  const teacher = await getTeacherById(user.id);
  if (!teacher) {
    redirect('/login');
  }

  return (
    <ProfileClient teacher={teacher} />
  );
}
