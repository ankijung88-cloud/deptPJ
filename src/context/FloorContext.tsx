import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFloorCategories } from '../api/categories';
import { FloorCategory } from '../types';
const FALLBACK_FLOORS: FloorCategory[] = [
    {
        id: 'floor-6',
        floor: '6F',
        title: { ko: '그로스 마켓', en: 'Growth Market' },
        description: { ko: '공동구매와 프리오더를 통해 새로운 가치를 발견하는 시장입니다.', en: 'A market where you discover new values through group purchases and pre-orders.' },
        color: '#E74C3C'
    },
    {
        id: 'floor-5',
        floor: '5F',
        title: { ko: '노마드 워크플레이', en: 'Nomad Workplay' },
        description: { ko: '일하고, 즐기며, 나누는 일상이 영감이 되는 공간입니다.', en: 'A space where working, enjoying, and sharing daily life becomes inspiration.' },
        color: '#00D2FF'
    },
    {
        id: 'floor-4',
        floor: '4F',
        title: { ko: '로컬 헤리티지', en: 'Local Heritage' },
        description: { ko: '지역의 숨결이 담긴 문화 유산과 미식을 경험해보세요.', en: 'Experience cultural heritage and gourmet food containing the breath of the region.' },
        color: '#00A8FF'
    },
    {
        id: 'floor-3',
        floor: '3F',
        title: { ko: '아트 디스커버리', en: 'Art Discovery' },
        description: { ko: '당신의 일상에 세상의 모든 아름다운 가치들을 얻을 수 있는 여정입니다.', en: 'A journey where you can obtain all the beautiful values of the world in your daily life.' },
        color: '#2ECC71'
    },
    {
        id: 'floor-2',
        floor: '2F',
        title: { ko: '뷰티 앤 패션', en: 'Beauty & Fashion' },
        description: { ko: '건강함과 당신의 정체성을 드러내는 패션을 한곳에서 만나보세요.', en: 'Meet health and fashion that reveals your identity in one place.' },
        color: '#F39C12'
    },
    {
        id: 'floor-1',
        floor: '1F',
        title: { ko: '테크 앤 케어', en: 'Tech & Care' },
        description: { ko: '일상의 품격을 높이는 스마트한 기술과 맞춤형 웰니스 공간입니다.', en: 'A smart technology and customized wellness space that enhances the quality of daily life.' },
        color: '#FFD32A'
    }
];

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
            const data = await getFloorCategories().catch(() => []) || [];
            
            // Map dynamic data by floor name for easy lookup
            const dynamicMap = new Map(data.map(d => [d.floor?.toString().toUpperCase(), d]));

            // Always start with fallbacks
            const finalFloors = FALLBACK_FLOORS.map(fb => {
                const dynamic = dynamicMap.get(fb.floor.toUpperCase());
                if (dynamic) {
                    return { ...fb, ...dynamic, id: dynamic.id || fb.id };
                }
                return fb;
            });

            // Add any floors from API that aren't in fallbacks
            const extraFloors = data.filter(d => 
                !FALLBACK_FLOORS.some(fb => fb.floor.toUpperCase() === d.floor?.toString().toUpperCase())
            );

            const allFloors = [...finalFloors, ...extraFloors].sort((a, b) => {
                const levelA = parseInt(a.floor) || 0;
                const levelB = parseInt(b.floor) || 0;
                return levelB - levelA;
            });

            setFloors(allFloors);
        } catch (error) {
            console.error('Failed to fetch floors, using fallback:', error);
            // Ensure we have something to show
            setFloors([...FALLBACK_FLOORS].sort((a, b) => {
                const levelA = parseInt(a.floor) || 0;
                const levelB = parseInt(b.floor) || 0;
                return levelB - levelA;
            }));
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
