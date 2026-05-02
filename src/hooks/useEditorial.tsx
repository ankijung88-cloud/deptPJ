import { useState, useEffect } from 'react';
import { getFeaturedProducts } from '../api/products';
import { FeaturedItem } from '../types';

export const useEditorial = (floorId?: string) => {
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEditorial = async () => {
            setLoading(true);
            try {
                const allProducts = await getFeaturedProducts();
                // Filter products by floor if floorId is provided
                // This assumes floorId might be in category or subcategory
                const filtered = floorId 
                    ? allProducts.filter(p => {
                        const pid = p.category?.toString().toLowerCase() || '';
                        const fid = floorId.toLowerCase();
                        const fNum = fid.replace('floor-', '').replace('f', '');
                        const pNum = pid.replace('floor-', '').replace('f', '');
                        
                        return pid === fid || pNum === fNum || pid.includes(fid) || fid.includes(pid);
                    })
                    : allProducts;
                
                setItems(filtered);
            } catch (error) {
                console.error('Error fetching editorial items:', error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEditorial();
    }, [floorId]);

    return { items, loading };
};

