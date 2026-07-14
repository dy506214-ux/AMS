import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { hashPassword } from './auth';

export interface Teacher {
  id: string;
  employeeId: string;
  passwordHash: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getTeachers(): Promise<Teacher[]> {
  return prisma.teacher.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  return prisma.teacher.findUnique({
    where: { id }
  });
}

export async function createTeacher(data: {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  password?: string;
}): Promise<Teacher> {
  // Check if email or employee ID already exists
  const existingTeacher = await prisma.teacher.findFirst({
    where: {
      OR: [
        { employeeId: data.employeeId },
        { email: data.email }
      ]
    }
  });

  if (existingTeacher) {
    throw new Error('Teacher with this Email or Employee ID already exists.');
  }

  const defaultPassword = data.password || 'password123';
  const passwordHash = await hashPassword(defaultPassword);

  return prisma.teacher.create({
    data: {
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150',
      passwordHash
    }
  });
}

export async function updateTeacher(
  id: string,
  data: {
    employeeId?: string;
    name?: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
    password?: string;
  }
): Promise<Teacher> {
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    throw new Error('Teacher not found');
  }

  // Validation
  if (data.employeeId && data.employeeId !== teacher.employeeId) {
    const duplicateId = await prisma.teacher.findUnique({ where: { employeeId: data.employeeId } });
    if (duplicateId) {
      throw new Error('Employee ID already in use.');
    }
  }
  if (data.email && data.email !== teacher.email) {
    const duplicateEmail = await prisma.teacher.findUnique({ where: { email: data.email } });
    if (duplicateEmail) {
      throw new Error('Email already in use.');
    }
  }

  const updateData: Prisma.TeacherUpdateInput = {};
  if (data.employeeId) updateData.employeeId = data.employeeId;
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.phone) updateData.phone = data.phone;
  if (data.photoUrl) updateData.photoUrl = data.photoUrl;
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  return prisma.teacher.update({
    where: { id },
    data: updateData
  });
}

export async function deleteTeacher(id: string): Promise<void> {
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    throw new Error('Teacher not found');
  }

  await prisma.teacher.delete({
    where: { id }
  });
}
