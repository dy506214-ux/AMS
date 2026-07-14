import 'dotenv/config';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Generating production-ready mock data for AttendancePro (Optimized)...');

  // 1. Generate hashes once to keep script fast
  const adminHash = await bcrypt.hash('Dhirendra@2026', 10);
  const teacherHash = await bcrypt.hash('Teacher@2026', 10);
  const studentHash = await bcrypt.hash('Student@2026', 10);

  // 2. Clear existing records in proper order (cascade/relational constraints)
  console.log('Clearing existing records from database...');
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.admin.deleteMany();
  console.log('Database tables cleared successfully.');

  // 3. Create Admin: DHIRENDRA
  const adminData = {
    id: 'admin-dhirendra',
    username: 'DHIRENDRA',
    name: 'DHIRENDRA',
    email: 'principal@attendence.com',
    passwordHash: adminHash,
  };
  await prisma.admin.create({ data: adminData });
  console.log('Seeded Admin: DHIRENDRA (principal@attendence.com)');

  // 4. Create 10 Teachers (TCH001 to TCH010)
  const teacherNames = [
    'Arjun Sharma',
    'Priya Patel',
    'Rohan Verma',
    'Sneha Gupta',
    'Amit Singh',
    'Nisha Joshi',
    'Deepak Kumar',
    'Sunita Rao',
    'Vikram Malhotra',
    'Kavita Nair',
  ];

  const teacherPhotos = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  ];

  const dbTeachers = [];
  for (let i = 0; i < 10; i++) {
    const code = `TCH${String(i + 1).padStart(3, '0')}`;
    const teacherData = {
      id: `teacher-${i + 1}`,
      employeeId: code,
      name: teacherNames[i],
      email: `teacher${i + 1}@attendence.com`,
      phone: `+91-98765-${String(10000 + i).slice(1)}`,
      photoUrl: teacherPhotos[i],
      passwordHash: teacherHash,
    };
    const dbTeacher = await prisma.teacher.create({ data: teacherData });
    dbTeachers.push(dbTeacher);
  }
  console.log('Seeded 10 Teachers (TCH001 to TCH010)');

  // 5. Create 600 Students
  // Classes 1 to 10. Sections A and B. 30 Students per section.
  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Shaurya',
    'Atharva', 'Aaryan', 'Dev', 'Kabir', 'Aryan', 'Ananya', 'Diya', 'Saanvi', 'Pari', 'Angel',
    'Ishi', 'Aanya', 'Pihu', 'Riya', 'Aadhya', 'Anika', 'Kavya', 'Aditi', 'Avani', 'Prisha',
    'Rohan', 'Siddharth', 'Ishita', 'Tanisha', 'Meera', 'Karan', 'Rahul', 'Varun', 'Neha', 'Pooja'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Patel', 'Mehta', 'Singh', 'Joshi', 'Rao', 'Reddy', 'Kumar',
    'Mishra', 'Pandey', 'Choudhury', 'Trivedi', 'Desai', 'Nair', 'Iyer', 'Sen', 'Bose', 'Das',
    'Roy', 'Malhotra', 'Kapoor', 'Khanna', 'Yadav'
  ];

  const studentPhotos = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  ];

  const studentsData = [];
  let nameIndex = 0;
  let studentCounter = 1;

  console.log('Generating 600 students...');
  for (let classNum = 1; classNum <= 10; classNum++) {
    const teacherId = `teacher-${classNum}`; // Teacher X corresponds to Class X (Section A & B)

    for (const section of ['A', 'B']) {
      for (let rollNum = 1; rollNum <= 30; rollNum++) {
        const rollStr = String(rollNum).padStart(3, '0');
        const customId = `APS-2026-${classNum}${section}-${rollStr}`;

        // Select a unique name combination
        const firstName = firstNames[nameIndex % firstNames.length];
        const lastName = lastNames[(nameIndex + rollNum) % lastNames.length];
        const name = `${firstName} ${lastName}`;
        nameIndex++;

        studentsData.push({
          id: customId,
          rollNumber: rollStr,
          name: name,
          email: `student${studentCounter}@attendence.com`,
          phone: `+91-91234-${String(20000 + classNum * 100 + rollNum).slice(1)}`,
          class: String(classNum),
          section: section,
          photoUrl: studentPhotos[nameIndex % studentPhotos.length],
          passwordHash: studentHash,
          teacherId: teacherId,
        });
        studentCounter++;
      }
    }
  }

  console.log('Inserting 600 students in bulk...');
  await prisma.student.createMany({ data: studentsData });
  console.log('Seeded 600 Students successfully.');

  // 6. Generate Attendance records for the current month (July 2026)
  // July 1 to July 14, 2026. Excluding weekends: July 4, 5, 11, 12
  const attendanceDates = [
    '2026-07-01',
    '2026-07-02',
    '2026-07-03',
    '2026-07-06',
    '2026-07-07',
    '2026-07-08',
    '2026-07-09',
    '2026-07-10',
    '2026-07-13',
    '2026-07-14',
  ];

  console.log('Generating historical attendance records in bulk...');
  const attendanceData = [];

  for (const date of attendanceDates) {
    for (const student of studentsData) {
      // 88% Present, 12% Absent probability
      const status = Math.random() > 0.12 ? 'present' : 'absent';
      attendanceData.push({
        id: `att-${date}-${student.id}`,
        studentId: student.id,
        date: date,
        status: status,
        markedByTeacherId: student.teacherId,
        createdAt: new Date(`${date}T09:00:00.000Z`),
        updatedAt: new Date(`${date}T09:00:00.000Z`),
      });
    }
  }

  console.log(`Inserting ${attendanceData.length} attendance records in bulk...`);
  await prisma.attendance.createMany({ data: attendanceData });
  console.log('Seeded attendance records successfully.');

  // 7. Write to db.json to update local caching/fallback DB
  console.log('Writing seed backup to data/db.json...');
  const jsonBackup = {
    admins: [
      {
        id: adminData.id,
        username: adminData.username,
        passwordHash: adminData.passwordHash,
        name: adminData.name,
        email: adminData.email
      }
    ],
    teachers: dbTeachers.map(t => ({
      id: t.id,
      employeeId: t.employeeId,
      passwordHash: t.passwordHash,
      name: t.name,
      email: t.email,
      phone: t.phone,
      photoUrl: t.photoUrl
    })),
    students: studentsData.map(s => ({
      id: s.id,
      rollNumber: s.rollNumber,
      passwordHash: s.passwordHash,
      name: s.name,
      email: s.email,
      phone: s.phone,
      class: s.class,
      section: s.section,
      photoUrl: s.photoUrl,
      teacherId: s.teacherId
    })),
    attendance: attendanceData.map(a => ({
      id: a.id,
      studentId: a.studentId,
      date: a.date,
      status: a.status as 'present' | 'absent',
      markedByTeacherId: a.markedByTeacherId,
      updatedAt: a.updatedAt.toISOString(),
    }))
  };

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(path.join(dataDir, 'db.json'), JSON.stringify(jsonBackup, null, 2), 'utf-8');
  console.log('Backup written successfully to data/db.json.');
  console.log('Seeding process fully completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
