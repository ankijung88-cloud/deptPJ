import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { 
  Text, 
  ContactShadows,
  Html,
  Environment
} from "@react-three/drei";
import { AvatarModel } from "./AvatarModel";
import { useAutoTranslate } from "../../hooks/useAutoTranslate";


const DepartmentRoom = ({ dept, onEnter }: { dept: any, onEnter: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const doorPos = useRef(0);
  const leftDoorRef = useRef<any>();
  const rightDoorRef = useRef<any>();
  const { translatedText: deptName } = useAutoTranslate(dept.name);

  useFrame((_state, delta) => {
    const target = isOpen ? 1 : 0;
    doorPos.current = THREE.MathUtils.lerp(doorPos.current, target, delta * 3);
    
    if (leftDoorRef.current) leftDoorRef.current.position.x = -1 - doorPos.current * 1.5;
    if (rightDoorRef.current) rightDoorRef.current.position.x = 1 + doorPos.current * 1.5;
  });

  const handleDoorClick = (e: any) => {
    e.stopPropagation();
    setIsOpen(true);
    if (onEnter) onEnter(dept.id);
  };

  // Auto-close door after entry
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsOpen(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <group position={dept.offset} rotation={dept.rotation || [0, 0, 0]}>
      {/* 4 Walls (Solid/Opaque) - Seamless Side-by-Side (8x16) */}
      {/* Back Wall */}
      <mesh position={[0, 1.5, -8]}>
        <boxGeometry args={[8, 3, 0.05]} />
        <meshStandardMaterial color={dept.color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-4, 1.5, 0]}>
        <boxGeometry args={[0.05, 3, 16]} />
        <meshStandardMaterial color={dept.color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[4, 1.5, 0]}>
        <boxGeometry args={[0.05, 3, 16]} />
        <meshStandardMaterial color={dept.color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Front Wall (Static parts) - Solid */}
      <mesh position={[-3, 1.5, 8]}>
        <boxGeometry args={[2, 3, 0.05]} />
        <meshStandardMaterial color={dept.color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[3, 1.5, 8]}>
        <boxGeometry args={[2, 3, 0.05]} />
        <meshStandardMaterial color={dept.color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 2.5, 8]}>
        <boxGeometry args={[4, 1, 0.05]} />
        <meshStandardMaterial color={dept.color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Sliding Doors - High Opacity Glass to differentiate from walls */}
      <group onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')}>
        {/* Left Door */}
        <mesh ref={leftDoorRef} position={[-1, 1, 8]} onDoubleClick={handleDoorClick}>
          <boxGeometry args={[2, 2, 0.08]} />
          <meshStandardMaterial color={dept.color} opacity={0.8} transparent metalness={1} roughness={0.1} />
        </mesh>
        {/* Right Door */}
        <mesh ref={rightDoorRef} position={[1, 1, 8]} onDoubleClick={handleDoorClick}>
          <boxGeometry args={[2, 2, 0.08]} />
          <meshStandardMaterial color={dept.color} opacity={0.8} transparent metalness={1} roughness={0.1} />
        </mesh>
      </group>

      {/* Rim Lighting - Re-aligned for 8x16 footprint */}
      {[[-4, 3, 0], [4, 3, 0], [0, 3, -8], [0, 3, 8]].map((p, i) => (
        <mesh key={i} position={p as any}>
          <boxGeometry args={[i < 2 ? 0.1 : 8, 0.1, i < 2 ? 16 : 0.1]} />
          <meshStandardMaterial emissive={dept.color} emissiveIntensity={2} color={dept.color} />
        </mesh>
      ))}

      {/* Dept Label */}
      <Text
        position={[0, 3.2, 8.05]}
        fontSize={0.4}
        color={dept.color}
        fontWeight="bold"
        anchorX="center"
      >
        {deptName.toUpperCase()}
      </Text>
    </group>
  );
};


