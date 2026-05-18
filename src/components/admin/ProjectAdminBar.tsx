import React, { useState } from 'react';
import { Settings, Plus, Layout, Trash2, Globe, LayoutGrid } from 'lucide-react';
import { FeaturedItem } from '../../types';
import { TemplateSwitchModal } from '../common/TemplateSwitchModal';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

interface ProjectAdminBarProps {
    item?: FeaturedItem;
    onEditSettings: () => void;
    onEditHeader: () => void;
    onDelete?: () => void;
    onAdd?: () => void;
    canEdit: boolean;
}

const modalTheme = {
    bgColor: '#FCF9F5',
    textPrimary: '#2D2924',
    textSecondary: '#8B7E66',
    highlightColor: '#8B7E66',
    color3: '#E6DCD2'
};

export const ProjectAdminBar: React.FC<ProjectAdminBarProps> = ({ 
    item, 
    onEditSettings, 
    onEditHeader,
    onDelete,
    onAdd,
    canEdit 
}) => {
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateModalType, setTemplateModalType] = useState<'standard' | 'project'>('standard');

    if (!canEdit) return null;

    const handleSelectTemplate = async (templateId: string) => {
        if (!item) return;
        
        try {
            const backendData = {
                title: item.title,
                category: item.category,
                subcategory: item.subcategory,
                description: item.description,
                long_description: item.long_description,
                image_url: item.imageUrl,
                thumbnail_url: item.thumbnailUrl,
                side_image_url: item.sideImageUrl,
                back_image_url: item.backImageUrl,
                event_date: item.date,
                location: item.location,
                price: item.price,
                closed_days: JSON.stringify(item.closedDays || []),
                video_url: item.videoUrl,
                page_type: templateId,
                parent_id: (item as any).parent_id,
                theme_data: (item as any).theme_data,
                selected_templates: JSON.stringify(item.selected_templates || [])
            };

            const response = await fetch(`/api/products/${item.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                },
                body: JSON.stringify(backendData)
            });

            if (response.ok) {
                setIsTemplateModalOpen(false);
                
                // Let's redirect based on template ID:
                const isProjectTemplate = ['skincare', 'curation', 'brand', 'magazine', 'community', 'project_landing'].includes(templateId);
                
                if (isProjectTemplate) {
                    const params = new URLSearchParams();
                    if (item.agency_id) params.append('agencyId', String(item.agency_id));
                    if (item.category) params.append('category', String(item.category));
                    if (item.subcategory) params.append('subcategory', String(item.subcategory));
                    const queryString = params.toString() ? `?${params.toString()}` : '';
                    
                    if (templateId === 'project_landing') {
                        window.location.href = `/project-template${queryString}`;
                    } else {
                        window.location.href = `/project-template/${templateId}${queryString}`;
                    }
                } else {
                    window.location.href = `/detail/${item.id}`;
                }
            } else {
                alert('템플릿 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to switch template:', error);
            alert('템플릿 변경 중 오류가 발생했습니다.');
        }
    };

    return (
        <>
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
                    {/* Add switchers to the left of "제품 추가등록" */}
                    <button
                        onClick={() => {
                            setTemplateModalType('standard');
                            setIsTemplateModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold transition-all border border-white/10 relative overflow-hidden group"
                    >
                        <LayoutGrid size={12} className="text-[#FF3B3B]" />
                        <AutoTranslatedText text="템플릿 선택" />
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    </button>

                    <button
                        onClick={() => {
                            setTemplateModalType('project');
                            setIsTemplateModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold transition-all border border-white/10 relative overflow-hidden group"
                    >
                        <Layout size={12} className="text-[#FF8F00]" />
                        <AutoTranslatedText text="프로젝트형 템플릿 선택" />
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                    </button>

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

            <TemplateSwitchModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelect={handleSelectTemplate}
                currentTemplateId={item?.page_type}
                theme={modalTheme}
                filterType={templateModalType}
            />
        </>
    );
};
