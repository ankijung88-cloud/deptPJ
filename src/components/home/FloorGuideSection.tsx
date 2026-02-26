import React, { useEffect, useState } from 'react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { motion } from 'framer-motion';
import { getFloorCategories } from '../../api/categories';
import { FloorCategory } from '../../types';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nParams';
import { Link } from 'react-router-dom';

export const FloorGuideSection: React.FC = () => {
    const { i18n } = useTranslation();
    const [floors, setFloors] = useState<FloorCategory[]>([]);

    useEffect(() => {
        let mounted = true;
        const fetchFloors = async () => {
            try {
                const data = await getFloorCategories();
                if (mounted) {
                    const sortedData = [...data].sort((a, b) => {
                        const valA = parseInt(a.floor) || 0;
                        const valB = parseInt(b.floor) || 0;
                        return valA - valB;
                    });
                    setFloors(sortedData);
                }
            } catch (error) {
                console.error("Error fetching floors", error);
            }
        };
        fetchFloors();
        return () => { mounted = false; };
    }, []);

    return (
        <section className="h-screen w-full snap-start bg-charcoal overflow-hidden flex flex-col items-center justify-center py-12 px-6">
            <div className="container mx-auto h-full flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center">
                {floors.map((floor) => (
                    <div
                        key={floor.floor}
                        className="flex-1 w-full md:w-auto h-[20vh] md:h-[70vh] max-w-[400px] relative group rounded-2xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-dancheong-red/20"
                    >
                        <Link to={`/floor/${floor.id}`} className="block w-full h-full">
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                style={{ backgroundImage: `url(${floor.bgImage})` }}
                            >
                                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-700" />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6 }}
                                    className="w-full"
                                >
                                    <span className="text-6xl md:text-7xl font-serif font-bold text-white/10 block mb-1 group-hover:text-white/20 transition-colors leading-none">
                                        {floor.floor}
                                    </span>

                                    <h3 className="text-lg md:text-xl font-serif font-bold text-white mb-2 group-hover:text-dancheong-green transition-colors">
                                        <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                    </h3>

                                    <p className="text-[10px] md:text-xs text-white/50 max-w-[200px] mx-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 line-clamp-2">
                                        <AutoTranslatedText text={getLocalizedText(floor.description, i18n.language)} />
                                    </p>

                                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="text-white mx-auto shadow-lg" size={18} />
                                    </div>
                                </motion.div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
};
