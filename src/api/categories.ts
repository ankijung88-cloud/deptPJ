import { supabase } from '../lib/supabaseClient';
import { FloorCategory, NavItem } from '../types';
import { FLOOR_CATEGORIES } from '../data/mockData';

// Merge multi-language data: use Supabase data but supplement with mock translations
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

export const getFloorCategories = async (): Promise<FloorCategory[]> => {
    const { data, error } = await supabase.from('floor_categories').select('*').order('floor');
    if (error) {
        console.error('Error fetching floor_categories:', error);
        return [];
    }
    return (data || []).map((item: any, index: number) => {
        const fallback = FLOOR_CATEGORIES.find(f => f.id === item.id) || FLOOR_CATEGORIES[index % FLOOR_CATEGORIES.length];
        return {
            id: item.id,
            floor: item.floor,
            title: mergeLocalizedText(item.title, fallback.title),
            description: mergeLocalizedText(item.description, fallback.description),
            bgImage: item.bg_image,
            content: item.content || fallback.content || [],
            subitems: item.subitems || fallback.subitems || []
        };
    });
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
