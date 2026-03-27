import React from 'react';
import { Image as DreiImage } from '@react-three/drei';

interface TheaterEnvironmentProps {
    accentColor: string;
    isMobile: boolean;
}

const TheaterEnvironment: React.FC<TheaterEnvironmentProps> = ({ accentColor, isMobile }) => {
    // Theater colors
    const seatColor = "#0a0a0a";
    const wallColor = "#040404";
    const ceilingColor = "#020202";

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -20]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={seatColor} roughness={0.9} />
            </mesh>

            {/* Side Walls */}
            <mesh position={[-25, 5, -20]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[100, 40]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>
            <mesh position={[25, 5, -20]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[100, 40]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>

            {/* Ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 18, -20]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={ceilingColor} />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 5, 30]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[100, 40]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>

            {/* Front Wall (behind screen) */}
            <mesh position={[0, 5, -35]}>
                <planeGeometry args={[100, 40]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>

            {/* Seats - Simple boxes in tiers */}
            {!isMobile && Array.from({ length: 6 }).map((_, rowIndex) => (
                <group key={rowIndex} position={[0, -4.5 + rowIndex * 0.8, 28 - rowIndex * 7]}>
                    {Array.from({ length: 14 }).map((_, seatIndex) => (
                        <mesh key={seatIndex} position={[(seatIndex - 6.5) * 3.5, 0, 0]}>
                            <boxGeometry args={[3, 2, 2.5]} />
                            <meshStandardMaterial color={seatColor} metalness={0.05} roughness={0.9} />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* Audience Silhouette Sprite */}
            {/* Placed in front of the camera to simulate the view from the back */}
            <group position={[0, isMobile ? -3 : -1.5, isMobile ? 2 : 12]}>
               <DreiImage 
                    url="/assets/images/theater/audience.png" 
                    scale={isMobile ? [18, 9] : [40, 20]} 
                    transparent 
                    opacity={0.8} 
                    toneMapped={false}
                />
            </group>

            {/* Ambient and Decorative Lighting */}
            <ambientLight intensity={0.15} />
            <pointLight position={[0, 15, -10]} intensity={2} color={accentColor} distance={60} />
            
            {/* Side Glows */}
            <rectAreaLight
                width={2}
                height={20}
                intensity={5}
                color={accentColor}
                position={[-24.5, 5, -15]}
                rotation={[0, Math.PI / 2, 0]}
            />
            <rectAreaLight
                width={2}
                height={20}
                intensity={5}
                color={accentColor}
                position={[24.5, 5, -15]}
                rotation={[0, -Math.PI / 2, 0]}
            />
        </group>
    );
};

export default TheaterEnvironment;
