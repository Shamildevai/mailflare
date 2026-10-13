import type { ReactNode } from "react";

export type HeaderSearchProps = {
	value: string;
	onChange: (value: string) => void;
	label: string;
	placeholder?: string;
	onSubmit?: () => void;
	trailing?: ReactNode;
	inputProps?: Record<string, string>;
};
