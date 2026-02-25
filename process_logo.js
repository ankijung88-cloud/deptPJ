import { Jimp } from 'jimp';

async function processImage() {
  const input = '/Users/hwany/.gemini/antigravity/brain/cfc32550-8b88-4f96-8689-c43230629d84/department_dept_3d_1771581124606.png';
  const output = '/Users/hwany/Desktop/department/public/department_circle_logo.png';

  try {
    const image = await Jimp.read(input);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    const visited = new Uint8Array(width * height);
    const queue = [{x: 0, y: 0}];
    visited[0] = 1;
    
    // 배경 판별: 채도가 낮은 색상(흰색, 검은색, 회색계열)은 배경으로 간주
    // 황금색/골드색상은 R과 G가 높고 B가 상대적으로 낮아 채도가 큼
    function isBackground(x, y) {
        const idx = (width * y + x) << 2;
        const r = image.bitmap.data[idx];
        const g = image.bitmap.data[idx+1];
        const b = image.bitmap.data[idx+2];
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        
        // 채도가 15% 미만이면 무채색(배경)으로 판별
        return saturation < 0.15 || (max < 30); // 아주 어두운 색도 포함
    }
    
    let head = 0;
    while(head < queue.length) {
        const p = queue[head++];
        const idx = (width * p.y + p.x) << 2;
        image.bitmap.data[idx+3] = 0; // 투명하게 만듦
        
        const neighbors = [
            {x: p.x+1, y: p.y}, {x: p.x-1, y: p.y},
            {x: p.x, y: p.y+1}, {x: p.x, y: p.y-1}
        ];
        
        for (const n of neighbors) {
            if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                const vIdx = width * n.y + n.x;
                if (!visited[vIdx] && isBackground(n.x, n.y)) {
                    visited[vIdx] = 1;
                    queue.push(n);
                }
            }
        }
    }

    image.autocrop({ cropOnlyFrames: false, tolerance: 0.1, leaveBorder: 0 });
    await image.write(output);
    console.log('Successfully created tight-cropped transparent logo using flood fill.');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
