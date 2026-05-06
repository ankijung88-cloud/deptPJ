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

const normalizeUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    // Strip absolute backend URL if present
    return url.replace(/^http:\/\/43\.200\.230\.44:3000/, '');
};

const mapToFeaturedItem = (item: any): FeaturedItem => {
    let parsedEventDates = item.event_dates || [];
    // Handle MySQL JSON if it comes as a string
    if (typeof parsedEventDates === 'string') {
        try { parsedEventDates = JSON.parse(parsedEventDates); } catch (e) { parsedEventDates = []; }
    }

    if (!parsedEventDates.length && item.event_date) {
        const dateStr = extractDateString(item.event_date);
        parsedEventDates = generateDateRange(dateStr);
    }

    const parseJsonIfNeeded = (val: any) => {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        return val;
    };

    return {
        id: item.id,
        title: parseJsonIfNeeded(item.title),
        category: item.category,
        subcategory: item.subcategory,
        description: parseJsonIfNeeded(item.description),
        imageUrl: normalizeUrl(item.image_url),
        thumbnailUrl: normalizeUrl(item.thumbnail_url),
        date: parseJsonIfNeeded(item.event_date),
        location: parseJsonIfNeeded(item.location),
        price: item.price,
        closedDays: (typeof item.closed_days === 'string' ? JSON.parse(item.closed_days) : item.closed_days) || [],
        videoUrl: normalizeUrl(item.video_url || item.video_Url), 
        long_description: parseJsonIfNeeded(item.long_description),
        user_id: item.user_id,
        parent_id: item.parent_id,
        eventDates: parsedEventDates.length > 0 ? parsedEventDates : (
            item.id === 'global-exchange-week' ? Array.from({ length: 15 }, (_, i) => `2026-03-${(i + 1).toString().padStart(2, '0')}`) :
                item.id === 'global-artist-collab-2026' ? Array.from({ length: 16 }, (_, i) => `2026-03-${(i + 5).toString().padStart(2, '0')}`) :
                    item.id === 'k-culture-brand-collab' ? Array.from({ length: 16 }, (_, i) => `2026-03-${(i + 10).toString().padStart(2, '0')}`) :
                        item.id === 'hanbok-symphony' ? Array.from({ length: 31 }, (_, i) => `2026-03-${(i + 1).toString().padStart(2, '0')}`) :
                            []
        ),
        selected_templates: (typeof item.selected_templates === 'string' ? JSON.parse(item.selected_templates) : item.selected_templates) || [],
        agency_id: item.agency_id,
        detail_media_url: normalizeUrl(item.detail_media_url),
        detail_media_type: item.detail_media_type,
        reservation_programs: parseJsonIfNeeded(item.reservation_programs) || [],
        reservation_slots: parseJsonIfNeeded(item.reservation_slots) || [],
        page_type: item.page_type || 'standard',
        metadata: parseJsonIfNeeded(item.metadata) || {}
    };
};

export const getFeaturedProducts = async (): Promise<FeaturedItem[]> => {
    try {
        const token = sessionStorage.getItem('admin_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let response = await fetch('/api/products', { headers });
        if (response.status === 401 || response.status === 403) {
            if (token) {
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
                response = await fetch('/api/products');
            }
            if (!response.ok) {
                console.warn(`API access restricted (${response.status}). Using local fallbacks.`);
                return [];
            }
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return (data || []).map(mapToFeaturedItem);
    } catch (error) {
        console.error('Error fetching getFeaturedProducts:', error);
        return [];
    }
};

export const getProductsByCategory = async (category: string): Promise<FeaturedItem[]> => {
    try {
        const token = sessionStorage.getItem('admin_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let response = await fetch(`/api/products/category/${encodeURIComponent(category)}`, { headers });
        if (response.status === 401 || response.status === 403) {
            if (token) {
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
                response = await fetch(`/api/products/category/${encodeURIComponent(category)}`);
            }
            if (!response.ok) {
                console.warn(`Category API access restricted (${response.status}).`);
                return [];
            }
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return (data || []).map(mapToFeaturedItem);
    } catch (error) {
        console.error('Error fetching getProductsByCategory:', error);
        return [];
    }
};

export const getProductById = async (id: string): Promise<FeaturedItem | null> => {
    try {
        const token = sessionStorage.getItem('admin_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let response = await fetch(`/api/products/${encodeURIComponent(id)}`, { headers });
        if (response.status === 401 || response.status === 403) {
            if (token) {
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
                response = await fetch(`/api/products/${encodeURIComponent(id)}`);
            }
            if (!response.ok) return null;
        }
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data ? mapToFeaturedItem(data) : null;
    } catch (e) {
        console.error('Exception in getProductById:', e);
        return null;
    }
};

export const searchProducts = async (query: string, lang?: string): Promise<FeaturedItem[]> => {
    try {
        const url = lang
            ? `/api/products/search?q=${encodeURIComponent(query)}&lang=${lang}`
            : `/api/products/search?q=${encodeURIComponent(query)}`;
            
        const token = sessionStorage.getItem('admin_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let response = await fetch(url, { headers });
        
        // 401/403: Silent auto-healing for guest users or expired tokens
        if (response.status === 401 || response.status === 403) {
            if (token) {
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
                response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    return (data || []).map(mapToFeaturedItem);
                }
            }
            // Silent fallback for guests or if second try fails
            return [];
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return (data || []).map(mapToFeaturedItem);
    } catch (error) {
        // Keep as warning only, not red error
        console.warn('Product search API fallback active:', error);
        return [];
    }
};

export const getProductsByUser = async (userId: string): Promise<FeaturedItem[]> => {
    // Note: User-specific fetching might need Auth later
    try {
        const token = sessionStorage.getItem('admin_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let response = await fetch(`/api/products/user/${encodeURIComponent(userId)}`, { headers });
        if (response.status === 401 || response.status === 403) {
            if (token) {
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
                response = await fetch(`/api/products/user/${encodeURIComponent(userId)}`);
            }
            if (!response.ok) return [];
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return (data || []).map(mapToFeaturedItem);
    } catch (error) {
        console.error('Error fetching user products:', error);
        return [];
    }
};

export const deleteProduct = async (id: string): Promise<void> => {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        }
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Delete failed');
    }
};

export const createProduct = async (productData: any): Promise<FeaturedItem> => {
    const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Create failed');
    }
    const data = await response.json();
    const newItem = await getProductById(data.id || productData.id);
    if (!newItem) throw new Error('Failed to fetch new product after creation');
    return newItem;
};

export const updateProduct = async (id: string, productData: any): Promise<FeaturedItem> => {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Update failed');
    }
    
    // Fetch and return the updated product
    const updated = await getProductById(id);
    if (!updated) throw new Error('Failed to fetch updated product after saving');
    return updated;
};
