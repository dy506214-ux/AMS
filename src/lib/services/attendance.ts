import { prisma } from '../db/prisma';

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
  markedByTeacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentAttendanceState {
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  status: 'present' | 'absent' | 'unmarked';
  attendanceId?: string;
}

export async function getAttendanceForStudent(studentId: string): Promise<Attendance[]> {
  const records = await prisma.attendance.findMany({
    where: { studentId },
    orderBy: { date: 'desc' }
  });
  return records as unknown as Attendance[];
}

export async function getAttendanceStatsForStudent(studentId: string): Promise<{
  presentDays: number;
  absentDays: number;
  totalDays: number;
  percentage: number;
}> {
  const records = await prisma.attendance.findMany({
    where: { studentId }
  });
  const totalDays = records.length;
  const presentDays = records.filter((r: any) => r.status === 'present').length;
  const absentDays = totalDays - presentDays;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  return { presentDays, absentDays, totalDays, percentage };
}

export async function getAttendanceForClass(
  className: string,
  sectionName: string,
  date: string
): Promise<StudentAttendanceState[]> {
  const classStudents = await prisma.student.findMany({
    where: { class: className, section: sectionName },
    orderBy: { rollNumber: 'asc' }
  });

  const studentIds = classStudents.map((s: any) => s.id);
  const dateRecords = await prisma.attendance.findMany({
    where: { date, studentId: { in: studentIds } }
  });

  return classStudents.map((student: any) => {
    const record = dateRecords.find((r: any) => r.studentId === student.id);
    return {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      status: record ? (record.status as 'present' | 'absent') : 'unmarked',
      attendanceId: record?.id
    };
  });
}

export async function markAttendance(
  records: { studentId: string; status: 'present' | 'absent' }[],
  date: string,
  teacherId: string
): Promise<void> {
  const upserts = records.map((record) => {
    return prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: record.studentId,
          date
        }
      },
      update: {
        status: record.status,
        markedByTeacherId: teacherId,
        updatedAt: new Date()
      },
      create: {
        studentId: record.studentId,
        date,
        status: record.status,
        markedByTeacherId: teacherId
      }
    });
  });

  await prisma.$transaction(upserts);
}

export async function getTodayAttendanceSummary(date: string = new Date().toISOString().split('T')[0]): Promise<{
  totalStudents: number;
  totalPresent: number;
  totalAbsent: number;
  percentage: number;
}> {
  const totalStudents = await prisma.student.count();
  const todayRecords = await prisma.attendance.findMany({
    where: { date }
  });

  const totalPresent = todayRecords.filter((r: any) => r.status === 'present').length;
  const totalAbsent = todayRecords.filter((r: any) => r.status === 'absent').length;

  const percentage = todayRecords.length > 0
    ? Math.round((totalPresent / todayRecords.length) * 100)
    : 0;

  return {
    totalStudents,
    totalPresent,
    totalAbsent,
    percentage
  };
}

export async function getOverallSchoolStats(): Promise<{
  totalTeachers: number;
  totalStudents: number;
  averageAttendancePercentage: number;
}> {
  const totalTeachers = await prisma.teacher.count();
  const totalStudents = await prisma.student.count();

  const totalAttendanceRecords = await prisma.attendance.count();
  const presentRecords = await prisma.attendance.count({
    where: { status: 'present' }
  });

  const averageAttendancePercentage = totalAttendanceRecords > 0
    ? Math.round((presentRecords / totalAttendanceRecords) * 100)
    : 100;

  return {
    totalTeachers,
    totalStudents,
    averageAttendancePercentage
  };
}
