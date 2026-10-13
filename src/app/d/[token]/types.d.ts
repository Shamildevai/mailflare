export type PublicDriveItem = { id: string; kind: "file" | "folder"; name: string; size: number; contentType: string; updatedAt: string };
export type PublicDriveListing = { item: PublicDriveItem; items: PublicDriveItem[]; path: { id: string; name: string }[] };
