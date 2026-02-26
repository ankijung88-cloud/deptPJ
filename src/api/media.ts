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

        return {
            id: item.id,
            title: item.title,
            videoUrl: finalVideoUrl,
            thumbnailUrl: finalThumbnailUrl,
            location: item.location,
            viewCount: item.view_count || fallbackShort.viewCount
        };
    });
};
