import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { driveItems } from "@/db/schema";
import { authorizeDrive } from "@/lib/drive/auth";
import { withoutTrashedAncestors } from "@/lib/drive/access";

/** Every folder the user owns (not trashed), flat; the client builds the tree for the "Move to folder" menu. */
export async function GET(request: Request) {
	const auth = await authorizeDrive(request);
	if (auth.error) return auth.error;
	const { db, user } = auth;
	const rows = await db.select().from(driveItems).where(and(eq(driveItems.ownerId, user.id), eq(driveItems.kind, "folder"), isNull(driveItems.trashedAt))).limit(2000);
	const folders = await withoutTrashedAncestors(db, rows);
	return NextResponse.json({ folders: folders.map((folder) => ({ id: folder.id, name: folder.name, parentId: folder.parentId })) });
}
