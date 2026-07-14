import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '../db/prisma';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'attendancepro-super-secret-key-987654321-safe'
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: { id: string; role: 'admin' | 'teacher' | 'student'; email: string; name: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { id: string; role: 'admin' | 'teacher' | 'student'; email: string; name: string };
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(
  identifier: string, // email/username/employeeId/rollNumber
  password: string,
  role: 'admin' | 'teacher' | 'student'
): Promise<{ token: string; user: { id: string; name: string; email: string; role: string } } | null> {
  let user: { id: string; name: string; email: string; passwordHash: string } | null = null;

  const idLower = identifier.toLowerCase();

  if (role === 'admin') {
    user = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ]
      }
    });
  } else if (role === 'teacher') {
    user = await prisma.teacher.findFirst({
      where: {
        OR: [
          { employeeId: identifier },
          { email: identifier }
        ]
      }
    });
  } else if (role === 'student') {
    user = await prisma.student.findFirst({
      where: {
        OR: [
          { rollNumber: identifier },
          { email: identifier }
        ]
      }
    });
  }

  if (!user) return null;

  const isPasswordMatch = await comparePassword(password, user.passwordHash);
  if (!isPasswordMatch) return null;

  const payload = {
    id: user.id,
    role,
    email: user.email,
    name: user.name
  };

  const token = await signToken(payload);
  return { token, user: { id: user.id, name: user.name, email: user.email, role } };
}
