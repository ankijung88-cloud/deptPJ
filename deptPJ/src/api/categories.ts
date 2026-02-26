import { supabase } from '../lib/supabaseClient';
import { FloorCategory, NavItem } from '../types';

export const getFloorCategories = async (): Promise<FloorCategory[]> => {
    const { data, error } = await supabase.from('floor_categories').select('*').order('id');
    if (error) {
        console.error('Error fetching floor_categories:', error);
        return [];
    }
    return (data || []).map((item: any) => ({
        id: item.id,
        floor: item.floor,
        title: item.title,
        description: item.description,
        bgImage: item.bg_image,
        content: item.content || [],
        subitems: item.subitems || []
    }));
};

export const getNavItems = async (): Promise<NavItem[]> => {
    const { data, error } = await supabase.from('nav_items').select('*').order('id');
    if (error) {
        console.error('Error fetching nav_items:', error);
        return [];
    }
    return (data || []).map((item: any) => ({
        id: item.id,
        href: item.href,
        subitems: item.subitems || []
    }));
};
