'use client';
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "../config";
import actionProvider from "../ActionProvider";
import messageParser from "../Messageparser";
import "./ChatBotComponent.css"; // Custom CSS for creative styling


const ChatBotComponent = () => {
  return (
    <div className="chatbot-container">
      <div className="chatbot-wrapper">
        <Chatbot
          config={config}
          actionProvider={actionProvider}
          messageParser={messageParser}
        />
      </div>
    </div>
  );
};

export default ChatBotComponent;
