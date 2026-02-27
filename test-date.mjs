const generateDateRange = (dateString) => {
    if (!dateString) return [];

    // Check for "YYYY.MM.DD" or "YYYY-MM-DD" patterns and "~" or "-" separators
    const normalized = dateString
        .replace(/\./g, '-')
        .replace(/\s*[~-]\s*/g, '~');

    // Extract dates using regex
    const dateRegex = /\d{4}-\d{1,2}-\d{1,2}/g;
    const matches = normalized.match(dateRegex);

    if (!matches) return [];

    if (matches.length === 2 && normalized.includes('~')) {
        const start = new Date(matches[0]);
        const end = new Date(matches[1]);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const dates = [];
            const current = new Date(start);
            // Cap at a reasonable max days (e.g., 365) to prevent infinite loops
            let maxDays = 365;
            while (current <= end && maxDays-- > 0) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
            return dates;
        }
    } else if (matches.length >= 1) {
        // Single date or multiple specific dates
        return matches.filter(m => {
            const d = new Date(m);
            return !isNaN(d.getTime());
        }).map(m => new Date(m).toISOString().split('T')[0]);
    }

    return [];
};

console.log(generateDateRange("2026.05.01 - 2026.05.07"));
