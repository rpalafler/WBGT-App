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
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";

// change this later to get acutal WBGT point value from app context
const wbgtValue = 72;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
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

  const { t } = useTranslation();

  const VISION_MODEL = "meta-llama/llama-3.2-11b-vision-instruct:free";

  const visionPrompt = `
  Keep response to a few sentences.
  This is a heatmap visualization of WBGT data forecast in the Imperial Valley. 
  The date and time of the data is shown at the left of the screen. 
  The WBGT value for a selected location is ${wbgtValue} F.
  The WBGT category is shown on the gauge chart at the bottom left of the screen.
  Please give a recomendation on outside activity based on the WBGT category provided to you.
  `;

  useEffect(() => {
    console.log("AIChat component mounted");
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      if (welcomeMessageShown) {
        addResponseMessage(t("Welcome Message"));
      }
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [t, welcomeMessageShown]);

  const handleWidgetToggle = (isOpen) => {
    if (isOpen && !welcomeMessageShown) {
      addResponseMessage(t("Welcome Message"));
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
      You are Sol, an climate data assistant trained to explain Wet Bulb Globe Temperature forecasts to general users. 
      
      WBGT, or Wet Bulb Globe Temperature, is a measure of heat stress on the human body in direct sunlight.
       It takes into account several factors beyond just temperature and humidity, including wind speed, sun angle, and cloud cover, which the Heat Index doesn't consider. 
       Essentially, WBGT provides a more comprehensive picture of how hot it feels to be outside in the sun, especially during hot weather. 

      Coverage: Imperial Valley
      Resolution: ~2.5 km
      Temporal frequency: hourly

      WBGT Values are broken down into categories and give recomendations on outside activity:
      - Safe (green): Below 75.9 F, normal activities, monitor fluids
      - Caution (yellow): 75.9 F to 78.7 F, normal activites, monitor fluids
      - Warning (orange): 78.8 F to 83.7, plan intense or prolonged excercise with discretion
      - Danger (red): 83.8 F to 87.6 F, Limit intense exercise and total daily exposure to heat
      - Extreme (black): 87.6 F and above, cancel exercise

      When answering:
      - Do not make up facts or exaggerate details. If you're unsure, say so.
      - Respond clearly and concisely.
      - Use simple terms (avoid too much jargon).
      - Use bullet points if summarizing multiple aspects.
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
        title="Sol"
        subtitle={t("Your WBGT data AI assistant")}
      />
    </>
  );
};

export default AIChat;
