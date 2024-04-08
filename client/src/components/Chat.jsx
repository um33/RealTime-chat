import { useState, useEffect } from "react";
import io from "socket.io-client";

// Initialize socket outside of the Chat component to avoid reconnecting on every re-render.
const socket = io("http://localhost:3000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    const messageHandler = (message) => {
      console.log("new message received", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on("display new message", messageHandler);

    return () => {
      socket.off("display new message", messageHandler);
    };
  }, []);

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      const message = { text: messageInput, timestamp: new Date() };
      socket.emit("send message", message);
      setMessageInput(""); 
    }
  };
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: 'auto', padding: '70px', maxHeight: '1000px' }}>
      <div id="message-list" style={{ height: '500px', overflowY: 'auto', border: '1px solid #000', padding: '50px', marginBottom: '10px' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ backgroundColor: '#e5e5e5', color: 'blue', padding: '5px 10px', margin: '5px 0', borderRadius: '10px' }}>
            {message.text}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Write your message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flexGrow: 1, padding: '10px' }}
        />
        <button onClick={sendMessage} style={{ marginLeft: '10px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
