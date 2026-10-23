import { connection } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MeetingModel } from "@/models/Meeting";

// 測試資料庫連線：GET /api/health/db
export async function GET() {
  await connection();

  try {
    const conn = await connectDB();
    const meetingCount = await MeetingModel.countDocuments();

    return Response.json({
      ok: true,
      database: conn.connection.name,
      meetingCount,
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
