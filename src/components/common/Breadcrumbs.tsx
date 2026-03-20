import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useFloors } from '../../context/FloorContext';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from './AutoTranslatedText';
import { useNavigationState } from '../../context/NavigationActionContext';
import { getFloorBySubId } from '../../utils/themeUtils';

export const Breadcrumbs: React.FC = () => {
    const { action, breadcrumbTitle, breadcrumbPath } = useNavigationState();
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const { floors } = useFloors();
    const { i18n } = useTranslation();

    if (location.pathname === '/' || location.pathname === '/inspiration') {
        return null; // Don't show on main landing or 3D view which has its own header
    }

    const getLabel = (segment: string, array: string[], index: number) => {
        // Hardcoded translations for known structural segments
        const translations: { [key: string]: string } = {
            'floor': '층별안내',
            'category': '카테고리',
            'detail': '상세',
            'admin': '관리자',
            'login': '로그인',
            'museum': '가상 전시관',
            'store': '가상 스토어',
            'cinema': '가상 시네마',
            'ticket': '가상 티켓',
            'virtual-museum': '가상 전시관',
            'virtual-store': '가상 스토어',
            'virtual-cinema': '가상 시네마',
            'virtual-ticket': '가상 티켓'
        };

        if (translations[segment]) {
            return translations[segment];
        }

        // Check if segment is a floor ID (e.g., '6f', '7f')
        const floor = floors.find(f => f.floor.toLowerCase() === segment.toLowerCase());
        if (floor) {
            return floor.floor.toUpperCase();
        }

        // Check if segment is a subcategory ID
        if (array[index-1] === 'category') {
            for (const f of floors) {
                const sub = f.subitems?.find(s => s.id === segment);
                if (sub) return getLocalizedText(sub.label, i18n.language);
            }
        }

        // Avoid showing raw UUIDs in breadcrumbs (common for detail/some-uuid)
        if (array[index-1] === 'detail' || segment.length > 20) {
            // First check if parent title was passed in navigation state
            if (location.state?.parentTitle && (array[index-1] === 'detail')) {
                return location.state.parentTitle;
            }
            return breadcrumbTitle || '상세 기록';
        }

        return segment;
    };

    return (
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar select-none z-50 py-1.5">
            <div className="flex items-center gap-1.5">
                <span className="text-[#00FFC2]/60 font-mono text-[10px] tracking-[0.2em] font-black uppercase whitespace-nowrap">
                    ARCHIVE //
                </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-white/80">
                <Link to="/" className="hover:text-[#00FFC2] transition-colors whitespace-nowrap">
                    <AutoTranslatedText text="3D포털" />
                </Link>
                
                <ChevronRight className="w-3 h-3 text-[#00FFC2]/50 shrink-0" />
                
                <Link to="/inspiration" className="hover:text-[#00FFC2] transition-colors whitespace-nowrap">
                    <AutoTranslatedText text="층별안내" />
                </Link>

                {/* URL-based segments (Fallback if breadcrumbPath is empty) */}
                {breadcrumbPath.length > 0 ? (
                    breadcrumbPath.map((item, index) => {
                        const isLast = index === breadcrumbPath.length - 1;
                        const label = typeof item.label === 'object' 
                            ? getLocalizedText(item.label, i18n.language) 
                            : item.label;

                        let routeTo = '';
                        if (item.type === 'floor') {
                            const floorNum = item.id?.replace('floor-', '') || '';
                            routeTo = floorNum ? `/inspiration?floor=${floorNum}` : '/inspiration';
                        } else if (item.type === 'category') {
                            const floorNum = getFloorBySubId(item.id);
                            routeTo = floorNum ? `/inspiration?floor=${floorNum}` : `/category/${item.id}`;
                        } else if (item.type === 'detail' && !isLast) {
                            routeTo = `/detail/${item.id}`;
                        }

                        return (
                            <React.Fragment key={index}>
                                <ChevronRight className="w-3 h-3 text-[#00FFC2]/50 shrink-0" />
                                {isLast ? (
                                    <span className="text-[#00FFC2] font-black brightness-110 drop-shadow-[0_0_8px_rgba(0,255,194,0.4)] whitespace-nowrap">
                                        <AutoTranslatedText text={label} />
                                    </span>
                                ) : (
                                    routeTo ? (
                                        <Link to={routeTo} className="hover:text-[#00FFC2]/90 transition-colors whitespace-nowrap">
                                            <AutoTranslatedText text={label} />
                                        </Link>
                                    ) : (
                                        <span className="text-white/80 whitespace-nowrap">
                                            <AutoTranslatedText text={label} />
                                        </span>
                                    )
                                )}
                            </React.Fragment>
                        );
                    })
                ) : (
                    pathnames.map((name, index) => {
                        const label = getLabel(name, pathnames, index);
                        if (!label) return null;

                        let routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                        const isLast = index === pathnames.length - 1;

                        // Special handling for 'category' segment in breadcrumbs
                        if (name === 'category' && pathnames[index + 1]) {
                            const floorNum = getFloorBySubId(pathnames[index + 1]);
                            if (floorNum) {
                                routeTo = `/inspiration?floor=${floorNum}`;
                            }
                        }

                        return (
                            <React.Fragment key={routeTo}>
                                <ChevronRight className="w-3 h-3 text-[#00FFC2]/50 shrink-0" />
                                {isLast ? (
                                    <span className="text-[#00FFC2] font-black brightness-110 drop-shadow-[0_0_8px_rgba(0,255,194,0.4)] whitespace-nowrap">
                                        <AutoTranslatedText text={label} />
                                    </span>
                                ) : (
                                    <Link to={routeTo} className="hover:text-[#00FFC2]/90 transition-colors whitespace-nowrap">
                                        <AutoTranslatedText text={label} />
                                    </Link>
                                )}
                            </React.Fragment>
                        );
                    })
                )}
            </div>

            {/* Action Slot */}
            {action && (
                <div className="flex-shrink-0 ml-3 pointer-events-auto flex items-center h-full">
                    {action}
                </div>
            )}
        </nav>
    );
};
