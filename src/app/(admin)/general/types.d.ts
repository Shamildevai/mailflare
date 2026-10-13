export interface GeneralSettings {
	outboundAttachmentMaxMb: number;
	/** Per-user Drive cap in GB; null when unlimited. */
	driveStorageLimitGb: number | null;
}
