"use client";

import { scheduledFolderConfig } from "@/components/messages/message-folder-configs";
import { MessageFolderPage } from "@/components/messages/message-folder-page";

export default function ScheduledPage() {
	return <MessageFolderPage config={scheduledFolderConfig} />;
}
