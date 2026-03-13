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
            if (data && data.length > 0) {
                const sortedData = [...data].sort((a, b) => {
                    const levelA = parseInt(a.floor) || 0;
                    const levelB = parseInt(b.floor) || 0;
                    return levelB - levelA;
                });
                setFloors(sortedData);
            } else {
                setFloors(FALLBACK_FLOORS);
            }
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
