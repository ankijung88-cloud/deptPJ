import express from 'express';
import { GoogleGenAI } from '@google/genai';
import lunarPkg from 'lunar-javascript';

const { Solar, Lunar } = lunarPkg;
const router = express.Router();

let ai;
try {
  // We recommend using API key from environment variables
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  console.warn("Google GenAI initialization warning: GEMINI_API_KEY might be missing.", e.message);
}

router.post('/', async (req, res) => {
    try {
        if (!ai) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is missing or invalid on the server.' });
        }

        const { name, birthYear, birthMonth, birthDay, birthTime, lunarSolar, gender } = req.body;

        if (!name || !birthYear || !birthMonth || !birthDay || !gender) {
            return res.status(400).json({ error: 'Missing requried Saju information.' });
        }

        // Parse hour
        let hour = 12; // default if '모름'
        if (birthTime && birthTime !== '모름') {
            if (birthTime.includes('자시')) hour = 0;
            else if (birthTime.includes('축시')) hour = 2;
            else if (birthTime.includes('인시')) hour = 4;
            else if (birthTime.includes('묘시')) hour = 6;
            else if (birthTime.includes('진시')) hour = 8;
            else if (birthTime.includes('사시')) hour = 10;
            else if (birthTime.includes('오시')) hour = 12;
            else if (birthTime.includes('미시')) hour = 14;
            else if (birthTime.includes('신시')) hour = 16;
            else if (birthTime.includes('유시')) hour = 18;
            else if (birthTime.includes('술시')) hour = 20;
            else if (birthTime.includes('해시')) hour = 22;
        }

        // Convert to exactly Year, Month, Day, Hour
        const y = parseInt(birthYear);
        const m = parseInt(birthMonth);
        const d = parseInt(birthDay);
        
        let lunarObj;
        if (lunarSolar === 'lunar') {
            lunarObj = Lunar.fromYmdHms(y, m, d, hour, 0, 0);
        } else {
            const solarObj = Solar.fromYmdHms(y, m, d, hour, 0, 0);
            lunarObj = solarObj.getLunar();
        }

        const bazi = lunarObj.getEightChar();
        const yearPillar = bazi.getYear();
        const monthPillar = bazi.getMonth();
        const dayPillar = bazi.getDay();
        const timePillar = birthTime === '모름' ? '알수없음' : bazi.getTime();

        const prompt = `
당신은 대한민국 최고의 명리학자이자 친절한 사주 상담가입니다. 다음 사용자의 정확한 사주팔자(만세력) 정보와 사용자 정보를 바탕으로 전문적이지만 이해하기 쉽게 사주를 풀이해주세요.
사주는 단순히 결정된 미래가 아니라 인생의 나침반이라는 따뜻한 조언과 함께 작성해야 합니다.

[작성 시점 (현재)]
- 기준 일자: ${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월

[내담자 정보]
- 이름: ${name}
- 성별: ${gender === 'M' ? '남성' : '여성'}
- 생년월일: ${birthYear}년 ${birthMonth}월 ${birthDay}일 (${lunarSolar === 'lunar' ? '음력' : '양력'})
- 태어난 시간: ${birthTime || '모름'}

[실제 프로그램이 계산한 만세력(사주팔자) 정보 - 100% 정확한 데이터입니다]
- 년주(Year): ${yearPillar}
- 월주(Month): ${monthPillar}
- 일주(Day): ${dayPillar}
- 시주(Time): ${timePillar}
* AI는 천간지지를 스스로 다시 계산하지 마시고, 위에서 제공된 100% 정확한 사주팔자 정보를 그대로 활용하여 오행과 신살을 분석해 주세요. 특히 사주팔자 8자의 한자를 풀이 시작 부분에 반드시 명시하여 사용자에게 신뢰를 주어야 합니다. 시주가 '알수없음'이면 3주 6자로만 풀이합니다.

[응답 가이드라인 (다음 구조를 반드시 지켜주세요)]
1. 💡 명식 분석 (제공한 사주팔자 한자와 오행 구성 등을 간략하고 명확하게 설명)
2. ✨ 사주 총평 (전체적인 운의 흐름과 타고난 기운)
3. 📅 세운 및 월운 (현재 연도의 한 해 운세 흐름과, 이번 달부터 다가오는 몇 달간의 주요 흐름)
4. 💰 재물운 (재물의 흐름, 유리한 투자 방향, 자산 관리 조언)
5. 💼 직업/학업운 (적성에 맞는 분야, 성취를 얻기 좋은 시기)
6. ❤️ 애정/대인관계운 (사람들과의 관계, 연애나 결혼에 대한 조언)
7. 🍀 행운을 불러오는 꿀팁 (행운의 색상, 숫자, 방향 등 가벼운 팁)

마크다운 형식(Markdown)으로 깔끔하게 정리하되, 각 항목에 알맞은 적절한 이모지를 사용하여 부드럽고 가독성 좋게 작성해주세요. 너무 딱딱하거나 어렵고 무서운 용어(예: 백호대살, 원진살 등)를 사용할 경우, 긍정적으로 승화할 수 있는 방향으로 부연 설명을 꼭 해주세요.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({
            success: true,
            data: response.text
        });
    } catch (error) {
        console.error('Saju API error:', error);
        res.status(500).json({ error: '운세를 풀이하는 도중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
});

export default router;
