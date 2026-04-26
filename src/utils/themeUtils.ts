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
    ['#F2E7D5', '#A12D27', '#FF5252', 'rgba(161,45,39,0.2)',
        '#F2E7D5', '#F2E7D5', '#A12D2722', '#FFD700', '#FF8A80', '내금위 (Royal Guard)'],

    // 2. 관복 (Officer Blue) — deep indigo & sky
    ['#F2E7D5', '#1A2944', '#7DD3FC', 'rgba(26,41,68,0.2)',
        '#F2E7D5', '#F2E7D5', '#1A294422', '#E0F2FE', '#0EA5E9', '관복 (Officer Blue)'],

    // 3. 선비 (Scholar) — forest jade
    ['#F2E7D5', '#4F6D5B', '#34D399', 'rgba(79,109,91,0.2)',
        '#F2E7D5', '#F2E7D5', '#4F6D5B22', '#A7F3D0', '#059669', '선비 (Scholar Green)'],

    // 4. 왕실 (Royal Court) — purple & lilac
    ['#F2E7D5', '#6D28D9', '#C084FC', 'rgba(109,40,217,0.2)',
        '#F2E7D5', '#F2E7D5', '#6D28D922', '#E9D5FF', '#7C3AED', '왕실 (Royal Purple)'],

    // 5. 포수 (Hunter) — warm earth & amber
    ['#F2E7D5', '#B45309', '#FCD34D', 'rgba(180,83,9,0.2)',
        '#F2E7D5', '#F2E7D5', '#B4530922', '#FEF3C7', '#D97706', '포수 (Hunter Amber)'],

    // 6. 묵서 (Ink Calligraphy) — charcoal & silver
    ['#F2E7D5', '#171717', '#E5E5E5', 'rgba(23,23,23,0.2)',
        '#F2E7D5', '#F2E7D5', '#17171722', '#F5F5F5', '#6B7280', '묵서 (Ink & Silver)'],

    // 7. 해군 (Navy Strategist) — teal & cyan
    ['#F2E7D5', '#0891B2', '#67E8F9', 'rgba(8,145,178,0.2)',
        '#F2E7D5', '#F2E7D5', '#0891B222', '#CFFAFE', '#0891B2', '해군 (Ocean Strategy)'],

    // 8. 후궁 (Inner Palace) — plum & rose
    ['#F2E7D5', '#C026D3', '#F0ABFC', 'rgba(192,38,211,0.2)',
        '#F2E7D5', '#F2E7D5', '#C026D322', '#FAE8FF', '#C026D3', '후궁 (Inner Palace)'],

    // 9. 학자 (Jade Scholar) — emerald & mint
    ['#F2E7D5', '#059669', '#6EE7B7', 'rgba(5,150,105,0.2)',
        '#F2E7D5', '#F2E7D5', '#05966922', '#D1FAE5', '#059669', '학자 (Jade Scholar)'],

    // 10. 무장 (Warrior) — copper & fire
    ['#F2E7D5', '#EA580C', '#FCA369', 'rgba(234,88,12,0.2)',
        '#F2E7D5', '#F2E7D5', '#EA580C22', '#FFEDD5', '#EA580C', '무장 (Warrior Copper)'],

    // 11. 야간 (Night Sky) — deep indigo
    ['#F2E7D5', '#4338CA', '#818CF8', 'rgba(67,56,202,0.2)',
        '#F2E7D5', '#F2E7D5', '#4338CA22', '#E0E7FF', '#4338CA', '야간 (Night Sky)'],

    // 12. 대나무 (Bamboo Grove) — lime & sage
    ['#F2E7D5', '#65A30D', '#A3E635', 'rgba(101,163,13,0.2)',
        '#F2E7D5', '#F2E7D5', '#65A30D22', '#ECFCCB', '#65A30D', '대나무 (Bamboo Grove)'],

    // 13. 홍화 (Safflower Pink) — rose & coral
    ['#F2E7D5', '#E11D48', '#FDA4AF', 'rgba(225,29,72,0.2)',
        '#F2E7D5', '#F2E7D5', '#E11D4822', '#FFE4E6', '#E11D48', '홍화 (Safflower Pink)'],

    // 14. 심해 (Deep Sea) — navy blue & aqua
    ['#F2E7D5', '#0369A1', '#7DD3FC', 'rgba(3,105,161,0.2)',
        '#F2E7D5', '#F2E7D5', '#0369A122', '#BAE6FD', '#0369A1', '심해 (Deep Sea)'],

    // 15. 청동 (Ancient Bronze) — deep amber & rust
    ['#F2E7D5', '#B45309', '#F59E0B', 'rgba(180,83,9,0.2)',
        '#F2E7D5', '#F2E7D5', '#B4530922', '#FEF3C7', '#B45309', '청동 (Ancient Bronze)'],

    // 16. 신비 (Mystical) — violet & lavender
    ['#F2E7D5', '#7C3AED', '#C084FC', 'rgba(124,58,237,0.2)',
        '#F2E7D5', '#F2E7D5', '#7C3AED22', '#EDE9FE', '#7C3AED', '신비 (Mystical Violet)'],

    // 17. 산천 (Mountain Stream) — teal & seafoam
    ['#F2E7D5', '#0D9488', '#5EEAD4', 'rgba(13,148,136,0.2)',
        '#F2E7D5', '#F2E7D5', '#0D948822', '#CCFBF1', '#0D9488', '산천 (Mountain Stream)'],

    // 18. 전통 (Traditional Clay) — terracotta & beige
    ['#F2E7D5', '#92400E', '#D4956A', 'rgba(146,64,14,0.2)',
        '#F2E7D5', '#F2E7D5', '#92400E22', '#FDF8F0', '#92400E', '전통 (Traditional Clay)'],
];

