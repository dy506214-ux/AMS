import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { prisma } from '@/lib/db/prisma';
import MarksEntryClient from '@/app/teacher/marks/MarksEntryClient';

export const revalidate = 0; // Fresh details on load

export default async function TeacherMarksPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    redirect('/login');
  }

  // 1. Get classes and sections where this teacher is assigned
  const homeroomStudents = await prisma.student.findMany({
    where: { teacherId: user.id },
    select: { class: true, section: true }
  });

  const uniqueClassesAndSections = homeroomStudents.reduce((acc: { class: string; section: string }[], current) => {
    const exists = acc.some(item => item.class === current.class && item.section === current.section);
    if (!exists) {
      acc.push({ class: current.class, section: current.section });
    }
    return acc;
  }, []);

  // 2. Fetch all students in those classes and sections
  let assignedStudents: any[] = [];
  if (uniqueClassesAndSections.length > 0) {
    assignedStudents = await prisma.student.findMany({
      where: {
        OR: uniqueClassesAndSections.map(cs => ({ class: cs.class, section: cs.section }))
      },
      orderBy: { rollNumber: 'asc' }
    });
  }

  return (
    <MarksEntryClient assignedStudents={assignedStudents} />
  );
}
