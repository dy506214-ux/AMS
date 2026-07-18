import { prisma } from '../db/prisma';

export interface CreateSlotInput {
  teacherId: string;
  classId: string;
  sectionId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
}

export async function createAttendanceSlot(data: CreateSlotInput) {
  // Validate teacher assignment (teacher exists)
  const teacher = await prisma.teacher.findUnique({
    where: { id: data.teacherId }
  });
  if (!teacher) {
    throw new Error('Teacher not found.');
  }

  // Check if duplicate slot already exists (same teacher, class, section, date, and type)
  const duplicate = await prisma.attendanceSlot.findFirst({
    where: {
      teacherId: data.teacherId,
      classId: data.classId,
      sectionId: data.sectionId,
      date: data.date,
      type: data.type
    }
  });

  if (duplicate) {
    throw new Error(`Attendance has already been completed for Class ${data.classId} - Section ${data.sectionId} today.`);
  }

  // Insert into AttendanceSlot table
  return prisma.attendanceSlot.create({
    data: {
      createdBy: teacher.name,
      teacherId: data.teacherId,
      classId: data.classId,
      sectionId: data.sectionId,
      date: data.date,
      time: data.time,
      duration: data.duration,
      type: data.type,
      status: 'ACTIVE'
    }
  });
}

export async function getTodaySlotsForTeacher(teacherId: string, date: string) {
  const slots = await prisma.attendanceSlot.findMany({
    where: {
      teacherId,
      date
    },
    orderBy: {
      time: 'asc'
    },
    include: {
      attendances: true
    }
  });

  // Calculate student count and attendance count for each slot
  const slotsWithCounts = await Promise.all(
    slots.map(async (slot) => {
      const studentCount = await prisma.student.count({
        where: {
          class: slot.classId,
          section: slot.sectionId
        }
      });

      const attendanceCount = slot.attendances.length;
      const isPending = attendanceCount === 0;

      return {
        ...slot,
        studentCount,
        attendanceCount,
        attendanceStatus: isPending ? 'Pending' : 'Submitted'
      };
    })
  );

  return slotsWithCounts;
}

export async function getSlotById(slotId: string) {
  return prisma.attendanceSlot.findUnique({
    where: { id: slotId },
    include: {
      teacher: {
        select: {
          name: true
        }
      }
    }
  });
}

export async function getStudentsAndAttendanceForSlot(slotId: string) {
  const slot = await prisma.attendanceSlot.findUnique({
    where: { id: slotId }
  });

  if (!slot) {
    throw new Error('Attendance slot not found.');
  }

  // Get students matching the slot's class and section
  const students = await prisma.student.findMany({
    where: {
      class: slot.classId,
      section: slot.sectionId
    },
    orderBy: {
      rollNumber: 'asc'
    }
  });

  // Get attendance records for this slot
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      slotId
    }
  });

  return students.map((student) => {
    const record = attendanceRecords.find((r) => r.studentId === student.id);
    return {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      photoUrl: student.photoUrl,
      status: record ? record.status : 'unmarked',
      attendanceId: record?.id
    };
  });
}
