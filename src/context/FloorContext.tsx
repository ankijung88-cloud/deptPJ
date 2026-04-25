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
    const [floors, setFloors] = useState<FloorCategory[]>(FALLBACK_FLOORS);
    const [loading, setLoading] = useState(true);

    const refreshFloors = async () => {
        setLoading(true);
        try {
            const data = await getFloorCategories();
            if (!data || data.length === 0) {
                setFloors(FALLBACK_FLOORS);
                return;
            }

            // Merge dynamic data with fallback data
            const mergedFloors = FALLBACK_FLOORS.map(fallback => {
                const dynamic = data.find(d => d.id?.toString() === fallback.id?.toString()) || 
                                data.find(d => d.floor?.toString().trim().toUpperCase() === fallback.floor?.toString().trim().toUpperCase());
                
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
                            
                            // Use fallback subitems as the primary source of truth
                            // and only augment with dynamic data if ID matches
                            return fallbackSubitems.map(fbSub => {
                                const dynSub = dynamicSubitems.find(d => d.id?.toString().toLowerCase() === fbSub.id?.toString().toLowerCase());
                                return {
                                    ...fbSub,
                                    ...(dynSub || {}),
                                    // Ensure fallback labels are preserved unless dynamic explicitly provides them
                                    label: fbSub.label,
                                    bgImage: dynSub?.bgImage || dynSub?.bg_image || fbSub?.bgImage
                                };
                            });
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
