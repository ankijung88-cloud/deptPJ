import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { getAgencies } from '../../api/auth';
import { FALLBACK_PARTNERS } from '../../data/fallbackData';

const ScrollingRow: React.FC<{ direction: 'left' | 'right'; speed: number; items: any[] }> = ({ direction, speed, items }) => {
    if (!items || items.length === 0) return null;
    
    return (
        <div className="flex relative overflow-hidden h-28 items-center">
            <motion.div 
                className="flex gap-8 whitespace-nowrap absolute left-0"
                animate={{ 
                    x: direction === 'left' ? [0, -2500] : [-2500, 0] 
                }}
                transition={{ 
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed,
                        ease: "linear",
                    },
                }}
            >
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex gap-8 items-center">
                        {items.map((partner, pIdx) => (
                            <div 
                                key={`${i}-${pIdx}`} 
                                className="flex items-center gap-5 px-8 py-4 bg-white/60 backdrop-blur-md border border-dancheong-ink/5 rounded-3xl shadow-sm hover:border-dancheong-ink/10 transition-all cursor-default group min-w-[280px]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-dancheong-ink/5 flex items-center justify-center group-hover:bg-dancheong-mugwort/10 transition-colors overflow-hidden">
                                    {partner.logo_url ? (
                                        <img src={partner.logo_url} alt={partner.agency_name || partner.name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-dancheong-mugwort" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-dancheong-ink tracking-tight">
                                        {partner.agency_name || partner.name}
                                    </span>
                                    <span className="text-[10px] text-dancheong-ink/40 font-bold uppercase tracking-wider">
                                        {partner.industry || (partner.agency_name ? 'Certified Partner' : 'Industry Partner')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export const LandingPartnerSection: React.FC = () => {
    const [partners, setPartners] = useState<any[]>([]);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const data = await getAgencies();
                if (data && data.length > 0) {
                    setPartners(data);
                } else {
                    setPartners(FALLBACK_PARTNERS);
                }
            } catch (error) {
                console.warn('Could not fetch dynamic partners, using fallback data');
                setPartners(FALLBACK_PARTNERS);
            }
        };
        fetchPartners();
    }, []);

    // Split partners into 3 rows
    const row1 = partners.length > 0 ? partners.slice(0, Math.ceil(partners.length / 3)) : [];
    const row2 = partners.length > 0 ? partners.slice(Math.ceil(partners.length / 3), Math.ceil(partners.length * 2 / 3)) : [];
    const row3 = partners.length > 0 ? partners.slice(Math.ceil(partners.length * 2 / 3)) : [];

    // Ensure rows have at least some items if splitting static data
    const finalRow1 = row1.length > 0 ? row1 : FALLBACK_PARTNERS.slice(0, 4);
    const finalRow2 = row2.length > 0 ? row2 : FALLBACK_PARTNERS.slice(4, 8);
    const finalRow3 = row3.length > 0 ? row3 : FALLBACK_PARTNERS.slice(8, 12);

    return (
        <section id="partners" className="relative w-full py-24 bg-transparent overflow-hidden border-t border-dancheong-ink/5">
            <div className="w-full">
                <div className="flex flex-col items-center mb-16 px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h4 className="text-dancheong-mugwort text-[11px] font-black tracking-[0.5em] uppercase mb-4">
                            Trusted by Global Agencies
                        </h4>
                        <div className="h-[2px] w-16 bg-dancheong-mugwort/20 mx-auto" />
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <ScrollingRow direction="left" speed={70} items={finalRow1} />
                    <ScrollingRow direction="right" speed={60} items={finalRow2} />
                    <ScrollingRow direction="left" speed={80} items={finalRow3} />
                </div>
            </div>
        </section>
    );
};
