const fs = require('fs');
let code = fs.readFileSync('c:/dev/DEPT-Pj2-main/src/pages/AboutPage.tsx', 'utf-8');

const sIdx = code.indexOf('{/* 03. Executive Summary */}');
const eIdx = code.indexOf('{/* 06. Core Theme */}');

if (sIdx === -1 || eIdx === -1) {
    console.log("NOT FOUND", sIdx, eIdx);
    process.exit(1);
}

const newSlide = `            {/* 03. Project Overview */}
            <Slide id="03" title="프로젝트 개요 (Project Overview)" icon={Target}>
                <FadeInContent>
                    <div className="flex flex-col gap-10 mt-2 w-full">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div>
                                <h3 className="text-2xl font-bold mb-4 text-white">프로젝트 요약 (Executive Summary)</h3>
                                <p className="text-white/80 font-light text-lg leading-relaxed break-keep bg-white/5 p-8 rounded-3xl border border-white/5 h-full">
                                    K-컬처의 예술적 가치와 다양한 브랜드를 한 공간에 담아낸 <b className="text-white">웹 기반 가상 백화점</b>입니다.<br /><br />
                                    사용자는 브라우저 상에서 직접 3D 전시 공간을 탐험하며, 평면적인 e-commerce의 한계를 넘는 혁신적인 인터랙티브 소비 경험을 만나게 됩니다.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-4 text-dancheong-gold">기획 의도 (Planning Intention)</h3>
                                <p className="text-white/80 font-light text-lg leading-relaxed break-keep bg-gradient-to-r from-white/[0.05] to-transparent border-l-4 border-dancheong-gold p-8 rounded-r-3xl h-full flex items-center">
                                    K-팝, K-뷰티, K-푸드 등 흩어진 한국 문화를 <b>'층(Floor)'</b>이라는 공간적 큐레이션으로 통합하여 시각적 몰입감과 정보 탐색의 흥미를 동시에 제공하기 위해 기획되었습니다.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10 pt-8 border-t border-white/10">
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-dancheong-red">시장의 문제점 (Problem)</h3>
                                <ul className="list-none space-y-4 text-white/70 font-light text-base bg-black/40 p-6 rounded-2xl border border-white/5 h-full">
                                    <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-dancheong-red mt-2 shrink-0" />기존 아카이브 사이트들의 <strong>평면적인 정보 나열 방식</strong></li>
                                    <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-dancheong-red mt-2 shrink-0" />오프라인 매장 방문 없이 느낄 수 없는 <strong>브랜드 공간 철학의 부재</strong></li>
                                    <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-dancheong-red mt-2 shrink-0" />글로벌 사용자들을 위한 통합된 <strong>하이엔드 온라인 쇼룸 부족</strong></li>
                                </ul>
                            </div>
                            <div>
                                 <h3 className="text-xl font-bold mb-4 text-dancheong-gold">선정 배경 (Background)</h3>
                                <ul className="list-none space-y-4 text-white/70 font-light text-base bg-black/40 p-6 rounded-2xl border border-white/5 h-full">
                                    <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-dancheong-gold mt-2 shrink-0" />한국 문화 확산에 따른 <strong>프리미엄 메타-컬처 플랫폼</strong> 수요 증가</li>
                                    <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-dancheong-gold mt-2 shrink-0" />비대면 시대 이후, <strong>공간 메타포(Spatial Metaphor)</strong>를 활용한 3D 웹 트렌드 부상</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </FadeInContent>
            </Slide>

`;

let nCode = code.substring(0, code.indexOf("            {/* 03. Executive Summary */}")) + newSlide + code.substring(eIdx);

for (let i = 6; i <= 22; i++) {
    const obId = i.toString().padStart(2, '0');
    const nbId = (i - 2).toString().padStart(2, '0');
    nCode = nCode.replace(new RegExp(`\\{\\/\\* ${obId}\\.`, 'g'), `{/* ${nbId}.`);
    nCode = nCode.replace(new RegExp(`id="${obId}"`, 'g'), `id="${nbId}"`);
}

fs.writeFileSync('c:/dev/DEPT-Pj2-main/src/pages/AboutPage.tsx', nCode);
console.log("SUCCESSFULLY MERGED SLIDES");
