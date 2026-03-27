import { Notice } from '../types';

export const getNotices = async (): Promise<Notice[]> => {
    try {
        const token = sessionStorage.getItem('admin_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let response = await fetch('/api/notices', { headers });
        if (response.status === 401 || response.status === 403) {
            if (token) {
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
                response = await fetch('/api/notices');
            }
            if (!response.ok) {
                console.warn(`Notice API access restricted (${response.status}). Using local fallbacks.`);
                return [];
            }
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        const data = await response.json();
        return (data || []).map((item: any) => ({
            ...item,
            title: typeof item.title === 'string' ? JSON.parse(item.title) : item.title,
            content: typeof item.content === 'string' ? JSON.parse(item.content) : item.content,
            is_important: !!item.is_important
        }));
    } catch (error: any) {
        console.error('Error fetching notices:', error);
        throw error;
    }
};

export const createNotice = async (data: any): Promise<void> => {
    const response = await fetch('/api/notices', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Create failed');
};

export const updateNotice = async (id: string | number, data: any): Promise<void> => {
    const response = await fetch(`/api/notices/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Update failed');
};

export const deleteNotice = async (id: string | number): Promise<void> => {
    const response = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        }
    });
    if (!response.ok) throw new Error('Delete failed');
};
