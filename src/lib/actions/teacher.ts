'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { prisma } from '../db/prisma';
import * as attendanceService from '../services/attendance';
import * as teacherService from '../services/teacher';
import * as attendanceSlotService from '../services/attendanceSlot';

export async function markAttendanceAction(
  records: { studentId: string; status: 'present' | 'absent' }[],
  date: string
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    await attendanceService.markAttendance(records, date, user.id);
    revalidatePath('/teacher');
    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to save attendance.' };
  }
}

export async function updateTeacherProfileAction(data: {
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  password?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    const result = await teacherService.updateTeacher(user.id, data);
    revalidatePath('/teacher');
    return { success: true, teacher: result };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to update profile.' };
  }
}

export async function createAnnouncementAction(data: {
  title: string;
  content: string;
  category: string;
  dateInfo: string;
  priority?: string;
  status?: string;
  publishDate?: string;
  expiryDate?: string;
  audienceType?: string;
  classId?: string;
  sectionId?: string;
  studentIds?: string;
  attachmentUrl?: string;
  thumbnail?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        dateInfo: data.dateInfo,
        priority: data.priority || 'Normal',
        status: data.status || 'published',
        publishDate: data.publishDate || null,
        expiryDate: data.expiryDate || null,
        audienceType: data.audienceType || 'All Students',
        classId: data.classId || null,
        sectionId: data.sectionId || null,
        studentIds: data.studentIds || null,
        attachmentUrl: data.attachmentUrl || null,
        thumbnail: data.thumbnail || null,
        teacherId: user.id
      }
    });
    revalidatePath('/teacher');
    revalidatePath('/teacher/announcements');
    return { success: true, announcement };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to create announcement.' };
  }
}

export async function updateAnnouncementAction(
  id: string,
  data: {
    title: string;
    content: string;
    category: string;
    dateInfo: string;
    priority?: string;
    status?: string;
    publishDate?: string;
    expiryDate?: string;
    audienceType?: string;
    classId?: string;
    sectionId?: string;
    studentIds?: string;
    attachmentUrl?: string;
    thumbnail?: string;
  }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return { error: 'Unauthorized.' };
  }

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement) {
      return { error: 'Announcement not found.' };
    }

    if (user.role !== 'admin' && announcement.teacherId !== user.id) {
      return { error: 'Unauthorized to update this announcement.' };
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        dateInfo: data.dateInfo,
        priority: data.priority,
        status: data.status,
        publishDate: data.publishDate,
        expiryDate: data.expiryDate,
        audienceType: data.audienceType,
        classId: data.classId,
        sectionId: data.sectionId,
        studentIds: data.studentIds,
        attachmentUrl: data.attachmentUrl,
        thumbnail: data.thumbnail
      }
    });

    revalidatePath('/teacher');
    revalidatePath('/teacher/announcements');
    return { success: true, announcement: updated };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to update announcement.' };
  }
}

export async function deleteAnnouncementAction(id: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return { error: 'Unauthorized.' };
  }

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement) {
      return { error: 'Announcement not found.' };
    }

    if (user.role !== 'admin' && announcement.teacherId !== user.id) {
      return { error: 'Unauthorized to delete this announcement.' };
    }

    // Soft Delete
    await prisma.announcement.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    revalidatePath('/teacher');
    revalidatePath('/teacher/announcements');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to delete announcement.' };
  }
}


export async function createAttendanceSlotAction(data: {
  classId: string;
  sectionId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    const slot = await attendanceSlotService.createAttendanceSlot({
      teacherId: user.id,
      classId: data.classId,
      sectionId: data.sectionId,
      date: data.date,
      time: data.time,
      duration: data.duration,
      type: data.type
    });
    revalidatePath('/teacher');
    revalidatePath('/teacher/attendance');
    return { success: true, slot };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to create slot.' };
  }
}

export async function markSlotAttendanceAction(
  slotId: string,
  records: { studentId: string; status: 'present' | 'absent' }[]
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    await attendanceService.markAttendanceForSlot(slotId, records, user.id);
    revalidatePath('/teacher');
    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to save attendance.' };
  }
}

export async function deleteAttendanceSlotAction(slotId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    return { error: 'Unauthorized.' };
  }

  try {
    const slot = await prisma.attendanceSlot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      return { error: 'Attendance slot not found.' };
    }

    if (slot.teacherId !== user.id) {
      return { error: 'Unauthorized to delete this slot.' };
    }

    await prisma.$transaction([
      prisma.attendance.updateMany({
        where: { slotId },
        data: { slotId: null }
      }),
      prisma.attendanceSlot.delete({
        where: { id: slotId }
      })
    ]);

    revalidatePath('/teacher');
    revalidatePath('/teacher/attendance');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'Failed to delete slot.' };
  }
}

export async function getStudentsForMarksAction(data: {
  classId: string;
  sectionId: string;
  subject: string;
  examName: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') return { error: 'Unauthorized.' };

  try {
    const students = await prisma.student.findMany({
      where: { class: data.classId, section: data.sectionId },
      orderBy: { rollNumber: 'asc' }
    });

    const marks = await (prisma as any).mark.findMany({
      where: {
        subject: data.subject,
        examName: data.examName,
        studentId: { in: students.map(s => s.id) }
      }
    });

    return { success: true, students, marks };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch students or marks.' };
  }
}

export async function saveMarksAction(data: {
  subject: string;
  examName: string;
  maxMarks: number;
  records: { studentId: string; marksObtained: number; attendanceStatus?: string; remarks?: string }[];
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') return { error: 'Unauthorized.' };

  try {
    const upserts = data.records.map(record => {
      return (prisma as any).mark.upsert({
        where: {
          studentId_subject_examName: {
            studentId: record.studentId,
            subject: data.subject,
            examName: data.examName
          }
        },
        update: {
          marksObtained: record.marksObtained,
          maxMarks: data.maxMarks,
          attendanceStatus: record.attendanceStatus || 'present',
          remarks: record.remarks || null,
          teacherId: user.id
        },
        create: {
          studentId: record.studentId,
          subject: data.subject,
          examName: data.examName,
          marksObtained: record.marksObtained,
          maxMarks: data.maxMarks,
          attendanceStatus: record.attendanceStatus || 'present',
          remarks: record.remarks || null,
          teacherId: user.id
        }
      });
    });

    await prisma.$transaction(upserts);
    revalidatePath('/student/examinations');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to save marks.' };
  }
}
