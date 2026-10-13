import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { driveItems } from "@/db/schema";
import { getEnv } from "@/lib/cloudflare";
import { getDriveChain, getPublicDriveItem } from "@/lib/drive/access";
import { streamDriveFile } from "@/lib/drive/content";
import type { DriveTokenParams } from "./types";

const publicItem = (row: typeof driveItems.$inferSelect) => ({ id: row.id, kind: row.kind, name: row.name, size: row.size, contentType: row.contentType, updatedAt: row.updatedAt.toISOString() });

/** Public, unauthenticated access to an item (and its subtree) shared by link. */
export async function GET(request: Request, { params }: DriveTokenParams) {
	const { token } = await params;
	const env = getEnv();
	const db = getDb(env);
	const url = new URL(request.url);
	const target = url.searchParams.get("item");
	const resolved = await getPublicDriveItem(db, token, target);
	if (!resolved) return NextResponse.json({ error: "Link not found" }, { status: 404 });
	const { root, item } = resolved;
	if (url.searchParams.get("content") === "1" || url.searchParams.get("download") === "1") {
		return streamDriveFile(env, request, item, url.searchParams.get("download") === "1");
	}
	const children = item.kind === "folder" ? await db.select().from(driveItems).where(and(eq(driveItems.parentId, item.id), isNull(driveItems.trashedAt), isNull(driveItems.uploadId))) : [];
	const chain = await getDriveChain(db, item);
	const path = chain.slice(chain.findIndex((entry) => entry.id === root.id)).map((entry) => ({ id: entry.id, name: entry.name }));
	return NextResponse.json({ item: publicItem(item), items: children.map(publicItem), path });
}
