import { supabase } from '../lib/supabaseClient';
import { FeaturedItem } from '../types';

const mapToFeaturedItem = (item: any): FeaturedItem => ({
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
    user_id: item.user_id
});

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
