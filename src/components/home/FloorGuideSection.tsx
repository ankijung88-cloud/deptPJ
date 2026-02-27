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
    const [hoveredFloorId, setHoveredFloorId] = useState<string | null>(null);

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

    useEffect(() => {
        if (floors.length > 0 && !hoveredFloorId) {
            setHoveredFloorId(floors[0].id);
        } else if (floors.length === 0) {
            setHoveredFloorId(null);
        }
    }, [floors, hoveredFloorId]);

    return (
        <section className="h-screen w-full snap-start bg-charcoal overflow-hidden flex flex-col items-center justify-center py-12 px-6">
            <div className="container mx-auto h-[70vh] flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center">
                {floors.map((floor, index) => {
                    const isHovered = hoveredFloorId === floor.id || (hoveredFloorId === null && index === 0);

                    return (
                        <motion.div
                            key={floor.floor}
                            className="relative h-full w-full rounded-2xl overflow-hidden cursor-pointer group bg-charcoal border border-white/5"
                            onHoverStart={() => setHoveredFloorId(floor.id)}
                            onClick={() => setHoveredFloorId(floor.id)}
                            animate={{
                                flex: isHovered ? (window.innerWidth >= 768 ? 5 : 3) : 1,
                                opacity: 1
                            }}
                            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                        >
                            <Link to={`/floor/${floor.id}`} className="block w-full h-full">
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${floor.bgImage})` }}
                                >
                                    <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'bg-gradient-to-t from-black via-black/40 to-black/10' : 'bg-black/60'}`} />
                                </div>

                                {/* Inactive Vertical Title */}
                                <div
                                    className={`absolute inset-0 flex flex-col items-center p-4 transition-opacity duration-300 delay-100 ${isHovered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                >
                                    <div className="text-4xl font-serif font-bold text-white/30 mb-8 pt-8">
                                        {floor.floor}
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md text-white/70 text-xs md:text-sm font-bold px-2 py-4 rounded-sm tracking-widest flex items-center shadow-lg">
                                        <span style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                                            <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} verticalRotateHyphen={true} />
                                        </span>
                                    </div>
                                </div>

                                {/* Active Details Overlay */}
                                <div
                                    className={`absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end transition-all duration-500 delay-150 transform ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                                >
                                    <span className="text-6xl md:text-8xl font-serif font-bold text-white/20 block mb-2 leading-none drop-shadow-md">
                                        {floor.floor}
                                    </span>

                                    <h3 className="text-xl md:text-3xl font-serif font-bold text-white mb-3 group-hover:text-dancheong-green transition-colors drop-shadow-md">
                                        <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                    </h3>

                                    <p className="text-xs md:text-sm text-white/70 max-w-md line-clamp-3 mb-6">
                                        <AutoTranslatedText text={getLocalizedText(floor.description, i18n.language)} />
                                    </p>

                                    <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest hover:text-dancheong-red transition-colors w-fit">
                                        Explore Floor
                                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-dancheong-red transition-all duration-300 shadow-lg">
                                            <ArrowUpRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};
