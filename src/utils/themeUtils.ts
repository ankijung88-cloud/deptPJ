import React from 'react';

// ===================================================
// Joseon Dynasty Rich Multi-Color Theme System
// Each theme has: bg, accent, highlight + 5 extra harmonious colors
// Text colors are auto-computed for legibility
// ===================================================

export interface JoseonTheme {
    // Core palette
    bgColor: string;
    accentColor: string;
    highlightColor: string;
    borderColor: string;
    glowColor: string;
    name: string;

    // 5 harmonious companion colors
    color1: string; // card / panel background
    color2: string; // secondary accent (headers, badges)
    color3: string; // divider / border
    color4: string; // tag / chip color
    color5: string; // gradient overlay / tertiary

    // Auto-contrast text colors
    textPrimary: string;   // high contrast (title text)
    textSecondary: string; // medium contrast (body text)
    textMuted: string;     // low contrast (captions)

    // Pre-built React CSSProperties style objects
    bgStyle: React.CSSProperties;
    accentStyle: React.CSSProperties;
    highlightStyle: React.CSSProperties;
    borderStyle: React.CSSProperties;
    glowStyle: React.CSSProperties;
    bgAccentStyle: React.CSSProperties;
    bgHighlightStyle: React.CSSProperties;
    cardBgStyle: React.CSSProperties;
    cardBorderStyle: React.CSSProperties;
    color1Style: React.CSSProperties;
    color2Style: React.CSSProperties;
    textPrimaryStyle: React.CSSProperties;
    textSecondaryStyle: React.CSSProperties;
}

// [bgColor, accentColor, highlightColor, glowColor,
//  color1, color2, color3, color4, color5, name]
type PaletteData = [
    string, string, string, string,
    string, string, string, string, string, string
];

const JOSEON_PALETTE_DATA: PaletteData[] = [
    // 1. 내금위 (Royal Guard) — crimson & gold
    ['#2C0A0A', '#D4AF37', '#FF5252', 'rgba(212,175,55,0.45)',
        '#5C1A1A', '#8B2020', '#D4AF3755', '#FFD700', '#FF8A80', '내금위 (Royal Guard)'],

    // 2. 관복 (Officer Blue) — deep indigo & sky
    ['#0A0F1E', '#38BDF8', '#7DD3FC', 'rgba(56,189,248,0.4)',
        '#1E2D4A', '#1E3A5F', '#38BDF833', '#E0F2FE', '#0EA5E9', '관복 (Officer Blue)'],

    // 3. 선비 (Scholar) — forest jade
    ['#0A1F17', '#10B981', '#34D399', 'rgba(16,185,129,0.4)',
        '#1A3D2B', '#2D5A40', '#10B98133', '#A7F3D0', '#059669', '선비 (Scholar Green)'],

    // 4. 왕실 (Royal Court) — purple & lilac
    ['#180B2E', '#A855F7', '#C084FC', 'rgba(168,85,247,0.4)',
        '#2D1554', '#4A1D96', '#A855F733', '#E9D5FF', '#7C3AED', '왕실 (Royal Purple)'],

    // 5. 포수 (Hunter) — warm earth & amber
    ['#1F0F03', '#F59E0B', '#FCD34D', 'rgba(245,158,11,0.4)',
        '#3D1F08', '#5C3010', '#F59E0B33', '#FEF3C7', '#D97706', '포수 (Hunter Amber)'],

    // 6. 묵서 (Ink Calligraphy) — near-black & silver
    ['#0A0A0A', '#A8A8A8', '#E5E5E5', 'rgba(168,168,168,0.35)',
        '#1A1A1A', '#2A2A2A', '#A8A8A833', '#F5F5F5', '#6B7280', '묵서 (Ink & Silver)'],

    // 7. 해군 (Navy Strategist) — teal & cyan
    ['#041520', '#22D3EE', '#67E8F9', 'rgba(34,211,238,0.4)',
        '#0C2E3E', '#0E4558', '#22D3EE33', '#CFFAFE', '#0891B2', '해군 (Ocean Strategy)'],

    // 8. 후궁 (Inner Palace) — plum & rose
    ['#1C041F', '#E879F9', '#F0ABFC', 'rgba(232,121,249,0.4)',
        '#3A0A40', '#5A0F61', '#E879F933', '#FAE8FF', '#C026D3', '후궁 (Inner Palace)'],

    // 9. 학자 (Jade Scholar) — emerald & mint
    ['#021A10', '#34D399', '#6EE7B7', 'rgba(52,211,153,0.4)',
        '#0A3020', '#10432C', '#34D39933', '#D1FAE5', '#059669', '학자 (Jade Scholar)'],

    // 10. 무장 (Warrior) — copper & fire
    ['#1A0700', '#FB923C', '#FCA369', 'rgba(251,146,60,0.4)',
        '#3D1500', '#5C1F05', '#FB923C33', '#FFEDD5', '#EA580C', '무장 (Warrior Copper)'],

    // 11. 야간 (Night Sky) — deep violet & indigo
    ['#07041A', '#6366F1', '#818CF8', 'rgba(99,102,241,0.4)',
        '#130B38', '#1E1254', '#6366F133', '#E0E7FF', '#4338CA', '야간 (Night Sky)'],

    // 12. 대나무 (Bamboo Grove) — lime & sage
    ['#071508', '#84CC16', '#A3E635', 'rgba(132,204,22,0.4)',
        '#142B0E', '#1C3D14', '#84CC1633', '#ECFCCB', '#65A30D', '대나무 (Bamboo Grove)'],

    // 13. 홍화 (Safflower Pink) — rose & coral
    ['#200510', '#FB7185', '#FDA4AF', 'rgba(251,113,133,0.4)',
        '#40091E', '#5C0D28', '#FB718533', '#FFE4E6', '#E11D48', '홍화 (Safflower Pink)'],

    // 14. 심해 (Deep Sea) — navy blue & aqua
    ['#020C1B', '#38BDF8', '#7DD3FC', 'rgba(56,189,248,0.4)',
        '#061C38', '#0A2850', '#38BDF833', '#BAE6FD', '#0369A1', '심해 (Deep Sea)'],

    // 15. 청동 (Ancient Bronze) — deep amber & rust
    ['#150900', '#D97706', '#F59E0B', 'rgba(217,119,6,0.4)',
        '#2D1500', '#422000', '#D9770633', '#FEF3C7', '#B45309', '청동 (Ancient Bronze)'],

    // 16. 신비 (Mystical) — violet & lavender
    ['#100624', '#A855F7', '#C084FC', 'rgba(168,85,247,0.4)',
        '#200D47', '#30126A', '#A855F733', '#EDE9FE', '#7C3AED', '신비 (Mystical Violet)'],

    // 17. 산천 (Mountain Stream) — teal & seafoam
    ['#011A14', '#2DD4BF', '#5EEAD4', 'rgba(45,212,191,0.4)',
        '#0A332A', '#0F4A3C', '#2DD4BF33', '#CCFBF1', '#0D9488', '산천 (Mountain Stream)'],

    // 18. 전통 (Traditional Clay) — terracotta & beige
    ['#1C0B00', '#C07040', '#D4956A', 'rgba(192,112,64,0.4)',
        '#3A1A08', '#542810', '#C0704033', '#FDF8F0', '#92400E', '전통 (Traditional Clay)'],
];

