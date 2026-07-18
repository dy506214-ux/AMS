import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentById } from '@/lib/services/student';
import { prisma } from '@/lib/db/prisma';
import HistoryClient from './HistoryClient';

export const revalidate = 0; // Fresh logs on load

export default async function StudentHistoryPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') {
    redirect('/login');
  }

  const student = await getStudentById(user.id);
  if (!student) {
    redirect('/login');
  }

  // 1. Fetch all teachers and map them to the student's class subjects
  const teachers = await prisma.teacher.findMany();
  
  const startClasses = [1, 3, 5, 7, 9, 11];
  const sectionsList = ['A', 'B', 'C', 'D'];

  const assignedTeachers = teachers.filter((teacher, i) => {
    const startClass = startClasses[i % startClasses.length];
    const startSectionIdx = i % 4;

    for (let p = 0; p < 7; p++) {
      const cNum = ((startClass + p - 1) % 12) + 1;
      const sec = sectionsList[(startSectionIdx + p) % 4];
      if (String(cNum) === student.class && sec === student.section) {
        return true;
      }
    }
    return false;
  });

  const defaultSubjects = [
    'Mathematics', 'Science', 'English', 
    'Social Science', 'Hindi', 'Computer', 'Physical Education'
  ];
  
  const subjectsMap: Record<string, string[]> = {
    '1': ['Mathematics', 'English', 'EVS', 'Hindi', 'Art & Craft', 'Music', 'Physical Education'],
    '2': ['Mathematics', 'English', 'EVS', 'Hindi', 'General Knowledge', 'Moral Science', 'Physical Education'],
    '3': ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Computer', 'Physical Education'],
    '4': ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Computer', 'Physical Education'],
    '5': ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Computer', 'Physical Education'],
    '6': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Physical Education'],
    '7': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Physical Education'],
    '8': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Physical Education'],
    '9': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Information Technology', 'Physical Education'],
    '10': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science', 'Physical Education'],
    '11': ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science', 'Physical Education', 'Library'],
    '12': ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science', 'Physical Education', 'Library']
  };

  const classSubjects = subjectsMap[student.class] || defaultSubjects;
  const teacherSubjectMap: Record<string, string> = {};
  assignedTeachers.forEach((teacher, index) => {
    const subjectName = classSubjects[index % classSubjects.length];
    teacherSubjectMap[teacher.id] = subjectName;
  });

  // 2. Load student's attendance records with teacher and slot relations
  const records = await prisma.attendance.findMany({
    where: { studentId: user.id },
    include: {
      markedByTeacher: true,
      slot: true
    },
    orderBy: { date: 'desc' }
  });

  // 3. Serialize logs with real database fields and mapping
  const serializedLogs = records.map((log: any) => {
    const subject = teacherSubjectMap[log.markedByTeacherId] || (log.markedByTeacher ? log.markedByTeacher.name + ' Class' : 'Regular Class');
    return {
      id: log.id,
      date: typeof log.date === 'string' ? log.date : (log.date as Date).toISOString().split('T')[0],
      status: log.status,
      createdAt: log.createdAt.toISOString(),
      subject,
      teacher: log.markedByTeacher ? log.markedByTeacher.name : 'System',
      checkIn: log.slot ? log.slot.time : '09:00 AM',
      remarks: log.remarks || '-',
      studentClass: student.class,
      studentSection: student.section
    };
  });

  return (
    <HistoryClient logs={serializedLogs} />
  );
}
