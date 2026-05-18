import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getFeaturedProducts, createProduct } from '../api/products';
import { FeaturedItem, LocalizedString } from '../types';
import { Loader2 } from 'lucide-react';
import ProjectLandingPage from '../templates/ProjectLandingPage';
import { ProjectSkincarePage } from '../templates/ProjectSkincarePage';
import { ProjectCurationPage } from '../templates/ProjectCurationPage';
import { ProjectBrandPage } from '../templates/ProjectBrandPage';
import { ProjectMagazinePage } from '../templates/ProjectMagazinePage';
import { ProjectCommunityPage } from '../templates/ProjectCommunityPage';
import { useAdmin } from '../hooks/useAdmin';

const getLocalizedValue = (val: LocalizedString, lang: 'ko' | 'en'): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang] || val['ko'] || '';
};

const ProjectTemplatePage: React.FC = () => {
    const { pageId } = useParams<{ pageId?: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAdmin();

    const [resolvedItem, setResolvedItem] = useState<FeaturedItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Parse context from URL query params
    const queryParams = new URLSearchParams(location.search);
    const urlCategory = queryParams.get('category');
    const urlSubcategory = queryParams.get('subcategory');
    const urlAgencyId = queryParams.get('agencyId');

    const resolvePage = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log(`[ProjectTemplatePage] Resolving Page - ID: ${pageId}, Category: ${urlCategory}, Subcategory: ${urlSubcategory}, Agency: ${urlAgencyId}`);
            const allProducts = await getFeaturedProducts();

            // 1. If pageId is provided, look for exact ID match
            if (pageId) {
                const exactMatch = allProducts.find(p => p.id === pageId);
                if (exactMatch) {
                    console.log(`[ProjectTemplatePage] Found exact ID match in DB:`, exactMatch);
                    setResolvedItem(exactMatch);
                    setLoading(false);
                    return;
                }

                // 2. Exact match not found -> Auto-provisioning scenario!
                console.log(`[ProjectTemplatePage] Exact ID match not found. Attempting to auto-provision: ${pageId}`);
                
                // Determine page type from the ID string
                let resolvedPageType = 'skincare'; // default fallback
                const lowerId = pageId.toLowerCase();
                
                if (lowerId.includes('curation')) {
                    resolvedPageType = 'curation';
                } else if (lowerId.includes('brand')) {
                    resolvedPageType = 'brand';
                } else if (lowerId.includes('magazine')) {
                    resolvedPageType = 'magazine';
                } else if (lowerId.includes('community')) {
                    resolvedPageType = 'community';
                } else if (lowerId.includes('landing') || lowerId.includes('home')) {
                    resolvedPageType = 'project_landing';
                } else if (lowerId.includes('haircare') || lowerId.includes('skincare') || lowerId.includes('hair') || lowerId.includes('skin')) {
                    resolvedPageType = 'skincare';
                }

                // Find a base template to clone from
                const baseTemplate = allProducts.find(p => p.page_type === resolvedPageType && !p.agency_id) || 
                                     allProducts.find(p => p.page_type === resolvedPageType) || 
                                     allProducts.find(p => p.page_type === 'skincare') || 
                                     allProducts[0];

                if (!baseTemplate) {
                    throw new Error(`Could not find a base template of type ${resolvedPageType} to clone.`);
                }

                // Construct a clean display title from the ID
                const cleanTitle = pageId
                    .replace(/^(skincare|curation|brand|magazine|community|landing|home)-/, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase());

                const agencyIdToUse = urlAgencyId || user?.id?.toString() || null;

                const newItem: any = {
                    ...baseTemplate,
                    id: pageId,
                    agency_id: agencyIdToUse,
                    category: urlCategory || baseTemplate.category || '',
                    subcategory: urlSubcategory || baseTemplate.subcategory || '',
                    title: {
                        ko: `${cleanTitle} (${getLocalizedValue(baseTemplate.title, 'ko')})`,
                        en: `${cleanTitle} (${getLocalizedValue(baseTemplate.title, 'en')})`
                    }
                };

                // Delete auto-incrementing/PK fields that shouldn't be duplicated if any
                delete newItem.created_at;
                delete newItem.updated_at;

                console.log(`[ProjectTemplatePage] Auto-provisioning product in DB:`, newItem);
                const created = await createProduct(newItem);
                setResolvedItem(created);
                setLoading(false);
                return;
            }

            // 3. No pageId provided -> We are at the Landing Page (/project-template)
            // Prioritize matching the specific category & subcategory combination
            let landingItem = allProducts.find(p => p.page_type === 'project_landing' && 
                                                   p.category === urlCategory && 
                                                   p.subcategory === urlSubcategory && 
                                                   (urlAgencyId ? p.agency_id?.toString() === urlAgencyId : !p.agency_id));

            if (!landingItem && urlCategory) {
                // Fallback to category only match
                landingItem = allProducts.find(p => p.page_type === 'project_landing' && 
                                                   p.category === urlCategory && 
                                                   (urlAgencyId ? p.agency_id?.toString() === urlAgencyId : !p.agency_id));
            }

            if (!landingItem) {
                // Proactively create/provision a landing page for this category/subcategory to make the site work beautifully!
                console.log(`[ProjectTemplatePage] Landing page not found for category: ${urlCategory}. Provisioning default landing page.`);
                
                const baseLanding = allProducts.find(p => p.page_type === 'project_landing' && !p.agency_id) || 
                                    allProducts.find(p => p.page_type === 'project_landing') || 
                                    allProducts[0];

                if (baseLanding) {
                    const landingId = `landing-${urlCategory || 'default'}-${Date.now()}`;
                    const agencyIdToUse = urlAgencyId || user?.id?.toString() || null;
                    
                    const newLanding = {
                        ...baseLanding,
                        id: landingId,
                        agency_id: agencyIdToUse,
                        category: urlCategory || '',
                        subcategory: urlSubcategory || '',
                        title: { ko: 'Home', en: 'Home' }
                    };
                    
                    delete (newLanding as any).created_at;
                    delete (newLanding as any).updated_at;

                    const createdLanding = await createProduct(newLanding);
                    setResolvedItem(createdLanding);
                    setLoading(false);
                    return;
                }
            }

            if (landingItem) {
                setResolvedItem(landingItem);
            } else {
                // Ultimate fallback
                const fallback = allProducts.find(p => p.page_type === 'project_landing') || allProducts[0];
                setResolvedItem(fallback || null);
            }
        } catch (err: any) {
            console.error('[ProjectTemplatePage] Resolution error:', err);
            setError(err.message || 'Page resolution failed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        resolvePage();
    }, [pageId, urlCategory, urlSubcategory, urlAgencyId, user?.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FCF9F5] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-dancheong-ink/60" />
                <p className="text-sm font-serif text-dancheong-ink/40 tracking-wider">로딩 중...</p>
            </div>
        );
    }

    if (error || !resolvedItem) {
        return (
            <div className="min-h-screen bg-[#FCF9F5] flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h2 className="text-2xl font-serif text-dancheong-ink font-bold">페이지를 찾을 수 없습니다</h2>
                <p className="text-dancheong-ink/60 max-w-md">{error || '해당 템플릿의 상세 정보 또는 데이터가 존재하지 않습니다.'}</p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-dancheong-ink text-white rounded-full text-sm font-bold uppercase tracking-wider hover:bg-dancheong-ink/80 transition-all duration-300"
                >
                    메인으로 이동
                </button>
            </div>
        );
    }

    // Render corresponding template based on resolved page type
    switch (resolvedItem.page_type) {
        case 'skincare':
            return <ProjectSkincarePage item={resolvedItem} />;
        case 'curation':
            return <ProjectCurationPage item={resolvedItem} />;
        case 'brand':
            return <ProjectBrandPage item={resolvedItem} />;
        case 'magazine':
            return <ProjectMagazinePage item={resolvedItem} />;
        case 'community':
            return <ProjectCommunityPage item={resolvedItem} />;
        case 'project_landing':
        default:
            return <ProjectLandingPage item={resolvedItem} />;
    }
};

export default ProjectTemplatePage;
