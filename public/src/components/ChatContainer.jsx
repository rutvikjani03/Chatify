import React, { useEffect, useRef, useState } from "react";
import "./ChatContainer.css";
import ChatInput from "../components/ChatInput.jsx";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { FaArrowLeft } from "react-icons/fa";

export default function ChatContainer({ currentChat, currentUser, socket, onDeselectChat }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      if (currentChat) {
        const response = await axios.post("http://localhost:5000/api/getallmsg", {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      }
    };

    fetchData();
  }, [currentChat, currentUser]);

  const handleSendMessage = async (msg) => {
    await axios.post("http://localhost:5000/api/addmessage", {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });

    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, [socket]);

  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentChat) {
    return null; // or render a loading indicator or something else
  }

  return (
    <div className="Montainer">
      <div className="chat-header">
        <div className="user-details">
          <FaArrowLeft
            style={{ width: "40px", height: "20px" }}
            color="white"
            size={30}
            className="resetbutton"
            onClick={onDeselectChat} // Deselect chat on click
          />
          <div className="avatar">
            <img src={`${currentChat.AvatarImage}`} alt="" />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div ref={scrollRef} key={uuidv4()}>
            <div className={`message ${message.fromSelf ? "sended" : "recieved"}`}>
              <div className="content">
                <p>{message.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ChatInput handleSendMessage={handleSendMessage} />
    </div>
  );
}