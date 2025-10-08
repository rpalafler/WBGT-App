import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../Context";

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

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true, // <-- añade esto

  defaultHeaders: {
    "HTTP-Referer": process.env.REACT_APP_SITE_URL,
    "X-Title": process.env.REACT_APP_SITE_TITLE,
  },
});

const AIChat = ({ applicationRef, onOpenChange }) => {
  const { selectedWBGTValue } = useContext(AppContext);
  const wbgtValue =
    selectedWBGTValue !== null
      ? ((selectedWBGTValue - 273.15) * 9) / 5 + 32
      : null;
  const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const { t } = useTranslation();

  // const VISION_MODEL = "meta-llama/llama-3.2-11b-vision-instruct:free";

  const VISION_MODEL = "mistralai/mistral-small-3.2-24b-instruct:free";

  const determineCategory = (valueF) => {
    if (valueF === null || valueF === undefined) return null;
    if (valueF < 72) return "Safe";
    if (valueF < 76) return "Caution";
    if (valueF < 80) return "Warning";
    if (valueF < 84) return "Danger";
    return "Extreme";
  };

  const formattedWBGT =
    wbgtValue === null ? "unknown" : `${wbgtValue.toFixed(1)} °F`;
  const category = determineCategory(wbgtValue);

  // Randomized style/topic hints to diversify responses
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const styleHints = [
    "use a friendly tone and vary sentence starts",
    "be crisp and energetic; avoid repeating the same verbs",
    "use encouraging tone with varied verbs; avoid repetition",
    "write in plain, conversational Spanish if user writes in Spanish",
    "mix one concise sentence plus 2 short bullets",
    "use 3 compact sentences without bullets",
  ];

  const angleHints = [
    "mention wind or shade if relevant",
    "suggest a cooling strategy (hat, light clothing, misting)",
    "add a pacing cue (work:rest ratio like 15:5 min for harder activity)",
    "suggest checking vulnerable groups (kids, mayores, trabajadores al sol)",
    "suggest optimal time window (e.g., before 10 am / after 6 pm)",
    "if Safe, suggest staying hydrated but enjoying outdoor time",
  ];

  const chosenStyle = pick(styleHints);
  const chosenAngle = pick(angleHints);

  const visionPrompt = `
  Use Fahrenheit only. Be helpful but concise (4–6 short sentences max).
  WBGT at the selected point: ${formattedWBGT}. Category (gauge thresholds): ${
    category ?? "unknown"
  }.
  Thresholds (F): Safe <72, Caution 72–<76, Warning 76–<80, Danger 80–<84, Extreme ≥84.
  Briefly interpret the heatmap you see: mention overall intensity (cool/moderate/hot), any hotspots vs cooler areas nearby, and whether the selected point looks higher/lower than surroundings.
  Then give practical guidance for outdoor activity for this category (hydration, shade/rest pacing, time-of-day tips, vulnerable groups). Avoid extra background.
  Style guidance: ${chosenStyle}. Also ${chosenAngle}.
  Output format:
  - First sentence: WBGT and category.
  - Then 2–3 short bullets with varied wording.
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
    if (typeof onOpenChange === "function") {
      onOpenChange(isOpen);
    }
    setIsChatOpen(isOpen);

    // Toggle a body class so mobile CSS can react when chat is open
    const body = document?.body;
    if (body) {
      if (isOpen) {
        body.classList.add("chat-open");
      } else {
        body.classList.remove("chat-open");
      }
    }
    if (isOpen && !welcomeMessageShown) {
      addResponseMessage(t("Welcome Message"));
      setWelcomeMessageShown(true);
    }
  };

  // Ensure body class is removed on unmount
  useEffect(() => {
    return () => {
      document?.body?.classList?.remove("chat-open");
    };
  }, []);

  const handleNewUserMessage = async (newMessage) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      toggleMsgLoader();

      const systemMessage = {
        role: "system",
        content: `
      You are Sol, a climate data assistant. Be clear and practical while varying your wording.
      Use Fahrenheit only. The user's current WBGT is ${formattedWBGT} and falls in the ${
          category ?? "unknown"
        } section according to thresholds (F): Safe <72, Caution 72–<76, Warning 76–<80, Danger 80–<84, Extreme ≥84.
      In one opening line, define WBGT very briefly (heat stress in sun), state the value and category. Then provide concise, actionable recommendations with varied phrasing. Avoid repeating the same tips every time; rotate focus between hydration, shade/rest cadence, clothing, timing, intensity, and vulnerable groups. ${chosenStyle}. Also ${chosenAngle}.
      Respond in 3–6 short sentences or 1 sentence plus 2–4 bullets. Do not exceed 900 characters.
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
        temperature: 0.9,
        top_p: 0.9,
        presence_penalty: 0.4,
        frequency_penalty: 0.4,
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
        temperature: 0.9,
        top_p: 0.9,
        presence_penalty: 0.4,
        frequency_penalty: 0.4,
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
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        handleToggle={handleWidgetToggle}
        title="Sol"
        subtitle={t("Your WBGT data AI assistant")}
      />

      <div className="screenshot-button-container">
        <ScreenshotButton
          applicationRef={applicationRef}
          onCapture={handleScreenshotCaptured}
          isProcessing={isProcessing}
        />
      </div>
    </>
  );
};

export default AIChat;
