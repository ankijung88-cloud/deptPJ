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
            const data = await getFloorCategories() || [];
            
            // Merge dynamic data with fallback data
            // We map over FALLBACK_FLOORS to ensure the core structure (1F-6F) always exists
            const mergedFloors = FALLBACK_FLOORS.map(fallback => {
                const dynamic = data.find(d => d.id?.toString() === fallback.id?.toString()) || 
                                data.find(d => d.floor?.toString().trim().toUpperCase() === fallback.floor?.toString().trim().toUpperCase());
                
                if (dynamic) {
                    return { 
                        ...fallback, 
                        ...dynamic,
                        // Ensure we use the dynamic ID and floor name if they exist, 
                        // but fallback to the static ones if the dynamic ones are null/undefined
                        id: dynamic.id || fallback.id,
                        floor: dynamic.floor || fallback.floor,
                        subitems: (dynamic.subitems && dynamic.subitems.length > 0) ? dynamic.subitems : fallback.subitems
                    };
                }
                return fallback;
            });

            // Add extra floors from DB that are not in fallback
            const extraFloors = data.filter(d => 
                !FALLBACK_FLOORS.some(f => f.id?.toString() === d.id?.toString() || f.floor === d.floor)
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
