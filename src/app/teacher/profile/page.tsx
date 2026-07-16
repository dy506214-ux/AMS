import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getTeacherById } from '@/lib/services/teacher';
import { getStudentsByTeacherId } from '@/lib/services/student';
import { prisma } from '@/lib/db/prisma';
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

  // Load teacher's assigned classes/sections
  const assignedStudents = await getStudentsByTeacherId(user.id);

  // Load recent slots and announcements for activity timeline
  const db = prisma as any;
  const recentSlots = await db.attendanceSlot.findMany({
    where: { teacherId: user.id },
    orderBy: [
      { date: 'desc' },
      { time: 'desc' }
    ],
    take: 5
  });

  const recentAnnouncements = await db.announcement.findMany({
    where: { 
      teacherId: user.id,
      isDeleted: false 
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Serialize models
  const serializedTeacher = {
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    photoUrl: teacher.photoUrl,
    employeeId: teacher.employeeId
  };

  const serializedStudents = assignedStudents.map(s => ({
    id: s.id,
    rollNumber: s.rollNumber,
    name: s.name,
    class: s.class,
    section: s.section
  }));

  const serializedSlots = recentSlots.map((s: any) => ({
    id: s.id,
    classId: s.classId,
    sectionId: s.sectionId,
    date: s.date,
    time: s.time,
    createdAt: s.createdAt.toISOString()
  }));

  const serializedAnnouncements = recentAnnouncements.map((a: any) => ({
    id: a.id,
    title: a.title,
    status: a.status,
    createdAt: a.createdAt.toISOString()
  }));

  return (
    <ProfileClient 
      teacher={serializedTeacher} 
      assignedStudents={serializedStudents}
      recentSlots={serializedSlots}
      recentAnnouncements={serializedAnnouncements}
    />
  );
}
