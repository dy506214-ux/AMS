import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { prisma } from '@/lib/db/prisma';
import AnnouncementsClient from '@/app/student/announcements/AnnouncementsClient';

export const revalidate = 0; // Fresh details on load

export default async function StudentAnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') {
    redirect('/login');
  }

  // Load student profile to get class and section
  const student = await prisma.student.findUnique({
    where: { id: user.id }
  });
  if (!student) {
    redirect('/login');
  }

  // Load published, non-deleted notices targeted to this student
  const announcements = await prisma.announcement.findMany({
    where: {
      status: 'published',
      isDeleted: false,
      OR: [
        { audienceType: 'All Students' },
        {
          audienceType: 'Specific Class',
          classId: student.class
        },
        {
          audienceType: 'Specific Section',
          classId: student.class,
          sectionId: student.section
        },
        {
          audienceType: 'Specific Students',
          studentIds: {
            contains: student.id
          }
        }
      ]
    },
    orderBy: { createdAt: 'desc' }
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
    audienceType: ann.audienceType,
    createdAt: ann.createdAt.toISOString()
  }));

  return (
    <AnnouncementsClient announcements={serializedAnnouncements} />
  );
}
