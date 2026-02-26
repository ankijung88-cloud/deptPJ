import { supabase } from '../lib/supabaseClient';
import { CalendarEvent } from '../types';

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase.from('calendar_events').select('*');
    if (error) {
        console.error('Error fetching calendar_events:', error);
        return [];
    }
    return (data || []).map((item: any) => ({
        id: item.id,
        date: item.date,
        title: item.title,
        category: item.category,
        imageUrl: item.image_url
    }));
};
