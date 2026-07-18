import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentsByTeacherId } from '@/lib/services/student';
import { prisma } from '@/lib/db/prisma';
import ClassesClient from './ClassesClient';

export const revalidate = 0;

export default async function ClassesPage() {
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

  // Fetch teacher profile
  const teacherProfile = await prisma.teacher.findUnique({
    where: { id: user.id }
  });

  // Fetch today's slots for timetable/next class calculations
  const todayDate = new Date().toISOString().split('T')[0];
  const todaySlots = await prisma.attendanceSlot.findMany({
    where: {
      teacherId: user.id,
      date: todayDate
    }
  });

  const classesAndSections = assignedStudents.reduce((acc: { class: string; section: string }[], student) => {
    const exists = acc.some(item => item.class === student.class && item.section === student.section);
    if (!exists) {
      acc.push({ class: student.class, section: student.section });
    }
    return acc;
  }, []).sort((a, b) => {
    const aClass = parseInt(a.class) || 0;
    const bClass = parseInt(b.class) || 0;
    if (aClass !== bClass) {
      return aClass - bClass;
    }
    return a.section.localeCompare(b.section);
  });

  const serializedTeacher = teacherProfile ? {
    id: teacherProfile.id,
    name: teacherProfile.name,
    email: teacherProfile.email,
    phone: teacherProfile.phone,
    photoUrl: teacherProfile.photoUrl,
    employeeId: teacherProfile.employeeId
  } : null;

  const serializedSlots = todaySlots.map((slot: any) => ({
    id: slot.id,
    classId: slot.classId,
    sectionId: slot.sectionId,
    date: slot.date,
    time: slot.time,
    duration: slot.duration,
    type: slot.type,
    status: slot.status
  }));

  return (
    <ClassesClient 
      assignedStudents={assignedStudents} 
      classesAndSections={classesAndSections}
      teacherProfile={serializedTeacher}
      todaySlots={serializedSlots}
    />
  );
}
