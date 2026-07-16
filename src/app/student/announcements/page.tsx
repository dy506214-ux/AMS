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

  // Load published, non-deleted notices
  const db = prisma as any;
  const announcements = await db.announcement.findMany({
    where: {
      status: 'published',
      isDeleted: false
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
