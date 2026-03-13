import { FloorCategory, NavItem } from '../types';

export const getFloorCategories = async (): Promise<FloorCategory[]> => {
    try {
        const response = await fetch('/api/categories/floors');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        const data = await response.json();
        return (data || []).map((item: any) => ({
            id: item.id,
            floor: item.floor,
            title: item.title,
            description: item.description,
            bgImage: item.bg_image,
            color: item.color,
            videoUrl: item.video_url,
            content: (typeof item.content === 'string' ? JSON.parse(item.content) : item.content) || [],
            subitems: (typeof item.subitems === 'string' ? JSON.parse(item.subitems) : item.subitems) || []
        }));
    } catch (error: any) {
        console.error('Error fetching floor_categories:', error);
        throw error;
    }
};

export const getNavItems = async (): Promise<NavItem[]> => {
    try {
        const response = await fetch('/api/categories/nav');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        const data = await response.json();
        return (data || []).map((item: any) => ({
            id: item.id,
            href: item.href,
            subitems: (typeof item.subitems === 'string' ? JSON.parse(item.subitems) : item.subitems) || []
        }));
    } catch (error: any) {
        console.error('Error fetching nav_items:', error);
        throw error;
    }
};

export const createFloorCategory = async (data: any): Promise<void> => {
    const response = await fetch('/api/categories/floors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Create failed');
};

export const updateFloorCategory = async (id: string, data: any): Promise<void> => {
    const response = await fetch(`/api/categories/floors/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Update failed');
};

export const deleteFloorCategory = async (id: string): Promise<void> => {
    const response = await fetch(`/api/categories/floors/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete failed');
};

export const createNavItem = async (data: any): Promise<void> => {
    const response = await fetch('/api/categories/nav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Create failed');
};

export const updateNavItem = async (id: string, data: any): Promise<void> => {
    const response = await fetch(`/api/categories/nav/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Update failed');
};

export const deleteNavItem = async (id: string): Promise<void> => {
    const response = await fetch(`/api/categories/nav/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete failed');
};
