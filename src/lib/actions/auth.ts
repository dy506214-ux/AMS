'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authenticateUser, verifyToken } from '../services/auth';

export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean; role?: string }> {
  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'admin' | 'teacher' | 'student' | null;

  if (!identifier || !password) {
    return { error: 'Please enter all credentials.' };
  }

  try {
    const result = await authenticateUser(identifier, password, role || undefined);

    if (!result) {
      return { error: 'Invalid credentials. Please try again.' };
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'token',
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });

    return { success: true, role: result.user.role };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  return await verifyToken(token);
}
