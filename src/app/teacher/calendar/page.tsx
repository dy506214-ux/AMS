import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { prisma } from '@/lib/db/prisma';
import CalendarClient from './CalendarClient';

export const revalidate = 0;

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    redirect('/login');
  }

  // 1. Get classes and sections where this teacher is assigned
  const homeroomStudents = await prisma.student.findMany({
    where: { teacherId: user.id },
    select: { class: true, section: true }
  });

  const classesAndSections = homeroomStudents.reduce((acc: { class: string; section: string }[], current) => {
    const exists = acc.some(item => item.class === current.class && item.section === current.section);
    if (!exists) {
      acc.push({ class: current.class, section: current.section });
    }
    return acc;
  }, []);

  return (
    <CalendarClient 
      classesAndSections={classesAndSections} 
    />
  );
}
