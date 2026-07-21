import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function getUserFromCookies() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.id) return null;

    await dbConnect();
    // Retrieve the user from the database, omitting the password field
    const userDoc = await User.findById(decoded.id).select("-password").lean();
    return userDoc;
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes("Dynamic server usage")) {
      throw error;
    }
    console.error("Error in getUserFromCookies:", error);
    return null;
  }
}
