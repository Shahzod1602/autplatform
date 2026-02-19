import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        materials: { orderBy: { createdAt: "desc" } },
        enrollments: { select: { userId: true, enrolledAt: true } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const grouped = {
      ...course,
      examMaterials: course.materials.filter((m) => m.type === "EXAM_MATERIAL"),
      textbooks: course.materials.filter((m) => m.type === "TEXTBOOK"),
      slides: course.materials.filter((m) => m.type === "SLIDE"),
    };

    return NextResponse.json(grouped);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const { name, description, icon, color } = await req.json();

    const course = await prisma.course.update({
      where: { id },
      data: { name, description, icon, color },
    });

    return NextResponse.json(course);
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
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ message: "Course deleted" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
