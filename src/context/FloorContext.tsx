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
                            
                            // If we have dynamic subitems, use them as the primary source
                            // but enrich with fallback data for missing fields
                            if (dynamicSubitems && dynamicSubitems.length > 0) {
                                return dynamicSubitems.map(dynSub => {
                                    const fbSub = fallbackSubitems.find(f => f.id?.toString().toLowerCase() === dynSub.id?.toString().toLowerCase());
                                    return {
                                        ...(fbSub || {}),
                                        ...dynSub,
                                        // Ensure labels and descriptions from dynamic data take precedence
                                        label: dynSub.label || fbSub?.label,
                                        description: dynSub.description || fbSub?.description,
                                        bgImage: dynSub.bgImage || dynSub.bg_image || fbSub?.bgImage
                                    };
                                });
                            }
                            
                            // If no dynamic subitems, return fallbacks
                            return fallbackSubitems;
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
