import { supabase } from '../lib/supabaseClient';
import { LiveShort } from '../types';
import { LIVE_SHORTS } from '../data/mockData';

export const getLiveShorts = async (): Promise<LiveShort[]> => {
    const { data, error } = await supabase.from('live_shorts').select('*');
    if (error) {
        console.error('Error fetching live_shorts:', error);
        return [];
    }
    return (data || []).map((item: any, index: number) => {
        // Try to find a matching mock item by ID first, or fallback based on index
        const fallbackShort = LIVE_SHORTS.find(s => s.id === item.id) || LIVE_SHORTS[index % LIVE_SHORTS.length];
        
        let finalVideoUrl = item.video_url;
        if (!finalVideoUrl || finalVideoUrl.startsWith('./') || finalVideoUrl === '') {
            finalVideoUrl = fallbackShort.videoUrl;
        }

        let finalThumbnailUrl = item.thumbnail_url;
        if (!finalThumbnailUrl || finalThumbnailUrl === '' || finalThumbnailUrl === 'undefined') {
            finalThumbnailUrl = fallbackShort.thumbnailUrl;
        }

        // Merge multi-language data: use Supabase data but supplement with mock translations
        const mergeLocalizedText = (dbValue: any, mockValue: any) => {
            if (!dbValue) return mockValue;
            if (typeof dbValue === 'string') {
                // DB has plain string (Korean only) → use mock for multi-lang
                if (typeof mockValue === 'object' && mockValue !== null) {
                    return { ...mockValue, ko: dbValue };
                }
                return mockValue || { ko: dbValue };
            }
            // DB has object → merge with mock as fallback for missing keys
            if (typeof mockValue === 'object' && mockValue !== null) {
                return { ...mockValue, ...dbValue };
            }
            return dbValue;
        };

        return {
            id: item.id,
            title: mergeLocalizedText(item.title, fallbackShort.title),
            videoUrl: finalVideoUrl,
            thumbnailUrl: finalThumbnailUrl,
            location: mergeLocalizedText(item.location, fallbackShort.location),
            viewCount: item.view_count || fallbackShort.viewCount
        };
    });
};
