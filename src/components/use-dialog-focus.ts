"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

const FOCUSABLE = ["a[href]", "button:not([disabled])", "input:not([disabled])", "select:not([disabled])", "textarea:not([disabled])", "[tabindex]"]
	.map((selector) => `${selector}:not([tabindex="-1"])`)
	.join(", ");

export function getFocusable(container: HTMLElement): HTMLElement[] {
	return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => element.offsetParent !== null || element === document.activeElement);
}

export function useDialogFocus(container: RefObject<HTMLElement | null>, initialFocus?: RefObject<HTMLElement | null>) {
	const [opener] = useState(() => (typeof document !== "undefined" && document.activeElement instanceof HTMLElement ? document.activeElement : null));

	useEffect(() => {
		const root = container.current;
		(initialFocus?.current ?? (root ? getFocusable(root)[0] : null) ?? root)?.focus();

		function onKeyDown(event: KeyboardEvent) {
			if (event.key !== "Tab" || !root) return;
			const focusable = getFocusable(root);
			if (focusable.length === 0) {
				event.preventDefault();
				return;
			}
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const inside = root.contains(document.activeElement);
			if (event.shiftKey && (!inside || document.activeElement === first)) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && (!inside || document.activeElement === last)) {
				event.preventDefault();
				first.focus();
			}
		}

		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [container, initialFocus]);

	useEffect(() => () => {
		if (opener?.isConnected) opener.focus();
	}, [opener]);
}
