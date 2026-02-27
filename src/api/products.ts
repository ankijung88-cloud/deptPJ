import { supabase } from '../lib/supabaseClient';
import { FeaturedItem } from '../types';
import { FEATURED_ITEMS } from '../data/mockData';

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

const mapToFeaturedItem = (item: any, index?: number): FeaturedItem => {
    const fallback = FEATURED_ITEMS.find(f => f.id === item.id) || (index !== undefined ? FEATURED_ITEMS[index % FEATURED_ITEMS.length] : undefined);
    return {
        id: item.id,
        title: fallback ? mergeLocalizedText(item.title, fallback.title) : item.title,
        category: item.category,
        subcategory: item.subcategory,
        description: fallback ? mergeLocalizedText(item.description, fallback.description) : item.description,
        imageUrl: (item.image_url && item.image_url.startsWith('http')) ? item.image_url : (fallback?.imageUrl || item.image_url),
        date: fallback ? mergeLocalizedText(item.event_date, fallback.date) : item.event_date,
        location: fallback ? mergeLocalizedText(item.location, fallback.location) : item.location,
        price: fallback ? mergeLocalizedText(item.price, fallback.price) : item.price,
        closedDays: item.closed_days || [],
        videoUrl: item.video_url,
        user_id: item.user_id
    };
};

export const getFeaturedProducts = async (): Promise<FeaturedItem[]> => {
    const { data, error } = await supabase.from('featured_items').select('*');
    if (error) {
        console.error('Error fetching getFeaturedProducts:', error);
        return [];
    }
    return (data || []).map((item, index) => mapToFeaturedItem(item, index));
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
    return (data || []).map((item, index) => mapToFeaturedItem(item, index));
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
