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
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [sharingType, setSharingType] = useState<'screen' | 'camera' | 'none'>('none');

    // Track RTCPeerConnections per participant (for presenter broadcasting to everyone)
    const peerConnections = useRef<{ [socketId: string]: RTCPeerConnection }>({});
    
    // For viewers: The single connection receiving the broadcast
    const viewerConnection = useRef<RTCPeerConnection | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const safeSetLocalStream = (stream: MediaStream | null) => isMounted.current && setLocalStream(stream);
    const safeSetRemoteStream = (stream: MediaStream | null) => isMounted.current && setRemoteStream(stream);
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
            
            // Ensure all tracks are explicitly enabled and STAY enabled during startup period
            const forceEnableTracks = () => {
                stream.getTracks().forEach(track => {
                    if (!track.enabled) track.enabled = true;
                });
            };

            // Initial burst of activation prompts
            forceEnableTracks();
            for (let i = 1; i <= 10; i++) {
                setTimeout(forceEnableTracks, i * 150);
            }

            console.log(`[WebRTC] Stream acquired with ${stream.getVideoTracks().length} video tracks.`);
            
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
        
        // Let the socket room know stream is cleared
        socket?.emit('share-screen', { url: '', type: 'none' });
    };

    useEffect(() => {
        if (!socket) return;

        // 2. Viewer Flow: Receive an Offer
        const handleReceiveOffer = async ({ senderId, offer }: { senderId: string, offer: RTCSessionDescriptionInit }) => {
            console.log('[WebRTC] Received offer from', senderId);
            
            const pc = new RTCPeerConnection(ICE_SERVERS);
            viewerConnection.current = pc;

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('webrtc-ice-candidate', {
                        targetId: senderId,
                        candidate: event.candidate
                    });
                }
            };

            // When a track arrives from Presenter, store it in remoteStream
            pc.ontrack = (event) => {
                console.log('[WebRTC] Track received!', event.streams[0]);
                safeSetRemoteStream(event.streams[0]);
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
            console.log('[WebRTC] Received answer from', senderId);
            const pc = peerConnections.current[senderId];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        // 4. Common Flow: Exchange ICE Candidate (P2P routing path logic)
        const handleReceiveIceCandidate = async ({ senderId, candidate }: { senderId: string, candidate: RTCIceCandidateInit }) => {
            const pc = peerConnections.current[senderId] || viewerConnection.current;
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error('[WebRTC] Error adding received ice candidate', e);
                }
            }
        };

        // Listeners attached to socket
        socket.on('webrtc-offer', handleReceiveOffer);
        socket.on('webrtc-answer', handleReceiveAnswer);
        socket.on('webrtc-ice-candidate', handleReceiveIceCandidate);

        return () => {
            socket.off('webrtc-offer', handleReceiveOffer);
            socket.off('webrtc-answer', handleReceiveAnswer);
            socket.off('webrtc-ice-candidate', handleReceiveIceCandidate);
        };
    }, [socket]);

    // Handle sudden participant joins mid-presentation: Presenter needs to send offer to new participant
    useEffect(() => {
        if (isSharing && localStream && participants.length > 0) {
            const remoteParticipants = participants.filter(p => p.id !== socket?.id);
            remoteParticipants.forEach(p => {
                // If we haven't created a connection to this user yet, send them an offer
                if (!peerConnections.current[p.id]) {
                    createAndSendOffer(p.id, localStream);
                }
            });
        }
    }, [participants, isSharing, localStream, socket]);

    // Cleanup memory on hook unmount
    useEffect(() => {
        return () => {
            Object.values(peerConnections.current).forEach(pc => pc.close());
            if (viewerConnection.current) viewerConnection.current.close();
            if (localStream) localStream.getTracks().forEach(t => t.stop());
        };
    }, []);

    return {
        localStream,
        remoteStream,
        isSharing,
        sharingType,
        startScreenShare,
        startCameraShare,
        stopStream
    };
};
