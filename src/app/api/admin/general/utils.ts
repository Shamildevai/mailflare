import { z } from "zod";
import { getDb } from "@/db";
import { appSettings } from "@/db/schema";
import { getEnv } from "@/lib/cloudflare";
import { requireSessionUser } from "@/lib/api/auth";
import { isPrimaryAdmin } from "@/lib/auth/admin";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";
import { getOutboundAttachmentMaxMb, MAX_OUTBOUND_ATTACHMENT_MAX_MB } from "@/lib/email/attachment-policy";
import { getDriveStorageLimit } from "@/lib/drive/storage";

const GIB = 1024 ** 3;

const schema = z.object({
	outboundAttachmentMaxMb: z.number().int().min(1).max(MAX_OUTBOUND_ATTACHMENT_MAX_MB).optional(),
	/** Per-user Drive limit in GB; null removes the limit. */
	driveStorageLimitGb: z.number().positive().max(1_000_000).nullable().optional(),
});

async function readSettings(env: CloudflareEnv) {
	const limit = await getDriveStorageLimit(env);
	return { outboundAttachmentMaxMb: await getOutboundAttachmentMaxMb(env), driveStorageLimitGb: limit === null ? null : Math.round((limit / GIB) * 100) / 100 };
}

export async function GET(request: Request) {
	const env = getEnv();
	const auth = await requireSessionUser(env, request);
	if (auth.error) return auth.error;
	if (!isPrimaryAdmin(auth.user)) return Response.json({ error: "Forbidden" }, { status: 403 });
	return Response.json(await readSettings(env), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
	const env = getEnv();
	const auth = await requireSessionUser(env, request);
	if (auth.error) return auth.error;
	if (!isPrimaryAdmin(auth.user)) return Response.json({ error: "Forbidden" }, { status: 403 });
	if (!hasValidSessionMutationOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
	const parsed = schema.safeParse(await request.json().catch(() => null));
	if (!parsed.success || (parsed.data.outboundAttachmentMaxMb === undefined && parsed.data.driveStorageLimitGb === undefined)) return Response.json({ error: "Enter a valid attachment limit (1 to 25 MB) or Drive storage limit" }, { status: 400 });
	const values: Partial<typeof appSettings.$inferInsert> = { updatedAt: new Date() };
	if (parsed.data.outboundAttachmentMaxMb !== undefined) values.outboundAttachmentMaxMb = parsed.data.outboundAttachmentMaxMb;
	if (parsed.data.driveStorageLimitGb !== undefined) values.driveStorageLimitBytes = parsed.data.driveStorageLimitGb === null ? null : Math.round(parsed.data.driveStorageLimitGb * GIB);
	await getDb(env).insert(appSettings).values({ id: "default", ...values }).onConflictDoUpdate({ target: appSettings.id, set: values });
	return Response.json(await readSettings(env), { headers: { "Cache-Control": "no-store" } });
}
