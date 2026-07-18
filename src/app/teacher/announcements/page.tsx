import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { prisma } from '@/lib/db/prisma';
import { getStudentsByTeacherId } from '@/lib/services/student';
import AnnouncementsClient from './AnnouncementsClient';

export const revalidate = 0;

export default async function AnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    redirect('/login');
  }

  const db = prisma as any;
  const announcements = await db.announcement.findMany({
    where: {
      teacherId: user.id,
      isDeleted: false
    },
    orderBy: { createdAt: 'desc' }
  });

  // Load ALL students and classes/sections from the database for dynamic audience selector
  const assignedStudents = await prisma.student.findMany({
    orderBy: { name: 'asc' }
  });
  
  const classesAndSections = assignedStudents.reduce((acc: { class: string; section: string }[], student) => {
    const exists = acc.some(item => item.class === student.class && item.section === student.section);
    if (!exists) {
      acc.push({ class: student.class, section: student.section });
    }
    return acc;
  }, []);

  // Sort classes numerically, and sections alphabetically
  classesAndSections.sort((a, b) => {
    const aClass = parseInt(a.class) || 0;
    const bClass = parseInt(b.class) || 0;
    if (aClass !== bClass) {
      return aClass - bClass;
    }
    return a.section.localeCompare(b.section);
  });

  const serializedAnnouncements = announcements.map((ann: any) => ({
    id: ann.id,
    title: ann.title,
    content: ann.content,
    category: ann.category,
    dateInfo: ann.dateInfo,
    priority: ann.priority,
    status: ann.status,
    publishDate: ann.publishDate,
    expiryDate: ann.expiryDate,
    audienceType: ann.audienceType,
    classId: ann.classId,
    sectionId: ann.sectionId,
    studentIds: ann.studentIds,
    attachmentUrl: ann.attachmentUrl,
    thumbnail: ann.thumbnail,
    teacherId: ann.teacherId,
    createdAt: ann.createdAt.toISOString(),
    updatedAt: ann.updatedAt.toISOString()
  }));

  return (
    <AnnouncementsClient 
      announcements={serializedAnnouncements} 
      classesAndSections={classesAndSections}
      assignedStudents={assignedStudents}
    />
  );
}
