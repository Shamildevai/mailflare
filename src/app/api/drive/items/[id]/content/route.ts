import { authorizeDrive } from "@/lib/drive/auth";
import { getDriveItem, getDriveRole } from "@/lib/drive/access";
import { streamDriveFile } from "@/lib/drive/content";
import type { DriveItemParams } from "../types";

export async function GET(request: Request, { params }: DriveItemParams) {
	const { id } = await params;
	const auth = await authorizeDrive(request);
	if (auth.error) return auth.error;
	const { env, db, user } = auth;
	const item = await getDriveItem(db, id);
	if (!item || !(await getDriveRole(db, user.id, item))) return new Response("Not found", { status: 404 });
	return streamDriveFile(env, request, item, new URL(request.url).searchParams.get("download") === "1");
}
