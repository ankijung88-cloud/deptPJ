/**
 * ID Normalization Utility
 * Maps legacy IDs (e.g., floor-1, global, tech) to current rebranded IDs (e.g., floor-tech-care, car-care).
 * This ensures consistency between database records and the current UI configuration.
 */

/**
 * Maps legacy floor IDs to current rebranded IDs
 */
export const getNormalizedFloorId = (id: string): string => {
    if (!id) return '';
    const s = id.toLowerCase();
    if (s === 'floor-1' || s === 'floor-tech-care') return 'floor-tech-care';
    if (s === 'floor-4') return 'floor-6'; // 4F is now Local Heritage
    if (s === 'floor-6') return 'floor-gather-mall'; // 6F is now Gather Mall
    return id;
};

/**
 * Maps legacy subcategory IDs to current rebranded IDs
 */
export const getNormalizedSubcategoryId = (sub: string): string => {
    if (!sub) return '';
    const s = sub.toLowerCase();
    
    // Floor 1: TECH & CARE (previously floor-1)
    if (['car', 'trend', 'exchange', 'car-care', 'car-care-exchange-week', 'global', '글로벌', 'tech'].includes(s)) {
        return 'car-care';
    }
    if (['window', '디지털쇼윈도', '디지털 쇼윈도'].includes(s)) {
        return 'window';
    }
    
    // Floor 6: GATHER MALL (previously 4F)
    if (['talk', 'b2b-mall', '인터뷰', 'interview', 'mall'].includes(s)) {
        return 'b2b-mall';
    }
    
    return sub;
};
