import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentById } from '@/lib/services/student';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'student') {
    redirect('/login');
  }

  const studentDetails = await getStudentById(user.id);
  const photoUrl = studentDetails?.photoUrl || undefined;

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-md flex">
      {/* Sidebar Navigation */}
      <Sidebar role="student" userName={user.name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        <Navbar title="Student Portal" userName={user.name} photoUrl={photoUrl} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
