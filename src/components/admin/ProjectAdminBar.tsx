import React from 'react';
import { Settings, Plus, Layout, Trash2, Globe } from 'lucide-react';
import { FeaturedItem } from '../../types';

interface ProjectAdminBarProps {
    item?: FeaturedItem;
    onEditSettings: () => void;
    onEditHeader: () => void;
    onDelete?: () => void;
    onAdd?: () => void;
    canEdit: boolean;
}

export const ProjectAdminBar: React.FC<ProjectAdminBarProps> = ({ 
    item, 
    onEditSettings, 
    onEditHeader,
    onDelete,
    onAdd,
    canEdit 
}) => {
    if (!canEdit) return null;

    return (
        <div className="fixed top-20 left-0 w-full z-[150] px-6 py-2 bg-[#2D2924]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-4 pointer-events-auto">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                    <Globe size={12} className="text-[#FFD700]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                        {item?.page_type || 'Template'} Admin
                    </span>
                </div>
                
                <div className="h-4 w-[1px] bg-white/20" />

                <button 
                    onClick={onEditSettings}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold transition-all border border-white/10"
                >
                    <Settings size={14} />
                    페이지 정보 수정
                </button>

                <button 
                    onClick={onEditHeader}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold transition-all border border-white/10"
                >
                    <Layout size={14} />
                    헤더/네비게이션 수정
                </button>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
                {onAdd && (
                    <button 
                        onClick={onAdd}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#FFD700] hover:bg-[#FFC000] text-[#2D2924] rounded-lg text-[10px] font-black transition-all shadow-lg shadow-[#FFD700]/20"
                    >
                        <Plus size={14} />
                        제품 추가등록
                    </button>
                )}
                
                {onDelete && (
                    <button 
                        onClick={onDelete}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-all border border-red-500/20"
                        title="Delete Page"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};
