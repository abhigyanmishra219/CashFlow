import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const coursesBatch = await req.json();

    if (!Array.isArray(coursesBatch)) {
      return NextResponse.json(
        { success: false, message: "Payload must be a JSON Array of courses." },
        { status: 400 }
      );
    }

    if (coursesBatch.length === 0) {
      return NextResponse.json(
        { success: false, message: "Empty courses batch payload." },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const sanitizedCourses: any[] = [];
    const seenCodes = new Set<string>();

    // 1. Basic validation and internal batch duplicate check
    for (let i = 0; i < coursesBatch.length; i++) {
      const course = coursesBatch[i];
      const rowNum = i + 1;

      if (!course.name || !course.code || !course.brand || !course.category || !course.duration || !course.fee) {
        errors.push(`Row ${rowNum}: Missing one or more required fields (name, code, brand, category, duration, fee).`);
        continue;
      }

      const codeStr = String(course.code).trim();

      if (seenCodes.has(codeStr)) {
        errors.push(`Row ${rowNum}: Duplicate course code '${codeStr}' detected within the uploaded batch.`);
        continue;
      }
      seenCodes.add(codeStr);

      // Format fee if raw number/text
      let feeVal = String(course.fee).trim();
      if (!feeVal.includes("₹")) {
        const numFee = parseFloat(feeVal.replace(/[^\d.]/g, ""));
        if (!isNaN(numFee)) {
          feeVal = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(numFee);
        }
      }

      sanitizedCourses.push({
        name: String(course.name).trim(),
        code: codeStr,
        brand: String(course.brand).trim(),
        category: String(course.category).trim(),
        duration: String(course.duration).trim(),
        fee: feeVal,
        status: String(course.status || "ACTIVE").trim().toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      });
    }

    if (sanitizedCourses.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid courses to import.", errors },
        { status: 400 }
      );
    }

    // 2. Database duplicate check
    const codesToCheck = sanitizedCourses.map((c) => c.code);
    const existingCourses = await Course.find({ code: { $in: codesToCheck } });
    const existingCodes = new Set(existingCourses.map((c) => c.code));

    const finalCourses: any[] = [];
    sanitizedCourses.forEach((c) => {
      if (existingCodes.has(c.code)) {
        errors.push(`Course with code '${c.code}' already exists in database.`);
      } else {
        finalCourses.push(c);
      }
    });

    if (finalCourses.length === 0) {
      return NextResponse.json(
        { success: false, message: "All courses in this batch already exist in the database.", errors },
        { status: 400 }
      );
    }

    // 3. Batch insert
    const inserted = await Course.insertMany(finalCourses);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully imported ${inserted.length} course(s).`,
        importedCount: inserted.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error bulk importing courses:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to bulk import courses." },
      { status: 500 }
    );
  }
}
