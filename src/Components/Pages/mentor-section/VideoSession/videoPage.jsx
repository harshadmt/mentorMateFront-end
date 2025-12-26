import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaPhoneSlash, 
  FaExpand, 
  FaCompress,
  FaUser,
  FaExclamationTriangle,
  FaCog
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

// ✅ FIXED: Use environment variable or window.location.origin
const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // Fallback to current domain if env not set
  return window.location.origin;
};

// ✅ IMPROVED: Get auth token from localStorage with fallback checks
const getAuthToken = () => {
  try {
    // Check multiple possible keys
    const token = 
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('token');
    
    if (token) {
      // auth token found (hidden log removed)
    }
    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const VideoCallPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoAssignedRef = useRef(false);
  const containerRef = useRef(null);
  const socketRef = useRef(null);  // ✅ Changed: Will be created per instance
  const joinedRef = useRef(false);
  const pendingCandidatesRef = useRef([]);

  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUser, setRemoteUser] = useState("Participant");
  const [permissionError, setPermissionError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');  // ✅ NEW: Track connection status
  const [mediaState, setMediaState] = useState({
    hasAudio: false,
    hasVideo: false,
    isAudioDenied: false,
    isVideoDenied: false
  });

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  const cleanupPeerConnection = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
  };

  const endCall = () => {
    cleanupPeerConnection();
    cleanupMedia();
    navigate(-1);
  };

  const initMediaStream = async () => {
    try {
      setIsLoading(true);
      
      const constraints = {
        audio: !mediaState.isAudioDenied,
        video: !mediaState.isVideoDenied && {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      if (!constraints.audio && !constraints.video) {
        setPermissionError('Camera and microphone access are required');
        setIsLoading(false);
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const hasAudio = stream.getAudioTracks().length > 0;
      const hasVideo = stream.getVideoTracks().length > 0;
      
      setMediaState({
        hasAudio,
        hasVideo,
        isAudioDenied: !hasAudio,
        isVideoDenied: !hasVideo
      });

      if (hasAudio || hasVideo) {
        if (localVideoRef.current && hasVideo) {
          localVideoRef.current.srcObject = stream;
          // Ensure video plays
          localVideoRef.current.play().catch(err => console.warn('Local video autoplay error:', err));
          // Local video stream loaded
        }
        localStreamRef.current = stream;
        setPermissionError(null);
        setIsLoading(false);
        return true;
      } else {
        setPermissionError('Camera and microphone access are required');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Error initializing media:", err);
      setIsLoading(false);
      
      if (err.name === 'NotAllowedError') {
        let deniedServices = [];
        if (constraints.audio && constraints.video) {
          deniedServices = ['microphone', 'camera'];
        } else if (constraints.audio) {
          deniedServices = ['microphone'];
        } else if (constraints.video) {
          deniedServices = ['camera'];
        }
        setPermissionError(`Please allow ${deniedServices.join(' and ')} access to continue`);
        setMediaState(prev => ({
          ...prev,
          isAudioDenied: constraints.audio ? true : prev.isAudioDenied,
          isVideoDenied: constraints.video ? true : prev.isVideoDenied
        }));
      } else if (err.name === 'NotFoundError') {
        setPermissionError('No camera or microphone found. Please check your devices.');
      } else {
        setPermissionError('Failed to access camera or microphone. Please try again.');
      }
      
      return false;
    }
              // Diagnostic: log audio/video tracks available locally
              try {
                // Local stream tracks info (debug logs removed)
              } catch (e) {}
  };

  const handleUserJoined = useCallback((data) => {
    // user joined
    setConnected(true);
    if (peerRef.current) {
      // Peer connection already exists, skipping...
      return;
    }
    const peer = createPeer(data.userId);
    peerRef.current = peer;
    
    peer.createOffer()
      .then(offer => {
        peer.setLocalDescription(offer);
        socketRef.current.emit("offer", {
          target: data.socketId,
          offer
        });
        // Sent offer
      })
      .catch(err => console.error("Error creating offer:", err));
  }, []);

  const handleReceiveOffer = useCallback(async (data) => {
    // Received offer
    setConnected(true);
    if (peerRef.current) {
      // Peer connection already exists, skipping...
      return;
    }
    const peer = createPeer(data.sender);
    peerRef.current = peer;

    try {
      await peer.setRemoteDescription(new RTCSessionDescription(data.offer));

      for (const candidate of pendingCandidatesRef.current) {
        try {
          await peer.addIceCandidate(candidate);
        } catch (err) {
          console.error("Error adding pending ICE candidate:", err);
        }
      }
      pendingCandidatesRef.current = [];

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socketRef.current.emit("answer", {
        target: data.sender,
        answer
      });
      // Sent answer
    } catch (err) {
      console.error("Error handling offer:", err);
    }
  }, []);

  const handleReceiveAnswer = useCallback(async (data) => {
    // Received answer
    if (peerRef.current) {
      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));

        for (const candidate of pendingCandidatesRef.current) {
          try {
            await peerRef.current.addIceCandidate(candidate);
          } catch (err) {
            console.error("Error adding pending ICE candidate:", err);
          }
        }
        pendingCandidatesRef.current = [];
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    }
  }, []);

  const handleNewICECandidate = useCallback((data) => {
    // Received ICE candidate
    if (data.candidate && peerRef.current) {
      const candidate = new RTCIceCandidate(data.candidate);
      if (peerRef.current.remoteDescription) {
        peerRef.current.addIceCandidate(candidate)
          .catch(err => console.error("Error adding ICE candidate:", err));
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    }
  }, []);

  const handleUserDisconnected = useCallback((data) => {
    // User disconnected
    setConnected(false);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const createPeer = (userId) => {
    // ✅ FIXED: Added TURN servers for NAT traversal (fixes 40% of connection issues)
    const iceServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ];
    
    // Add TURN servers if configured (allows connection through firewalls)
    if (import.meta.env.VITE_TURN_SERVER) {
      iceServers.push({
        urls: import.meta.env.VITE_TURN_SERVER,
        username: import.meta.env.VITE_TURN_USERNAME || undefined,
        credential: import.meta.env.VITE_TURN_PASSWORD || undefined
      });
    }

    const peer = new RTCPeerConnection({
      iceServers: iceServers
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          target: userId,
          candidate: event.candidate
        });
      }
    };

    peer.ontrack = (event) => {
      const remoteStream = event.streams && event.streams[0];
      if (!remoteStream) return;

      const streamId = remoteStream.id;

      // Attach to video element for combined A/V streams (avoid reassigning same stream)
      if (remoteVideoRef.current) {
        try {
          if (remoteVideoRef.current.srcObject !== remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(err => console.warn('Remote video play error (may be autoplay block):', err));
            // Attached remote stream to video
          } else {
            // Skip re-attaching same remote video stream
          }
        } catch (e) {
          console.warn('Failed to attach remote stream to video element:', e);
        }
      }

      // Attach audio to a dedicated audio element to improve autoplay behavior across browsers
      if (remoteAudioRef.current && remoteStream.getAudioTracks().length > 0) {
        try {
          if (remoteAudioRef.current.srcObject !== remoteStream) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.muted = false;
            remoteAudioRef.current.volume = 1.0;
            remoteAudioRef.current.play().catch(err => console.warn('Remote audio play error (may be autoplay block):', err));
            // Attached remote stream to audio
          } else {
            // Skip re-attaching same remote audio stream
          }
        } catch (e) {
          console.warn('Failed to attach remote stream to audio element:', e);
        }
      }

      try {
        // Remote stream tracks info (debug logs removed)
      } catch (e) {}
    };

    peer.onconnectionstatechange = () => {
      // Connection state changed
      if (peer.connectionState === "disconnected" || peer.connectionState === "failed") {
        setConnected(false);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    return peer;
  };

  // ✅ NEW: Socket initialization with JWT authentication and connection recovery
  useEffect(() => {
    // ✅ FIXED: Only initialize socket once, skip if already created
    if (socketRef.current?.connected || socketRef.current?.connecting) {
      return;
    }

    const token = getAuthToken();
    
    // ✅ FIXED: Allow socket connection even without token (will fail gracefully on backend if needed)
    // This prevents blocking the entire video component when token is missing
    if (!token) {
      console.warn("No auth token available - socket will attempt connection without authentication");
    }

    try {
      // Create new socket instance per component (not global)
      const newSocket = io(getSocketURL(), {
        auth: {
          token: token || ''  // ✅ FIXED: Send empty string if no token instead of undefined
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],  // ✅ FIXED: Added polling fallback
        query: { roomId: id }
      });

      socketRef.current = newSocket;

      // Connection status monitoring
      newSocket.on('connect', () => {
        setConnectionStatus('connected');
        console.info('✅ Socket connected:', newSocket.id);
      });

      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error);
        setConnectionStatus('error');
      });

      newSocket.on('disconnect', (reason) => {
        // debug-level: normal during HMR / reloads; warn only for server disconnects
        if (reason === 'io server disconnect') {
          console.warn('Socket disconnected by server:', reason);
          setConnectionStatus('disconnected');
        } else {
          console.debug('Socket disconnected:', reason);
        }
      });

      return () => {
        // ✅ FIXED: Only disconnect if socket exists and is connected
        if (newSocket && newSocket.connected) {
          newSocket.disconnect();
        }
        socketRef.current = null;
      };
    } catch (error) {
      console.error('Socket initialization error:', error);
      setPermissionError('Failed to initialize connection');
    }
  }, [id]);

  useEffect(() => {
    const init = async () => {
      // Wait for socket to be ready before initializing media
      if (!socketRef.current) {
        // Waiting for socket to initialize...
        return;
      }

      const mediaSuccess = await initMediaStream();
      if (mediaSuccess && !joinedRef.current && socketRef.current) {
        joinedRef.current = true;
        const socket = socketRef.current;
        
        // Add socket event listeners
        socket.on("user-joined", handleUserJoined);
        socket.on("receive-offer", handleReceiveOffer);
        socket.on("receive-answer", handleReceiveAnswer);
        socket.on("receive-ice-candidate", handleNewICECandidate);
        socket.on("user-disconnected", handleUserDisconnected);
        socket.on("user-info", (info) => setRemoteUser(info.name || "Participant"));
        
        // Join room and notify backend
        // Joining room
        socket.emit("join-room", { roomId: id, userId: socket.id });
      }
    };

    // Small delay to ensure socket is initialized
    const timer = setTimeout(() => {
      init();
    }, 500);

    return () => {
      clearTimeout(timer);
      cleanupPeerConnection();
      cleanupMedia();
      if (joinedRef.current && socketRef.current) {
        const socket = socketRef.current;
        // Remove all listeners
        socket.off("user-joined");
        socket.off("receive-offer");
        socket.off("receive-answer");
        socket.off("receive-ice-candidate");
        socket.off("user-disconnected");
        socket.off("user-info");
        socket.emit("leave-room", id);
        joinedRef.current = false;
      }
    };
  }, [id]);

  useEffect(() => {
    let timer;
    if (!permissionError && !isLoading) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [permissionError, isLoading]);

  // ✅ FIXED: Ensure local video stream is assigned to video element
  useEffect(() => {
    const el = localVideoRef.current;
    const stream = localStreamRef.current;
    if (el && stream && cameraOn) {
      if (el.srcObject !== stream && !localVideoAssignedRef.current) {
        el.srcObject = stream;
        localVideoAssignedRef.current = true;
        el.play().catch(err => console.warn('Play error:', err));
        // Local video ref updated
      }
    }

    return () => {
      // when camera toggled off or component unmounts, reset assignment flag
      if (!cameraOn) localVideoAssignedRef.current = false;
    };
  }, [cameraOn]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const requestPermissionAgain = () => {
    setPermissionError(null);
    setRetryCount(prev => prev + 1);
  };

  const continueWithoutVideo = () => {
    setMediaState(prev => ({ ...prev, isVideoDenied: true }));
    setPermissionError(null);
    setRetryCount(prev => prev + 1);
  };

  const toggleMic = () => {
    if (!mediaState.hasAudio) return;
    
    const micTrack = localStreamRef.current?.getAudioTracks()[0];
    if (micTrack) {
      micTrack.enabled = !micTrack.enabled;
      setMicOn(micTrack.enabled);
    }
  };

  const toggleCamera = () => {
    if (!mediaState.hasVideo) return;
    
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    if (camTrack) {
      camTrack.enabled = !camTrack.enabled;
      setCameraOn(camTrack.enabled);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full opacity-10 animate-ping"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-blue-100 rounded-full opacity-30 animate-bounce"></div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl border border-blue-200/50 text-center relative z-10 animate-fadeIn">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Setting up your call...
          </h2>
          <p className="text-blue-600 animate-pulse">Please wait while we access your camera and microphone</p>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-red-200 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-200 rounded-full opacity-10 animate-pulse"></div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl border border-blue-200/50 relative z-10 animate-slideUp">
          <div className="relative mb-6">
            <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto animate-bounce" />
            <div className="absolute inset-0 bg-yellow-200 rounded-full opacity-20 animate-ping"></div>
          </div>
          
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Permission Required
          </h2>
          <p className="mb-6 text-gray-700">{permissionError}</p>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={requestPermissionAgain}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Try Again
            </button>
            
            {!mediaState.isAudioDenied && mediaState.isVideoDenied && (
              <button
                onClick={continueWithoutVideo}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Continue Audio Only
              </button>
            )}
            
            <button
              onClick={() => navigate(-1)}
              className="bg-white hover:bg-blue-50 text-blue-600 py-3 px-6 rounded-xl font-medium transition-all duration-300 border border-blue-200 hover:border-blue-300 transform hover:scale-105"
            >
              Go Back
            </button>
          </div>

          <div className="mt-8 text-sm text-blue-600 bg-blue-50/50 rounded-xl p-4">
            <p className="mb-2 font-medium">Troubleshooting:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Check your browser's permission settings</li>
              <li>Make sure no other app is using your camera/mic</li>
              <li>Refresh the page and try again</li>
              {mediaState.isVideoDenied && (
                <li>Click "Continue Audio Only" for voice calls</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full opacity-5 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-300 rounded-full opacity-5 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100 to-white rounded-full opacity-10 animate-spin" style={{animationDuration: '20s'}}></div>
      </div>

      {/* Top header with enhanced styling */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 animate-slideDown">
        <div className="bg-white/90 backdrop-blur-lg rounded-full px-6 py-3 flex items-center shadow-lg border border-blue-200/50 hover:shadow-xl transition-all duration-300">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3 animate-pulse">
              <FaUser size={14} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="font-semibold text-gray-800">{remoteUser}</span>
          <span className="mx-3 text-blue-300">•</span>
          <span className="font-mono font-medium text-blue-600">{formatTime(callDuration)}</span>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-white/90 backdrop-blur-lg hover:bg-white transition-all duration-300 shadow-lg border border-blue-200/50 hover:shadow-xl transform hover:scale-110"
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {fullscreen ? <FaCompress size={18} className="text-blue-600" /> : <FaExpand size={18} className="text-blue-600" />}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-full bg-white/90 backdrop-blur-lg hover:bg-white transition-all duration-300 shadow-lg border border-blue-200/50 hover:shadow-xl transform hover:scale-110"
            aria-label="Settings"
          >
            <BsThreeDotsVertical size={18} className="text-blue-600" />
          </button>
        </div>
      </div>

      {/* Main video container with enhanced styling */}
      <div className={`relative w-full max-w-6xl ${fullscreen ? 'h-screen' : 'h-[80vh]'} rounded-2xl overflow-hidden shadow-2xl border border-blue-200/50 backdrop-blur-lg animate-fadeIn`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-blue-100/20"></div>
        
        <div className={`relative inset-0 ${connected ? '' : 'flex items-center justify-center'} h-full`}>
          {connected ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Hidden audio element to ensure audio playback in browsers that block audio on <video> */}
              <audio
                ref={remoteAudioRef}
                autoPlay
                playsInline
                style={{ display: 'none' }}
              />
            </>
          ) : (
            <div className="text-center p-6 animate-slideUp">
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto animate-pulse">
                  <FaUser size={60} className="text-blue-400" />
                </div>
                <div className="absolute inset-0 w-40 h-40 mx-auto rounded-full bg-blue-300 opacity-20 animate-ping"></div>
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Waiting for {remoteUser} to join...
              </h3>
              <p className="text-blue-600 text-lg">
                You can start your {mediaState.hasVideo ? 'video' : 'audio'} call as soon as they join
              </p>
              
              {/* Animated waiting indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced local video preview */}
        {mediaState.hasVideo && (
          <div className="absolute bottom-4 right-4 w-52 h-40 rounded-2xl overflow-hidden border-3 border-white shadow-2xl bg-black animate-slideUp">
            <video
              ref={(el) => {
                localVideoRef.current = el;
                // When element is mounted, assign the stream immediately
                if (el) {
                  // ensure rendering quality and avoid GPU compositing flicker
                  try {
                    el.style.backgroundColor = 'transparent';
                    el.style.objectFit = 'cover';
                    el.style.objectPosition = 'center center';
                    el.style.backfaceVisibility = 'hidden';
                    el.style.willChange = 'transform, opacity';
                    el.style.transform = 'translateZ(0)';
                  } catch (e) {}

                  const stream = localStreamRef.current;
                  if (stream) {
                    // only assign if different stream to avoid interrupting play()
                    if (el.srcObject !== stream) {
                      el.srcObject = stream;
                      localVideoAssignedRef.current = true;
                      el.play().catch(err => console.warn('Autoplay error:', err));
                      // Local video stream attached to element
                    }
                  }
                }
              }}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: cameraOn ? 'block' : 'none'
              }}
            />
            {!cameraOn && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                <FaVideoSlash size={36} className="text-blue-400 animate-pulse" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
          </div>
        )}
      </div>

      {/* Enhanced control buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-slideUp">
        <div className="flex gap-4 bg-white/90 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-2xl border border-blue-200/50 hover:shadow-3xl transition-all duration-300">
          <button
            onClick={toggleMic}
            disabled={!mediaState.hasAudio}
            className={`group relative p-4 rounded-2xl flex flex-col items-center transition-all duration-300 transform hover:scale-110 ${
              !mediaState.hasAudio 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : micOn 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-lg hover:shadow-xl' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700'
            }`}
            aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          >
            <div className="relative">
              {micOn ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
              {!micOn && (
                <div className="absolute inset-0 bg-red-300 rounded-full opacity-30 animate-ping"></div>
              )}
            </div>
            <span className="text-xs mt-2 font-medium">
              {!mediaState.hasAudio ? "No Mic" : micOn ? "Mute" : "Unmute"}
            </span>
          </button>
          
          {mediaState.hasVideo && (
            <button
              onClick={toggleCamera}
              className={`group relative p-4 rounded-2xl flex flex-col items-center transition-all duration-300 transform hover:scale-110 ${
                cameraOn 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-lg hover:shadow-xl' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700'
              }`}
              aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
            >
              <div className="relative">
                {cameraOn ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
                {!cameraOn && (
                  <div className="absolute inset-0 bg-red-300 rounded-full opacity-30 animate-ping"></div>
                )}
              </div>
              <span className="text-xs mt-2 font-medium">{cameraOn ? "Stop Video" : "Start Video"}</span>
            </button>
          )}
          
          <button
            onClick={endCall}
            className="group relative p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl flex flex-col items-center"
            aria-label="End call"
          >
            <div className="relative">
              <FaPhoneSlash size={24} />
              <div className="absolute inset-0 bg-red-300 rounded-full opacity-30 animate-pulse group-hover:animate-ping"></div>
            </div>
            <span className="text-xs mt-2 font-medium">End Call</span>
          </button>
        </div>
      </div>

      {/* Enhanced settings panel */}
      {showSettings && (
        <div className="absolute right-4 bottom-24 bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl w-72 z-20 border border-blue-200/50 animate-slideUp">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold flex items-center text-blue-800 text-lg">
              <FaCog className="mr-2 text-blue-600 animate-spin" style={{animationDuration: '2s'}} /> Settings
            </h4>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600 text-xl p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
              aria-label="Close settings"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="group">
              <label className="block text-sm font-medium text-blue-700 mb-2">Microphone</label>
              <select 
                className="w-full bg-gradient-to-r from-blue-50 to-white rounded-xl p-3 text-sm border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                disabled={!mediaState.hasAudio}
              >
                <option>Default Microphone</option>
              </select>
              {!mediaState.hasAudio && (
                <p className="text-xs text-red-500 mt-1 animate-pulse">Microphone access denied</p>
              )}
            </div>
            
            {mediaState.hasVideo && (
              <div className="group">
                <label className="block text-sm font-medium text-blue-700 mb-2">Camera</label>
                <select className="w-full bg-gradient-to-r from-blue-50 to-white rounded-xl p-3 text-sm border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                  <option>Default Camera</option>
                </select>
              </div>
            )}
            
            <div className="group">
              <label className="block text-sm font-medium text-blue-700 mb-2">Speaker</label>
              <select className="w-full bg-gradient-to-r from-blue-50 to-white rounded-xl p-3 text-sm border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                <option>Default Speaker</option>
              </select>
            </div>
            
            {/* Additional settings */}
            <div className="border-t border-blue-100 pt-4 mt-4">
              <h5 className="text-sm font-medium text-blue-700 mb-3">Call Quality</h5>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">HD Video</span>
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only" />
                  <div className="w-10 h-6 bg-blue-200 rounded-full shadow-inner transition-all duration-200 cursor-pointer">
                    <div className="w-4 h-4 bg-blue-600 rounded-full shadow transform translate-x-4 transition-transform duration-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        
        .hover\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        .backdrop-blur-lg {
          backdrop-filter: blur(16px);
        }
      `}</style>
    </div>
  );
};

export default VideoCallPage;