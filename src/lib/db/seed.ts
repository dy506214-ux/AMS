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
  await prisma.mark.deleteMany();
  await prisma.attendanceSlot.deleteMany();
  await prisma.announcement.deleteMany();
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

  // 4. Create 43 Teachers from the spreadsheet
  const teacherNames = [
    "Amit Sharma", "Rahul Verma", "Vikas Yadav", "Sandeep Kumar", "Rohit Singh", "Ankit Gupta",
    "Deepak Jain", "Manoj Patel", "Nitin Chauhan", "Arjun Mehta", "Pankaj Mishra", "Saurabh Rai",
    "Aman Saxena", "Lokesh Gupta", "Mohit Tyagi", "Ravi Sharma", "Ajay Kumar", "Dinesh Pal",
    "Sunil Yadav", "Pradeep Singh", "Karan Verma", "Abhishek Jain", "Harsh Gupta", "Vivek Kumar",
    "Sachin Yadav", "Naveen Sharma", "Tarun Singh", "Gaurav Patel", "Hemant Kumar", "Kapil Verma",
    "Yogesh Sharma", "Mukesh Kumar", "Shivam Gupta", "Akash Singh", "Neeraj Jain", "Manish Rai",
    "Vinay Kumar", "Umesh Sharma", "Dev Kumar", "Akhil Verma", "Ritesh Singh", "Bhanu Pratap",
    "Keshav Gupta"
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
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
  ];

  const dbTeachers = [];
  const startClasses = [1, 3, 5, 7, 9, 11];
  const sectionsList = ['A', 'B', 'C', 'D'];

  // Map to store teachers who teach each class-section combo
  const teachersForClassSection: Record<string, string[]> = {};
  for (let c = 1; c <= 12; c++) {
    for (const s of sectionsList) {
      teachersForClassSection[`${c}-${s}`] = [];
    }
  }

  console.log(`Seeding ${teacherNames.length} Teachers...`);
  for (let i = 0; i < teacherNames.length; i++) {
    const code = `TCH${String(i + 1).padStart(3, '0')}`;
    const tId = `teacher-${i + 1}`;
    
    const mobileSuffix = String(Math.floor(i / 10)) + '0';
    const mobile = `98001000${mobileSuffix}`;

    const teacherData = {
      id: tId,
      employeeId: code,
      name: teacherNames[i],
      email: `teacher${i + 1}@erp.com`,
      phone: mobile,
      photoUrl: teacherPhotos[i % teacherPhotos.length],
      passwordHash: teacherHash,
    };
    
    const dbTeacher = await prisma.teacher.create({ data: teacherData });
    dbTeachers.push(dbTeacher);

    // Compute timetable classes and sections taught by this teacher
    const startClass = startClasses[i % startClasses.length];
    const startSectionIdx = i % 4;

    for (let p = 0; p < 7; p++) {
      const cNum = ((startClass + p - 1) % 12) + 1;
      const sec = sectionsList[(startSectionIdx + p) % 4];
      const key = `${cNum}-${sec}`;
      teachersForClassSection[key].push(tId);
    }
  }
  console.log(`Seeded ${teacherNames.length} Teachers successfully.`);

  // 5. Create Students for Class 1 (using user-provided data)
  const malePhotos = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  ];

  const femalePhotos = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150'
  ];

  const class1Raw = [
    // Section A
    { adm: "ADM-1001", roll: 1, name: "Aarav Sharma", gen: "Male", sec: "A" },
    { adm: "ADM-1002", roll: 2, name: "Vivaan Sharma", gen: "Male", sec: "A" },
    { adm: "ADM-1003", roll: 3, name: "Aditya Sharma", gen: "Male", sec: "A" },
    { adm: "ADM-1004", roll: 4, name: "Krishna Verma", gen: "Male", sec: "A" },
    { adm: "ADM-1005", roll: 5, name: "Arjun Verma", gen: "Male", sec: "A" },
    { adm: "ADM-1006", roll: 6, name: "Sai Verma", gen: "Male", sec: "A" },
    { adm: "ADM-1007", roll: 7, name: "Reyansh Yadav", gen: "Male", sec: "A" },
    { adm: "ADM-1008", roll: 8, name: "Vihaan Yadav", gen: "Male", sec: "A" },
    { adm: "ADM-1009", roll: 9, name: "Ayaan Yadav", gen: "Male", sec: "A" },
    { adm: "ADM-1010", roll: 10, name: "Kabir Singh", gen: "Male", sec: "A" },
    { adm: "ADM-1011", roll: 11, name: "Rohan Singh", gen: "Male", sec: "A" },
    { adm: "ADM-1012", roll: 12, name: "Mohit Singh", gen: "Male", sec: "A" },
    { adm: "ADM-1013", roll: 13, name: "Nikhil Gupta", gen: "Male", sec: "A" },
    { adm: "ADM-1014", roll: 14, name: "Yash Gupta", gen: "Male", sec: "A" },
    { adm: "ADM-1015", roll: 15, name: "Kunal Gupta", gen: "Male", sec: "A" },
    { adm: "ADM-1016", roll: 16, name: "Dev Patel", gen: "Male", sec: "A" },
    { adm: "ADM-1017", roll: 17, name: "Aryan Patel", gen: "Male", sec: "A" },
    { adm: "ADM-1018", roll: 18, name: "Harsh Patel", gen: "Male", sec: "A" },
    { adm: "ADM-1019", roll: 19, name: "Laksh Jain", gen: "Male", sec: "A" },
    { adm: "ADM-1020", roll: 20, name: "Shivam Jain", gen: "Male", sec: "A" },
    { adm: "ADM-1021", roll: 21, name: "Ananya Jain", gen: "Female", sec: "A" },
    { adm: "ADM-1022", roll: 22, name: "Priya Chauhan", gen: "Female", sec: "A" },
    { adm: "ADM-1023", roll: 23, name: "Siya Chauhan", gen: "Female", sec: "A" },
    { adm: "ADM-1024", roll: 24, name: "Meera Chauhan", gen: "Female", sec: "A" },
    { adm: "ADM-1025", roll: 25, name: "Kavya Kumar", gen: "Female", sec: "A" },
    // Section B
    { adm: "ADM-1026", roll: 1, name: "Ishita Kumar", gen: "Female", sec: "B" },
    { adm: "ADM-1027", roll: 2, name: "Riya Kumar", gen: "Female", sec: "B" },
    { adm: "ADM-1028", roll: 3, name: "Pooja Mishra", gen: "Female", sec: "B" },
    { adm: "ADM-1029", roll: 4, name: "Diya Mishra", gen: "Female", sec: "B" },
    { adm: "ADM-1030", roll: 5, name: "Neha Mishra", gen: "Female", sec: "B" },
    { adm: "ADM-1031", roll: 6, name: "Aarav Rai", gen: "Male", sec: "B" },
    { adm: "ADM-1032", roll: 7, name: "Vivaan Rai", gen: "Male", sec: "B" },
    { adm: "ADM-1033", roll: 8, name: "Aditya Rai", gen: "Male", sec: "B" },
    { adm: "ADM-1034", roll: 9, name: "Krishna Tyagi", gen: "Male", sec: "B" },
    { adm: "ADM-1035", roll: 10, name: "Arjun Tyagi", gen: "Male", sec: "B" },
    { adm: "ADM-1036", roll: 11, name: "Sai Tyagi", gen: "Male", sec: "B" },
    { adm: "ADM-1037", roll: 12, name: "Reyansh Saxena", gen: "Male", sec: "B" },
    { adm: "ADM-1038", roll: 13, name: "Vihaan Saxena", gen: "Male", sec: "B" },
    { adm: "ADM-1039", roll: 14, name: "Ayaan Saxena", gen: "Male", sec: "B" },
    { adm: "ADM-1040", roll: 15, name: "Kabir Pal", gen: "Male", sec: "B" },
    { adm: "ADM-1041", roll: 16, name: "Rohan Pal", gen: "Male", sec: "B" },
    { adm: "ADM-1042", roll: 17, name: "Mohit Pal", gen: "Male", sec: "B" },
    { adm: "ADM-1043", roll: 18, name: "Nikhil Mehta", gen: "Male", sec: "B" },
    { adm: "ADM-1044", roll: 19, name: "Yash Mehta", gen: "Male", sec: "B" },
    { adm: "ADM-1045", roll: 20, name: "Kunal Mehta", gen: "Male", sec: "B" },
    { adm: "ADM-1046", roll: 21, name: "Dev Pandey", gen: "Male", sec: "B" },
    { adm: "ADM-1047", roll: 22, name: "Aryan Pandey", gen: "Male", sec: "B" },
    { adm: "ADM-1048", roll: 23, name: "Harsh Pandey", gen: "Male", sec: "B" },
    { adm: "ADM-1049", roll: 24, name: "Laksh Joshi", gen: "Male", sec: "B" },
    { adm: "ADM-1050", roll: 25, name: "Shivam Joshi", gen: "Male", sec: "B" },
    // Section C
    { adm: "ADM-1051", roll: 1, name: "Ananya Joshi", gen: "Female", sec: "C" },
    { adm: "ADM-1052", roll: 2, name: "Priya Agarwal", gen: "Female", sec: "C" },
    { adm: "ADM-1053", roll: 3, name: "Siya Agarwal", gen: "Female", sec: "C" },
    { adm: "ADM-1054", roll: 4, name: "Meera Agarwal", gen: "Female", sec: "C" },
    { adm: "ADM-1055", roll: 5, name: "Kavya Malhotra", gen: "Female", sec: "C" },
    { adm: "ADM-1056", roll: 6, name: "Ishita Malhotra", gen: "Female", sec: "C" },
    { adm: "ADM-1057", roll: 7, name: "Riya Malhotra", gen: "Female", sec: "C" },
    { adm: "ADM-1058", roll: 8, name: "Pooja Kapoor", gen: "Female", sec: "C" },
    { adm: "ADM-1059", roll: 9, name: "Diya Kapoor", gen: "Female", sec: "C" },
    { adm: "ADM-1060", roll: 10, name: "Neha Kapoor", gen: "Female", sec: "C" },
    { adm: "ADM-1061", roll: 11, name: "Aarav Sharma", gen: "Male", sec: "C" },
    { adm: "ADM-1062", roll: 12, name: "Vivaan Sharma", gen: "Male", sec: "C" },
    { adm: "ADM-1063", roll: 13, name: "Aditya Sharma", gen: "Male", sec: "C" },
    { adm: "ADM-1064", roll: 14, name: "Krishna Verma", gen: "Male", sec: "C" },
    { adm: "ADM-1065", roll: 15, name: "Arjun Verma", gen: "Male", sec: "C" },
    { adm: "ADM-1066", roll: 16, name: "Sai Verma", gen: "Male", sec: "C" },
    { adm: "ADM-1067", roll: 17, name: "Reyansh Yadav", gen: "Male", sec: "C" },
    { adm: "ADM-1068", roll: 18, name: "Vihaan Yadav", gen: "Male", sec: "C" },
    { adm: "ADM-1069", roll: 19, name: "Ayaan Yadav", gen: "Male", sec: "C" },
    { adm: "ADM-1070", roll: 20, name: "Kabir Singh", gen: "Male", sec: "C" },
    { adm: "ADM-1071", roll: 21, name: "Rohan Singh", gen: "Male", sec: "C" },
    { adm: "ADM-1072", roll: 22, name: "Mohit Singh", gen: "Male", sec: "C" },
    { adm: "ADM-1073", roll: 23, name: "Nikhil Gupta", gen: "Male", sec: "C" },
    { adm: "ADM-1074", roll: 24, name: "Yash Gupta", gen: "Male", sec: "C" },
    { adm: "ADM-1075", roll: 25, name: "Kunal Gupta", gen: "Male", sec: "C" },
    // Section D
    { adm: "ADM-1076", roll: 1, name: "Dev Patel", gen: "Male", sec: "D" },
    { adm: "ADM-1077", roll: 2, name: "Aryan Patel", gen: "Male", sec: "D" },
    { adm: "ADM-1078", roll: 3, name: "Harsh Patel", gen: "Male", sec: "D" },
    { adm: "ADM-1079", roll: 4, name: "Laksh Jain", gen: "Male", sec: "D" },
    { adm: "ADM-1080", roll: 5, name: "Shivam Jain", gen: "Male", sec: "D" },
    { adm: "ADM-1081", roll: 6, name: "Ananya Jain", gen: "Female", sec: "D" },
    { adm: "ADM-1082", roll: 7, name: "Priya Chauhan", gen: "Female", sec: "D" },
    { adm: "ADM-1083", roll: 8, name: "Siya Chauhan", gen: "Female", sec: "D" },
    { adm: "ADM-1084", roll: 9, name: "Meera Chauhan", gen: "Female", sec: "D" },
    { adm: "ADM-1085", roll: 10, name: "Kavya Kumar", gen: "Female", sec: "D" },
    { adm: "ADM-1086", roll: 11, name: "Ishita Kumar", gen: "Female", sec: "D" },
    { adm: "ADM-1087", roll: 12, name: "Riya Kumar", gen: "Female", sec: "D" },
    { adm: "ADM-1088", roll: 13, name: "Pooja Mishra", gen: "Female", sec: "D" },
    { adm: "ADM-1089", roll: 14, name: "Diya Mishra", gen: "Female", sec: "D" },
    { adm: "ADM-1090", roll: 15, name: "Neha Mishra", gen: "Female", sec: "D" },
    { adm: "ADM-1091", roll: 16, name: "Aarav Rai", gen: "Male", sec: "D" },
    { adm: "ADM-1092", roll: 17, name: "Vivaan Rai", gen: "Male", sec: "D" },
    { adm: "ADM-1093", roll: 18, name: "Aditya Rai", gen: "Male", sec: "D" },
    { adm: "ADM-1094", roll: 19, name: "Krishna Tyagi", gen: "Male", sec: "D" },
    { adm: "ADM-1095", roll: 20, name: "Arjun Tyagi", gen: "Male", sec: "D" },
    { adm: "ADM-1096", roll: 21, name: "Sai Tyagi", gen: "Male", sec: "D" },
    { adm: "ADM-1097", roll: 22, name: "Reyansh Saxena", gen: "Male", sec: "D" },
    { adm: "ADM-1098", roll: 23, name: "Vihaan Saxena", gen: "Male", sec: "D" },
    { adm: "ADM-1099", roll: 24, name: "Ayaan Saxena", gen: "Male", sec: "D" },
    { adm: "ADM-1100", roll: 25, name: "Kabir Pal", gen: "Male", sec: "D" }
  ];

  const studentsData = [];
  let studentCounter = 1;

  console.log('Seeding Class 1 students...');
  for (const raw of class1Raw) {
    const rollStr = String(raw.roll).padStart(3, '0');
    const eligibleTeachers = teachersForClassSection[`1-${raw.sec}`];
    const assignedTeacherId = eligibleTeachers[raw.roll % eligibleTeachers.length] || null;
    const photoArr = raw.gen === 'Female' ? femalePhotos : malePhotos;
    const photoUrl = photoArr[raw.roll % photoArr.length];

    studentsData.push({
      id: raw.adm,
      rollNumber: rollStr,
      name: raw.name,
      email: `student${studentCounter}@erp.com`,
      phone: `+91-91234-1${String(100 + raw.roll).slice(1)}`,
      class: "1",
      section: raw.sec,
      photoUrl: photoUrl,
      passwordHash: studentHash,
      teacherId: assignedTeacherId,
    });
    studentCounter++;
  }

  // 6. Generate Mock Students for Classes 2 to 12 (Sections A-D, 25 per section)
  // Expanded name bank to generate fully different names
  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Shaurya',
    'Atharva', 'Aaryan', 'Dev', 'Kabir', 'Aryan', 'Ananya', 'Diya', 'Saanvi', 'Pari', 'Angel',
    'Ishi', 'Aanya', 'Pihu', 'Riya', 'Aadhya', 'Anika', 'Kavya', 'Aditi', 'Avani', 'Prisha',
    'Rohan', 'Siddharth', 'Ishita', 'Tanisha', 'Meera', 'Karan', 'Rahul', 'Varun', 'Neha', 'Pooja',
    'Abhinav', 'Alok', 'Aman', 'Amit', 'Anil', 'Ankur', 'Ankit', 'Arpit', 'Ashish', 'Ayush',
    'Bhavesh', 'Chaitanya', 'Darshan', 'Deepak', 'Gaurav', 'Harish', 'Himanshu', 'Jatin', 'Kartik',
    'Lalit', 'Manish', 'Mayank', 'Naman', 'Nikhil', 'Pankaj', 'Piyush', 'Pranav', 'Rajat',
    'Rakesh', 'Ravi', 'Rohit', 'Sachin', 'Sandeep', 'Sanjay', 'Saurabh', 'Shreyas', 'Sumit',
    'Sunil', 'Tarun', 'Tushar', 'Udit', 'Vikas', 'Vikram', 'Vineet', 'Yash', 'Abhishek', 'Bhavana',
    'Deepika', 'Divya', 'Ekta', 'Garima', 'Geeta', 'Harshita', 'Indu', 'Jyoti', 'Kajal', 'Kiran',
    'Lata', 'Madhu', 'Mamta', 'Manju', 'Megha', 'Monika', 'Nisha', 'Payal', 'Preeti', 'Priyanka'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Patel', 'Mehta', 'Singh', 'Joshi', 'Rao', 'Reddy', 'Kumar',
    'Mishra', 'Pandey', 'Choudhury', 'Trivedi', 'Desai', 'Nair', 'Iyer', 'Sen', 'Bose', 'Das',
    'Roy', 'Malhotra', 'Kapoor', 'Khanna', 'Yadav', 'Agarwal', 'Bansal', 'Chawla', 'Dhawan',
    'Grover', 'Jain', 'Khurana', 'Luthra', 'Mahajan', 'Mehra', 'Sethi', 'Sood', 'Suri',
    'Talwar', 'Taneja', 'Wadhwa', 'Bhasin', 'Chaudhary', 'Dwivedi', 'Goyal', 'Kapoor', 'Mathur'
  ];

  const studentPhotos = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  ];

  let nameIndex = 0;
  let admissionCounter = 1101;

  console.log('Generating 25 students per section for classes 2 to 12...');
  for (let classNum = 2; classNum <= 12; classNum++) {
    for (const section of sectionsList) {
      const key = `${classNum}-${section}`;
      const eligibleTeachers = teachersForClassSection[key];

      for (let rollNum = 1; rollNum <= 25; rollNum++) {
        const rollStr = String(rollNum).padStart(3, '0');
        const customId = `ADM-${admissionCounter}`;
        admissionCounter++;

        // Select a unique name combination
        const firstName = firstNames[nameIndex % firstNames.length];
        const lastName = lastNames[(nameIndex + rollNum) % lastNames.length];
        const name = `${firstName} ${lastName}`;
        nameIndex++;

        // Assign to one of the teachers who teach this class-section in round-robin
        const assignedTeacherId = eligibleTeachers[rollNum % eligibleTeachers.length] || null;

        studentsData.push({
          id: customId,
          rollNumber: rollStr,
          name: name,
          email: `student${studentCounter}@erp.com`,
          phone: `+91-91234-${String(20000 + classNum * 100 + rollNum).slice(1)}`,
          class: String(classNum),
          section: section,
          photoUrl: studentPhotos[nameIndex % studentPhotos.length],
          passwordHash: studentHash,
          teacherId: assignedTeacherId,
        });
        studentCounter++;
      }
    }
  }

  console.log(`Inserting ${studentsData.length} students in bulk...`);
  await prisma.student.createMany({ data: studentsData });
  console.log('Seeded Students successfully.');

  // 7. Generate Attendance slots and records for July 1 to July 14, 2026 weekdays
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

  const periodTimes = ["08:30 AM", "09:20 AM", "10:10 AM", "11:00 AM", "12:30 PM", "01:20 PM", "02:10 PM"];

  console.log('Generating historical attendance slots & records...');
  
  const slotsToCreate = [];
  const attendancesToCreate = [];

  for (const date of attendanceDates) {
    for (let i = 0; i < dbTeachers.length; i++) {
      const teacher = dbTeachers[i];
      const startClass = startClasses[i % startClasses.length];
      const startSectionIdx = i % 4;

      // Seed slots for the periods taught by this teacher
      for (let p = 0; p < 7; p++) {
        const cNum = ((startClass + p - 1) % 12) + 1;
        const sec = sectionsList[(startSectionIdx + p) % 4];
        
        const slotId = `slot-${date}-${teacher.id}-P${p + 1}`;
        slotsToCreate.push({
          id: slotId,
          createdBy: teacher.name,
          teacherId: teacher.id,
          classId: String(cNum),
          sectionId: sec,
          date: date,
          time: periodTimes[p],
          duration: 45,
          type: 'Regular Class',
          status: 'completed',
          createdAt: new Date(`${date}T09:00:00.000Z`),
          updatedAt: new Date(`${date}T09:00:00.000Z`),
        });

        // Add attendance records for all students in this class-section
        const targetStudents = studentsData.filter(s => s.class === String(cNum) && s.section === sec);
        for (const student of targetStudents) {
          // 90% Present, 10% Absent probability
          const status = Math.random() > 0.10 ? 'present' : 'absent';
          attendancesToCreate.push({
            id: `att-${date}-${slotId}-${student.id}`,
            studentId: student.id,
            date: date,
            status: status,
            markedByTeacherId: teacher.id,
            slotId: slotId,
            createdAt: new Date(`${date}T09:00:00.000Z`),
            updatedAt: new Date(`${date}T09:00:00.000Z`),
          });
        }
      }
    }
  }

  console.log(`Inserting ${slotsToCreate.length} attendance slots in bulk...`);
  const batchSize = 1000;
  for (let idx = 0; idx < slotsToCreate.length; idx += batchSize) {
    await prisma.attendanceSlot.createMany({
      data: slotsToCreate.slice(idx, idx + batchSize)
    });
  }

  console.log(`Inserting ${attendancesToCreate.length} attendance records in bulk...`);
  for (let idx = 0; idx < attendancesToCreate.length; idx += batchSize) {
    await prisma.attendance.createMany({
      data: attendancesToCreate.slice(idx, idx + batchSize)
    });
  }
  console.log('Seeded historical attendance successfully.');

  // 8. Write to db.json to update local caching/fallback DB
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
    attendance: attendancesToCreate.map(a => ({
      id: a.id,
      studentId: a.studentId,
      date: a.date,
      status: a.status as 'present' | 'absent',
      markedByTeacherId: a.markedByTeacherId,
      slotId: a.slotId,
      updatedAt: a.updatedAt.toISOString(),
    })),
    attendanceSlots: slotsToCreate.map(s => ({
      id: s.id,
      createdBy: s.createdBy,
      teacherId: s.teacherId,
      classId: s.classId,
      sectionId: s.sectionId,
      date: s.date,
      time: s.time,
      duration: s.duration,
      type: s.type,
      status: s.status,
      updatedAt: s.updatedAt.toISOString(),
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
