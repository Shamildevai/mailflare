import type { Metadata } from "next";
import { getHomeBranding } from "@/app/home-server-utils";
import { getServerTranslator } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/types";

export async function authPageMetadata(titleKey: TranslationKey): Promise<Metadata> {
	const t = await getServerTranslator();
	const { appName } = await getHomeBranding();
	return { title: `${t(titleKey)} - ${appName}` };
}
