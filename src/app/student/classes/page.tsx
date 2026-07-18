// Student Classes page wrapper
import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { prisma } from '@/lib/db/prisma';
import StudentClassesClient from './client';

export const revalidate = 0; // Fresh classes data on load

export default async function StudentClassesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') {
    redirect('/login');
  }

  // 1. Fetch student profile
  const student = await prisma.student.findUnique({
    where: { id: user.id }
  });
  if (!student) {
    redirect('/login');
  }

  // 2. Fetch all teachers to map timetable
  const teachers = await prisma.teacher.findMany();

  // 3. Filter teachers who teach this student's class and section
  const startClasses = [1, 3, 5, 7, 9, 11];
  const sectionsList = ['A', 'B', 'C', 'D'];

  const assignedTeachers = teachers.filter((teacher, i) => {
    const startClass = startClasses[i % startClasses.length];
    const startSectionIdx = i % 4;

    // Check if the teacher teaches this class and section in their 7-period schedule
    for (let p = 0; p < 7; p++) {
      const cNum = ((startClass + p - 1) % 12) + 1;
      const sec = sectionsList[(startSectionIdx + p) % 4];
      if (String(cNum) === student.class && sec === student.section) {
        return true;
      }
    }
    return false;
  });

  // 4. Fetch student's attendance records to compute subject-wise percentages
  const studentAttendance = await prisma.attendance.findMany({
    where: { studentId: student.id }
  });

  // 5. Dynamic subject mapping based on student's class
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

  // 6. Map subjects to assigned teachers and compute attendance rates
  const subjectClasses = assignedTeachers.map((teacher, index) => {
    const subjectName = classSubjects[index % classSubjects.length];
    
    // Find teacher's period details in the timetable for this student's class-section
    const teacherIdx = teachers.findIndex(t => t.id === teacher.id);
    const startClass = startClasses[teacherIdx % startClasses.length];
    const startSectionIdx = teacherIdx % 4;
    let periodIndex = 0;
    for (let p = 0; p < 7; p++) {
      const cNum = ((startClass + p - 1) % 12) + 1;
      const sec = sectionsList[(startSectionIdx + p) % 4];
      if (String(cNum) === student.class && sec === student.section) {
        periodIndex = p;
        break;
      }
    }

    const times = [
      { start: '08:30 AM', end: '09:15 AM' },
      { start: '09:30 AM', end: '10:15 AM' },
      { start: '11:00 AM', end: '11:45 AM' },
      { start: '01:00 PM', end: '01:45 PM' },
      { start: '02:00 PM', end: '02:45 PM' },
      { start: '03:00 PM', end: '03:45 PM' },
      { start: '04:00 PM', end: '04:45 PM' }
    ];
    const slotTime = times[periodIndex] || { start: '09:00 AM', end: '09:45 AM' };

    // Calculate dynamic attendance rate for this subject (marked by this teacher)
    const teacherRecords = studentAttendance.filter(a => a.markedByTeacherId === teacher.id);
    const totalSlots = teacherRecords.length;
    const presentSlots = teacherRecords.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercentage = totalSlots > 0 
      ? Math.round((presentSlots / totalSlots) * 100) 
      : 90; // Default high attendance rate

    // Deterministic subject codes & descriptions
    const subjectCodes: Record<string, string> = {
      'Mathematics': 'MATH-101', 'Science': 'SCI-102', 'English': 'ENG-103',
      'Social Science': 'SST-104', 'Social Studies': 'SST-104', 'EVS': 'EVS-104',
      'Hindi': 'HIN-105', 'Computer': 'COMP-106', 'Computer Science': 'COMP-106',
      'Physical Education': 'PE-107', 'Physics': 'PHY-101', 'Chemistry': 'CHEM-102'
    };
    const code = subjectCodes[subjectName] || `${subjectName.substring(0, 3).toUpperCase()}-101`;

    const subjectDescriptions: Record<string, string> = {
      'Mathematics': 'Algebra, Geometry, Trigonometry & more',
      'Science': 'Physics, Chemistry, Biology & more',
      'English': 'Grammar, Literature, Comprehension',
      'Social Science': 'History, Geography, Civics & Economics',
      'Social Studies': 'History, Geography, Civics & Economics',
      'EVS': 'Environmental studies and general science',
      'Hindi': 'व्याकरण, साहित्य, हिंदी भाषा',
      'Computer': 'Computer Basics, Programming, MS Office',
      'Computer Science': 'Computer Basics, Programming, MS Office',
      'Physical Education': 'Sports, Fitness, Yoga & Health'
    };
    const description = subjectDescriptions[subjectName] || 'Core curriculum syllabus & lectures';

    return {
      subjectName,
      subjectCode: code,
      description,
      teacherName: teacher.name,
      teacherPhoto: teacher.photoUrl,
      teacherEmail: teacher.email,
      teacherPhone: teacher.phone,
      teacherDesignation: 'Senior Subject Specialist',
      class: `Class ${student.class}`,
      section: student.section,
      roomNumber: `${student.class}0${index + 1}`,
      lectureTime: `${slotTime.start} - ${slotTime.end}`,
      duration: '45 mins',
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index % 6],
      attendancePercentage,
      teacherId: teacher.id
    };
  });

  return (
    <StudentClassesClient
      student={{
        name: student.name,
        class: student.class,
        section: student.section,
        photoUrl: student.photoUrl,
        rollNumber: student.rollNumber
      }}
      subjectClasses={subjectClasses}
    />
  );
}
