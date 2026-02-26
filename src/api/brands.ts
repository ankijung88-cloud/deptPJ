import { supabase } from '../lib/supabaseClient';
import { BrandSpotlight } from '../types';

export const getBrandSpotlights = async (): Promise<BrandSpotlight[]> => {
    const { data, error } = await supabase
        .from('brand_spotlights')
        .select('*');

    if (error) {
        console.error('Error fetching brand_spotlights:', error);
        return [];
    }

    // Map database snake_case columns to camelCase used in the frontend types
    return (data || []).map((item: any) => ({
        id: item.id,
        brandName: item.brand_name,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        videoUrl: item.video_url,
        tags: item.tags || []
    }));
};
