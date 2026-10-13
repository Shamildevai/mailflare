import { like, or, sql } from "drizzle-orm";
import type { AnyColumn, SQL } from "drizzle-orm";
import { driveItems } from "@/db/schema";

import { isDriveCategory } from "./category-names";
import type { DriveCategory } from "./category-names";

export { DRIVE_CATEGORIES, isDriveCategory } from "./category-names";
export type { DriveCategory } from "./category-names";

// Browsers leave the type empty for formats they do not know (HEIC, Markdown, Office files on some systems),
// so the file extension is checked as well.
const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif", "heic", "heif", "bmp", "tif", "tiff", "svg", "raw", "dng"];
const VIDEO_EXTENSIONS = ["mp4", "mov", "m4v", "mkv", "webm", "avi", "wmv", "mpg", "mpeg", "3gp"];
const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md", "csv", "rtf", "odt", "ods", "odp", "pages", "numbers", "key", "epub"];

export type DriveTypeColumns = { contentType: AnyColumn; name: AnyColumn };
const driveColumns: DriveTypeColumns = { contentType: driveItems.contentType, name: driveItems.name };

/** Parses `?types=photos,videos` into known categories. */
export function parseDriveCategories(value: string | null): DriveCategory[] {
	return [...new Set((value ?? "").split(",").filter(isDriveCategory))];
}

function build(columns: DriveTypeColumns) {
	const byExtension = (extensions: string[]) => extensions.map((extension) => sql`lower(${columns.name}) like ${`%.${extension}`}`);
	const photo = or(like(columns.contentType, "image/%"), ...byExtension(PHOTO_EXTENSIONS))!;
	const video = or(like(columns.contentType, "video/%"), ...byExtension(VIDEO_EXTENSIONS))!;
	const document = or(
		like(columns.contentType, "text/%"),
		like(columns.contentType, "application/vnd.%"),
		sql`${columns.contentType} in ('application/pdf', 'application/msword', 'application/rtf', 'application/json', 'application/epub+zip')`,
		...byExtension(DOCUMENT_EXTENSIONS),
	)!;
	return { photo, video, document };
}

/** WHERE condition selecting the files of a category. Photos and videos win over documents, e.g. for an .svg. */
export function driveCategoryCondition(category: DriveCategory, columns: DriveTypeColumns = driveColumns): SQL {
	const { photo, video, document } = build(columns);
	if (category === "photos") return photo;
	if (category === "videos") return video;
	if (category === "documents") return sql`((${document}) and not (${photo}) and not (${video}))`;
	return sql`(not (${photo}) and not (${video}) and not (${document}))`;
}

/** Files matching any of the chosen categories. */
export function driveTypesCondition(categories: DriveCategory[], columns: DriveTypeColumns = driveColumns): SQL {
	return or(...categories.map((category) => driveCategoryCondition(category, columns)))!;
}
