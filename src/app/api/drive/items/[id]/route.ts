import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { driveItems } from "@/db/schema";
import { authorizeDrive } from "@/lib/drive/auth";
import { deleteDriveItems, getDriveItem, getDriveRole, toDriveItemDtos } from "@/lib/drive/access";
import { canEditDrive, normalizeDriveName } from "@/lib/drive/utils";
import type { DriveItemParams } from "./types";

/** Rename, move to trash or restore. */
export async function PATCH(request: Request, { params }: DriveItemParams) {
	const { id } = await params;
	const auth = await authorizeDrive(request, true);
	if (auth.error) return auth.error;
	const { db, user } = auth;
	const item = await getDriveItem(db, id);
	if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
	const body = await request.json().catch(() => ({})) as { name?: unknown; trashed?: unknown };
	const restoring = body.trashed === false && !!item.trashedAt;
	const role = await getDriveRole(db, user.id, item, restoring);
	if (!canEditDrive(role)) return NextResponse.json({ error: "Not found" }, { status: 404 });
	// Editors may move an item to the trash; only the owner can bring it back.
	if (body.trashed === false && role !== "owner") return NextResponse.json({ error: "Only the owner can do that" }, { status: 403 });
	const patch: Partial<typeof driveItems.$inferInsert> = { updatedAt: new Date() };
	if (body.name !== undefined) {
		const name = normalizeDriveName(body.name);
		if (!name) return NextResponse.json({ error: "Enter a name" }, { status: 400 });
		patch.name = name;
	}
	if (typeof body.trashed === "boolean") patch.trashedAt = body.trashed ? new Date() : null;
	await db.update(driveItems).set(patch).where(eq(driveItems.id, id));
	const [updated] = await toDriveItemDtos(db, [{ ...item, ...patch } as typeof item], user.id, () => role!);
	return NextResponse.json({ item: updated });
}

/** Permanently deletes an item the owner has already moved to the trash. */
export async function DELETE(request: Request, { params }: DriveItemParams) {
	const { id } = await params;
	const auth = await authorizeDrive(request, true);
	if (auth.error) return auth.error;
	const { env, db, user } = auth;
	const item = await getDriveItem(db, id);
	if (!item || item.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
	if (!item.trashedAt) return NextResponse.json({ error: "Move the item to trash first" }, { status: 409 });
	await deleteDriveItems(env, [item]);
	return NextResponse.json({ ok: true });
}
