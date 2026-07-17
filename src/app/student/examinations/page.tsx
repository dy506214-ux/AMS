import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentById } from '@/lib/services/student';
import { prisma } from '@/lib/db/prisma';
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

  const marks = await (prisma as any).mark.findMany({
    where: { studentId: student.id }
  });

  const serializedStudent = {
    id: student.id,
    rollNumber: student.rollNumber,
    name: student.name,
    class: student.class,
    section: student.section,
    photoUrl: student.photoUrl
  };

  const serializedMarks = marks.map((m: any) => ({
    id: m.id,
    subject: m.subject,
    examName: m.examName,
    marksObtained: m.marksObtained,
    maxMarks: m.maxMarks,
    remarks: m.remarks || ''
  }));

  return (
    <ExaminationsClient student={serializedStudent} marks={serializedMarks} />
  );
}
