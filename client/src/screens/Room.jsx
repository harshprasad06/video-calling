import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const RoomScreen = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isCallStarted, setIsCallStarted] = useState(false);
  const navigate = useNavigate();

  const endCall = () => {
    // Stop all tracks in local stream
    myStream?.getTracks().forEach((track) => track.stop());
    // Close peer connection
    peer.peer.close();
    // Reset state
    setMyStream(null);
    setRemoteStream(null);
    setRemoteSocketId(null);
    navigate("/");
  };

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
    setIsCallStarted(true);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
      setIsCallStarted(true);
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (!myStream) return;
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
      setIsCallStarted(true);
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <>
      <style>{`
        .room-container {
          height: 100vh;
          background: radial-gradient(circle, #1e003c, #0c0032);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          font-family: 'Poppins', sans-serif;
          color: white;
        }

        .btn {
          background: linear-gradient(90deg, #a855f7, #ec4899);
          border: none;
          padding: 0.8rem 1.5rem;
          margin: 0.5rem;
          border-radius: 0.6rem;
          color: white;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(236, 72, 153, 0.4);
          transition: all 0.3s ease;
        }

        .btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 18px rgba(168, 85, 247, 0.6);
        }

        .stream-section {
          text-align: center;
        }

        .stream-player {
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 0 25px rgba(236, 72, 153, 0.3);
          margin-top: 1rem;
        }
      `}</style>

      <div className="room-container">
        <h1>🔮 Magic Call Room</h1>
        <h3>
          {remoteSocketId ? "User Connected" : "Waiting for a user to join..."}
        </h3>

        {!isCallStarted && remoteSocketId && (
          <button className="btn" onClick={handleCallUser}>
           📞 Call
          </button>
        )}

        <div style={{ display: "flex", gap: "1rem" }}>
          {myStream && remoteSocketId && (
            <button
              style={{
                backgroundColor: "green",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                margin: "20px auto",
                display: "block",
                fontSize: "16px",
              }}
              onClick={sendStreams}
            >
             💻 Send Stream
            </button>
          )}
          {(myStream || remoteStream) && (
            <button
              onClick={endCall}
              style={{
                backgroundColor: "#ff4d4f",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                margin: "20px auto",
                display: "block",
                fontSize: "16px",
              }}
            >
              🚫 End Call
            </button>
          )}
        </div>

        {myStream && (
          <div className="stream-section">
            <h2>My Stream</h2>
            <div className="stream-player">
              <ReactPlayer playing height="240px" width="100%" url={myStream} />
            </div>
          </div>
        )}

        {remoteStream && (
          <div className="stream-section">
            <h2>Remote Stream</h2>
            <div className="stream-player">
              <ReactPlayer
                playing
                height="240px"
                width="100%"
                url={remoteStream}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RoomScreen;
