import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET - ดึง post ทั้งหมด
export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: true, // ดึงข้อมูล user ที่เป็นเจ้าของ post
            },
            orderBy: {
                id: "desc",
            },
        });
        return NextResponse.json(posts, { status: 200 });
    } catch  {
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 }
        );
    }
}

// POST - สร้าง post ใหม่
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json().catch(() => null)) as unknown;

        const title =
            typeof (body as { title?: unknown } | null)?.title === "string"
                ? (body as { title: string }).title.trim()
                : "";
        const content =
            typeof (body as { content?: unknown } | null)?.content === "string"
                ? (body as { content: string }).content
                : "";
        const authorIdRaw = (body as { authorId?: unknown } | null)?.authorId;
        const authorId = Number(authorIdRaw);

        // Validate required fields
        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        if (!Number.isFinite(authorId)) {
            return NextResponse.json(
                { error: "authorId must be a number" },
                { status: 400 }
            );
        }

        const post = await prisma.post.create({
            data: {
                title,
                content: content || "",
                authorId,
            },
            include: {
                author: true,
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch  {
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 }
        );
    }
}

// DELETE - ลบ post ตาม id
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const idRaw = searchParams.get("id");
        const id = Number(idRaw);

        if (!Number.isFinite(id)) {
            return NextResponse.json(
                { error: "id must be a number" },
                { status: 400 }
            );
        }

        await prisma.post.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
    } catch  {
        return NextResponse.json(
            { error: "Failed to delete post" },
            { status: 500 }
        );
    }
}
