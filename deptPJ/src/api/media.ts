import { supabase } from '../lib/supabaseClient';
import { LiveShort } from '../types';

export const getLiveShorts = async (): Promise<LiveShort[]> => {
    const { data, error } = await supabase.from('live_shorts').select('*');
    if (error) {
        console.error('Error fetching live_shorts:', error);
        return [];
    }
    return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        videoUrl: item.video_url,
        thumbnailUrl: item.thumbnail_url || 'https://images.unsplash.com/photo-1541535650810-10d26f597a65?auto=format&fit=crop&q=80',
        location: item.location,
        viewCount: item.view_count
    }));
};
