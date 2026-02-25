import { FEATURED_ITEMS } from '../data/mockData';
import { FeaturedItem } from '../types';

export const getFeaturedProducts = async (): Promise<FeaturedItem[]> => {
    return FEATURED_ITEMS;
};

export const getProductsByCategory = async (category: string): Promise<FeaturedItem[]> => {
    return FEATURED_ITEMS.filter(item =>
        item.category.toLowerCase() === category.toLowerCase() ||
        (item as any).subcategory?.toLowerCase() === category.toLowerCase()
    );
};

export const getProductById = async (id: string): Promise<FeaturedItem | null> => {
    return FEATURED_ITEMS.find(item => item.id === id) || null;
};

export const searchProducts = async (query: string): Promise<FeaturedItem[]> => {
    const q = query.toLowerCase();
    return FEATURED_ITEMS.filter(item =>
        item.title.ko.toLowerCase().includes(q) ||
        item.description.ko.toLowerCase().includes(q)
    );
};

export const getProductsByUser = async (_userId: string): Promise<FeaturedItem[]> => {
    return [];
};

export const deleteProduct = async (_id: string): Promise<void> => {
    console.warn('Delete product is not supported in frontend-only mode');
};

export const createProduct = async (_productData: any): Promise<{ id: string }> => {
    throw new Error('Create product is not supported in frontend-only mode');
};

export const updateProduct = async (_id: string, _productData: any): Promise<void> => {
    throw new Error('Update product is not supported in frontend-only mode');
};
