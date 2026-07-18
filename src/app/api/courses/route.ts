import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import { getUserFromCookies } from "@/lib/helper";

export async function GET() {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    
    let query: any = {};
    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      query.brand = user.brandScope;
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    const body = await req.json();

    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      body.brand = body.brand || user.brandScope;
    }

    // Check if course code already exists
    if (body.code) {
      const existingCourse = await Course.findOne({ code: body.code });
      if (existingCourse) {
        return NextResponse.json(
          { success: false, message: `Course with code '${body.code}' already exists.` },
          { status: 400 }
        );
      }
    }

    const newCourse = await Course.create(body);
    return NextResponse.json(
      { success: true, data: newCourse, message: "Course created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
