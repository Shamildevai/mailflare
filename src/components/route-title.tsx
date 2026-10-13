"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBranding } from "@/components/branding-provider";
import { useLanguage } from "@/components/language-provider";
import { getRouteTitleKey } from "./route-title-utils";

export function RouteTitle() {
	const pathname = usePathname();
	const { t } = useLanguage();
	const { appName } = useBranding();
	const key = getRouteTitleKey(pathname);
	const title = key ? `${t(key)} - ${appName}` : null;

	useEffect(() => {
		if (title) document.title = title;
	}, [title]);

	return null;
}
