import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const MAJOR_ARCANA = [
    "0. The Fool", "I. The Magician", "II. The High Priestess", "III. The Empress", "IV. The Emperor",
    "V. The Hierophant", "VI. The Lovers", "VII. The Chariot", "VIII. Strength", "IX. The Hermit",
    "X. Wheel of Fortune", "XI. Justice", "XII. The Hanged Man", "XIII. Death", "XIV. Temperance",
    "XV. The Devil", "XVI. The Tower", "XVII. The Star", "XVIII. The Moon", "XIX. The Sun",
    "XX. Judgement", "XX1. The World"
];

interface TarotDeck3DProps {
    tarotBackUrl?: string | null;
    isHost: boolean;
    flippedCards: number[];
    onCardFlip: (index: number) => void;
    consultationMode: 'basic' | 'premium';
}

export const TarotDeck3D: React.FC<TarotDeck3DProps> = ({ 
    tarotBackUrl, 
    flippedCards, 
    onCardFlip,
    consultationMode
}) => {
    // Generate 22 cards
    const cards = useMemo(() => {
        const totalCards = 22;
        const radius = 0.5; // Radius of the arc spread
        const cardsArr = [];
        
        for (let i = 0; i < totalCards; i++) {
            // Arc logic (spread horizontally)
            const angle = (Math.PI / 3) * (i / (totalCards - 1)) - (Math.PI / 6); 
            // -30 degrees to +30 degrees arc
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * (radius * 0.2); // flatten the curve a bit
            
            // Adjust position slightly to avoid clipping and give a layered look
            const yOffset = i * 0.001; 
            
            cardsArr.push({
                index: i,
                position: [x, 0.01 + yOffset, z - 0.2] as [number, number, number],
                rotation: [-Math.PI / 2, 0, angle] as [number, number, number], // lay flat but rotated along arc
                name: MAJOR_ARCANA[i]
            });
        }
        // Actually, if we shuffle them, we want them ordered differently visually? 
        // For now, linear spread is good.
        return cardsArr;
    }, []);

    const backTexture = tarotBackUrl ? useTexture(tarotBackUrl) : null;

    return (
        <group position={[0, 0.35, 0]}>
            {/* 0.35 is slightly above the TraditionalTable top (0.25 + 0.08) */}
            {cards.map((card) => {
                const isFlipped = flippedCards.includes(card.index);
                
                return (
                    <TarotCard 
                        key={card.index}
                        card={card}
                        isFlipped={isFlipped}
                        backTexture={backTexture}
                        onClick={() => {
                            // Anyone can flip in basic mode, only Host or allowed rules in Premium
                            if (consultationMode === 'basic') {
                                // Basic mode logic limits handled by parent 
                                onCardFlip(card.index);
                            } else {
                                // In premium mode, both can flip, but maybe host has full control?
                                onCardFlip(card.index);
                            }
                        }}
                    />
                );
            })}
        </group>
    );
};

interface TarotCardProps {
    card: { index: number, position: [number, number, number], rotation: [number, number, number], name: string };
    isFlipped: boolean;
    backTexture: THREE.Texture | null | THREE.Texture[];
    onClick: () => void;
}

const TarotCard: React.FC<TarotCardProps> = ({ card, isFlipped, backTexture, onClick }) => {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    
    // Animate flip status using useFrame for smooth transition
    // Initial state setup to match isFlipped
    
    useFrame((_state, delta) => {
        if (meshRef.current) {
            // Lerp Rotation X for flip
            meshRef.current.rotation.x = THREE.MathUtils.lerp(
                meshRef.current.rotation.x, 
                isFlipped ? 0 : card.rotation[0], // If flipped, it should face camera mostly. 
                // Wait, if it sits on the table, it should just rotate on Z or X to flip over.
                // standard rotation is [-Math.PI/2, 0, angle]. Flat on back.
                // Flipped would be [Math.PI/2, 0, angle]? No, flip over X axis: [Math.PI/2, Math.PI, angle] or just rotate Z?
                // Let's rotate around X by Math.PI.
                // Flipped rotation: [Math.PI/2, 0, -angle] effectively. Let's use simple lerp.
                0.1
            );
            
            // Just handling the flip logic simply
            const currentRotX = meshRef.current.rotation.x;
            const targetRotX = isFlipped ? -Math.PI / 2 : Math.PI / 2;
            meshRef.current.rotation.x = THREE.MathUtils.lerp(currentRotX, targetRotX, delta * 15);
            
            // Y position for hover/flip emphasis
            const currentY = meshRef.current.position.y;
            const targetY = isFlipped ? card.position[1] + 0.05 : (hovered ? card.position[1] + 0.02 : card.position[1]);
            meshRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY, delta * 10);
            
            // X, Z position slightly forward if flipped
            const targetZ = isFlipped ? card.position[2] + 0.3 : card.position[2];
            meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * 5);
        }
    });

    return (
        <group 
            ref={meshRef}
            position={card.position} 
            rotation={[Math.PI / 2, 0, card.rotation[2]]} // Note default orientation setup
            onClick={(e) => {
                e.stopPropagation();
                if (!isFlipped) onClick();
            }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        >
            {/* Card Body */}
            <mesh castShadow receiveShadow>
                {/* Standard Tarot Card aspect ratio is roughly 2.75" x 4.75" -> 1 : 1.7 */}
                <boxGeometry args={[0.08, 0.14, 0.002]} />
                {/* Back side material (face down pointing up usually, wait) */}
                <meshStandardMaterial attach="material-0" color="#222" />
                <meshStandardMaterial attach="material-1" color="#222" />
                <meshStandardMaterial attach="material-2" color="#222" />
                <meshStandardMaterial attach="material-3" color="#222" />
                {/* Front face (+Z normally in BoxGeometry, but we rotate) */}
                <meshStandardMaterial attach="material-4" color="#fff" />
                {/* Back face (-Z) */}
                <meshStandardMaterial attach="material-5" color={backTexture ? "#fff" : "#1a103c"} map={Array.isArray(backTexture) ? backTexture[0] : backTexture} />
            </mesh>
            
            {/* Front Face Text placeholder when flipped */}
            <Text
                position={[0, 0, 0.0015]}
                fontSize={0.012}
                color="#000"
                maxWidth={0.07}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
                rotation={[0, 0, 0]}
            >
                {card.name}
            </Text>
            
            {/* Decorative Gold Border for back face */}
            <mesh position={[0, 0, -0.0015]}>
                <planeGeometry args={[0.075, 0.135]} />
                <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} wireframe />
            </mesh>
        </group>
    );
};
