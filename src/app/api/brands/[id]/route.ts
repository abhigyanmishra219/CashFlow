import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Brand from "@/models/Brand";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    
    const updatedBrand = await Brand.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, brand: updatedBrand });
  } catch (error: any) {
    console.error("Update Brand Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const deletedBrand = await Brand.findByIdAndDelete(id);
    
    if (!deletedBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Brand deleted successfully" });
  } catch (error: any) {
    console.error("Delete Brand Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete brand" }, { status: 500 });
  }
}
