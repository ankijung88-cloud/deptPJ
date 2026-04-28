import { useEffect, useRef, useState } from 'react';

// Free STUN servers for NAT traversal
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

export const useWebRTCScreenShare = (socket: any, participants: any[]) => {
    // Media flow states
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const [isSharing, setIsSharing] = useState(false);
    const [sharingType, setSharingType] = useState<'screen' | 'camera' | 'none'>('none');

    // Track RTCPeerConnections per participant (for presenter broadcasting to everyone)
    const peerConnections = useRef<{ [socketId: string]: RTCPeerConnection }>({});
    
    // For viewers: Connections receiving broadcasts from multiple participants
    const viewerConnections = useRef<{ [socketId: string]: RTCPeerConnection }>({});
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const safeSetLocalStream = (stream: MediaStream | null) => isMounted.current && setLocalStream(stream);
    const safeSetRemoteStreams = (update: (prev: Record<string, MediaStream>) => Record<string, MediaStream>) => {
        if (isMounted.current) setRemoteStreams(update);
    };
    const safeSetIsSharing = (sharing: boolean) => isMounted.current && setIsSharing(sharing);
    const safeSetSharingType = (type: 'screen' | 'camera' | 'none') => isMounted.current && setSharingType(type);

    const startScreenShare = async () => {
        try {
            if (localStream) stopStream();

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 },
                    frameRate: { max: 30 }
                },
                audio: false
            });
            
            safeSetLocalStream(stream);
            safeSetIsSharing(true);
            safeSetSharingType('screen');

            stream.getVideoTracks()[0].onended = () => {
                stopStream();
            };

            const remoteParticipants = participants.filter(p => p.id !== socket.id);
            for (const participant of remoteParticipants) {
                createAndSendOffer(participant.id, stream);
            }

            return stream;
        } catch (err) {
            console.error('[WebRTC] Error starting display media:', err);
            return null;
        }
    };

    // New: Start Camera Share
    const startCameraShare = async () => {
        try {
            if (localStream) stopStream();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280, max: 1280 },
                    height: { ideal: 720, max: 720 },
                    frameRate: { max: 30 }
                },
                audio: true
            });
            
            // Ensure all tracks are explicitly enabled
            stream.getTracks().forEach(track => {
                track.enabled = true;
            });
            
            safeSetLocalStream(stream);
            safeSetIsSharing(true);
            safeSetSharingType('camera');

            const remoteParticipants = participants.filter(p => p.id !== socket.id);
            for (const participant of remoteParticipants) {
                createAndSendOffer(participant.id, stream);
            }

            return stream;
        } catch (err) {
            console.error('[WebRTC] Error starting user media:', err);
            return null;
        }
    };

    // Helper: Presenter creates Offer
    const createAndSendOffer = async (targetId: string, stream: MediaStream) => {
        if (!socket) return;
        
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnections.current[targetId] = pc;

        // Add local stream tracks to PC
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // Handle ICE Candidates generated locally -> send to target Viewer
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('webrtc-ice-candidate', {
                    targetId,
                    candidate: event.candidate
                });
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc-offer', { targetId, offer });
    };

    // Stop Sharing (Cleanup all P2P connections)
    const stopStream = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            safeSetLocalStream(null);
        }
        safeSetIsSharing(false);
        safeSetSharingType('none');

        // Close all presenter outbound connections
        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};
    };

    useEffect(() => {
        if (!socket) return;

        // 2. Viewer Flow: Receive an Offer from a specific peer
        const handleReceiveOffer = async ({ senderId, offer }: { senderId: string, offer: RTCSessionDescriptionInit }) => {
            console.log('[WebRTC] Received offer from', senderId);
            
            const pc = new RTCPeerConnection(ICE_SERVERS);
            viewerConnections.current[senderId] = pc;

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('webrtc-ice-candidate', {
                        targetId: senderId,
                        candidate: event.candidate
                    });
                }
            };

            // When a track arrives from a specific sender, store it in remoteStreams record
            pc.ontrack = (event) => {
                console.log('[WebRTC] Track received from', senderId);
                const receivedStream = event.streams[0];
                safeSetRemoteStreams(prev => ({
                    ...prev,
                    [senderId]: receivedStream
                }));
            };

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit('webrtc-answer', { targetId: senderId, answer });
            } catch (err) {
                console.error('[WebRTC] Setup Viewer Error:', err);
            }
        };

        // 3. Presenter Flow: Receive Answer from Viewers
        const handleReceiveAnswer = async ({ senderId, answer }: { senderId: string, answer: RTCSessionDescriptionInit }) => {
            const pc = peerConnections.current[senderId];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        // 4. Common Flow: Exchange ICE Candidate (P2P routing path logic)
        const handleReceiveIceCandidate = async ({ senderId, candidate }: { senderId: string, candidate: RTCIceCandidateInit }) => {
            const pc = peerConnections.current[senderId] || viewerConnections.current[senderId];
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    // Ignore transient errors before remote description is set
                }
            }
        };

        socket.on('webrtc-offer', handleReceiveOffer);
        socket.on('webrtc-answer', handleReceiveAnswer);
        socket.on('webrtc-ice-candidate', handleReceiveIceCandidate);

        return () => {
            socket.off('webrtc-offer', handleReceiveOffer);
            socket.off('webrtc-answer', handleReceiveAnswer);
            socket.off('webrtc-ice-candidate', handleReceiveIceCandidate);
        };
    }, [socket]);

    // Handle participant list changes: Remove streams of players who left
    useEffect(() => {
        const participantIds = new Set(participants.map(p => p.id));
        
        safeSetRemoteStreams(prev => {
            const newStreams = { ...prev };
            let changed = false;
            Object.keys(newStreams).forEach(id => {
                if (!participantIds.has(id)) {
                    delete newStreams[id];
                    changed = true;
                    // Also close connection if exists
                    if (viewerConnections.current[id]) {
                        viewerConnections.current[id].close();
                        delete viewerConnections.current[id];
                    }
                }
            });
            return changed ? newStreams : prev;
        });
    }, [participants]);

    // Handle sudden participant joins mid-presentation: Presenter needs to send offer to new participant
    useEffect(() => {
        if (isSharing && localStream && participants.length > 0 && socket) {
            const remoteParticipants = participants.filter(p => p.id !== socket.id);
            remoteParticipants.forEach(p => {
                if (!peerConnections.current[p.id]) {
                    createAndSendOffer(p.id, localStream);
                }
            });
        }
    }, [participants, isSharing, localStream, socket]);

    // Cleanup resources
    useEffect(() => {
        return () => {
            Object.values(peerConnections.current).forEach(pc => pc.close());
            Object.values(viewerConnections.current).forEach(pc => pc.close());
            if (localStream) localStream.getTracks().forEach(t => t.stop());
        };
    }, []);

    return {
        localStream,
        remoteStreams,
        isSharing,
        sharingType,
        startScreenShare,
        startCameraShare,
        stopStream
    };
};
