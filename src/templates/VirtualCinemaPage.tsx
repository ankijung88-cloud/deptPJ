import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Play, ArrowLeft, Plus, Image as ImageIcon, Edit3, Trash2, Check } from 'lucide-react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

import VirtualGallery from '../components/gallery/VirtualGallery';
import { FeaturedItem } from '../types';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { getProductById, updateProduct } from '../api/products';
import { useFloors } from '../context/FloorContext';
import { useAdmin } from '../hooks/useAdmin';

interface VirtualCinemaPageProps {
    item?: FeaturedItem;
    productId?: string;
    onClose?: () => void;
}

const VirtualCinemaPage: React.FC<VirtualCinemaPageProps> = ({ productId, onClose }) => {
    const { i18n, t } = useTranslation();
    const { id: routeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [isExplorationMode, setIsExplorationMode] = useState(false);
    useImmersiveMode(isExplorationMode);

    const parentId = routeId || location.state?.parentId;

    const theme = {
        bgStyle: { backgroundColor: '#FFFFFF' },
        color1: '#FFFFFF',
        color2: '#FFFFFF',
        color3: '#171717',
        accentColor: '#DC2626', // red-600
        highlightColor: '#171717',
        textPrimary: '#171717',
        glowColor: '#DC2626'
    };

    const { isAdmin: isAdminLoggedIn, role } = useAdmin();
    const isManagementAllowed = isAdminLoggedIn && (role === 'admin' || role === 'manager');

    const [cinemaItems, setCinemaItems] = useState<any[]>([]);
    const [selectedCinemaItem, setSelectedCinemaItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    
    // Metadata Editing
    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDesc, setTempDesc] = useState('');
    const [floorLabel, setFloorLabel] = useState('');

    // Modal & Add/Edit State
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const { floors } = useFloors();

    const getLocalizedString = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val.ko || val.en || Object.values(val)[0] as string || '';
    };

    useEffect(() => {
        const fetchCinemaData = async () => {
            if (!productId) {
                setIsLoading(false);
                return;
            }

            try {
                const product = await getProductById(productId);
                if (product && product.metadata) {
                    const items = typeof product.metadata === 'string' 
                        ? JSON.parse(product.metadata).items || [] 
                        : product.metadata.items || [];
                    setCinemaItems(items);
                    setTempTitle(getLocalizedString(product.title));
                    setTempDesc(getLocalizedString(product.description));
                    
                    if (items.length > 0 && !selectedCinemaItem) {
                        setSelectedCinemaItem(items[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching cinema data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCinemaData();
    }, [productId]);

    useEffect(() => {
        if (floors && parentId) {
            const floor = floors.find(f => f.id === parentId);
            if (floor) {
                setFloorLabel(i18n.language === 'ko' ? floor.floor : `${floor.floor} Floor`);
            }
        }
    }, [floors, parentId, i18n.language]);

    const handleSaveMetadata = async () => {
        if (!productId) return;
        try {
            await updateProduct(productId, {
                title: tempTitle,
                description: tempDesc
            });
            setIsEditingMetadata(false);
        } catch (error) {
            console.error("Error updating metadata:", error);
        }
    };

    const handleAddItem = async () => {
        if (!newTitle || !productId) return;
        setIsUploading(true);

        try {
            const newItem = {
                id: isEditMode ? editingItemId : Date.now().toString(),
                title: newTitle,
                imageUrl: newThumbnailUrl,
                videoUrl: newVideoUrl,
                type: 'video'
            };

            let updatedItems;
            if (isEditMode) {
                updatedItems = cinemaItems.map(item => item.id === editingItemId ? newItem : item);
            } else {
                updatedItems = [...cinemaItems, newItem];
            }

            await updateProduct(productId, {
                metadata: JSON.stringify({ items: updatedItems })
            });

            setCinemaItems(updatedItems);
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving cinema item:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditInitiate = (item: any) => {
        setIsEditMode(true);
        setEditingItemId(item.id);
        setNewTitle(typeof item.title === 'string' ? item.title : item.title.ko);
        setNewThumbnailUrl(item.imageUrl);
        setNewVideoUrl(item.videoUrl);
        setShowAddModal(true);
    };

    const handleDelete = async (itemId: string) => {
        if (!window.confirm(t('common.confirm_delete'))) return;
        if (!productId) return;

        try {
            const updatedItems = cinemaItems.filter(item => item.id !== itemId);
            await updateProduct(productId, {
                metadata: JSON.stringify({ items: updatedItems })
            });
            setCinemaItems(updatedItems);
            if (selectedCinemaItem?.id === itemId) {
                setSelectedCinemaItem(updatedItems[0] || null);
            }
        } catch (error) {
            console.error("Error deleting cinema item:", error);
        }
    };

    const resetForm = () => {
        setNewTitle('');
        setNewThumbnailUrl('');
        setNewVideoUrl('');
        setPreviewUrl(null);
        setIsEditMode(false);
        setEditingItemId(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
                setNewThumbnailUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For now, we'll just use a placeholder or handle as data URL if small
            // In a real app, this would be an S3/Cloudinary upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewVideoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen font-sans bg-white relative overflow-hidden selection:bg-dancheong-mugwort/20">
            {/* Texture Overlay - Subtly enhanced for premium feel */}
            <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.04] mix-blend-overlay" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-white blur-[150px] rounded-full opacity-60" />
                <div className="absolute bottom-[10%] left-[-10%] w-[60%] h-[60%] bg-white blur-[120px] rounded-full opacity-40" />
            </div>

            <header className="relative w-full py-24 px-6 md:px-12 border-b border-dancheong-ink/5 z-[50] bg-white/60 backdrop-blur-2xl">
                <div className="container mx-auto relative z-10">
                    <div className="flex justify-between items-start mb-16">
                        <button 
                            onClick={() => {
                                if (onClose) {
                                    onClose();
                                } else {
                                    navigate(-1);
                                }
                            }}
                            className="flex items-center gap-3 text-dancheong-ink hover:text-red-600 transition-all uppercase text-[10px] font-black tracking-[0.4em] relative z-[60] group"
                        >
                            <div className="w-8 h-8 rounded-full border border-dancheong-ink/10 flex items-center justify-center group-hover:border-red-600 transition-colors">
                                <ArrowLeft size={14} />
                            </div>
                            <AutoTranslatedText text="Back" />
                        </button>
                        {isManagementAllowed && (
                            <div className="flex gap-4 relative z-[70]">
                                <button onClick={() => isEditingMetadata ? handleSaveMetadata() : setIsEditingMetadata(true)} className="flex items-center gap-3 px-8 py-3 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition-all text-[10px] font-black tracking-widest uppercase text-dancheong-ink shadow-sm">
                                    {isEditingMetadata ? <Check size={14} /> : <Edit3 size={14} />}
                                    <AutoTranslatedText text={isEditingMetadata ? "Save Changes" : "Edit Page Info"} />
                                </button>
                                <button onClick={() => { setIsEditMode(false); setShowAddModal(true); }} className="flex items-center gap-3 px-8 py-3 rounded-full bg-red-600 hover:bg-neutral-900 transition-all text-[10px] font-black tracking-widest uppercase text-white shadow-xl shadow-red-600/10">
                                    <Plus size={14} />
                                    <AutoTranslatedText text="Add Video" />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="max-w-5xl">
                        <div className="flex items-center gap-4 mb-8">
                            <Link to="/" className="px-6 py-2 rounded-full text-[10px] font-black tracking-[0.3em] uppercase border border-dancheong-ink/10 bg-red-600 text-white hover:bg-dancheong-ink transition-all">
                                <AutoTranslatedText text="시네마" /> {floorLabel}
                            </Link>
                            <div className="h-[1px] w-16 bg-dancheong-ink/10" />
                        </div>
                        {isEditingMetadata ? (
                            <textarea value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} className="w-full bg-white border border-dancheong-ink/20 rounded-[2.5rem] p-8 text-4xl md:text-6xl font-serif font-black mb-8 text-dancheong-ink focus:outline-none focus:border-[#800020] transition-all shadow-xl resize-none" rows={2} />
                        ) : (
                            <h1 className="text-6xl md:text-9xl font-serif font-black mb-10 leading-[0.85] tracking-tighter text-dancheong-ink uppercase">
                                <AutoTranslatedText text={tempTitle} />
                            </h1>
                        )}
                        {isEditingMetadata ? (
                            <textarea value={tempDesc} onChange={(e) => setTempDesc(e.target.value)} className="w-full bg-white border border-dancheong-ink/20 rounded-[2.5rem] p-8 text-xl font-serif italic text-dancheong-ink/60 focus:outline-none focus:border-[#800020] transition-all shadow-xl resize-none" rows={3} />
                        ) : (
                            <p className="text-2xl md:text-3xl font-serif italic text-dancheong-ink/60 max-w-3xl leading-relaxed border-l-[6px] border-red-600 pl-10">
                                <AutoTranslatedText text={tempDesc} />
                            </p>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 md:px-12 py-40 relative z-10">
                <div className="h-[80vh] rounded-[4rem] overflow-hidden bg-white border border-dancheong-ink/5 shadow-[0_120px_200px_rgba(0,0,0,0.08)] relative">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-12 h-12 border-4 border-dancheong-ink/10 border-t-red-600 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <VirtualGallery items={cinemaItems} stories={[]} theme={theme} lang={i18n.language} onClick={() => setIsExplorationMode(true)} cinemaItem={selectedCinemaItem} playing={isVideoPlaying} setPlaying={setIsVideoPlaying} isTheaterMode={true} />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mt-32">
                    {cinemaItems.map((item) => (
                        <div 
                            key={item.id} 
                            className="relative group rounded-[4.5rem] overflow-hidden border border-dancheong-ink/5 bg-white cursor-pointer transition-all duration-1000 hover:shadow-[0_80px_120px_rgba(0,0,0,0.1)] hover:-translate-y-6" 
                            onClick={() => setSelectedCinemaItem(item)}
                        >
                            <div className="aspect-[4/3] relative overflow-hidden">
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-dancheong-ink/10 group-hover:bg-transparent transition-colors duration-700" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700">
                                    <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center scale-50 group-hover:scale-100 transition-transform duration-700">
                                        <Play size={24} className="text-[#800020] fill-current ml-1" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-14">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-2 h-2 rounded-full bg-[#800020]" />
                                    <span className="text-[10px] font-black tracking-[0.4em] text-dancheong-ink/30 uppercase">Exclusive</span>
                                </div>
                                <h4 className="font-serif font-black text-3xl text-dancheong-ink mb-8 leading-tight group-hover:text-[#800020] transition-colors">
                                    <AutoTranslatedText text={typeof item.title === 'string' ? item.title : (item.title as any).ko} />
                                </h4>
                                <div className="flex justify-between items-center pt-8 border-t border-dancheong-ink/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-dancheong-ink/5 flex items-center justify-center">
                                            <Play size={12} className="text-dancheong-ink/40" />
                                        </div>
                                        <div className="text-[10px] font-black tracking-[0.3em] text-dancheong-ink/40 uppercase">
                                            <AutoTranslatedText text="Play Archive" />
                                        </div>
                                    </div>
                                    {isManagementAllowed && (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleEditInitiate(item); }}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-dancheong-ink hover:text-white rounded-full text-dancheong-ink/20 transition-all"
                                            >
                                                <Edit3 size={14}/>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-[#800020] hover:text-white rounded-full text-dancheong-ink/20 transition-all"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-dancheong-ink/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="bg-white border border-dancheong-ink/10 w-full max-w-lg rounded-[4.5rem] overflow-hidden shadow-[0_100px_150px_rgba(0,0,0,0.3)]"
                        >
                            <div className="p-16">
                                <div className="flex justify-between items-center mb-12">
                                    <h3 className="text-4xl font-serif font-black text-dancheong-ink uppercase tracking-tighter">
                                        <AutoTranslatedText text={isEditMode ? "Edit Video" : "Add New Video"} />
                                    </h3>
                                    <button onClick={() => setShowAddModal(false)} className="w-12 h-12 flex items-center justify-center hover:bg-dancheong-ink/5 rounded-full text-dancheong-ink/20 hover:text-dancheong-ink transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black tracking-[0.4em] text-dancheong-ink/40 uppercase pl-1">
                                            <AutoTranslatedText text="Video Title" />
                                        </label>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full bg-white border border-dancheong-ink/10 rounded-3xl py-6 px-10 text-dancheong-ink text-sm focus:ring-4 focus:ring-red-600/5 focus:border-red-600 outline-none transition-all"
                                            placeholder={t("Enter title")}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-[0.4em] text-dancheong-ink/40 uppercase pl-1">
                                                <AutoTranslatedText text="Thumbnail" />
                                            </label>
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-square rounded-[3rem] bg-white border-2 border-dashed border-dancheong-ink/10 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 hover:bg-white transition-all overflow-hidden relative group"
                                            >
                                                {previewUrl || newThumbnailUrl ? (
                                                    <img src={previewUrl || newThumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-dancheong-ink/5 flex items-center justify-center group-hover:bg-red-600/10 transition-colors">
                                                            <ImageIcon size={24} className="text-dancheong-ink/20 group-hover:text-red-600 transition-colors" />
                                                        </div>
                                                        <span className="text-[9px] font-black text-dancheong-ink/20 uppercase tracking-widest"><AutoTranslatedText text="Upload" /></span>
                                                    </div>
                                                )}
                                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-[0.4em] text-dancheong-ink/40 uppercase pl-1">
                                                <AutoTranslatedText text="Video File" />
                                            </label>
                                            <div 
                                                onClick={() => videoInputRef.current?.click()}
                                                className="aspect-square rounded-[3rem] bg-white border-2 border-dashed border-dancheong-ink/10 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 hover:bg-white transition-all overflow-hidden relative group"
                                            >
                                                {newVideoUrl ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center">
                                                            <Play size={24} className="text-red-600" />
                                                        </div>
                                                        <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Ready</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-dancheong-ink/5 flex items-center justify-center group-hover:bg-[#800020]/10 transition-colors">
                                                            <Plus size={24} className="text-dancheong-ink/20 group-hover:text-[#800020] transition-colors" />
                                                        </div>
                                                        <span className="text-[9px] font-black text-dancheong-ink/20 uppercase tracking-widest"><AutoTranslatedText text="Upload" /></span>
                                                    </div>
                                                )}
                                                <input type="file" ref={videoInputRef} onChange={handleVideoUpload} className="hidden" accept="video/*" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddItem}
                                        disabled={isUploading || !newTitle}
                                        className="w-full py-8 rounded-[2.5rem] bg-[#800020] text-white font-black text-[11px] uppercase tracking-[0.5em] shadow-[0_30px_60px_rgba(128,0,32,0.25)] hover:bg-dancheong-ink active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-4 mt-8"
                                    >
                                        {isUploading ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Check size={18} />
                                        )}
                                        <AutoTranslatedText text={isEditMode ? "Update Video" : "Confirm Registration"} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cinema Footer */}
            <footer className="mt-64 py-40 px-6 border-t border-dancheong-ink/5 bg-white">
                <div className="container mx-auto flex flex-col items-center gap-16">
                    <div className="text-8xl md:text-[12rem] font-serif font-black tracking-tighter text-dancheong-ink/[0.03] uppercase select-none leading-none"><AutoTranslatedText text="MONGTANGSSOK" /></div>
                    <div className="flex flex-wrap justify-center gap-20 text-[10px] font-black tracking-[0.5em] uppercase text-dancheong-ink/30">
                        <a href="#" className="hover:text-[#800020] transition-colors"><AutoTranslatedText text="Archives" /></a>
                        <a href="#" className="hover:text-[#800020] transition-colors"><AutoTranslatedText text="Technical" /></a>
                        <a href="#" className="hover:text-[#800020] transition-colors"><AutoTranslatedText text="Terms" /></a>
                        <a href="#" className="hover:text-[#800020] transition-colors"><AutoTranslatedText text="Privacy" /></a>
                    </div>
                    <div className="w-24 h-[1px] bg-dancheong-ink/5 mt-12" />
                </div>
            </footer>
        </div>
    );
};

export default VirtualCinemaPage;
