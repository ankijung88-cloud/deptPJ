import { useRef, useEffect } from "react";

export interface MousePosition {
    x: number;
    y: number;
}

/**
 * Tracks the mouse position and returns normalized coordinates (-1 to 1) relative to the screen center.
 * Uses a ref to avoid React re-renders on every mouse move, ideal for high-performance Canvas animations.
 */
export function useMousePosition() {
    const mousePos = useRef<MousePosition>({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize to -1 ~ 1 with center at (0,0)
            mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return mousePos;
}
