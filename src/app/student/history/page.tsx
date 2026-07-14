import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getAttendanceForStudent } from '@/lib/services/attendance';
import HistoryClient from './HistoryClient';

export const revalidate = 0; // Fresh logs on load

export default async function StudentHistoryPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') {
    redirect('/login');
  }

  const logs = await getAttendanceForStudent(user.id);

  return (
    <HistoryClient logs={logs} />
  );
}
