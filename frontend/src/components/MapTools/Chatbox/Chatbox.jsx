import React, { useState, useEffect } from "react";
import {
  Widget,
  addResponseMessage,
  toggleMsgLoader,
} from "react-chat-widget-react-18";
import "react-chat-widget-react-18/lib/styles.css";
import ScreenshotButton from "./Screenshot";
import "./Chatbox.css";

import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey:
    "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",
  dangerouslyAllowBrowser: true, // <-- añade esto

  defaultHeaders: {
    "HTTP-Referer": process.env.REACT_APP_SITE_URL,
    "X-Title": process.env.REACT_APP_SITE_TITLE,
  },
});

const AIChat = ({ applicationRef }) => {
  const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const VISION_MODEL = "meta-llama/llama-3.2-11b-vision-instruct:free";

  const visionPrompt = `Here is a screenshot of a weather heatmap representing temperature patterns. 
  Please analyze the heatmap and explain the patterns you find in 1 or 2 paragraphs.
  `;

  useEffect(() => {
    console.log("AIChat component mounted");
  }, []);

  const handleWidgetToggle = (isOpen) => {
    if (isOpen && !welcomeMessageShown) {
      addResponseMessage(
        "Hello! I can help analyze your mapping application. Ask me questions or send a screenshot."
      );
      setWelcomeMessageShown(true);
    }
  };

  const handleNewUserMessage = async (newMessage) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      toggleMsgLoader();

      const systemMessage = {
        role: "system",
        content: `
        You are Claudia, an AI assistant specialized in explaining and analyzing climate datasets, especially NOAA's Real-Time Mesoscale Analysis (RTMA) dataset.
        `,
      };

      const updatedHistory = [
        systemMessage,
        ...chatHistory,
        { role: "user", content: newMessage },
      ];

      setChatHistory(updatedHistory);

      const completion = await openai.chat.completions.create({
        model: VISION_MODEL,
        messages: updatedHistory,
      });

      const reply = completion?.choices?.[0]?.message?.content;
      if (reply) {
        addResponseMessage(reply);
      } else {
        addResponseMessage("Received unexpected response from the model.");
      }
    } catch (error) {
      console.error("Chat error:", error);
      addResponseMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      toggleMsgLoader();
    }
  };

  // ESTA FUNCIÓN SE ADAPTARÁ EN EL SIGUIENTE PASO PARA MANDAR IMÁGENES
  const handleScreenshotCaptured = async (imageDataUrl) => {
    console.log("Screenshot capture started");
    console.log("🖼️ Screenshot base64:", imageDataUrl);

    addResponseMessage("Analyzing the heatmap...");
    toggleMsgLoader(); // Start loading state
    setIsProcessing(true);

    try {
      const imageContent = {
        role: "user",
        content: [
          {
            type: "text",
            text: visionPrompt.trim(),
          },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl, // base64 inline image
            },
          },
        ],
      };

      const completion = await openai.chat.completions.create({
        model: VISION_MODEL,
        messages: [imageContent],
      });

      const reply = completion?.choices?.[0]?.message?.content;
      if (reply) {
        addResponseMessage(reply);
      } else {
        addResponseMessage("Received unexpected response from the model.");
      }
    } catch (error) {
      console.error("Error analyzing screenshot:", error);
      addResponseMessage(`Error: ${error.message}`);
    } finally {
      toggleMsgLoader(); // Stop loading
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="screenshot-button-container">
        <ScreenshotButton
          applicationRef={applicationRef}
          onCapture={handleScreenshotCaptured}
          isProcessing={isProcessing}
        />
      </div>
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        handleToggle={handleWidgetToggle}
        title="Claudia"
        subtitle="Your climate data AI assistant"
      />
    </>
  );
};

export default AIChat;