// Compute relative luminance from hex to determine if text should be dark or light
function getLuminance(hex: string): number {
    if (!hex || !hex.startsWith('#')) return 1;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastText(bgHex: string): { primary: string; secondary: string; muted: string } {
    const lum = getLuminance(bgHex);
    // Dark background → use white text; light bg → use near-black text
    if (lum < 0.4) {
        return { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.85)', muted: 'rgba(255,255,255,0.60)' };
    } else {
        return { primary: '#171717', secondary: 'rgba(23,23,23,0.75)', muted: 'rgba(23,23,23,0.50)' };
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
        bgStyle: { backgroundColor: 'transparent', color: text.primary },
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

export const getComplementaryColor = (hex: string): string => {
    if (!hex || !hex.startsWith('#')) return '#FFFFFF';
    
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Invert colors
    const rInv = 255 - r;
    const gInv = 255 - g;
    const bInv = 255 - b;
    
    // Ensure sufficient contrast vs white/black of the icons
    // But for complementary, pure inversion is what was asked.
    return `#${rInv.toString(16).padStart(2, '0')}${gInv.toString(16).padStart(2, '0')}${bInv.toString(16).padStart(2, '0')}`;
};

export const DEFAULT_THEME: JoseonTheme = buildTheme([
    '#F2E7D5', '#4F6D5B', '#1A2944', 'rgba(79,109,91,0.2)',
    '#F2E7D5', '#F2E7D5', '#4F6D5B22', '#1A294433', '#171717', '몽땅쏙 (Default)'
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
    if (isNaN(f) || f < 1 || f > 7) return DEFAULT_THEME;
    return JOSEON_THEMES[(f - 1) % JOSEON_THEMES.length];
};
export const getFloorBySubId = (subId: string): string | undefined => {
    if (!subId) return undefined;
    if (subId.startsWith('f1_') || ['car-care', 'window', 'global'].includes(subId)) return '1';
    if (subId.startsWith('f2_') || ['skincare', 'hair', 'p_surgery', 'inner-beauty', 'body-care'].includes(subId)) return '2';
    if (subId.startsWith('f3_') || ['performance', 'exhibit', 'f3_media', 'f3_lounge', 'f3_audio'].includes(subId)) return '3';
    if (subId.startsWith('f4_') || ['b2b-mall', 'interview', 'talk', 'travel'].includes(subId)) return '6';
    if (subId.startsWith('f5_') || ['archive', 'collection'].includes(subId)) return '5';
    if (subId.startsWith('f6_') || ['heritage'].includes(subId)) return '4';
    if (subId.startsWith('f7_') || ['meeting-room'].includes(subId)) return '7';
    return undefined;
};
