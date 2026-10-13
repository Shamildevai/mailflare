import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { appSettings, driveItems } from "@/db/schema";

/** Per-user Drive cap in bytes, or null for unlimited. Set by the admin on the General page. */
export async function getDriveStorageLimit(env: CloudflareEnv): Promise<number | null> {
	const [settings] = await getDb(env).select({ limit: appSettings.driveStorageLimitBytes }).from(appSettings).where(eq(appSettings.id, "default")).limit(1);
	return settings?.limit && settings.limit > 0 ? settings.limit : null;
}

export async function getDriveStorageUsed(db: ReturnType<typeof getDb>, ownerId: string): Promise<number> {
	const [usage] = await db.select({ total: sql<number>`coalesce(sum(${driveItems.size}), 0)` }).from(driveItems).where(eq(driveItems.ownerId, ownerId));
	return Number(usage?.total ?? 0);
}
