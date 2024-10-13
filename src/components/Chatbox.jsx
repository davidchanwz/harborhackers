import { useEffect, useState } from 'react';
import '../App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import OpenAI from "openai";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // Get API key from environment variable
const ASSISTANT_ID = "asst_lNHkoXcw4QnxQO4rxLx9tffA"; // Replace with your assistant ID if needed

const systemMessage = {
    role: "system",
    content: "Explain things like you're a staff at Port Authority Singapore. You are answering the questions of interns and workers who have queries about PSA's rules and protocols."
};

function ChatbotPage() {
    const [messages, setMessages] = useState([
        {
            message: "Hello, I'm ChatGPT! Ask me anything!",
            sender: "ChatGPT"
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [assistant, setAssistant] = useState(null); // State to hold the assistant
    const [assistantName, setAssistantName] = useState(""); // State for assistant's name

    useEffect(() => {
        const fetchAssistant = async () => {
            const openai = new OpenAI({ apiKey: API_KEY, dangerouslyAllowBrowser: true }); // Pass API key directly here
            try {
                const myAssistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
                console.log(myAssistant); // Log the assistant to check if it exists
                setAssistant(myAssistant);
                setAssistantName(myAssistant.name || "Unnamed Assistant"); // Set assistant's name
                console.log("Retrieved Assistant Name:", myAssistant.name || "Unnamed Assistant");
            } catch (error) {
                console.error("Error retrieving the assistant:", error);
            }
        };
        fetchAssistant();
    }, []);

    const handleSend = async (message) => {
        const newMessage = {
            message,
            sender: "user"
        };

        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        setIsTyping(true);
        await processMessageToChatGPT(newMessages);
    };

    async function processMessageToChatGPT(chatMessages) {
        const apiMessages = chatMessages.map((messageObject) => {
            return {
                role: messageObject.sender === "ChatGPT" ? "assistant" : "user",
                content: messageObject.message
            };
        });

        const apiRequestBody = {
            model: "gpt-3.5-turbo",
            messages: [
                systemMessage,
                ...apiMessages
            ]
        };

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(apiRequestBody)
            });

            const data = await response.json();

            // Log the full response to inspect it
            console.log('API Response:', data);

            if (data.choices && data.choices.length > 0) {
                const botMessage = data.choices[0].message.content;
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        message: botMessage,
                        sender: "ChatGPT"
                    }
                ]);
            } else {
                throw new Error("No choices returned from API");
            }
        } catch (error) {
            console.error("Error fetching the chatbot response:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    message: "Sorry, there was an error processing your request.",
                    sender: "ChatGPT"
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    }

    return (
        <div style={{ position: "relative", height: "800px", width: "700px" }}>
            <MainContainer>
                <ChatContainer>
                    <div style={{ padding: '10px', fontWeight: 'bold' }}>
                        Assistant Name: {assistantName}
                    </div>
                    <MessageList 
                        scrollBehavior="smooth"
                        typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing..." /> : null}
                    >
                        {messages.map((message, i) => (
                            <Message 
                                key={i} 
                                model={{
                                    message: message.message,
                                    sentTime: "just now",
                                    sender: message.sender,
                                    direction: message.sender === "user" ? "outgoing" : "incoming", // Adjust direction
                                    position: message.sender === "user" ? "right" : "left" // Adjust position
                                }} 
                            />
                        ))}
                    </MessageList>
                    <MessageInput placeholder="Type your message here" onSend={handleSend} />
                </ChatContainer>
            </MainContainer>
        </div>
    );
}

export default ChatbotPage;