import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { FLOORS } from '../../constants/floors';
import { AutoTranslatedText } from './AutoTranslatedText';
import { useGetNavigationAction } from '../../context/NavigationActionContext';

export const Breadcrumbs: React.FC = () => {
    const action = useGetNavigationAction();
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (location.pathname === '/' || location.pathname === '/inspiration') {
        return null; // Don't show on main landing or 3D view which has its own header
    }

    const getLabel = (segment: string, index: number, array: string[]) => {
        if (segment === 'floor') return null; // Skip 'floor' segment for cleaner path
        if (segment === 'articles' && array[index-1]) return '아티클';
        if (segment === 'category') return null;
        if (segment === 'detail') return '상세 정보';

        // Check if segment is a floor level
        const floorLevel = parseInt(segment);
        if (!isNaN(floorLevel) && array[index-1] === 'floor') {
            const floor = FLOORS.find(f => f.level === floorLevel);
            return floor ? floor.label : segment;
        }

        // Check if segment is a subcategory ID
        if (array[index-1] === 'category') {
            for (const floor of FLOORS) {
                const sub = floor.subcategories.find(s => s.id === segment);
                if (sub) return sub.label;
            }
        }

        return segment.toUpperCase();
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

                {pathnames.map((name, index) => {
                    const label = getLabel(name, index, pathnames);
                    if (!label) return null;

                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;

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
                })}
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
