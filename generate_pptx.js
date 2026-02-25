import pptxgen from 'pptxgenjs';

async function createPresentation() {
    let pres = new pptxgen();

    // Title Slide
    let slide1 = pres.addSlide();
    slide1.addText('Culture Department Store', { x: 1, y: 1.5, w: 8, h: 1, fontSize: 44, bold: true, color: '363636', align: 'center' });
    slide1.addText('프로젝트 기획서 (Project Proposal)', { x: 1, y: 2.5, w: 8, h: 1, fontSize: 24, color: '666666', align: 'center' });
    slide1.addText('개발 스펙 및 아키텍처 분석 기반', { x: 1, y: 3.2, w: 8, h: 1, fontSize: 18, color: '999999', align: 'center' });

    // Slide 2: 개요
    let slide2 = pres.addSlide();
    slide2.addText('1. 프로젝트 개요', { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '363636' });
    slide2.addText([
        { text: '프로젝트 목적:\n', options: { bold: true } },
        { text: '다국어 문화를 지원하는 온라인 백화점(쇼핑몰) 플랫폼 구축.\n사용자는 다양한 카테고리의 상품을 탐색, 예약/결제할 수 있으며, 관리자는 상품과 예약을 관리.\n\n' },
        { text: '주요 타겟층:\n', options: { bold: true } },
        { text: '문화 및 라이프스타일 상품/서비스에 관심 있는 글로벌 일반 소비자.\n\n' },
        { text: '핵심 가치:\n', options: { bold: true } },
        { text: '직관적인 큐레이션, 실시간 자동 번역을 통한 다국어 지원, 편리한 관리자 대시보드 제공.' }
    ], { x: 0.5, y: 1.2, w: 9, h: 4, fontSize: 16, color: '363636', valign: 'top' });

    // Slide 3: 기술 스택
    let slide3 = pres.addSlide();
    slide3.addText('2. 시스템 아키텍처 및 기술 스택', { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '363636' });
    slide3.addText([
        { text: 'Frontend:\n', options: { bold: true, color: '0078D4' } },
        { text: ' - React 18, Vite\n - TypeScript, Tailwind CSS, Framer Motion\n - 상태 관리 & 라우팅: React Router v6\n - 다국어: i18next\n\n' },
        { text: 'Backend:\n', options: { bold: true, color: '0078D4' } },
        { text: ' - Node.js, Express.js\n - 데이터베이스: MySQL (mysql2)\n - 인증: JWT, bcryptjs\n - 파일 업로드: Multer\n - AI/번역: @google/generative-ai 지원 (번역 서비스)\n' }
    ], { x: 0.5, y: 1.2, w: 9, h: 4, fontSize: 16, color: '363636', valign: 'top' });

    // Slide 4: 주요 기능 명세
    let slide4 = pres.addSlide();
    slide4.addText('3. 주요 기능 명세 (Front-end & Back-end)', { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '363636' });
    slide4.addText([
        { text: '메인 스토어 기능:\n', options: { bold: true } },
        { text: ' - 메인 큐레이션 (Featured), 상품 카테고리 (All Products), 상세 페이지\n - 글로벌 사용자를 위한 자동 번역 (AutoTranslatedText 컴포넌트)\n\n' },
        { text: '사용자 및 쇼핑 기능:\n', options: { bold: true } },
        { text: ' - 회원가입, 로그인, 마이페이지\n - 장바구니 저장 및 예약/결제 (Bookings)\n\n' },
        { text: '관리자 (Admin) 대시보드:\n', options: { bold: true } },
        { text: ' - 상품 등록/수정/삭제 관리 (이미지 업로드 포함)\n - 예약(Booking) 및 유저 리스트 관리' }
    ], { x: 0.5, y: 1.2, w: 9, h: 4, fontSize: 16, color: '363636', valign: 'top' });

    // Slide 5: 데이터베이스 구조
    let slide5 = pres.addSlide();
    slide5.addText('4. 주요 데이터베이스 스키마', { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '363636' });
    slide5.addText([
        { text: 'Users (사용자):\n', options: { bold: true } },
        { text: ' - 이메일, 비밀번호, 권한 (일반 유저 vs 관리자) 등\n\n' },
        { text: 'Products (상품):\n', options: { bold: true } },
        { text: ' - 상품명, 카테고리, 설명, 가격, 이미지 URL, 등록일\n\n' },
        { text: 'Bookings (예약/결제):\n', options: { bold: true } },
        { text: ' - 예약 ID, 상품 ID (FK), 사용자 이메일, 결제 방법\n - 총 가격, 예약 상태 (Pending 등), 정산 상태 (수수료, 정산금액, 정산일자)' }
    ], { x: 0.5, y: 1.2, w: 9, h: 4, fontSize: 16, color: '363636', valign: 'top' });

    // Slide 6: 프론트엔드 라우팅 및 폴더 구조
    let slide6 = pres.addSlide();
    slide6.addText('5. 프론트엔드 라우팅 구조 (App.tsx)', { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '363636' });
    slide6.addText([
        { text: 'Public Routes:\n', options: { bold: true } },
        { text: ' - /, /detail/:id, /floor/:id, /floor-guide, /about, /:category, /all-products, /cart\n\n' },
        { text: 'Protected Routes (User):\n', options: { bold: true } },
        { text: ' - /mypage, /products/new, /products/:id/edit\n\n' },
        { text: 'Admin Routes (Admin Only):\n', options: { bold: true } },
        { text: ' - /admin/login, /admin/products, /admin/users, /admin/bookings\n' }
    ], { x: 0.5, y: 1.2, w: 9, h: 4, fontSize: 16, color: '363636', valign: 'top' });

    // Slide 7: 마무리
    let slide7 = pres.addSlide();
    slide7.addText('Thank You', { x: 1, y: 2, w: 8, h: 1, fontSize: 48, bold: true, color: '363636', align: 'center' });
    slide7.addText('성공적인 프로젝트 런칭을 기원합니다.', { x: 1, y: 3.5, w: 8, h: 1, fontSize: 20, color: '666666', align: 'center' });

    // Save the Presentation
    const outputFile = '/Users/hwany/Desktop/department/Project_Proposal.pptx';
    pres.writeFile({ fileName: outputFile }).then(fileName => {
        console.log(`Presentation created successfully: ${fileName}`);
    }).catch(err => {
        console.error('Error creating presentation:', err);
    });
}

createPresentation();
