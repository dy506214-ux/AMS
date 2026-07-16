import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentsByTeacherId } from '@/lib/services/student';
import ClassesClient from './ClassesClient';

export const revalidate = 0;

export default async function ClassesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    redirect('/login');
  }

  const assignedStudents = await getStudentsByTeacherId(user.id);

  const classesAndSections = assignedStudents.reduce((acc: { class: string; section: string }[], student) => {
    const exists = acc.some(item => item.class === student.class && item.section === student.section);
    if (!exists) {
      acc.push({ class: student.class, section: student.section });
    }
    return acc;
  }, []);

  return (
    <ClassesClient 
      assignedStudents={assignedStudents} 
      classesAndSections={classesAndSections} 
    />
  );
}
