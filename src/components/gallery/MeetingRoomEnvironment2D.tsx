import React from 'react';
import { Monitor } from 'lucide-react';

interface Participant {
    id: string;
    name: string;
    seatId: number | null;
    color: string;
    isMuted?: boolean;
    isVideoOff?: boolean;
}

interface MeetingRoomEnvironment2DProps {
    participants: Participant[];
    localParticipant: Participant;
    onSeatSelect: (seatId: number) => void;
    meetingMode: '1:1' | 'Group';
    screenData?: { url: string; type: string; presenterId?: string };
    webrtcStream?: MediaStream | null;
    splitMode?: 1 | 2 | 4;
}

export const MeetingRoomEnvironment2D: React.FC<MeetingRoomEnvironment2DProps> = ({
    screenData,
    webrtcStream,
    splitMode = 1
}) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (videoRef.current && webrtcStream) {
            videoRef.current.srcObject = webrtcStream;
        }
    }, [webrtcStream]);

    const renderScreen = (index: number) => {
        // Only the first screen shows the actual content for now
        const hasContent = index === 0 && screenData && screenData.type !== 'none';
        
        return (
            <div key={index} className="w-full h-full bg-black rounded-2xl border border-white/10 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                {hasContent ? (
                    <div className="w-full h-full">
                        {screenData.type === 'webrtc' ? (
                            <video 
                                ref={videoRef}
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-contain"
                            />
                        ) : screenData.type === 'video' ? (
                            <video 
                                src={screenData.url} 
                                autoPlay 
                                loop 
                                muted 
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <img 
                                src={screenData.url} 
                                className="w-full h-full object-contain" 
                                alt="Presentation"
                            />
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/5">
                        <Monitor size={splitMode === 4 ? 32 : 48} strokeWidth={1} />
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-20">
                            {index === 0 ? "Waiting for content" : `Screen ${index + 1}`}
                        </p>
                    </div>
                )}
                
                {/* Architectural Glow */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00D2FF]/10 to-transparent blur-sm" />
            </div>
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className={`w-full h-full max-w-[95vw] max-h-[75vh] aspect-video grid gap-4 transition-all duration-500 ${
                splitMode === 1 ? 'grid-cols-1' : 
                splitMode === 2 ? 'grid-cols-2' : 
                'grid-cols-2 grid-rows-2'
            }`}>
                {Array.from({ length: splitMode }).map((_, i) => renderScreen(i))}
            </div>
        </div>
    );
};
