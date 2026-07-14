# AttendancePro: Codebase Language Audit Report

This report presents the exact programming language distribution and codebase composition for the **AttendancePro** project. Calculations are based on all core source files located in the `src/` and `prisma/` directories.

---

## Codebase Language Distribution (Lines of Code)

| Programming Language | File Count | Lines of Code | Percentage (By Lines) |
| :--- | :---: | :---: | :---: |
| **TypeScript (React / `.tsx`)** | 24 | 4,165 | **74.39%** |
| **TypeScript (Pure JS/TS / `.ts`)** | 14 | 1,270 | **22.68%** |
| **CSS (Tailwind Base / `.css`)** | 1 | 97 | **1.73%** |
| **Prisma Schema (`.prisma`)** | 1 | 67 | **1.20%** |
| **Total Core Codebase** | **40** | **5,599** | **100.00%** |

---

## Codebase Language Distribution (By File Size)

| Programming Language | File Count | Code Size (Bytes) | Percentage (By Bytes) |
| :--- | :---: | :---: | :---: |
| **TypeScript (React / `.tsx`)** | 24 | 190,846 B | **82.64%** |
| **TypeScript (Pure JS/TS / `.ts`)** | 14 | 35,928 B | **15.56%** |
| **CSS (Tailwind Base / `.css`)** | 1 | 2,305 B | **1.00%** |
| **Prisma Schema (`.prisma`)** | 1 | 1,853 B | **0.80%** |
| **Total Core Codebase** | **40** | **230,932 B** | **100.00%** |

---

## Summary of Findings

- **Primary Language:** The project is built almost entirely on **TypeScript (97.07% total)**, ensuring strict static typing, interfaces, and safety across both Frontend components and Backend API route handlers.
- **Styling Architecture:** Custom CSS accounts for only **1.73%** of the codebase, as the project utilizes **Tailwind CSS utility classes** directly inside the React components.
- **Database Schema:** **1.20%** of the codebase defines the relational database tables (Admin, Teacher, Student, and Attendance logs) via the Prisma schema.
