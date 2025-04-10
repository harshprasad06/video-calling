import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const LobbyScreen = () => {
  const [room, setRoom] = useState("");
  const [email, setEmail] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, socket, room]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [handleJoinRoom, socket]);

  return (
    <>
      <style>{`
        .lobby-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle at top left, #1e003c, #0c0032, #0e0028);
          font-family: 'Poppins', sans-serif;
        }

        .form-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 2.5rem 3.5rem;
          border-radius: 1.2rem;
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          width: 100%;
          max-width: 420px;
          animation: floatIn 1s ease-in-out;
        }

        .title {
          font-size: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          background: linear-gradient(90deg, #f472b6, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .form label {
          display: block;
          margin-bottom: 0.4rem;
          margin-top: 1.2rem;
          font-weight: 600;
        }

        .form input {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.6rem;
          border: none;
          outline: none;
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
          font-size: 1rem;
          box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
        }

        .form input:focus {
          box-shadow: 0 0 12px #e879f9, 0 0 20px #9333ea;
        }

        .form input::placeholder {
          color: #ccc;
        }

        .join-btn {
          width: 100%;
          margin-top: 2rem;
          padding: 0.9rem;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          color: white;
          border: none;
          border-radius: 0.6rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
          transition: all 0.4s ease;
        }

        .join-btn:hover {
          background: linear-gradient(90deg, #ec4899, #a855f7);
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.7);
          transform: scale(1.03);
        }

        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

@media (max-width: 768px) {
 .lobby-container{
 padding-left:10px;
 padding-right:10px;

 }
}

      `}</style>

      <div className="lobby-container">
        <div className="form-card">
          <h1 className="title">✨ Join the Magic Room</h1>
          <form onSubmit={handleSubmitForm} className="form">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <label htmlFor="room">Room Number</label>
            <input
              type="text"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter Room ID"
              required
            />
            <button type="submit" className="join-btn">
              Join Room
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LobbyScreen;
