import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: "file:" + dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@aut-edu.uz" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@aut-edu.uz",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log("Admin created:", admin.email);

  // Test student
  const userPassword = await bcrypt.hash("student123", 10);
  const student = await prisma.user.upsert({
    where: { email: "student@aut-edu.uz" },
    update: {},
    create: {
      name: "Test Student",
      email: "student@aut-edu.uz",
      password: userPassword,
      role: "STUDENT",
      emailVerified: true,
    },
  });
  console.log("Student created:", student.email);

  // === COURSES ===
  const calculus = await prisma.course.create({
    data: {
      name: "Calculus I",
      description: "Limits, derivatives, integrals and their applications",
      color: "#3B82F6",
    },
  });

  const physics = await prisma.course.create({
    data: {
      name: "Physics I",
      description: "Fundamentals of mechanics, thermodynamics, and waves",
      color: "#EF4444",
    },
  });

  const programming = await prisma.course.create({
    data: {
      name: "Introduction to Programming",
      description: "Fundamentals of Python programming and algorithms",
      color: "#10B981",
    },
  });

  const english = await prisma.course.create({
    data: {
      name: "Academic English",
      description: "Academic English: writing, reading, speaking",
      color: "#F59E0B",
    },
  });

  console.log("Courses created");

  // === SAMPLE MATERIALS ===
  // Note: These are placeholder entries - actual files would be uploaded through the UI
  await prisma.courseMaterial.createMany({
    data: [
      // Calculus materials
      {
        courseId: calculus.id,
        title: "Midterm Exam 2025",
        type: "EXAM_MATERIAL",
        fileUrl: "/uploads/sample-calculus-midterm.pdf",
        fileName: "calculus-midterm-2025.pdf",
        fileSize: 1024000,
      },
      {
        courseId: calculus.id,
        title: "Final Exam 2024",
        type: "EXAM_MATERIAL",
        fileUrl: "/uploads/sample-calculus-final.pdf",
        fileName: "calculus-final-2024.pdf",
        fileSize: 2048000,
      },
      {
        courseId: calculus.id,
        title: "Stewart Calculus Textbook",
        type: "TEXTBOOK",
        fileUrl: "/uploads/sample-calculus-textbook.pdf",
        fileName: "stewart-calculus.pdf",
        fileSize: 15360000,
      },
      {
        courseId: calculus.id,
        title: "Lecture 1: Limits",
        type: "SLIDE",
        fileUrl: "/uploads/sample-calculus-slides-1.pdf",
        fileName: "lecture-1-limits.pdf",
        fileSize: 3072000,
      },

      // Physics materials
      {
        courseId: physics.id,
        title: "Midterm Exam 2025",
        type: "EXAM_MATERIAL",
        fileUrl: "/uploads/sample-physics-midterm.pdf",
        fileName: "physics-midterm-2025.pdf",
        fileSize: 1536000,
      },
      {
        courseId: physics.id,
        title: "Halliday Physics Textbook",
        type: "TEXTBOOK",
        fileUrl: "/uploads/sample-physics-textbook.pdf",
        fileName: "halliday-physics.pdf",
        fileSize: 20480000,
      },
      {
        courseId: physics.id,
        title: "Lecture 1: Kinematics",
        type: "SLIDE",
        fileUrl: "/uploads/sample-physics-slides-1.pdf",
        fileName: "lecture-1-kinematics.pdf",
        fileSize: 4096000,
      },

      // Programming materials
      {
        courseId: programming.id,
        title: "Final Exam 2024",
        type: "EXAM_MATERIAL",
        fileUrl: "/uploads/sample-prog-final.pdf",
        fileName: "programming-final-2024.pdf",
        fileSize: 512000,
      },
      {
        courseId: programming.id,
        title: "Python Crash Course",
        type: "TEXTBOOK",
        fileUrl: "/uploads/sample-python-textbook.pdf",
        fileName: "python-crash-course.pdf",
        fileSize: 10240000,
      },
      {
        courseId: programming.id,
        title: "Lecture 1: Variables & Data Types",
        type: "SLIDE",
        fileUrl: "/uploads/sample-prog-slides-1.pdf",
        fileName: "lecture-1-variables.pdf",
        fileSize: 2048000,
      },

      // English materials
      {
        courseId: english.id,
        title: "IELTS Practice Test",
        type: "EXAM_MATERIAL",
        fileUrl: "/uploads/sample-english-ielts.pdf",
        fileName: "ielts-practice.pdf",
        fileSize: 3072000,
      },
      {
        courseId: english.id,
        title: "Academic Writing Guide",
        type: "TEXTBOOK",
        fileUrl: "/uploads/sample-english-writing.pdf",
        fileName: "academic-writing-guide.pdf",
        fileSize: 5120000,
      },
    ],
  });

  console.log("Materials added");

  // Enroll student in some courses
  await prisma.courseEnrollment.createMany({
    data: [
      { userId: student.id, courseId: calculus.id },
      { userId: student.id, courseId: programming.id },
    ],
  });

  console.log("Student enrolled in courses");

  console.log("\n=== SEED COMPLETE ===");
  console.log("Admin: admin@aut-edu.uz / admin123");
  console.log("Student: student@aut-edu.uz / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
