import { Suspense } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { authPageMetadata } from "../auth-metadata";
import { ResetPasswordClient } from "./reset-password-client";

export const dynamic = "force-dynamic";

export const generateMetadata = () => authPageMetadata("auth.reset.chooseNew");

export default function ResetPasswordPage() {
	return (
		<AuthGuard mode="public">
			<Suspense>
				<ResetPasswordClient />
			</Suspense>
		</AuthGuard>
	);
}
