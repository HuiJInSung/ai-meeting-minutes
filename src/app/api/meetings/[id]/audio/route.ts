import { get } from "@vercel/blob";
import { findCurrentUser, unauthorized } from "@/lib/dal";
import { findMeeting } from "@/lib/meetings";

// 播放 / 下載錄音檔：GET /api/meetings/:id/audio
// Blob 是 private，確認是本人的紀錄後才由伺服器轉送檔案內容
export async function GET(_req: Request, ctx: RouteContext<"/api/meetings/[id]/audio">) {
  const user = await findCurrentUser();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const meeting = await findMeeting(user.id, id);
  if (!meeting?.audio) return Response.json({ error: "找不到錄音檔" }, { status: 404 });

  const result = await get(meeting.audio.pathname, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return Response.json({ error: "找不到錄音檔" }, { status: 404 });
  }

  const fileName = encodeURIComponent(meeting.audio.originalName ?? "recording");
  return new Response(result.stream, {
    headers: {
      // 不帶 Content-Length：Blob 的 get() 在串流回應時 size 會是 0，帶上會讓瀏覽器只收到 0 bytes
      "Content-Type": meeting.audio.contentType ?? result.blob.contentType,
      "Content-Disposition": `inline; filename*=UTF-8''${fileName}`,
      "Cache-Control": "private, no-store",
    },
  });
}
