export function parseDate(value) {
    if (!value) return null;

    const raw = String(value).trim();

    // Supports DD/MM/YYYY or DD-MM-YYYY
    const brMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (brMatch) {
        const [, day, month, year] = brMatch;
        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    // Supports YYYY-MM-DD
    const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsed = new Date(raw);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

export function daysAgo(value) {
    const date = parseDate(value);

    if (!date) {
        return null;
    }

    const today = startOfToday();

    return Math.floor((today - date) / 86400000);
}

export function isAfterDate(value, cutoffValue) {
    const date = parseDate(value);
    const cutoff = parseDate(cutoffValue);

    if (!date || !cutoff) {
        return true;
    }

    return date > cutoff;
}