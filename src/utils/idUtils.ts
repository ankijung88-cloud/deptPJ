/**
 * ID Normalization Utility
 * Maps legacy IDs (e.g., floor-1, global, tech) to current rebranded IDs.
 * This ensures consistency between database records and the current UI configuration.
 */

/**
 * Maps legacy floor IDs to current rebranded IDs
 */
export const getNormalizedFloorId = (id: string): string => {
    if (!id) return '';
    const s = id.toLowerCase();
    
    // Normalize variants of floor IDs to the floor-N pattern used in context/db
    if (s === 'floor-tech-care' || s === 'tech') return 'floor-1';
    if (s === 'floor-local-heritage') return 'floor-4';
    if (s === 'floor-gather-mall' || s === 'maktet' || s === 'market') return 'floor-6';
    
    // If it already matches floor-N, return it
    const match = s.match(/floor-\d/);
    if (match) return match[0];
    
    return id;
};

/**
 * Maps legacy subcategory IDs to current rebranded IDs
 */
export const getNormalizedSubcategoryId = (sub: string): string => {
    if (!sub) return '';
    const s = sub.toLowerCase();
    
    // F1 mappings
    if (s === 'tech') return 'f1_tech';
    if (s === 'trend' || s === 'library') return 'f1_library';
    if (s === 'kpop' || s === 'k-pop') return 'f1_kpop';
    
    // F6 mappings
    if (s === 'gourmet') return 'f6_gourmet';
    if (s === 'craft') return 'f6_craft';
    if (s === 'tour') return 'f6_tour';
    
    // F5 mappings
    if (s === 'fitting') return 'f5_fitting';
    
    return sub;
};
