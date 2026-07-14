import fs from 'fs';
import path from 'path';

// Define the types for our Database
export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  email: string;
}

export interface Teacher {
  id: string;
  employeeId: string;
  passwordHash: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
}

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
  teacherId: string | null; // Assigned Teacher
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
  markedByTeacherId: string;
  updatedAt: string | Date;
}

export interface Database {
  admins: Admin[];
  teachers: Teacher[];
  students: Student[];
  attendance: Attendance[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure database file exists
function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialDb: Database = {
      admins: [],
      teachers: [],
      students: [],
      attendance: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
  }
}

export function readDb(): Database {
  ensureDbExists();
  const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(fileContent);
}

export function writeDb(data: Database): void {
  ensureDbExists();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
