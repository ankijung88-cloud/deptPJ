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
    if (s === 'floor-4' || s === 'floor-gather-mall') return 'floor-gather-mall';
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
    
    // Floor 4: GATHER MALL (previously floor-4)
    if (['talk', 'b2b-mall', '인터뷰', 'interview', 'mall'].includes(s)) {
        return 'b2b-mall';
    }
    
    // Floor 2: BEAUTY & CARE
    if (['skincare', 'f2_skincare', 'skin'].includes(s)) return 'skincare';
    if (['hair', 'f2_hair', 'hair-care'].includes(s)) return 'hair';
    if (['perfume', 'f2_perfume', 'scent'].includes(s)) return 'perfume';
    if (['inner-beauty', 'f2_inner-beauty', 'health'].includes(s)) return 'inner-beauty';
    if (['body-care', 'f2_body-care', 'body'].includes(s)) return 'body-care';
    
    // Floor 3: LIFESTYLE CURATION
    if (['performance', 'f3_performance', 'live'].includes(s)) return 'performance';
    if (['exhibit', 'f3_exhibits', 'gallery'].includes(s)) return 'exhibit';
    if (['f3_media', 'media'].includes(s)) return 'f3_media';
    if (['f3_lounge', 'lounge'].includes(s)) return 'f3_lounge';
    if (['f3_audio', 'audio'].includes(s)) return 'f3_audio';
    
    // Floor 5: FASHION ARCHIVE
    if (['archive', 'f5_archive'].includes(s)) return 'archive';
    if (['collection', 'f5_collection'].includes(s)) return 'collection';
    if (['f5_material', 'material'].includes(s)) return 'f5_material';
    if (['f5_fitting', 'fitting'].includes(s)) return 'f5_fitting';
    if (['f5_textile', 'textile'].includes(s)) return 'f5_textile';

    // Floor 6: LOCAL HERITAGE
    if (['heritage', 'f6_heritage'].includes(s)) return 'heritage';
    if (['travel', 'f6_travel', 'tour'].includes(s)) return 'travel';
    if (['f6_gourmet', 'gourmet'].includes(s)) return 'f6_gourmet';
    if (['f6_craft', 'craft'].includes(s)) return 'f6_craft';
    if (['f6_tour', 'tour'].includes(s)) return 'f6_tour';
    
    return sub;
};
