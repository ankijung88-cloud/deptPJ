import { supabase } from '../lib/supabaseClient';
import { FeaturedItem } from '../types';

const extractDateString = (dateObj: any): string => {
    if (!dateObj) return '';
    if (typeof dateObj === 'string') return dateObj;
    return dateObj.ko || dateObj.en || Object.values(dateObj)[0] || '';
};

const generateDateRange = (dateString: string): string[] => {
    if (!dateString) return [];

    // Check for "YYYY.MM.DD" or "YYYY-MM-DD" patterns and "~" or "-" separators
    const normalized = dateString
        .replace(/\./g, '-')
        .replace(/\s+-\s+/g, '~')
        .replace(/\s*~\s*/g, '~');

    // Extract dates using regex
    const dateRegex = /\d{4}-\d{1,2}-\d{1,2}/g;
    const matches = normalized.match(dateRegex);

    if (!matches) return [];

    if (matches.length === 2 && normalized.includes('~')) {
        const start = new Date(matches[0]);
        const end = new Date(matches[1]);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const dates: string[] = [];
            const current = new Date(start);
            // Cap at a reasonable max days (e.g., 365) to prevent infinite loops
            let maxDays = 365;
            while (current <= end && maxDays-- > 0) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
            return dates;
        }
    } else if (matches.length >= 1) {
        // Single date or multiple specific dates
        return matches.filter(m => {
            const d = new Date(m);
            return !isNaN(d.getTime());
        }).map(m => new Date(m).toISOString().split('T')[0]);
    }

    return [];
};

const mapToFeaturedItem = (item: any): FeaturedItem => {
    let parsedEventDates = item.event_dates || [];
    if (!parsedEventDates.length && item.event_date) {
        const dateStr = extractDateString(item.event_date);
        parsedEventDates = generateDateRange(dateStr);
    }

    return {
        id: item.id,
        title: item.title,
        category: item.category,
        subcategory: item.subcategory,
        description: item.description,
        imageUrl: item.image_url,
        date: item.event_date,
        location: item.location,
        price: item.price,
        closedDays: item.closed_days || [],
        videoUrl: item.video_url,
        user_id: item.user_id,
        eventDates: parsedEventDates.length > 0 ? parsedEventDates : (
            // Injecting mock dates for demonstration if not in DB
            item.id === 'global-exchange-week' ? Array.from({ length: 15 }, (_, i) => `2026-03-${(i + 1).toString().padStart(2, '0')}`) :
                item.id === 'global-artist-collab-2026' ? Array.from({ length: 16 }, (_, i) => `2026-03-${(i + 5).toString().padStart(2, '0')}`) :
                    item.id === 'k-culture-brand-collab' ? Array.from({ length: 16 }, (_, i) => `2026-03-${(i + 10).toString().padStart(2, '0')}`) :
                        item.id === 'hanbok-symphony' ? Array.from({ length: 31 }, (_, i) => `2026-03-${(i + 1).toString().padStart(2, '0')}`) :
                            []
        )
    };
};

export const getFeaturedProducts = async (): Promise<FeaturedItem[]> => {
    const { data, error } = await supabase.from('featured_items').select('*');
    if (error) {
        console.error('Error fetching getFeaturedProducts:', error);
        return [];
    }
    return (data || []).map(mapToFeaturedItem);
};

export const getProductsByCategory = async (category: string): Promise<FeaturedItem[]> => {
    // Check both category and subcategory
    const { data, error } = await supabase
        .from('featured_items')
        .select('*')
        .or(`category.ilike.%${category}%,subcategory.ilike.%${category}%`);

    if (error) {
        console.error('Error fetching getProductsByCategory:', error);
        return [];
    }
    return (data || []).map(mapToFeaturedItem);
};

export const getProductById = async (id: string): Promise<FeaturedItem | null> => {
    const { data, error } = await supabase.from('featured_items').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching getProductById:', error);
        return null;
    }
    return data ? mapToFeaturedItem(data) : null;
};

export const searchProducts = async (query: string): Promise<FeaturedItem[]> => {
    const q = query.toLowerCase();
    const { data, error } = await supabase
        .from('featured_items')
        .select('*')
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`);

    if (error) {
        console.error('Error searching products:', error);
        return [];
    }
    return (data || []).map(mapToFeaturedItem);
};

export const getProductsByUser = async (userId: string): Promise<FeaturedItem[]> => {
    const { data, error } = await supabase.from('featured_items').select('*').eq('user_id', userId);
    if (error) {
        console.error('Error fetching user products:', error);
        return [];
    }
    return (data || []).map(mapToFeaturedItem);
};

// Assuming backend RPC for deletes/updates are handled elsewhere or these are standard update calls
export const deleteProduct = async (id: string): Promise<void> => {
    const { error } = await supabase.from('featured_items').delete().eq('id', id);
    if (error) throw error;
};

export const createProduct = async (productData: any): Promise<{ id: string }> => {
    const { data, error } = await supabase.from('featured_items').insert([productData]).select().single();
    if (error) throw error;
    return { id: data.id };
};

export const updateProduct = async (id: string, productData: any): Promise<void> => {
    const { error } = await supabase.from('featured_items').update(productData).eq('id', id);
    if (error) throw error;
};
