import { supabase } from '../lib/supabaseClient';
import { BrandSpotlight } from '../types';
import { BRAND_SPOTLIGHTS } from '../data/mockData';

const mergeLocalizedText = (dbValue: any, mockValue: any) => {
    if (!dbValue) return mockValue;
    if (typeof dbValue === 'string') {
        if (typeof mockValue === 'object' && mockValue !== null) {
            return { ...mockValue, ko: dbValue };
        }
        return mockValue || { ko: dbValue };
    }
    if (typeof mockValue === 'object' && mockValue !== null) {
        return { ...mockValue, ...dbValue };
    }
    return dbValue;
};

export const getBrandSpotlights = async (): Promise<BrandSpotlight[]> => {
    const { data, error } = await supabase
        .from('brand_spotlights')
        .select('*');

    if (error) {
        console.error('Error fetching brand_spotlights:', error);
        return [];
    }

    return (data || []).map((item: any, index: number) => {
        const fallback = BRAND_SPOTLIGHTS.find(b => b.id === item.id) || BRAND_SPOTLIGHTS[index % BRAND_SPOTLIGHTS.length];
        return {
            id: item.id,
            brandName: mergeLocalizedText(item.brand_name, fallback.brandName),
            title: mergeLocalizedText(item.title, fallback.title),
            description: mergeLocalizedText(item.description, fallback.description),
            imageUrl: item.image_url,
            videoUrl: item.video_url,
            tags: item.tags || fallback.tags || []
        };
    });
};
