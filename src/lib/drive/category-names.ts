export const DRIVE_CATEGORIES = ["photos", "videos", "documents", "others"] as const;
export type DriveCategory = (typeof DRIVE_CATEGORIES)[number];

export function isDriveCategory(value: string | null): value is DriveCategory {
	return !!value && (DRIVE_CATEGORIES as readonly string[]).includes(value);
}
