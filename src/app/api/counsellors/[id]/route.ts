import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Counsellor not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Counsellor deleted successfully" });
  } catch (error: any) {
    console.error("Delete Counsellor Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete counsellor" }, { status: 500 });
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
    const updated = await User.findByIdAndUpdate(id, body, { new: true }).select("-password");
    if (!updated) {
      return NextResponse.json({ error: "Counsellor not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, counsellor: updated });
  } catch (error: any) {
    console.error("Update Counsellor Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update counsellor" }, { status: 500 });
  }
}
