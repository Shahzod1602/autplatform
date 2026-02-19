import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const type = req.nextUrl.searchParams.get("type");

    const where: { courseId: string; type?: "EXAM_MATERIAL" | "TEXTBOOK" | "SLIDE" } = { courseId: id };
    if (type && ["EXAM_MATERIAL", "TEXTBOOK", "SLIDE"].includes(type)) {
      where.type = type as "EXAM_MATERIAL" | "TEXTBOOK" | "SLIDE";
    }

    const materials = await prisma.courseMaterial.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(materials);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const { title, type, fileUrl, fileName, fileSize } = await req.json();

    if (!title || !type || !fileUrl || !fileName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!["EXAM_MATERIAL", "TEXTBOOK", "SLIDE"].includes(type)) {
      return NextResponse.json({ error: "Invalid material type" }, { status: 400 });
    }

    const material = await prisma.courseMaterial.create({
      data: {
        courseId: id,
        title,
        type,
        fileUrl,
        fileName,
        fileSize: fileSize || 0,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
