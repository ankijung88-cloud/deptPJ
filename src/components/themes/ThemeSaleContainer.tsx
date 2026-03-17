import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { FeaturedItem } from '../../types';
import { getFeaturedProducts, deleteProduct } from '../../api/products';
import { getLocalizedText } from '../../utils/i18nUtils';
import { useTranslation } from 'react-i18next';

interface ThemeSaleContainerProps {
    item: FeaturedItem;
    theme: any;
    isAdmin: boolean;
}

const ThemeSaleContainer: React.FC<ThemeSaleContainerProps> = ({ item, theme: _theme, isAdmin }) => {
    const { i18n } = useTranslation();
    const [subProducts, setSubProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);

    const displayName = getLocalizedText(item.title, i18n.language);

    useEffect(() => {
        fetchSubProducts();
    }, [item.id]);

    const fetchSubProducts = async () => {
        setLoading(true);
        const data = await getFeaturedProducts();
        const filtered = data.filter(p => p.parentId === item.id);
        setSubProducts(filtered);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0A0D17]">
            {/* Sale Header / Hero */}
            <div className="relative h-[80vh] flex items-center">
                <div className="absolute inset-0 z-0">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <span className="text-[#00FFC2] font-bold tracking-widest uppercase text-sm block">Exquisite Collection</span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
                            <AutoTranslatedText text={displayName} />
                        </h1>
                        <p className="text-white/60 text-lg max-w-lg leading-relaxed font-light italic">
                            <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                        </p>
                        <div className="flex items-center gap-8 pt-4">
                            <div className="space-y-1">
                                <span className="text-white/40 text-xs uppercase font-bold tracking-widest">Price</span>
                                <div className="text-3xl font-serif font-bold text-[#00FFC2] italic">
                                    <AutoTranslatedText text={getLocalizedText(item.price, i18n.language)} />
                                </div>
                            </div>
                            <button className="px-10 py-4 bg-[#00FFC2] text-black rounded-full font-bold hover:scale-105 transition-all shadow-xl shadow-[#00FFC2]/20">
                                <AutoTranslatedText text="Order Now" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Product Grid Section */}
            <div className="max-w-7xl mx-auto px-6 py-24 space-y-12">
                <div className="flex justify-between items-end border-b border-white/10 pb-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-serif font-bold text-white">
                            <AutoTranslatedText text="Curated Items" />
                        </h2>
                        <p className="text-white/40 font-light"><AutoTranslatedText text="Handpicked selection from this archival series" /></p>
                    </div>
                    {isAdmin && (
                        <button className="bg-[#00FFC2] text-[#0A0D17] px-6 py-3 rounded-full flex items-center gap-2 font-bold hover:bg-white transition-all">
                            <Plus size={18} /> <AutoTranslatedText text="Add Product" />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {subProducts.map(product => (
                        <motion.div 
                            key={product.id}
                            whileHover={{ y: -10 }}
                            className="bg-[#1A2420]/40 border border-white/5 rounded-3xl overflow-hidden group hover:border-[#00FFC2]/30 transition-all"
                        >
                            <div className="aspect-[4/5] relative overflow-hidden">
                                <img src={product.imageUrl} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute top-4 right-4">
                                    <button className="p-3 bg-black/60 backdrop-blur-md rounded-full text-white/40 hover:text-[#00FFC2] transition-colors">
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                                {isAdmin && (
                                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                                        <button className="flex-1 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white text-xs font-bold hover:bg-[#00FFC2] hover:text-black">Edit</button>
                                        <button onClick={() => deleteProduct(product.id).then(fetchSubProducts)} className="p-2 bg-red-500/20 backdrop-blur-md rounded-xl text-red-400 hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 space-y-3">
                                <h4 className="text-white font-bold tracking-tight truncate">
                                    <AutoTranslatedText text={getLocalizedText(product.title, i18n.language)} />
                                </h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#00FFC2] font-serif font-bold text-sm italic">
                                        <AutoTranslatedText text={getLocalizedText(product.price, i18n.language)} />
                                    </span>
                                    <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest"><AutoTranslatedText text="Limited" /></span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {!loading && subProducts.length === 0 && (
                    <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-white/10 font-serif italic text-xl">
                            <AutoTranslatedText text="The collection is currently being updated." />
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThemeSaleContainer;
