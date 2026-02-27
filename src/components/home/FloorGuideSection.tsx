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
                // 항상 1F → 5F 순서로 정렬
                const sorted = data.sort((a, b) => {
                    const numA = parseInt(a.floor.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.floor.replace(/\D/g, '')) || 0;
                    return numA - numB;
                });
                if (mounted) setFloors(sorted);
            } catch (error) {
                console.error("Error fetching floors", error);
            }
        };
        fetchFloors();
        return () => { mounted = false; };
    }, []);

    return (
        <section className="h-screen w-full snap-start bg-charcoal overflow-hidden flex">
            {floors.map((floor) => (
                <div key={floor.floor} className="flex-1 h-full relative group border-r border-white/5 last:border-r-0 overflow-hidden">
                    <Link to={`/floor/${floor.id}`} className="block w-full h-full">
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                            style={{ backgroundImage: `url(${floor.bgImage})` }}
                        >
                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-700" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                                className="w-full"
                            >
                                <span className="text-8xl md:text-9xl font-serif font-bold text-white/10 block mb-4 group-hover:text-white/20 transition-colors">
                                    {floor.floor}
                                </span>

                                <h3 className="text-base md:text-xl lg:text-2xl font-serif font-bold text-white mb-4 group-hover:text-dancheong-green transition-colors break-words leading-snug px-2">
                                    <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                </h3>

                                <p className="text-sm text-white/60 max-w-[280px] mx-auto break-words opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                    <AutoTranslatedText text={getLocalizedText(floor.description, i18n.language)} />
                                </p>

                                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="text-white mx-auto" size={24} />
                                </div>
                            </motion.div>
                        </div>
                    </Link>
                </div>
            ))}
        </section>
    );
};
