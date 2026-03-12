import * as THREE from 'three';

export const getFallbackTexture = (color: string = '#ffffff'): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.arc(64, 64, 60, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
};
