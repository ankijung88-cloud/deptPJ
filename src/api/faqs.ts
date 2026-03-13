import { FAQ } from '../types';

export const getFaqs = async (): Promise<FAQ[]> => {
    try {
        const response = await fetch('/api/faqs');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        const data = await response.json();
        return (data || []).map((item: any) => ({
            ...item,
            question: typeof item.question === 'string' ? JSON.parse(item.question) : item.question,
            answer: typeof item.answer === 'string' ? JSON.parse(item.answer) : item.answer,
        }));
    } catch (error: any) {
        console.error('Error fetching faqs:', error);
        throw error;
    }
};

export const createFaq = async (data: any): Promise<void> => {
    const response = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Create failed');
};

export const updateFaq = async (id: string | number, data: any): Promise<void> => {
    const response = await fetch(`/api/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Update failed');
};

export const deleteFaq = async (id: string | number): Promise<void> => {
    const response = await fetch(`/api/faqs/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete failed');
};
