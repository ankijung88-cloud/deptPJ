import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, ShoppingCart } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { FeaturedItem } from '../../types';
import { getFeaturedProducts, deleteProduct } from '../../api/products';
import { getLocalizedText } from '../../utils/i18nUtils';
import { useTranslation } from 'react-i18next';

interface ThemeSaleContainerProps {
    parentId: string;
    isAdmin: boolean;
}

const ThemeSaleContainer: React.FC<ThemeSaleContainerProps> = ({ parentId, isAdmin }) => {
    const { i18n } = useTranslation();
    const [subProducts, setSubProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubProducts();
    }, [parentId]);

    const fetchSubProducts = async () => {
        setLoading(true);
        const data = await getFeaturedProducts();
        // Assume for now subproducts are linked via parentId
        const filtered = data.filter(p => p.parentId === parentId);
        setSubProducts(filtered);
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-white">
                    <AutoTranslatedText text="Product Collection" />
                </h3>
                {isAdmin && (
                    <button className="bg-[#00FFC2] text-[#0A0D17] px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:scale-105 transition-all">
                        <Plus size={18} /> <AutoTranslatedText text="Add Item" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subProducts.map(product => (
                    <motion.div 
                        key={product.id}
                        whileHover={{ y: -5 }}
                        className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden group"
                    >
                        <div className="aspect-square relative">
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                {isAdmin && (
                                    <>
                                        <button className="p-3 bg-white/10 rounded-full hover:bg-[#00FFC2] hover:text-black transition-all">
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(confirm('Delete?')) deleteProduct(product.id).then(fetchSubProducts);
                                            }}
                                            className="p-3 bg-white/10 rounded-full hover:bg-red-500 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="p-6">
                            <h4 className="text-lg font-bold text-white mb-2">
                                <AutoTranslatedText text={getLocalizedText(product.title, i18n.language)} />
                            </h4>
                            <p className="text-white/40 text-sm mb-4 line-clamp-2">
                                <AutoTranslatedText text={getLocalizedText(product.description, i18n.language)} />
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-[#00FFC2] font-serif font-bold italic">
                                    <AutoTranslatedText text={getLocalizedText(product.price, i18n.language)} />
                                </span>
                                <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                                    <ShoppingCart size={18} className="text-white/60" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {!loading && subProducts.length === 0 && (
                <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
                    <p className="text-white/20 font-serif italic text-lg">
                        <AutoTranslatedText text="No items in this collection yet." />
                    </p>
                </div>
            )}
        </div>
    );
};

export default ThemeSaleContainer;
