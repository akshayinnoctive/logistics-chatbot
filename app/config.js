import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  botName: "Logistics Assistant",
  initialMessages: [
    createChatBotMessage("Hi! I'm your Logistics Assistant. I can help you track shipments and provide delivery updates. How can I assist you?")
  ],
};

export default config;
