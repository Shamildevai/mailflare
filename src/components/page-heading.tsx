"use client";

import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/lib/i18n/types";

export function PageHeading({ labelKey }: { labelKey: TranslationKey }) {
	const { t } = useLanguage();
	return <h1 className="sr-only">{t(labelKey)}</h1>;
}
