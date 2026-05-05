import React, { useState, useEffect } from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumHero } from '../components/home/PremiumHero';
import { PremiumFeatureGrid } from '../components/home/PremiumFeatureGrid';
import { PremiumBannerSection } from '../components/home/PremiumBannerSection';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { FeaturedItem } from '../types';
import { getFeaturedProducts } from '../api/products';
import { useAdmin } from '../hooks/useAdmin';
import { EditableWrapper } from '../components/common/EditableWrapper';
import { TemplateTextEditModal } from '../components/admin/TemplateTextEditModal';

interface ProjectLandingPageProps {
    item?: FeaturedItem;
}

const ProjectLandingPage: React.FC<ProjectLandingPageProps> = ({ item }) => {
    useImmersiveMode(true);
    const { isAdmin, isAgency, user } = useAdmin();
    const [localItem, setLocalItem] = useState<FeaturedItem | undefined>(item);
    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | null>(null);

    useEffect(() => {
        if (!item) {
            // Fetch a sample skincare project if none is provided
            const fetchSample = async () => {
                try {
                    const products = await getFeaturedProducts();
                    const sample = products.find(p => p.page_type === 'skincare');
                    if (sample) setLocalItem(sample);
                } catch (err) {
                    console.error('Failed to fetch sample project:', err);
                }
            };
            fetchSample();
        } else {
            setLocalItem(item);
        }
    }, [item]);

    // Permissions: Admin or Agency owner of the project
    const canEdit = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    return (
        <div className="min-h-screen bg-[#F5F0E8] selection:bg-[#2D2924] selection:text-[#F5F0E8]">
            <PremiumHeader item={localItem} />
            
            <main className="pt-20">
                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Edit Hero Section" 
                    onEdit={() => setEditingSection('hero')}
                >
                    <PremiumHero item={localItem} />
                </EditableWrapper>

                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Edit Features Section" 
                    onEdit={() => setEditingSection('feature')}
                >
                    <PremiumFeatureGrid item={localItem} />
                </EditableWrapper>

                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Edit Banner & Inquiry" 
                    onEdit={() => setEditingSection('banner')}
                >
                    <PremiumBannerSection item={localItem} />
                </EditableWrapper>
            </main>

            <EditableWrapper 
                canEdit={canEdit} 
                label="Edit Footer Content" 
                onEdit={() => setEditingSection('footer')}
            >
                <PremiumFooter item={localItem} />
            </EditableWrapper>

            {/* Editing Modal */}
            {localItem && editingSection && (
                <TemplateTextEditModal 
                    item={localItem}
                    section={editingSection}
                    onClose={() => setEditingSection(null)}
                    onSuccess={(updated) => setLocalItem(updated)}
                />
            )}
        </div>
    );
};

export default ProjectLandingPage;

