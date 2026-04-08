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

    // Track RTCPeerConnections per participant (for presenter broadcasting to everyone)
    const peerConnections = useRef<{ [socketId: string]: RTCPeerConnection }>({});
    
    // For viewers: The single connection receiving the broadcast
    const viewerConnection = useRef<RTCPeerConnection | null>(null);

    // 1. Presenter Flow: Start sharing local screen
    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 },
                    frameRate: { max: 30 }
                },
                audio: false // Screen sharing audio can be tricky, skipping for simple visual PT
            });
            
            setLocalStream(stream);
            setIsSharing(true);

            // Handle when user hits "Stop sharing" via native browser built-in UI
            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

            // Initiate P2P Connection to everyone currently in the room
            // Only non-local participants
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
    const stopScreenShare = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setIsSharing(false);

        // Close all presenter outbound connections
        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};
        
        // Let the socket room know screen is cleared via normal share-screen event
        socket.emit('share-screen', { url: '', type: 'none' });
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
                setRemoteStream(event.streams[0]);
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
        startScreenShare,
        stopScreenShare
    };
};
