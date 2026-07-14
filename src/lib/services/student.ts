import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { hashPassword } from './auth';

export interface Student {
  id: string;
  rollNumber: string;
  passwordHash: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  photoUrl: string;
  teacherId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getStudents(): Promise<Student[]> {
  return prisma.student.findMany({
    orderBy: { rollNumber: 'asc' }
  });
}

export async function getStudentById(id: string): Promise<Student | null> {
  return prisma.student.findUnique({
    where: { id }
  });
}

export async function getStudentsByTeacherId(teacherId: string): Promise<Student[]> {
  return prisma.student.findMany({
    where: { teacherId },
    orderBy: { rollNumber: 'asc' }
  });
}

export async function createStudent(data: {
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  teacherId: string;
  photoUrl?: string;
  password?: string;
}): Promise<Student> {
  const existingStudent = await prisma.student.findFirst({
    where: {
      OR: [
        { rollNumber: data.rollNumber },
        { email: data.email }
      ]
    }
  });

  if (existingStudent) {
    throw new Error('Student with this Email or Roll Number already exists.');
  }

  const defaultPassword = data.password || 'password123';
  const passwordHash = await hashPassword(defaultPassword);

  return prisma.student.create({
    data: {
      rollNumber: data.rollNumber,
      name: data.name,
      email: data.email,
      phone: data.phone,
      class: data.class,
      section: data.section,
      teacherId: data.teacherId || null,
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      passwordHash
    }
  });
}

export async function updateStudent(
  id: string,
  data: {
    rollNumber?: string;
    name?: string;
    email?: string;
    phone?: string;
    class?: string;
    section?: string;
    teacherId?: string;
    photoUrl?: string;
    password?: string;
  }
): Promise<Student> {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    throw new Error('Student not found');
  }

  if (data.rollNumber && data.rollNumber !== student.rollNumber) {
    const duplicateRoll = await prisma.student.findUnique({ where: { rollNumber: data.rollNumber } });
    if (duplicateRoll) {
      throw new Error('Roll Number already in use.');
    }
  }
  if (data.email && data.email !== student.email) {
    const duplicateEmail = await prisma.student.findUnique({ where: { email: data.email } });
    if (duplicateEmail) {
      throw new Error('Email already in use.');
    }
  }

  const updateData: Prisma.StudentUncheckedUpdateInput = {};
  if (data.rollNumber) updateData.rollNumber = data.rollNumber;
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.phone) updateData.phone = data.phone;
  if (data.class) updateData.class = data.class;
  if (data.section) updateData.section = data.section;
  if (data.teacherId !== undefined) updateData.teacherId = data.teacherId || null;
  if (data.photoUrl) updateData.photoUrl = data.photoUrl;
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  return prisma.student.update({
    where: { id },
    data: updateData
  });
}

export async function deleteStudent(id: string): Promise<void> {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    throw new Error('Student not found');
  }

  await prisma.student.delete({
    where: { id }
  });
}

export async function assignStudentToTeacher(studentId: string, teacherId: string): Promise<Student> {
  return updateStudent(studentId, { teacherId });
}
