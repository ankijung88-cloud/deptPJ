import { FAQ } from '../types';

export const getFaqs = async (): Promise<FAQ[]> => {
    try {
        const token = sessionStorage.getItem('admin_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let response = await fetch('/api/faqs', { headers });
        if (response.status === 401 || response.status === 403) {
            if (token) {
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
                response = await fetch('/api/faqs');
                if (response.ok) {
                    const data = await response.json();
                    return (data || []).map((item: any) => ({
                        ...item,
                        question: typeof item.question === 'string' ? JSON.parse(item.question) : item.question,
                        answer: typeof item.answer === 'string' ? JSON.parse(item.answer) : item.answer,
                    }));
                }
            }
            return [];
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return (data || []).map((item: any) => ({
            ...item,
            question: typeof item.question === 'string' ? JSON.parse(item.question) : item.question,
            answer: typeof item.answer === 'string' ? JSON.parse(item.answer) : item.answer,
        }));
    } catch (error: any) {
        console.warn('FAQ API fallback active:', error);
        return [];
    }
};

export const createFaq = async (data: any): Promise<void> => {
    const response = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Create failed');
};

export const updateFaq = async (id: string | number, data: any): Promise<void> => {
    const response = await fetch(`/api/faqs/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Update failed');
};

export const deleteFaq = async (id: string | number): Promise<void> => {
    const response = await fetch(`/api/faqs/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        }
    });
    if (!response.ok) throw new Error('Delete failed');
};
