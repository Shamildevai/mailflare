import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { getEnv } from "@/lib/cloudflare";
import { requireSessionUser } from "@/lib/api/auth";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";

export async function authorizeDrive(request: Request, mutation = false) {
	const env = getEnv();
	const { user, error } = await requireSessionUser(env, request);
	if (error) return { error } as const;
	if (mutation && !hasValidSessionMutationOrigin(request)) return { error: NextResponse.json({ error: "Invalid origin" }, { status: 403 }) } as const;
	return { env, db: getDb(env), user, error: null } as const;
}
