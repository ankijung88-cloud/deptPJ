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
            console.log('FloorContext: API Data received:', data);
            
            // Merge dynamic data with fallback data
            // Use 'floor' string (e.g. "6F") as the unique key to match
            const mergedFloors = FALLBACK_FLOORS.map(fallback => {
                const dynamic = (data || []).find(d => {
                    const match = d.floor?.toString().trim().toUpperCase() === fallback.floor?.toString().trim().toUpperCase();
                    if (!match && d.floor) {
                        // console.log(`No match for DB floor "${d.floor}" against fallback "${fallback.floor}"`);
                    }
                    return match;
                });
                
                if (dynamic) {
                    console.log(`Matched floor ${fallback.floor}! ID: ${dynamic.id}`);
                }
                
                return dynamic ? { ...fallback, ...dynamic } : fallback;
            });

            // Also include any extra floors from DB that aren't in fallbacks
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
