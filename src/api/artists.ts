import { supabase } from '../lib/supabaseClient';
import { Artist } from '../types';
import { ARTISTS_OF_THE_YEAR } from '../data/mockData';

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

export const getArtists = async (): Promise<Artist[]> => {
    const { data, error } = await supabase.from('artists').select('*');
    if (error) {
        console.error('Error fetching artists:', error);
        return [];
    }
    return (data || []).map((item: any, index: number) => {
        const fallback = ARTISTS_OF_THE_YEAR.find(a => a.id === item.id) || ARTISTS_OF_THE_YEAR[index % ARTISTS_OF_THE_YEAR.length];
        return {
            id: item.id,
            name: mergeLocalizedText(item.name, fallback.name),
            type: mergeLocalizedText(item.artist_type, fallback.type),
            description: mergeLocalizedText(item.description, fallback.description),
            imageUrl: item.image_url,
            subcategory: item.subcategory
        };
    });
};
