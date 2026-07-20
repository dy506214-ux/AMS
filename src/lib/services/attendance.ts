import { prisma } from '../db/prisma';

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'medical';
  markedByTeacherId: string;
  slotId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentAttendanceState {
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'medical' | 'unmarked';
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
  const presentDays = records.filter((r) => r.status === 'present').length;
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

  const studentIds = classStudents.map((s) => s.id);
  const dateRecords = await prisma.attendance.findMany({
    where: { date, studentId: { in: studentIds } }
  });

  return classStudents.map((student) => {
    const record = dateRecords.find((r) => r.studentId === student.id);
    return {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      status: record ? (record.status as 'present' | 'absent' | 'late' | 'leave' | 'medical') : 'unmarked',
      attendanceId: record?.id
    };
  });
}

export async function markAttendance(
  records: { studentId: string; status: 'present' | 'absent' | 'late' | 'leave' | 'medical' }[],
  date: string,
  teacherId: string
): Promise<void> {
  const upserts = records.map((record) => {
    return prisma.attendance.upsert({
      where: {
        studentId_date_slotId: {
          studentId: record.studentId,
          date,
          slotId: null as any
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
        markedByTeacherId: teacherId,
        slotId: null
      }
    });
  });

  await prisma.$transaction(upserts);
}

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function markAttendanceForSlot(
  slotId: string,
  records: { studentId: string; status: 'present' | 'absent' | 'late' | 'leave' | 'medical' }[],
  teacherId: string
): Promise<void> {
  const slot = await prisma.attendanceSlot.findUnique({
    where: { id: slotId }
  });

  if (!slot) {
    throw new Error('Attendance slot not found.');
  }

  if (slot.status === 'SAVED' || slot.status === 'completed') {
    throw new Error('Attendance has already been saved for this slot.');
  }

  const upserts = records.map((record) => {
    return prisma.attendance.upsert({
      where: {
        studentId_date_slotId: {
          studentId: record.studentId,
          date: slot.date,
          slotId: slotId
        }
      },
      update: {
        status: record.status,
        markedByTeacherId: teacherId,
        updatedAt: new Date()
      },
      create: {
        studentId: record.studentId,
        date: slot.date,
        status: record.status,
        markedByTeacherId: teacherId,
        slotId: slotId
      }
    });
  });

  const slotUpdate = prisma.attendanceSlot.update({
    where: { id: slotId },
    data: {
      status: 'SAVED',
      updatedAt: new Date()
    }
  });

  const auditCreate = prisma.attendanceAudit.create({
    data: {
      slotId,
      action: 'Updated',
      performedBy: teacherId,
      role: 'Teacher',
      teacherId,
      classId: slot.classId,
      sectionId: slot.sectionId,
      slotType: slot.type,
      attendanceDate: slot.date,
      serverTime: new Date().toISOString(),
      newValue: JSON.stringify({ status: 'SAVED', markedCount: records.length })
    }
  });

  // Single atomic database transaction for all records, slot status, and audit log
  await prisma.$transaction([...upserts, slotUpdate, auditCreate]);
}

export async function getTodayAttendanceSummary(date: string = getLocalDateString()): Promise<{
  totalStudents: number;
  totalPresent: number;
  totalAbsent: number;
  percentage: number;
}> {
  const totalStudents = await prisma.student.count();
  const todayRecords = await prisma.attendance.findMany({
    where: { date }
  });

  const totalPresent = todayRecords.filter((r) => r.status === 'present').length;
  const totalAbsent = todayRecords.filter((r) => r.status === 'absent').length;

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

