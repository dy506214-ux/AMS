import React from 'react';
import { getCurrentUser } from '@/lib/actions/auth';
import { getAttendanceStatsForStudent, getAttendanceForStudent } from '@/lib/services/attendance';
import { getStudentById } from '@/lib/services/student';
import { prisma } from '@/lib/db/prisma';
import DashboardClient from '@/app/student/DashboardClient';

export const revalidate = 0; // Disable cache for live stats

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') return null;

  const student = await getStudentById(user.id);
  if (!student) return null;

  const stats = await getAttendanceStatsForStudent(user.id);
  const attendanceLogs = await getAttendanceForStudent(user.id);
  const recentLogs = attendanceLogs.slice(0, 5); // Fetch top 5 recent days

  // Fetch published announcements targeted to this student
  const publishedAnnouncements = await prisma.announcement.findMany({
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
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Serialize logs
  const serializedLogs = recentLogs.map(log => ({
    id: log.id,
    date: typeof log.date === 'string' ? log.date : (log.date as Date).toISOString().split('T')[0],
    status: log.status,
    classId: student.class,
    sectionId: student.section
  }));

  const serializedAnnouncements = publishedAnnouncements.map((a: any) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category,
    dateInfo: a.dateInfo,
    createdAt: a.createdAt.toISOString()
  }));

  return (
    <DashboardClient
      student={student}
      stats={stats}
      recentLogs={serializedLogs}
      announcements={serializedAnnouncements}
    />
  );
}
