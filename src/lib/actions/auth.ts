'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authenticateUser, verifyToken } from '../services/auth';

export async function loginAction(
  prevState: any,
  formData: FormData
): Promise<{ error?: string; success?: boolean; role?: string }> {
  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'admin' | 'teacher' | 'student';

  if (!identifier || !password || !role) {
    return { error: 'Please enter all credentials and select a role.' };
  }

  try {
    const result = await authenticateUser(identifier, password, role);

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

    return { success: true, role };
  } catch (error: any) {
    return { error: error.message || 'An unexpected error occurred.' };
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
