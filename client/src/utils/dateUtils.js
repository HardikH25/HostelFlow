/**
 * Utility functions for user-friendly date and time formatting
 * Designed specifically for non-technical users.
 */

// Formats a date into a clean, human-friendly string (e.g. "Oct 27, 2026, 2:41 PM")
export const formatFriendlyDateTime = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
};

// Formats log/audit timestamps (e.g. "Today at 10:41 AM", "Yesterday at 1:49 AM", or "Oct 27, 2026, 1:49 AM")
export const formatAuditTimestamp = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    if (isToday) {
        return `Today at ${timeStr}`;
    }
    if (isYesterday) {
        return `Yesterday at ${timeStr}`;
    }

    const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return `${dateStr}, ${timeStr}`;
};

// Replaces raw technical ISO timestamps (e.g. 2026-10-27T00:19:32.759Z) inside text
// with clear, friendly local date & time (e.g. "Oct 27, 2026, 5:49 AM")
export const humanizeTimestampsInText = (text) => {
    if (!text || typeof text !== "string") return text || "";

    // Replace technical jargon first
    let cleaned = text
        .replace(/SLA Breach/gi, "Target Overdue")
        .replace(/SLA Deadline adjusted/gi, "Resolution window adjusted")
        .replace(/SLA Deadline/gi, "Resolution target");

    // Match ISO-8601 timestamps like 2026-10-27T00:19:32.759Z or 2026-10-27T00:19:32Z
    cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/g, (isoStr) => {
        try {
            const date = new Date(isoStr);
            if (isNaN(date.getTime())) return isoStr;
            return formatFriendlyDateTime(date);
        } catch {
            return isoStr;
        }
    });

    return cleaned;
};