const DeskGroup = ({ position, rotation = [0, 0, 0], color, participant, assignedUser, isManager, onSit, onRemove, onAssign, isAdmin, isAgency }: any) => {
  const isManagement = isAdmin || isAgency;
  const { translatedText: directorLabel } = useAutoTranslate("DIRECTOR");
  const { translatedText: idLabel } = useAutoTranslate("ID");
  const { translatedText: assignLabel } = useAutoTranslate("ASSIGN");

  return (
    <group position={position} rotation={rotation}>
      {/* Chair */}
      <group position={[0, 0, 0.8]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0.7, 0.2]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.05]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      </group>

      {/* Desk */}
      <group onClick={(e) => { e.stopPropagation(); if (!participant) onSit(); }}>
        {/* Table Top */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.05, 1]} />
          <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
        </mesh>
        
        {/* Legs */}
        {[[-0.7, 0.35, 0.45], [0.7, 0.35, 0.45], [-0.7, 0.35, -0.45], [0.7, 0.35, -0.45]].map((p, i) => (
          <mesh key={i} position={p as any}>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
            <meshStandardMaterial color="#444" />
          </mesh>
        ))}

        {/* Monitor */}
        <group position={[0, 1.1, -0.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.55, 0.02]} />
            <meshStandardMaterial color={participant ? "#000" : "#111"} metalness={1} roughness={0.1} />
          </mesh>
          {participant && (
             <mesh position={[0, 0, 0.011]}>
               <planeGeometry args={[0.85, 0.5]} />
               <meshBasicMaterial color={color} opacity={0.15} transparent />
             </mesh>
          )}
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.15, 0.15, 0.02]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>

        {/* Partition */}
        <mesh position={[0, 1.1, -0.49]}>
          <boxGeometry args={[1.5, 0.7, 0.02]} />
          <meshStandardMaterial color={color} opacity={0.1} transparent />
        </mesh>
      </group>

      {/* Occupancy Indicator */}
      {!participant && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color={color} opacity={0.2} transparent />
        </mesh>
      )}

      {/* Light for occupied seat */}
      {participant && (
        <pointLight position={[0, 1.5, -0.3]} intensity={1} color={color} distance={3} />
      )}

      {/* 3D Name Plate (Assignment) */}
      {assignedUser && (
        <group position={[0, 0.78, 0.4]}>
          <mesh>
            <boxGeometry args={[0.5, 0.02, 0.15]} />
            <meshStandardMaterial 
              color={isManager ? "#FFD700" : color} 
              opacity={0.8} 
              transparent 
              metalness={0.9} 
              roughness={0.1} 
            />
          </mesh>
          <Text
            position={[0, 0.02, 0]}
            fontSize={0.06}
            color={isManager ? "black" : "white"}
            rotation={[-Math.PI / 2.5, 0, 0]}
            fontWeight="bold"
          >
            {assignedUser.name.toUpperCase()}
          </Text>
        </group>
      )}

      {/* Manager / Director Badge */}
      {isManager && (
        <group position={[0, 2.2, -0.3]}>
          <Text
            fontSize={0.2}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
            fontWeight="black"
          >
            {directorLabel}
          </Text>
          <mesh position={[0, -0.1, -0.01]}>
            <planeGeometry args={[1.2, 0.4]} />
            <meshStandardMaterial color="#000" opacity={0.5} transparent />
          </mesh>
        </group>
      )}

      {/* Admin Interaction Menu */}
      {isManagement && !participant && (
        <group position={[0, 1.8, 0]}>
          {/* Delete Button */}
          <group position={[-0.2, 0, 0]} onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={0.5} />
            </mesh>
            <Text position={[0, 0, 0.13]} fontSize={0.15} color="white">×</Text>
          </group>

          {/* Assign/Designate Button */}
          <group position={[0.2, 0, 0]} onClick={(e) => { e.stopPropagation(); onAssign(); }}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#00D2FF" emissive="#0088aa" emissiveIntensity={0.5} />
            </mesh>
            <Text position={[0, 0, 0.13]} fontSize={0.12} color="white">{idLabel}</Text>
            <Text position={[0, -0.25, 0]} fontSize={0.1} color="white">{assignLabel}</Text>
          </group>
        </group>
      )}

      {/* Status Notification Box */}
      {participant?.status && participant.status !== 'working' && (
        <Html position={[0, 2.5, 0]} center>
          <div className="bg-[#0a0a0a] px-3 py-1.5 rounded-xl border border-white/20 shadow-2xl flex items-center gap-2 whitespace-nowrap scale-75">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
             <span className="text-[10px] font-black tracking-widest uppercase text-white/60">
               {participant.status}
             </span>
          </div>
        </Html>
      )}

      {participant && (
        <AvatarModel 
          position={[0, 0, 0.5]} 
          name={participant.name} 
          color={color} 
        />
      )}
    </group>
  );
};

