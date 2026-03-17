import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Plus } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { useNavigate } from 'react-router-dom';

interface ThemeExhibitContainerProps {
    parentId: string;
    isAdmin: boolean;
}

const ThemeExhibitContainer: React.FC<ThemeExhibitContainerProps> = ({ isAdmin }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-12">
            <div className="relative aspect-[21/9] rounded-3xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF00E5]/20 to-black z-0" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-[#FF00E5]/20 flex items-center justify-center mb-6 animate-pulse">
                        <Eye size={40} className="text-[#FF00E5]" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                        <AutoTranslatedText text="Immersive 3D Gallery" />
                    </h3>
                    <p className="text-white/60 max-w-xl mx-auto mb-8 font-light italic">
                        <AutoTranslatedText text="Experience our virtual heritage collection in a fully interactive 3D environment, curated specifically for this archive." />
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/inspiration')}
                        className="px-10 py-4 bg-[#FF00E5] text-white rounded-2xl font-bold text-lg shadow-2xl shadow-[#FF00E5]/20 hover:brightness-110 transition-all"
                    >
                        <AutoTranslatedText text="Enter Exhibition" />
                    </motion.button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h4 className="text-xl font-serif font-bold text-white">
                        <AutoTranslatedText text="Exhibited Masterpieces" />
                    </h4>
                    {isAdmin && (
                        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all border border-white/10">
                            <Plus size={18} /> <AutoTranslatedText text="Manage Exhibits" />
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Placeholder for exhibits */}
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-white/10 italic text-sm">
                            <Plus size={24} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThemeExhibitContainer;
