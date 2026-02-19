import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id: string }).id;

    const existing = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
    });

    if (existing) {
      return NextResponse.json({ error: "You are already enrolled" }, { status: 400 });
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: { userId, courseId: id },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id: string }).id;

    await prisma.courseEnrollment.delete({
      where: { userId_courseId: { userId, courseId: id } },
    });

    return NextResponse.json({ message: "Unenrolled from course" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
