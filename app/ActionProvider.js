import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "22c9840f30ab433a9ae8b83da4aef95f",
  baseURL: "https://api.aimlapi.com",
  dangerouslyAllowBrowser: true,
});

class ActionProvide {
  constructor(
    createChatBotMessage,
    setStateFunc,
    createClientMessage,
    stateRef,
    createCustomMessage,
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
    this.stateRef = stateRef;
    this.createCustomMessage = createCustomMessage;
  }

  // API Call with Retry Logic
  callGenAI = async (prompt, retries = 3, delay = 1000) => {
    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a system support chatbot that identifies errors and provides resolutions." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 150,
      });
      return chatCompletion.choices[0].message.content;
    } catch (error) {
      if (error.response?.status === 429 && retries > 0) {
        console.warn(`Rate limit hit. Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
        return this.callGenAI(prompt, retries - 1, delay * 2);
      }
      console.error("API Error:", error.message);
      return "Sorry, I'm having trouble responding right now. Please try again later.";
    }
  };

  // Delay Function
  timer = (ms) => new Promise((res) => setTimeout(res, ms));

  // Generate Chatbot Responses
  generateResponseMessage = async (userMessage) => {
    const responseFromGPT = await this.callGenAI(userMessage);
    const responseLines = responseFromGPT.split("\n");

    for (const msg of responseLines) {
      if (msg.trim().length) {
        const message = this.createChatBotMessage(msg.trim());
        this.updateChatBotMessage(message);
        await this.timer(500);
      }
    }
  };

  // Error Resolution Logic
  handleMessage = async (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("error code")) {
      const response =
        "Please provide the error code so I can identify the issue and suggest a solution. Alternatively, I can guide you to the right support contact.";
      this.updateChatBotMessage(this.createChatBotMessage(response));
    } else if (lowerMessage.includes("network issue")) {
      const response =
        "For network issues, ensure all cables are connected and the router is functioning. If the issue persists, contact the IT team at support@company.com.";
      this.updateChatBotMessage(this.createChatBotMessage(response));
    } else if (lowerMessage.includes("server down")) {
      const response =
        "If the server is down, try restarting it via the admin console. If unavailable, contact the server admin team at server_admin@company.com.";
      this.updateChatBotMessage(this.createChatBotMessage(response));
    } else if (lowerMessage.includes("permission denied")) {
      const response =
        "Permission issues are typically resolved by the admin. Please contact access_control@company.com for assistance.";
      this.updateChatBotMessage(this.createChatBotMessage(response));
    } else if (lowerMessage.includes("language:")) {
      const [language, text] = message.match(/language:(\w+):(.+)/) || [];
      if (language && text) {
        await this.generateResponseMessage(text.trim(), language.trim());
      } else {
        const error = this.createChatBotMessage(
          "Please specify a valid language and message format (e.g., 'language:fr:What is the error solution?')."
        );
        this.updateChatBotMessage(error);
      }
    } else {
      await this.generateResponseMessage(message);
    }
  };

  // Respond to User Messages
  respond = (message) => {
    this.handleMessage(message);
  };

  // Update Chatbot State with New Messages
  updateChatBotMessage = (message) => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  };
}

export default ActionProvide;
