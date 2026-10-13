import { env } from "cloudflare:workers";
import { getNodeEnv } from "@/lib/runtime";
import { withStorage } from "@/lib/storage";

export function getEnv(): CloudflareEnv {
	return withStorage(getNodeEnv() ?? (env as CloudflareEnv));
}

export async function getEnvAsync(): Promise<CloudflareEnv> {
	return getEnv();
}
