import React from 'react';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import textureImage from '../../assets/premium-landing/skincare_texture_moisture_1777972510234.png';
import bottleImage from '../../assets/premium-landing/skincare_bottle_minimalist_1777972530032.png';

const FEATURES = [
    { id: 1, title: '민감할 때', desc: '순하고 편안한 케어', image: textureImage },
    { id: 2, title: '건조할 때', desc: '촉촉한 보습 케어', image: bottleImage },
    { id: 3, title: '지칠 때', desc: '피부에 휴식을', image: textureImage },
    { id: 4, title: '특별한 날', desc: '나를 위한 스페셜 케어', image: bottleImage },
];

export const PremiumFeatureGrid: React.FC = () => {
    return (
        <section className="py-24 bg-[#F5F0E8]">
            <div className="container mx-auto px-6 md:px-12 lg:px-24">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="text-[10px] font-black tracking-[0.4em] mb-4 uppercase text-[#8B7E66]">
                        <AutoTranslatedText text="Today's Yeoul" />
                    </h2>
                    <h3 className="text-3xl font-serif text-[#2D2924]">오늘의 여울</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {FEATURES.map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="w-full aspect-square relative rounded-[40px] overflow-hidden mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                                <img 
                                    src={feature.image} 
                                    alt={feature.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-[#2D2924]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h4 className="text-lg font-serif text-[#2D2924] mb-1">
                                <AutoTranslatedText text={feature.title} />
                            </h4>
                            <p className="text-xs text-[#8B7E66] tracking-wide">
                                <AutoTranslatedText text={feature.desc} />
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
