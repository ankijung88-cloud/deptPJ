import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFloorCategories } from '../api/categories';
import { FloorCategory } from '../types';
const FALLBACK_FLOORS: FloorCategory[] = [
    {
        id: 'floor-6',
        floor: '6F',
        title: { ko: '그로스 마켓', en: 'Growth Market' },
        description: { ko: '공동구매와 프리오더를 통해 새로운 가치를 발견하는 시장입니다.', en: 'A market where you discover new values through group purchases and pre-orders.' },
        color: '#E74C3C',
        subitems: [
            { id: 'share-buy', label: { ko: '공동구매', en: 'Group Buy' }, bgImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80' },
            { id: 'funding', label: { ko: '크라우드펀딩', en: 'Crowdfunding' }, bgImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80' },
            { id: 'f6_gourmet', label: { ko: '미식 아카이브', en: 'Gourmet' }, bgImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80' },
            { id: 'f6_craft', label: { ko: '지역 공예관', en: 'Local Craft' }, bgImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80' },
            { id: 'f6_tour', label: { ko: '헤리티지 투어', en: 'Heritage Tour' }, bgImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80' }
        ]
    },
    {
        id: 'floor-5',
        floor: '5F',
        title: { ko: '패션 아카이브', en: 'Fashion Archive' },
        description: { ko: '전통과 현대가 어우러진 패션의 정수를 경험해보세요.', en: 'Experience the essence of fashion where tradition and modernity blend.' },
        color: '#00D2FF',
        subitems: [
            { id: 'archive', label: { ko: '패션 아카이브', en: 'Archive' }, bgImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80' },
            { id: 'collection', label: { ko: '시즌 컬렉션', en: 'Collection' }, bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80' },
            { id: 'f5_fitting', label: { ko: '피팅 스튜디오', en: 'Fitting' }, bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80' }
        ]
    },
    {
        id: 'floor-4',
        floor: '4F',
        title: { ko: '로컬 헤리티지', en: 'Local Heritage' },
        description: { ko: '지역의 숨결이 담긴 문화 유산과 미식을 경험해보세요.', en: 'Experience cultural heritage and gourmet food containing the breath of the region.' },
        color: '#00A8FF',
        subitems: [
            { id: 'heritage', label: { ko: '지역 문화 유산', en: 'Heritage' }, bgImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80' }
        ]
    },
    {
        id: 'floor-3',
        floor: '3F',
        title: { ko: '라이프스타일 큐레이션', en: 'Lifestyle Curation' },
        description: { ko: '당신의 일상에 아름다운 가치를 더하는 큐레이션입니다.', en: 'A curation that adds beautiful values to your daily life.' },
        color: '#2ECC71',
        subitems: [
            { id: 'performance', label: { ko: '공연 실황', en: 'Performance' }, bgImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80' },
            { id: 'exhibit', label: { ko: '가상 전시', en: 'Exhibit' }, bgImage: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80' },
            { id: 'movement', label: { ko: '무브먼트 아카이브', en: 'Movement' }, bgImage: 'https://images.unsplash.com/photo-1550133730-695473e544be?auto=format&fit=crop&q=80' }
        ]
    },
    {
        id: 'floor-2',
        floor: '2F',
        title: { ko: '뷰티 앤 케어', en: 'Beauty & Care' },
        description: { ko: '건강함과 당신의 정체성을 드러내는 뷰티 솔루션입니다.', en: 'A beauty solution that reveals your health and identity.' },
        color: '#F39C12',
        subitems: [
            { id: 'skincare', label: { ko: '스킨케어', en: 'Skincare' }, bgImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80' },
            { id: 'hair', label: { ko: '헤어케어', en: 'Hair Care' }, bgImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80' },
            { id: 'p_surgery', label: { ko: '뷰티성형', en: 'Beauty' }, bgImage: 'https://images.unsplash.com/photo-1512496011931-d21ff4827e4c?auto=format&fit=crop&q=80' },
            { id: 'inner-beauty', label: { ko: '이너뷰티', en: 'Inner Beauty' }, bgImage: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80' },
            { id: 'body-care', label: { ko: '바디케어', en: 'Body Care' }, bgImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80' }
        ]
    },
    {
        id: 'floor-1',
        floor: '1F',
        title: { ko: '테크 앤 케어', en: 'Tech & Care' },
        description: { ko: '일상의 품격을 높이는 스마트한 기술과 맞춤형 웰니스 공간입니다.', en: 'A smart technology and customized wellness space that enhances the quality of daily life.' },
        color: '#FFD32A',
        subitems: [
            { id: 'f1_kpop', label: { ko: 'K-팝 스테이지', en: 'K-Pop' }, bgImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80' },
            { id: 'f1_library', label: { ko: '트렌드 라이브러리', en: 'Library' }, bgImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80' },
            { id: 'f1_tech', label: { ko: '한류 테크존', en: 'K-Tech' }, bgImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80' },
            { id: 'car-care', label: { ko: 'CAR 케어', en: 'Car Care' }, bgImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80' }
        ]
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
            
            // Always start with fallbacks
            const finalFloors = FALLBACK_FLOORS.map(fb => {
                const dynamic = data.find(d => 
                    d.floor?.toString().toUpperCase() === fb.floor.toUpperCase() ||
                    d.id?.toString() === fb.id.replace('floor-', '')
                );
                
                if (!dynamic) return fb;
                
                // Merge dynamic data but preserve fallback subitems if dynamic ones are missing or empty
                return {
                    ...fb,
                    ...dynamic,
                    id: fb.id, // Keep our standardized id
                    subitems: (dynamic.subitems && dynamic.subitems.length > 0) 
                        ? dynamic.subitems 
                        : fb.subitems
                };
            });

            // Add any floors from API that aren't in fallbacks (using their original IDs)
            const extraFloors = data.filter(d => 
                !FALLBACK_FLOORS.some(fb => 
                    fb.floor.toUpperCase() === d.floor?.toString().toUpperCase() ||
                    fb.id.replace('floor-', '') === d.id?.toString()
                )
            );

            const allFloors = [...finalFloors, ...extraFloors].sort((a, b) => {
                const getNum = (f: string) => parseInt(f.replace(/[^0-9]/g, '')) || 0;
                return getNum(b.floor) - getNum(a.floor);
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
