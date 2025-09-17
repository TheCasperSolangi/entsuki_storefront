"use client";

import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Page() {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [connectionState, setConnectionState] = useState("connecting");
  const [error, setError] = useState(null);

  useEffect(() => {
    const connectToStream = async () => {
      try {
        setError(null);
        setConnectionState("connecting");

        const socket = new WebSocket("ws://localhost:5000/api/live");
        setWs(socket);

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
          ]
        });
        pcRef.current = pc;

        // When remote track is received (from broadcaster)
        pc.ontrack = (event) => {
          console.log("Received remote stream", event.streams.length, "streams");
          console.log("Track details:", event.track.kind, event.track.label);
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            console.log("Video element srcObject set");
            
            // Force the video to play
            videoRef.current.play().then(() => {
              console.log("Video started playing successfully");
              setConnectionState("connected");
            }).catch(error => {
              console.error("Error starting video playback:", error);
              // Try without audio if autoplay policy blocks it
              videoRef.current.muted = true;
              return videoRef.current.play();
            }).then(() => {
              console.log("Video playing (muted)");
              setConnectionState("connected");
            }).catch(error => {
              console.error("Failed to start video even when muted:", error);
              setError("Video playback failed - please click play manually");
            });
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.send(JSON.stringify({ 
              type: "candidate", 
              candidate: event.candidate 
            }));
          }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          console.log("Connection state:", pc.connectionState);
          setConnectionState(pc.connectionState);
          
          if (pc.connectionState === "failed") {
            setError("Connection failed. Please try refreshing.");
          }
        };

        // Handle ICE connection state
        pc.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", pc.iceConnectionState);
          if (pc.iceConnectionState === "disconnected") {
            setConnectionState("disconnected");
          }
        };

        socket.onopen = () => {
          console.log("Connected to signaling server as viewer");
          socket.send(JSON.stringify({ type: "viewer" }));
        };

        socket.onmessage = async (message) => {
          try {
            const data = JSON.parse(message.data);
            console.log("Received message:", data.type);

            if (data.type === "welcome") {
              console.log("Welcome message received");
            }

            if (data.type === "offer") {
              console.log("Received offer from broadcaster");
              await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await pc.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
              });
              await pc.setLocalDescription(answer);
              
              socket.send(JSON.stringify({ 
                type: "answer", 
                answer, 
                to: data.from 
              }));
              console.log("Answer sent to broadcaster");
            }

            if (data.type === "candidate") {
              console.log("Received ICE candidate");
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }

            if (data.type === "error") {
              console.error("Server error:", data.message);
              setError(data.message);
              setConnectionState("error");
            }

            if (data.type === "broadcast-ended") {
              console.log("Broadcast ended");
              setConnectionState("ended");
              if (videoRef.current) {
                videoRef.current.srcObject = null;
              }
            }

            if (data.type === "broadcaster-available") {
              console.log("Broadcaster is now available");
              // Re-register as viewer to connect to the new broadcaster
              socket.send(JSON.stringify({ type: "viewer" }));
            }
          } catch (error) {
            console.error("Error processing message:", error);
            setError("Error processing server message");
          }
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          setError("Connection error occurred");
          setConnectionState("error");
        };

        socket.onclose = () => {
          console.log("WebSocket connection closed");
          setConnectionState("disconnected");
        };

      } catch (error) {
        console.error("Error connecting to stream:", error);
        setError(`Failed to connect: ${error.message}`);
        setConnectionState("error");
      }
    };

    connectToStream();

    // Cleanup function
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const retry = () => {
    window.location.reload();
  };

  const getStatusMessage = () => {
    switch (connectionState) {
      case "connecting":
        return "Connecting to stream...";
      case "connected":
        return "🔴 Live Stream";
      case "disconnected":
        return "Disconnected from stream";
      case "ended":
        return "Broadcast has ended";
      case "error":
        return "Connection error";
      default:
        return "Connecting...";
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "text-green-600";
      case "connecting":
        return "text-yellow-600";
      case "disconnected":
      case "ended":
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <>
      <Header />
      
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-2">🎥 Live Stream</h1>
          <p className={`text-lg ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
            <p className="text-sm">{error}</p>
            <button
              onClick={retry}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls
            muted={connectionState === "connecting"}
            className="w-[800px] max-w-full rounded-lg shadow-lg"
            style={{ 
              backgroundColor: '#000',
              minHeight: '400px'
            }}
            onLoadedMetadata={() => {
              console.log("Video metadata loaded");
              if (videoRef.current) {
                console.log("Video dimensions:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
              }
            }}
            onPlaying={() => {
              console.log("Video is now playing");
              setConnectionState("connected");
            }}
            onError={(e) => {
              console.error("Video error:", e);
              setError("Video playback error");
            }}
          />
          
          {connectionState === "connecting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="text-white text-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                Connecting...
              </div>
            </div>
          )}
        </div>

        {(connectionState === "ended" || connectionState === "error") && (
          <button
            onClick={retry}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Refresh Page
          </button>
        )}

        {connectionState === "connected" && videoRef.current?.paused && (
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(console.error);
              }
            }}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            ▶️ Click to Play Video
          </button>
        )}
      </div>
      
      <Footer />
    </>
  );
}