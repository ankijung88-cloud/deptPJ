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
        const res = await fetch('http://43.200.230.44:3000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log(res.status, text);
    } catch(e) {
        console.error(e);
    }
}
run();
