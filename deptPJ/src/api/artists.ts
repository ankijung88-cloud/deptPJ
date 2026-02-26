import { supabase } from '../lib/supabaseClient';
import { Artist } from '../types';

export const getArtists = async (): Promise<Artist[]> => {
    const { data, error } = await supabase.from('artists').select('*');
    if (error) {
        console.error('Error fetching artists:', error);
        return [];
    }
    return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.artist_type,
        description: item.description,
        imageUrl: item.image_url,
        subcategory: item.subcategory
    }));
};
