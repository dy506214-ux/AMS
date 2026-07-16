import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/services/auth';
import { prisma } from '@/lib/db/prisma';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = prisma as any;
    const announcements = await db.announcement.findMany({
      where: {
        teacherId: user.id,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' }
    });

    const serialized = announcements.map((ann: any) => ({
      id: ann.id,
      title: ann.title,
      content: ann.content,
      category: ann.category,
      dateInfo: ann.dateInfo,
      priority: ann.priority,
      status: ann.status,
      publishDate: ann.publishDate,
      expiryDate: ann.expiryDate,
      audienceType: ann.audienceType,
      classId: ann.classId,
      sectionId: ann.sectionId,
      studentIds: ann.studentIds,
      attachmentUrl: ann.attachmentUrl,
      thumbnail: ann.thumbnail,
      teacherId: ann.teacherId,
      createdAt: ann.createdAt.toISOString(),
      updatedAt: ann.updatedAt.toISOString()
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
