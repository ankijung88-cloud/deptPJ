import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getFeaturedProducts, createProduct } from '../api/products';
import { FeaturedItem } from '../types';
import { Loader2 } from 'lucide-react';
import ProjectLandingPage from '../templates/ProjectLandingPage';
import { ProjectSkincarePage } from '../templates/ProjectSkincarePage';
import { ProjectCurationPage } from '../templates/ProjectCurationPage';
import { ProjectBrandPage } from '../templates/ProjectBrandPage';
import { ProjectMagazinePage } from '../templates/ProjectMagazinePage';
import { ProjectCommunityPage } from '../templates/ProjectCommunityPage';
import { useAdmin } from '../hooks/useAdmin';



const ProjectTemplatePage: React.FC = () => {
    const { pageId } = useParams<{ pageId?: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAdmin();

    const [resolvedItem, setResolvedItem] = useState<FeaturedItem | null>(null);
    const [activePageType, setActivePageType] = useState<string>('');
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

            // 1. If pageId is provided, resolve project-scoped page or fallback to the parent project landing page
            if (pageId) {
                // Determine page type from the ID string
                let resolvedPageType = '';
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

                // 2. We no longer auto-provision child pages as separate database records.
                // Instead, ALL child pages of a project template (Brand, Curation, etc.) 
                // use the PARENT landing page's database record to store their content via metadata.
                const isExplicitNull = urlAgencyId === 'null';
                const searchAgencyId = isExplicitNull ? null : (urlAgencyId || user?.id?.toString() || null);

                let parentLandingPage = null;
                if (urlCategory && urlSubcategory) {
                    parentLandingPage = allProducts.find(p => 
                        p.page_type === 'project_landing' && 
                        p.category === urlCategory && 
                        p.subcategory === urlSubcategory &&
                        (searchAgencyId ? p.agency_id?.toString() === searchAgencyId : !p.agency_id)
                    );
                }
                
                if (!parentLandingPage) {
                    parentLandingPage = allProducts.find(p => 
                        p.page_type === 'project_landing' && 
                        p.category === urlCategory && 
                        (searchAgencyId ? p.agency_id?.toString() === searchAgencyId : !p.agency_id)
                    );
                }

                if (parentLandingPage) {
                    console.log(`[ProjectTemplatePage] Serving parent landing page data for child view: ${resolvedPageType}`);
                    setActivePageType(resolvedPageType || 'project_landing');
                    setResolvedItem(parentLandingPage);
                    setLoading(false);
                    return;
                }

                // Try exact ID match if it doesn't match any known page type (direct link to product)
                const exactMatch = allProducts.find(p => p.id === pageId);
                if (exactMatch) {
                    console.log(`[ProjectTemplatePage] Found exact ID match in DB:`, exactMatch);
                    setActivePageType(exactMatch.page_type || 'project_landing');
                    setResolvedItem(exactMatch);
                    setLoading(false);
                    return;
                }
                console.warn(`[ProjectTemplatePage] Could not find parent landing page for category ${urlCategory}. Falling back to default.`);
            }

            // 3. No pageId provided -> We are at the Landing Page (/project-template)
            // Prioritize matching the specific category & subcategory combination
            let landingItem = allProducts.find(p => p.page_type === 'project_landing' && 
                                                   p.category === urlCategory && 
                                                   p.subcategory === urlSubcategory && 
                                                   (urlAgencyId ? p.agency_id?.toString() === urlAgencyId : !p.agency_id));

            if (!landingItem && urlCategory && !urlSubcategory) {
                // Fallback to category only match when no subcategory is specified
                landingItem = allProducts.find(p => p.page_type === 'project_landing' && 
                                                   p.category === urlCategory && 
                                                   (urlAgencyId ? p.agency_id?.toString() === urlAgencyId : !p.agency_id));
            }

            if (landingItem) {
                console.log(`[ProjectTemplatePage] Resolved precise landing page via category match:`, landingItem);
                setActivePageType('project_landing');
                setResolvedItem(landingItem);
                setLoading(false);
                return;
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
                    setActivePageType('project_landing');
                    setResolvedItem(createdLanding);
                    setLoading(false);
                    return;
                }
            }

            // Ultimate fallback
            const fallbackItem = allProducts.find(p => p.page_type === 'project_landing') || allProducts[0];
            if (fallbackItem) {
                console.log(`[ProjectTemplatePage] Resolved absolute fallback:`, fallbackItem);
                setActivePageType(fallbackItem.page_type || 'project_landing');
                setResolvedItem(fallbackItem);
            } else {
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
    const renderPageType = activePageType || resolvedItem.page_type;
    
    switch (renderPageType) {
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
