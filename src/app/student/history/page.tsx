import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentById } from '@/lib/services/student';
import { prisma } from '@/lib/db/prisma';
import HistoryClient from './HistoryClient';

export const revalidate = 0; // Fresh logs on load

export default async function StudentHistoryPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') {
    redirect('/login');
  }

  const student = await getStudentById(user.id);
  if (!student) {
    redirect('/login');
  }

  // Load student's attendance records with teacher and slot relations
  const db = prisma as any;
  const records = await db.attendance.findMany({
    where: { studentId: user.id },
    include: {
      markedByTeacher: true,
      slot: true
    },
    orderBy: { date: 'desc' }
  });

  // Serialize logs
  const serializedLogs = records.map((log: any) => ({
    id: log.id,
    date: log.date,
    status: log.status,
    createdAt: log.createdAt.toISOString(),
    markedByTeacher: log.markedByTeacher ? {
      id: log.markedByTeacher.id,
      name: log.markedByTeacher.name
    } : null,
    slot: log.slot ? {
      id: log.slot.id,
      time: log.slot.time,
      type: log.slot.type
    } : null,
    studentClass: student.class,
    studentSection: student.section
  }));

  return (
    <HistoryClient logs={serializedLogs} />
  );
}
