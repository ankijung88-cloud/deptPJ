import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FLOORS } from '../../constants/floors';
import { Compass, ChevronRight, Layers } from 'lucide-react';
import { AutoTranslatedText } from './AutoTranslatedText';

import { supabase } from '../../lib/supabaseClient';

export const GlobalMiniMap: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [stories, setStories] = useState<any[]>([]);
    
    const location = useLocation();
    const navigate = useNavigate();
    const { subId } = useParams<{ subId: string }>();
    
    // Fetch items when expanded
    useEffect(() => {
        if (isExpanded && items.length === 0) {
            const fetchAllData = async () => {
                try {
                    const [itemsRes, storiesRes] = await Promise.all([
                        supabase.from('featured_items').select('id, title, subcategory'),
                        supabase.from('story_cards').select('id, title, subcategory')
                    ]);
                    
                    if (itemsRes.data) setItems(itemsRes.data);
                    if (storiesRes.data) setStories(storiesRes.data);
                } catch (error) {
                    console.error('Failed to fetch minimap data:', error);
                }
            };
            fetchAllData();
        }
    }, [isExpanded, items.length]);

    // Identify current floor
    const currentPath = location.pathname;
    const currentFloor = FLOORS.find(f => 
        currentPath.includes(`/category/${f.label.toLowerCase()}`) || 
        f.subcategories.some(s => s.id === subId)
    );

    const getItemsForSub = (sid: string) => {
        const subItems = items.filter(i => i.subcategory === sid);
        const subStories = stories.filter(s => s.subcategory === sid);
        return [...subItems, ...subStories];
    };

    return (
        <div 
            className="fixed bottom-6 left-6 z-[60] flex flex-col items-start gap-3 p-4 -m-4"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: -20, y: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: -20, y: 20 }}
                        className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 mb-2 shadow-2xl min-w-[320px] max-w-[400px] max-h-[70vh] flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4 shrink-0">
                            <Layers size={18} className="text-white/40" />
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/60">
                                <AutoTranslatedText text="Temporal Directory" />
                            </span>
                        </div>

                        <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                            {FLOORS.map((floor) => {
                                const isActive = currentFloor?.level === floor.level;
                                const isCategoryActive = (sid: string) => subId === sid;

                                return (
                                    <div key={floor.level} className="space-y-3">
                                        <button
                                            onClick={() => {
                                                navigate(`/category/${floor.subcategories[0].id}`);
                                                setIsExpanded(false);
                                            }}
                                            className={`w-full flex items-center justify-between group/floor transition-all ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-mono font-bold w-6">{floor.label}</span>
                                                <span className="text-xs font-bold tracking-wider uppercase"><AutoTranslatedText text={floor.title} /></span>
                                            </div>
                                            {isActive && (
                                                <motion.div 
                                                    layoutId="activeIndicator"
                                                    className="w-1.5 h-1.5 rounded-full" 
                                                    style={{ backgroundColor: floor.color }} 
                                                />
                                            )}
                                        </button>

                                        <div className="pl-9 space-y-4 border-l border-white/10 ml-3">
                                            {floor.subcategories.map((sub) => {
                                                const subItems = getItemsForSub(sub.id);
                                                const active = isCategoryActive(sub.id);
                                                
                                                return (
                                                    <div key={sub.id} className="space-y-2">
                                                        <button
                                                            onClick={() => {
                                                                navigate(`/category/${sub.id}`);
                                                                setIsExpanded(false);
                                                            }}
                                                            className={`w-full text-left text-[10px] font-bold transition-all flex items-center gap-2 ${active ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                                                        >
                                                            {active && <ChevronRight size={10} style={{ color: floor.color }} />}
                                                            <AutoTranslatedText text={sub.label} />
                                                        </button>
                                                        
                                                        {subItems.length > 0 && (
                                                            <div className="pl-4 space-y-1.5 opacity-60">
                                                                {subItems.map((item) => (
                                                                    <button 
                                                                        key={item.id} 
                                                                        onClick={() => {
                                                                            navigate(`/category/${sub.id}`);
                                                                            setIsExpanded(false);
                                                                        }}
                                                                        className="w-full text-left text-[9px] text-white/40 font-medium leading-tight hover:text-white/80 transition-colors"
                                                                    >
                                                                        <AutoTranslatedText text={typeof item.title === 'string' ? item.title : item.title?.ko || ''} />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border relative ${isExpanded ? 'bg-white border-white scale-110' : 'bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/30 hover:scale-105'}`}
            >
                <Compass 
                    size={24} 
                    className={`transition-all duration-700 ${isExpanded ? 'text-black rotate-180 scale-110' : 'text-white/60 group-hover:text-white'}`} 
                />
                
                {/* Visual HUD Pulse when collapsed */}
                {!isExpanded && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-white/5 pointer-events-none" />
                )}
                
                {currentFloor && !isExpanded && (
                    <div 
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#2D3D36] shadow-lg"
                        style={{ backgroundColor: currentFloor.color }}
                    />
                )}
            </button>
        </div>
    );
};
