import { formatUserDate, getUserTimeZone, zonedDateFields } from "@/lib/time/utils";
import type { Translator } from "@/lib/i18n/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

/** "Today, 8:00 AM", "Tomorrow, 8:00 AM", "Friday, 8:00 AM" within a week, otherwise the date. */
export function formatScheduledSendTime(value: Date | string, t: Translator, now = new Date()): string {
	const date = new Date(value);
	const zone = getUserTimeZone();
	const startOfDay = (input: Date) => {
		const fields = zonedDateFields(input, zone);
		fields.setUTCHours(0, 0, 0, 0);
		return fields.getTime();
	};
	const days = Math.round((startOfDay(date) - startOfDay(now)) / DAY_MS);
	const time = formatUserDate(date, { hour: "numeric", minute: "2-digit" });
	if (days === 0) return t("schedule.todayAt", { time });
	if (days === 1) return t("schedule.tomorrowAt", { time });
	if (days >= 2 && days <= 7) return formatUserDate(date, { weekday: "long", hour: "numeric", minute: "2-digit" });
	const sameYear = zonedDateFields(date, zone).getUTCFullYear() === zonedDateFields(now, zone).getUTCFullYear();
	return formatUserDate(date, { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }), hour: "numeric", minute: "2-digit" });
}
