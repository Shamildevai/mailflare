import { cookies } from "next/headers";
import { getEnv } from "@/lib/cloudflare";
import { LOCALE_COOKIE, createTranslator, loadMessages, resolveLocale } from "./utils";
import type { Locale, Messages } from "./types";

/** The locale chosen in the preference cookie, for server code that must render in it. */
export async function getRequestLocale() {
	return resolveLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}

/** Server-side catalog load through the static assets binding; English when the catalog cannot be read. */
export async function loadServerMessages(locale: Locale): Promise<Partial<Messages> | undefined> {
	try {
		const assets = getEnv().ASSETS;
		return await loadMessages(locale, (path) => assets.fetch(new URL(path, "https://mailflare.local")));
	} catch (error) {
		console.warn(`Falling back to English: ${error instanceof Error ? error.message : error}`);
		return undefined;
	}
}

// For server components and route handlers; client components use `useLanguage()`.
export async function getServerTranslator() {
	const locale = await getRequestLocale();
	return createTranslator(locale, await loadServerMessages(locale));
}