export const OfficeEnvironment = ({ 
  seats, 
  participants, 
  departments, 
  onAddSeat, 
  onRemoveSeat, 
  onAssignUser, 
  onSit, 
  onMove, 
  onEnterRoom,
  user,
  isAdmin, 
  isAgency 
}: any) => {
  const { translatedText: anonymousLabel } = useAutoTranslate("Anonymous");
  return (
    <group>
      {/* Lighting & Environment */}
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#444444" />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
      
      {/* Fog for depth */}
      <fog attach="fog" args={["#0a0a0a", 5, 45]} />
      
      {/* Floor with Departmental Zones */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow
        onDoubleClick={(e) => {
          e.stopPropagation();
          onMove([e.point.x, 0, e.point.z]);
        }}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Grid */}
      <gridHelper args={[50, 50, "#222", "#111"]} position={[0, 0.01, 0]} />

      {/* Standing/Moving Participants */}
      {participants.filter((p: any) => !p.seatId).map((p: any) => (
        <AvatarModel 
          key={p.id}
          position={p.position || [0, 0, 15]} 
          name={p.name || anonymousLabel} 
          color={p.color} 
          isLocal={p.id === user?.uid || p.id === user?.id}
        />
      ))}

      {/* Department Rooms */}
      {departments.map((dept: any) => (
        <DepartmentRoom 
          key={dept.id} 
          dept={dept} 
          onEnter={(deptId: string) => {
            onEnterRoom(deptId);
            const rot = dept.rotation ? dept.rotation[1] : 0;
            const sign = Math.cos(rot) >= 0 ? 1 : -1;
            onMove([dept.offset[0], 0, dept.offset[2] + 4 * sign]);
          }} 
        />
      ))}

      {/* Seats in departments */}
      {departments.map((dept: any) => (
        <group key={dept.id} position={dept.offset as any} rotation={dept.rotation || [0, 0, 0]}>
          {seats.filter((s: any) => s.deptId === dept.id).map((seat: any, idx: number) => {
            const row = Math.floor(idx / 2);
            const col = idx % 2;
            const defaultPos: [number, number, number] = [(col - 0.5) * 3, 0, (row - 1) * 3];
            const pos = seat.position || defaultPos;
            const participant = participants.find((p: any) => p.seatId === seat.id);
            
            return (
              <DeskGroup 
                key={seat.id} 
                position={pos} 
                rotation={seat.rotation}
                color={dept.color} 
                participant={participant}
                assignedUser={seat.assignedUser}
                isManager={seat.isManager}
                onSit={() => onSit(seat.id)} 
                onRemove={() => onRemoveSeat(seat.id)}
                onAssign={() => onAssignUser(seat.id)}
                isAdmin={isAdmin}
                isAgency={isAgency}
              />
            );
          })}

          {/* Add Seat Button (3D) */}
          {isAdmin && (
            <group position={[0, 0.05, 4]} onClick={() => onAddSeat(dept.id)}>
              <mesh>
                <circleGeometry args={[0.5, 32]} />
                <meshStandardMaterial color={dept.color} opacity={0.2} transparent />
              </mesh>
              <Text
                position={[0, 0.1, 0]}
                fontSize={0.3}
                color="white"
                rotation={[-Math.PI / 2, 0, 0]}
              >
                +
              </Text>
            </group>
          )}
        </group>
      ))}

      <ContactShadows 
         position={[0, 0, 0]} 
         opacity={0.4} 
         scale={40} 
         blur={2} 
         far={10} 
         resolution={256} 
         color="#000000" 
      />
    </group>
  );
};
