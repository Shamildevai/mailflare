import { newId } from "@/lib/ids";

export type StorageTestResult = { ok: boolean; error?: string; latencyMs: number };

/** Writes, reads back and deletes a small object, so a wrong key, bucket or endpoint shows up before real mail does. */
export async function testStorage(env: CloudflareEnv): Promise<StorageTestResult> {
	const started = Date.now();
	const key = `healthcheck/${newId("chk")}`;
	const payload = `mailflare ${new Date().toISOString()}`;
	try {
		await env.BUCKET.put(key, payload, { httpMetadata: { contentType: "text/plain" } });
		const object = await env.BUCKET.get(key);
		const text = object ? await object.text() : null;
		await env.BUCKET.delete(key);
		if (text !== payload) return { ok: false, error: "Object read back did not match what was written", latencyMs: Date.now() - started };
		return { ok: true, latencyMs: Date.now() - started };
	} catch (error) {
		await env.BUCKET.delete(key).catch(() => undefined);
		return { ok: false, error: error instanceof Error ? error.message : "Storage test failed", latencyMs: Date.now() - started };
	}
}
