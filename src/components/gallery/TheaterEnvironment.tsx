import React from 'react';

interface TheaterEnvironmentProps {
    accentColor: string;
    isMobile: boolean;
}

const TheaterEnvironment: React.FC<TheaterEnvironmentProps> = ({ accentColor }) => {
    // Deep cinematic colors
    const wallColor = "#020202";
    const floorColor = "#010101";

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, -20]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color={floorColor} roughness={1} />
            </mesh>

            {/* Side Walls */}
            <mesh position={[-40, 0, -20]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[200, 100]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>
            <mesh position={[40, 0, -20]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[200, 100]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>

            {/* Ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 40, -20]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>

            {/* Front Wall (around screen) - Creating a bezel feel */}
            <mesh position={[0, 0, -35]}>
                <planeGeometry args={[300, 200]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>

            {/* Lighting - Subdued ambient to make screen pop */}
            <ambientLight intensity={0.05} />
            <pointLight position={[0, 20, -10]} intensity={0.5} color={accentColor} distance={100} />
            
            {/* Subtle corner glows to define space */}
            <spotLight
                position={[-35, 30, -30]}
                angle={0.4}
                penumbra={1}
                intensity={2}
                color={accentColor}
                target-position={[-40, 0, -35]}
            />
            <spotLight
                position={[35, 30, -30]}
                angle={0.4}
                penumbra={1}
                intensity={2}
                color={accentColor}
                target-position={[40, 0, -35]}
            />
        </group>
    );
};

export default TheaterEnvironment;
