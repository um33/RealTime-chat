import { useState, useEffect } from "react";
import io from "socket.io-client";
import _ from "lodash"; // Assuming lodash is installed for debouncing

// Initialize socket outside of the Chat component to avoid reconnecting on every re-render.
const socket = io("http://localhost:3000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [name, setName] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const messageHandler = (message) => {
      console.log("new message received", message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setIsTyping(false);
    };

    const typingHandler = (isTyping) => {
      setIsTyping(isTyping);
    };

    socket.on("display new message", messageHandler);
    socket.on("user typing", typingHandler);

    return () => {
      socket.off("display new message", messageHandler);
      socket.off("user typing", typingHandler);
    };
  }, []);

  const emitTypingEvent = _.debounce((isTyping) => {
    socket.emit("typing", { isTyping, sender: name });
  }, 300);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    emitTypingEvent(!!e.target.value);
  };

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      const message = { sender: name, text: messageInput, timestamp: Date.now() };
      socket.emit("send message", message);
      setMessageInput("");
      emitTypingEvent(false); 
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: 'auto', padding: '70px', maxHeight: '1000px' }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder='your name...' style={{ fontFamily: 'Arial, sans-serif', overflowY: 'auto', border: '1px solid #000', padding: '7px', marginBottom: '10px' }} />
      <div id="message-list" style={{ height: '500px', overflowY: 'auto', border: '1px solid #000', padding: '50px', marginBottom: '10px' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ backgroundColor: '#e5e5e5', color: 'blue', padding: '5px 10px', margin: '5px 0', borderRadius: '10px' }}>
            {message.sender}: {message.text}
            <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '5px' }}>
              {new Date(message.timestamp).toLocaleDateString()} {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isTyping && <div>Someone is typing...</div>}
      </div>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Write your message..."
          value={messageInput}
          onChange={handleInputChange}
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

