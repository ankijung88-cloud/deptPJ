import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFloorCategories } from '../api/categories';
import { FloorCategory } from '../types';
import { FALLBACK_FLOORS } from '../data/fallbackData';

interface FloorContextType {
    floors: FloorCategory[];
    loading: boolean;
    refreshFloors: () => Promise<void>;
}

const FloorContext = createContext<FloorContextType | undefined>(undefined);

export const FloorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [floors, setFloors] = useState<FloorCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshFloors = async () => {
        setLoading(true);
        try {
            const data = await getFloorCategories();
            // Merge dynamic data with fallback data
            const mergedFloors = FALLBACK_FLOORS.map(fallback => {
                const dynamic = (data || []).find(d => d.id?.toString() === fallback.id?.toString()) || 
                                (data || []).find(d => d.floor?.toString().trim().toUpperCase() === fallback.floor?.toString().trim().toUpperCase());
                
                if (dynamic) {
                    // Start with dynamic data but ensure critical fallback structure for rebranding
                    return { 
                        ...dynamic, 
                        id: fallback.id, 
                        floor: fallback.floor,
                        title: dynamic.title || fallback.title, 
                        subitems: (() => {
                            const fallbackSubitems = fallback.subitems || [];
                            const dynamicSubitems = (dynamic.subitems || []) as any[];
                            
                            // 1. Start with All subitems from DB
                            const merged = dynamicSubitems
                                .filter(dynSub => dynSub && dynSub.id) // Skip subitems with missing IDs
                                .map(dynSub => {
                                    const fbSub = fallbackSubitems.find(f => f.id === dynSub.id);
                                    return {
                                        ...fbSub,
                                        ...dynSub,
                                        // Ensure bgImage is normalized and prioritized
                                        bgImage: dynSub.bgImage || dynSub.bg_image || fbSub?.bgImage
                                    };
                                });

                            // 2. Add subitems from Fallback that are NOT in DB (to prevent breaks)
                            fallbackSubitems.forEach(fbSub => {
                                if (!merged.some(m => m.id === fbSub.id)) {
                                    merged.push(fbSub);
                                }
                            });

                            return merged;
                        })()
                    };
                }
                return fallback;
            });

            // Add extra floors from DB that are not in fallback
            const extraFloors = (data || []).filter(d => 
                !FALLBACK_FLOORS.some(f => f.floor === d.floor)
            );

            const allFloors = [...mergedFloors, ...extraFloors].sort((a, b) => {
                const levelA = parseInt(a.floor) || 0;
                const levelB = parseInt(b.floor) || 0;
                return levelB - levelA;
            });

            setFloors(allFloors);
        } catch (error) {
            console.error('Failed to fetch floors, using fallback:', error);
            setFloors(FALLBACK_FLOORS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshFloors();
    }, []);

    return (
        <FloorContext.Provider value={{ floors, loading, refreshFloors }}>
            {children}
        </FloorContext.Provider>
    );
};

export const useFloors = () => {
    const context = useContext(FloorContext);
    if (context === undefined) {
        throw new Error('useFloors must be used within a FloorProvider');
    }
    return context;
};
