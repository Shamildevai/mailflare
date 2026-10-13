export type DriveUploadStatus = "queued" | "uploading" | "done" | "failed";

export type DriveUploadEntry = {
	id: string;
	name: string;
	percent: number;
	resumed: boolean;
	status: DriveUploadStatus;
	error?: string;
};
