import axios from 'axios';
const API_URL = 'http://43.200.230.44:3000/api';

async function run() {
    try {
        const payload = {
            id: 'brand-floor-2-1-' + Date.now(),
            page_type: 'brand',
            title: {ko: 'Brand', en: 'Brand'},
            agency_id: 1,
            category: 'floor-2',
            metadata: { headerLogoText: 'TEST' }
        };
        const res = await axios.post(`${API_URL}/products`, payload);
        console.log(res.data);
    } catch(e) {
        console.error(e.response?.data || e.message);
    }
}
run();
