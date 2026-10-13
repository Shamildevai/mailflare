import { AuthGuard } from "@/components/auth/auth-guard";
import { authPageMetadata } from "../auth-metadata";
import { ForgotPasswordClient } from "./forgot-password-client";

export const dynamic = "force-dynamic";

export const generateMetadata = () => authPageMetadata("auth.forgot.title");

export default function ForgotPasswordPage() {
	return (
		<AuthGuard mode="public">
			<ForgotPasswordClient />
		</AuthGuard>
	);
}
