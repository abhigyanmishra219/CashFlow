import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await Company.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Company deleted successfully" });
  } catch (error: any) {
    console.error("Delete Company Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete company" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const updateData: any = { ...body };

    if (updateData.annualCapacityCap !== undefined) {
      updateData.annualCapacityCap = Number(updateData.annualCapacityCap);
    }
    if (updateData.collectedRevenue !== undefined) {
      updateData.collectedRevenue = Number(updateData.collectedRevenue);
    }

    const updated = await Company.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, company: updated });
  } catch (error: any) {
    console.error("Update Company Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update company" }, { status: 500 });
  }
}
