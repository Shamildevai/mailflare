"use client";

import { scheduledFolderConfig } from "@/components/messages/message-folder-configs";
import { MessageSplitLayout } from "@/components/messages/message-split-layout";

export default function ScheduledLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<MessageSplitLayout config={scheduledFolderConfig}>
			{children}
		</MessageSplitLayout>
	);
}
