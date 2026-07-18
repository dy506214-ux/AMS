// ViewStudents page wrapper
import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { prisma } from '@/lib/db/prisma';
import ViewStudentsClient from './client';

export const revalidate = 0; // Fresh roster data on load

interface PageProps {
  searchParams: Promise<{ class?: string; section?: string }>;
}

export default async function ViewStudentsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    redirect('/login');
  }

  const { class: classId, section: sectionId } = await searchParams;
  if (!classId || !sectionId) {
    redirect('/teacher/classes');
  }

  // 1. Fetch teacher details
  const teacher = await prisma.teacher.findUnique({
    where: { id: user.id }
  });
  if (!teacher) {
    redirect('/login');
  }

  // 2. Validate teacher authorization (must teach this class & section)
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

  const isAuthorized = uniqueClassesAndSections.some(
    cs => cs.class === classId && cs.section === sectionId
  );

  if (!isAuthorized) {
    // Return unauthorized message in a clean UI wrapper
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white border border-slate-100 p-8 rounded-2xl shadow-xs text-center">
        <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
        <p className="text-xs text-slate-500 mt-2">You are not authorized to view the rosters for Class {classId} - Section {sectionId}.</p>
      </div>
    );
  }

  // 3. Fetch all students in this class and section
  const students = await prisma.student.findMany({
    where: {
      class: classId,
      section: sectionId
    },
    orderBy: {
      rollNumber: 'asc'
    }
  });

  // 4. Fetch the latest date containing attendance records for this class-section
  const latestRecord = await prisma.attendance.findFirst({
    where: {
      student: {
        class: classId,
        section: sectionId
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  const targetDate = latestRecord?.date || new Date().toISOString().split('T')[0];

  // 5. Fetch attendance records for this class-section on targetDate
  const todayAttendance = await prisma.attendance.findMany({
    where: {
      date: targetDate,
      student: {
        class: classId,
        section: sectionId
      }
    }
  });

  // 6. Fetch all historical attendance records for the class roster to calculate percentages
  const historicalAttendance = await prisma.attendance.findMany({
    where: {
      studentId: {
        in: students.map(s => s.id)
      }
    }
  });

  // 7. Calculate individual student attendance percentages & append statuses
  const serializedStudents = students.map(s => {
    // Attendance Today status
    const todayRec = todayAttendance.find(r => r.studentId === s.id);
    const attendanceToday = todayRec ? todayRec.status : 'unmarked';

    // Historical calculation
    const studentAtts = historicalAttendance.filter(a => a.studentId === s.id);
    const totalSlots = studentAtts.length;
    const presentSlots = studentAtts.filter(a => a.status === 'present').length;
    const attendancePercentage = totalSlots > 0 
      ? Math.round((presentSlots / totalSlots) * 100) 
      : 100;

    return {
      id: s.id,
      rollNumber: s.rollNumber,
      name: s.name,
      email: s.email,
      phone: s.phone,
      photoUrl: s.photoUrl,
      class: s.class,
      section: s.section,
      attendanceToday,
      attendancePercentage,
    };
  });

  // 8. Statistics compilation
  const totalStudents = students.length;
  const presentToday = todayAttendance.filter(r => r.status === 'present').length;
  const absentToday = todayAttendance.filter(r => r.status === 'absent').length;
  const lateToday = todayAttendance.filter(r => r.status === 'late').length;

  const dynamicSubjects = {
    '1': ['Mathematics', 'English', 'EVS'],
    '2': ['Mathematics', 'Hindi', 'Science'],
    '3': ['Mathematics', 'Science', 'Social Studies'],
    '4': ['Mathematics', 'Science', 'English', 'Hindi'],
    '5': ['Mathematics', 'Science', 'Social Studies', 'English', 'Sanskrit']
  };
  const subjects = dynamicSubjects[classId as keyof typeof dynamicSubjects] || ['Mathematics', 'Science', 'English'];

  const secCode = sectionId.toUpperCase().charCodeAt(0) - 64; // A=1, B=2
  const roomNumber = `${classId}0${secCode}`;

  const stats = {
    totalStudents,
    presentToday,
    absentToday,
    lateToday,
    totalSubjects: subjects.length,
    subjects,
    roomNumber,
    dateLabel: targetDate,
  };

  return (
    <ViewStudentsClient
      classId={classId}
      sectionId={sectionId}
      teacher={{
        name: teacher.name,
        photoUrl: teacher.photoUrl,
      }}
      students={serializedStudents}
      stats={stats}
    />
  );
}
