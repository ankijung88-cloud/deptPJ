import React from 'react';
import { Instagram, Mail, MessageCircle } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

import { FeaturedItem } from '../../types';

interface PremiumFooterProps {
    item?: FeaturedItem;
}

export const PremiumFooter: React.FC<PremiumFooterProps> = ({ item }) => {
    const metadata = (item?.metadata as any) || {};

    return (
        <footer className="bg-[#F5F0E8] border-t border-[#2D2924]/10 py-24">
            <div className="container mx-auto px-6 md:px-12 lg:px-24">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
                    {/* Logo & Info */}
                    <div className="md:col-span-4 flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-3xl font-serif font-black text-[#2D2924]">여움</span>
                            <div className="w-2 h-2 bg-[#FF7F7F] rounded-full mt-2 shadow-[0_0_8px_rgba(255,127,127,0.4)]" />
                        </div>
                        <p className="text-xs text-[#8B7E66] leading-relaxed mb-10">
                            <AutoTranslatedText text={metadata.footerText || "피부에 여유를 담다\n프리미엄 스킨케어 큐레이션 서비스"} />
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div className="md:col-span-2 space-y-6">
                        <h4 className="text-[10px] font-black tracking-[0.3em] text-[#2D2924] uppercase">
                            <AutoTranslatedText text="고객센터" />
                        </h4>
                        <ul className="space-y-4 text-xs text-[#8B7E66]">
                            <li className="hover:text-[#2D2924] transition-colors cursor-pointer"><AutoTranslatedText text="공지사항" /></li>
                            <li className="hover:text-[#2D2924] transition-colors cursor-pointer"><AutoTranslatedText text="자주 묻는 질문" /></li>
                            <li className="hover:text-[#2D2924] transition-colors cursor-pointer"><AutoTranslatedText text="1:1 문의" /></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="md:col-span-2 space-y-6">
                        <h4 className="text-[10px] font-black tracking-[0.3em] text-[#2D2924] uppercase">
                            <AutoTranslatedText text="이용안내" />
                        </h4>
                        <ul className="space-y-4 text-xs text-[#8B7E66]">
                            <li className="hover:text-[#2D2924] transition-colors cursor-pointer"><AutoTranslatedText text="배송안내" /></li>
                            <li className="hover:text-[#2D2924] transition-colors cursor-pointer"><AutoTranslatedText text="교환/반품 안내" /></li>
                            <li className="hover:text-[#2D2924] transition-colors cursor-pointer"><AutoTranslatedText text="이용약관" /></li>
                            <li className="hover:text-[#2D2924] transition-colors cursor-pointer font-bold text-[#2D2924]"><AutoTranslatedText text="개인정보처리방침" /></li>
                        </ul>
                    </div>

                    {/* Links Column 3 */}
                    <div className="md:col-span-2 space-y-6">
                        <h4 className="text-[10px] font-black tracking-[0.3em] text-[#2D2924] uppercase">
                            <AutoTranslatedText text="회사정보" />
                        </h4>
                        <ul className="space-y-4 text-xs text-[#8B7E66]">
                            <li className="hover:text-[#2D2924] transition-colors cursor-pointer"><AutoTranslatedText text="회사소개" /></li>
                            <li className="hover:text-[#2D2924] transition-colors cursor-pointer"><AutoTranslatedText text="제휴문의" /></li>
                            <li className="hover:text-[#2D2924] transition-colors cursor-pointer"><AutoTranslatedText text="채용안내" /></li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div className="md:col-span-2 flex justify-start md:justify-end gap-6 h-fit">
                        <Instagram size={20} className="text-[#8B7E66] hover:text-[#2D2924] transition-colors cursor-pointer" />
                        <MessageCircle size={20} className="text-[#8B7E66] hover:text-[#2D2924] transition-colors cursor-pointer" />
                        <Mail size={20} className="text-[#8B7E66] hover:text-[#2D2924] transition-colors cursor-pointer" />
                    </div>
                </div>

                <div className="pt-12 border-t border-[#2D2924]/10 flex flex-col md:flex-row justify-between items-center text-[10px] text-[#8B7E66] tracking-widest uppercase">
                    <p>© 2026 YEOUM. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </footer>
    );
};