// Compute relative luminance from hex to determine if text should be dark or light
function getLuminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastText(bgHex: string): { primary: string; secondary: string; muted: string } {
    const lum = getLuminance(bgHex);
    // Dark background → use white text; light bg → use near-black text
    if (lum < 0.15) {
        return { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.75)', muted: 'rgba(255,255,255,0.45)' };
    } else if (lum < 0.4) {
        return { primary: '#F8FAFC', secondary: 'rgba(248,250,252,0.80)', muted: 'rgba(248,250,252,0.55)' };
    } else {
        return { primary: '#0F172A', secondary: 'rgba(15,23,42,0.75)', muted: 'rgba(15,23,42,0.50)' };
    }
}

function buildTheme(data: PaletteData): JoseonTheme {
    const [bgColor, accentColor, highlightColor, glowColor,
        color1, color2, color3, color4, color5, name] = data;
    const text = getContrastText(bgColor);

    return {
        bgColor, accentColor, highlightColor,
        borderColor: accentColor,
        glowColor, name,
        color1, color2, color3, color4, color5,
        textPrimary: text.primary,
        textSecondary: text.secondary,
        textMuted: text.muted,

        // Style objects
        bgStyle: { backgroundColor: bgColor, color: text.primary },
        accentStyle: { color: accentColor },
        highlightStyle: { color: highlightColor },
        borderStyle: { borderColor: accentColor },
        glowStyle: { boxShadow: `0 0 24px ${glowColor}` },
        bgAccentStyle: { backgroundColor: accentColor, color: getContrastText(accentColor).primary },
        bgHighlightStyle: { backgroundColor: highlightColor, color: getContrastText(highlightColor).primary },
        cardBgStyle: { backgroundColor: color1, border: `1px solid ${color3}`, color: text.primary },
        cardBorderStyle: { borderColor: `${accentColor}55` },
        color1Style: { backgroundColor: color1, color: text.primary },
        color2Style: { backgroundColor: color2, color: getContrastText(color2).primary },
        textPrimaryStyle: { color: text.primary },
        textSecondaryStyle: { color: text.secondary },
    };
}

export const JOSEON_THEMES: JoseonTheme[] = JOSEON_PALETTE_DATA.map(buildTheme);

export const getContrastColor = (bgHex: string): string => {
    const lum = getLuminance(bgHex);
    return lum < 0.35 ? '#FFFFFF' : '#0F172A';
};


export const DEFAULT_THEME: JoseonTheme = buildTheme([
    '#1A2420', '#00FFC2', '#FF3B30', 'rgba(0,255,194,0.3)',
    '#243530', '#2E4540', '#00FFC233', '#80FFE1', '#FF8A80', 'K-Archive (Default)'
]);

function hashString(s: string): number {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

export const getJoseonThemeById = (id: string, _fallbackFloor?: string | number): JoseonTheme => {
    if (!id) return DEFAULT_THEME;
    const index = hashString(id) % JOSEON_THEMES.length;
    return JOSEON_THEMES[index];
};


export const getJoseonTheme = (floor: string | number): JoseonTheme => {
    const f = parseInt(floor.toString(), 10);
    if (isNaN(f) || f < 1 || f > 6) return DEFAULT_THEME;
    return JOSEON_THEMES[(f - 1) % JOSEON_THEMES.length];
};
export const getFloorBySubId = (subId: string): string | undefined => {
    if (!subId) return undefined;
    if (subId.startsWith('f1_') || ['global', 'window', 'sync', 'pop'].includes(subId)) return '1';
    if (subId.startsWith('f2_') || ['performance', 'exhibit'].includes(subId)) return '2';
    if (subId.startsWith('f3_') || ['f3_media', 'f3_lounge', 'f3_audio'].includes(subId)) return '3';
    if (subId.startsWith('f4_') || ['talk', 'interview'].includes(subId)) return '4';
    if (subId.startsWith('f5_') || ['archive', 'collection'].includes(subId)) return '5';
    if (subId.startsWith('f6_') || ['heritage', 'travel'].includes(subId)) return '6';
    return undefined;
};
