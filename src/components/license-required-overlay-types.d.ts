import type { ReactNode } from "react";

export type LicenseRequiredOverlayProps = {
	required: "Pro" | "Team" | "Pro or Team";
	children: ReactNode;
};
