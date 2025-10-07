import React, { useState, useEffect, useContext, useRef } from "react";
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

// Configuración de OpenAI con OpenRouter
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": process.env.REACT_APP_SITE_URL,
    "X-Title": process.env.REACT_APP_SITE_TITLE,
  },
});

// Modelos separados y fallback
const TEXT_MODEL = "deepseek/deepseek-chat-v3.1:free";
const VISION_MODEL = "google/gemini-2.0-flash-exp:free";
const TEXT_FALLBACK = TEXT_MODEL;
const VISION_FALLBACK = VISION_MODEL;

async function createChat(messages, isVision = false, opts = {}) {
  const base = {
    temperature: 0.7,
    top_p: 0.9,
    presence_penalty: 0.3,
    frequency_penalty: 0.3,
    ...opts,
  };
  try {
    return await openai.chat.completions.create({
      model: isVision ? VISION_MODEL : TEXT_MODEL,
      messages,
      ...base,
    });
  } catch (e) {
    // Fallback automático
    return await openai.chat.completions.create({
      model: isVision ? VISION_FALLBACK : TEXT_FALLBACK,
      messages,
      ...base,
    });
  }
}

// Umbrales WBGT (°F)
function determineCategory(valueF) {
  if (valueF == null) return null;
  if (valueF < 72) return "Safe";
  if (valueF < 76) return "Caution";
  if (valueF < 80) return "Warning";
  if (valueF < 84) return "Danger";
  return "Extreme";
}

// Clasificador básico para charla corta
function isSmallTalk(msg) {
  const m = msg.toLowerCase();
  return (
    /^(hola|hello|hey|buenas|qué tal|como estas|how are you|hi)\b/.test(m) ||
    /(jaja|jeje|lol|xd)\b/.test(m) ||
    /(who are you|quién eres|que eres|what are you)/.test(m)
  );
}

const AIChat = ({ applicationRef, onOpenChange }) => {
  const { selectedWBGTValue } = useContext(AppContext);

  // ⚠️ Verifica que selectedWBGTValue venga en Kelvin realmente.
  const wbgtValue =
    selectedWBGTValue !== null
      ? ((selectedWBGTValue - 273.15) * 9) / 5 + 32
      : null;

  const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const { t } = useTranslation();

  const formattedWBGT =
    wbgtValue == null ? "unknown" : `${wbgtValue.toFixed(1)} °F`;
  const category = determineCategory(wbgtValue);

  // Hints por interacción: se fijan en refs y se recalculan por mensaje
  const styleRef = useRef(null);
  const angleRef = useRef(null);

  const styleHints = [
    "friendly, upbeat, varied sentence starts",
    "crisp and energetic; avoid repeating verbs",
    "warm, encouraging tone with varied wording",
    "plain, conversational Spanish if user writes Spanish",
    "one concise sentence + 2 short bullets",
    "3 compact sentences; no bullets",
  ];
  const angleHints = [
    "mention wind or shade if relevant",
    "suggest a cooling strategy (hat, light clothing, misting)",
    "add a pacing cue (e.g., 15:5 work:rest for strenuous tasks)",
    "check vulnerable groups (kids, elders, outdoor workers)",
    "suggest optimal time window (before 10 am / after 6 pm)",
    "if Safe, suggest staying hydrated and enjoying outdoor time",
  ];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  useEffect(() => {
    console.log("AIChat mounted");
    return () => document?.body?.classList?.remove("chat-open");
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      // aviso breve si el chat está abierto; evita duplicar bienvenida
      if (isChatOpen) addResponseMessage(t("Language updated"));
    };
    i18n.on("languageChanged", handleLanguageChange);
    return () => i18n.off("languageChanged", handleLanguageChange);
  }, [isChatOpen, t]);

  const handleWidgetToggle = (isOpen) => {
    if (typeof onOpenChange === "function") onOpenChange(isOpen);
    setIsChatOpen(isOpen);

    const body = document?.body;
    if (body) body.classList.toggle("chat-open", isOpen);

    if (isOpen && !welcomeMessageShown) {
      addResponseMessage(t("Welcome Message"));
      setWelcomeMessageShown(true);
    }
  };

  // Persona y reglas generales (texto)
  const buildTextSystemMessage = () => {
    const lang = i18n.language === "es" ? "es" : "en";
    const languageRule =
      lang === "es"
        ? "Responde SIEMPRE en español. No alternes a inglés."
        : "Respond ONLY in English. Do not switch to Spanish.";

    return {
      role: "system",
      content: `
You are Sol, a warm, approachable climate-data assistant for WBGT.
${languageRule}
Be kind, natural, and a little playful—but keep guidance practical and safe.
If the user goes off-topic, reply briefly and kindly, then steer back to WBGT heat-safety tips.
Use Fahrenheit only. User WBGT: ${formattedWBGT}; category: ${
        category ?? "unknown"
      }.
Thresholds (F): Safe <72, Caution 72–<76, Warning 76–<80, Danger 80–<84, Extreme ≥84.
Open with a one-line WBGT definition (heat stress in sun), give value+category, then concise, rotating, actionable tips (hydration, shade/rest cadence, clothing, timing, intensity, vulnerable groups).
3–6 short sentences or 1 sentence + 2–4 bullets. Max 900 chars.
`.trim(),
    };
  };

  const MAX_TURNS = 10;

  const handleNewUserMessage = async (newMessage) => {
    if (isProcessing) return;

    // Hints por interacción
    styleRef.current = pick(styleHints);
    angleRef.current = pick(angleHints);

    const personaNudges =
      i18n.language === "es"
        ? `Estilo: ${styleRef.current}. Además: ${angleRef.current}.`
        : `Style: ${styleRef.current}. Also: ${angleRef.current}.`;

    // Breve manejo de small talk
    if (isSmallTalk(newMessage)) {
      const msg =
        i18n.language === "es"
          ? "¡Hola! 😊 Soy Sol. Puedo charlar un poco, pero mi misión es ayudarte con el calor y el WBGT. ¿Quieres que revise tu punto del mapa o te doy consejos rápidos?"
          : "Hey there! 😊 I'm Sol. I can chat a bit, but my mission is to help with heat and WBGT. Want me to check your map point or share quick tips?";
      addResponseMessage(msg);
      return;
    }

    try {
      setIsProcessing(true);
      toggleMsgLoader();

      const systemMessage = buildTextSystemMessage();
      const updatedHistory = [
        systemMessage,
        ...chatHistory,
        { role: "user", content: `${newMessage}\n\n${personaNudges}` },
      ];
      // Poda de historial
      const trimmedHistory = updatedHistory.slice(-1 - MAX_TURNS);

      const completion = await createChat(trimmedHistory, false, {
        temperature: 0.8,
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      });

      const reply = completion?.choices?.[0]?.message?.content;
      if (reply) addResponseMessage(reply);
      else
        addResponseMessage(t("Received unexpected response from the model."));
      setChatHistory(trimmedHistory);
    } catch (error) {
      console.error("Chat error:", error);
      const msg =
        i18n.language === "es"
          ? `Error: ${error.message || "Ha ocurrido un problema."}`
          : `Error: ${error.message || "Something went wrong."}`;
      addResponseMessage(msg);
    } finally {
      setIsProcessing(false);
      toggleMsgLoader();
    }
  };

  // Prompt de visión: reglas de idioma por botón visible en la UI
  const buildVisionSystem = (fallbackLang) => ({
    role: "system",
    content: `
You are Sol, a friendly climate assistant.
IMPORTANT LANGUAGE RULE:
- Inspect the screenshot UI. There is a language toggle button.
- If the button text reads "English", that means the app is currently in Spanish → reply in Spanish.
- If the button text reads "Español", that means the app is currently in English → reply in English.
- If neither is confidently visible, reply in ${
      fallbackLang === "es" ? "Spanish" : "English"
    } (fallback to current i18n language).
Behavior:
- Use Fahrenheit only.
- Keep it to 4–6 short sentences or 1 sentence + 2–3 bullets.
- Thresholds (F): Safe <72, Caution 72–<76, Warning 76–<80, Danger 80–<84, Extreme ≥84.
- First line: WBGT and category at the selected point.
- Then practical, varied tips (hydration, shade/rest, clothing, timing, vulnerable groups).
- Be warm, concise, and avoid repetition.
`.trim(),
  });

  const buildVisionUser = (imageDataUrl, formattedWBGTStr, categoryStr) => {
    // Hints por interacción
    styleRef.current = pick(styleHints);
    angleRef.current = pick(angleHints);

    const vp = `
Briefly interpret the heatmap: overall intensity (cool/moderate/hot), hotspots vs nearby cooler areas, and whether the selected point looks higher/lower than surroundings.
WBGT at the selected point: ${formattedWBGTStr}. Category: ${
      categoryStr ?? "unknown"
    }.
Style guidance: ${styleRef.current}. Also ${angleRef.current}.
Output format:
- First sentence: WBGT and category.
- Then 2–3 short bullets with varied wording.
`.trim();

    return {
      role: "user",
      content: [
        { type: "text", text: vp },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ],
    };
  };

  const handleScreenshotCaptured = async (imageDataUrl) => {
    // Localizado
    addResponseMessage(
      i18n.language === "es"
        ? "Analizando el mapa..."
        : "Analyzing the heatmap..."
    );
    toggleMsgLoader();
    setIsProcessing(true);

    try {
      const fallbackLang = i18n.language === "es" ? "es" : "en";
      const system = buildVisionSystem(fallbackLang);
      const user = buildVisionUser(imageDataUrl, formattedWBGT, category);

      const completion = await createChat([system, user], true, {
        temperature: 0.8,
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      });

      const reply = completion?.choices?.[0]?.message?.content;
      if (reply) addResponseMessage(reply);
      else
        addResponseMessage(t("Received unexpected response from the model."));
    } catch (error) {
      console.error("Error analyzing screenshot:", error);
      const msg =
        i18n.language === "es"
          ? `Error: ${error.message || "No se pudo analizar la captura."}`
          : `Error: ${error.message || "Failed to analyze the screenshot."}`;
      addResponseMessage(msg);
    } finally {
      toggleMsgLoader();
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

// import React, { useState, useEffect, useContext } from "react";
// import { AppContext } from "../../../Context";

// import {
//   Widget,
//   addResponseMessage,
//   toggleMsgLoader,
// } from "react-chat-widget-react-18";
// import "react-chat-widget-react-18/lib/styles.css";
// import ScreenshotButton from "./Screenshot";
// import "./Chatbox.css";

// import OpenAI from "openai";
// import { useTranslation } from "react-i18next";
// import i18n from "../../../i18n";

// // change this later to get acutal WBGT point value from app context

// const openai = new OpenAI({
//   apiKey: process.env.REACT_APP_OPENAI_API_KEY,
//   baseURL: "https://openrouter.ai/api/v1",
//   dangerouslyAllowBrowser: true, // <-- añade esto

//   defaultHeaders: {
//     "HTTP-Referer": process.env.REACT_APP_SITE_URL,
//     "X-Title": process.env.REACT_APP_SITE_TITLE,
//   },
// });

// const AIChat = ({ applicationRef, onOpenChange }) => {
//   const { selectedWBGTValue } = useContext(AppContext);
//   const wbgtValue =
//     selectedWBGTValue !== null
//       ? ((selectedWBGTValue - 273.15) * 9) / 5 + 32
//       : null;
//   const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);

//   const { t } = useTranslation();

//   // const VISION_MODEL = "meta-llama/llama-3.2-11b-vision-instruct:free";

//   const VISION_MODEL = "mistralai/mistral-small-3.2-24b-instruct:free";

//   const determineCategory = (valueF) => {
//     if (valueF === null || valueF === undefined) return null;
//     if (valueF < 72) return "Safe";
//     if (valueF < 76) return "Caution";
//     if (valueF < 80) return "Warning";
//     if (valueF < 84) return "Danger";
//     return "Extreme";
//   };

//   const formattedWBGT =
//     wbgtValue === null ? "unknown" : `${wbgtValue.toFixed(1)} °F`;
//   const category = determineCategory(wbgtValue);

//   // Randomized style/topic hints to diversify responses
//   const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

//   const styleHints = [
//     "use a friendly tone and vary sentence starts",
//     "be crisp and energetic; avoid repeating the same verbs",
//     "use encouraging tone with varied verbs; avoid repetition",
//     "write in plain, conversational Spanish if user writes in Spanish",
//     "mix one concise sentence plus 2 short bullets",
//     "use 3 compact sentences without bullets",
//   ];

//   const angleHints = [
//     "mention wind or shade if relevant",
//     "suggest a cooling strategy (hat, light clothing, misting)",
//     "add a pacing cue (work:rest ratio like 15:5 min for harder activity)",
//     "suggest checking vulnerable groups (kids, mayores, trabajadores al sol)",
//     "suggest optimal time window (e.g., before 10 am / after 6 pm)",
//     "if Safe, suggest staying hydrated but enjoying outdoor time",
//   ];

//   const chosenStyle = pick(styleHints);
//   const chosenAngle = pick(angleHints);

//   const visionPrompt = `
//   Use Fahrenheit only. Be helpful but concise (4–6 short sentences max).
//   WBGT at the selected point: ${formattedWBGT}. Category (gauge thresholds): ${
//     category ?? "unknown"
//   }.
//   Thresholds (F): Safe <72, Caution 72–<76, Warning 76–<80, Danger 80–<84, Extreme ≥84.
//   Briefly interpret the heatmap you see: mention overall intensity (cool/moderate/hot), any hotspots vs cooler areas nearby, and whether the selected point looks higher/lower than surroundings.
//   Then give practical guidance for outdoor activity for this category (hydration, shade/rest pacing, time-of-day tips, vulnerable groups). Avoid extra background.
//   Style guidance: ${chosenStyle}. Also ${chosenAngle}.
//   Output format:
//   - First sentence: WBGT and category.
//   - Then 2–3 short bullets with varied wording.
//   `;

//   useEffect(() => {
//     console.log("AIChat component mounted");
//   }, []);

//   useEffect(() => {
//     const handleLanguageChange = () => {
//       if (welcomeMessageShown) {
//         addResponseMessage(t("Welcome Message"));
//       }
//     };

//     i18n.on("languageChanged", handleLanguageChange);

//     return () => {
//       i18n.off("languageChanged", handleLanguageChange);
//     };
//   }, [t, welcomeMessageShown]);

//   const handleWidgetToggle = (isOpen) => {
//     if (typeof onOpenChange === "function") {
//       onOpenChange(isOpen);
//     }
//     setIsChatOpen(isOpen);

//     // Toggle a body class so mobile CSS can react when chat is open
//     const body = document?.body;
//     if (body) {
//       if (isOpen) {
//         body.classList.add("chat-open");
//       } else {
//         body.classList.remove("chat-open");
//       }
//     }
//     if (isOpen && !welcomeMessageShown) {
//       addResponseMessage(t("Welcome Message"));
//       setWelcomeMessageShown(true);
//     }
//   };

//   // Ensure body class is removed on unmount
//   useEffect(() => {
//     return () => {
//       document?.body?.classList?.remove("chat-open");
//     };
//   }, []);

//   const handleNewUserMessage = async (newMessage) => {
//     if (isProcessing) return;

//     try {
//       setIsProcessing(true);
//       toggleMsgLoader();

//       const systemMessage = {
//         role: "system",
//         content: `
//       You are Sol, a climate data assistant. Be clear and practical while varying your wording.
//       Use Fahrenheit only. The user's current WBGT is ${formattedWBGT} and falls in the ${
//           category ?? "unknown"
//         } section according to thresholds (F): Safe <72, Caution 72–<76, Warning 76–<80, Danger 80–<84, Extreme ≥84.
//       In one opening line, define WBGT very briefly (heat stress in sun), state the value and category. Then provide concise, actionable recommendations with varied phrasing. Avoid repeating the same tips every time; rotate focus between hydration, shade/rest cadence, clothing, timing, intensity, and vulnerable groups. ${chosenStyle}. Also ${chosenAngle}.
//       Respond in 3–6 short sentences or 1 sentence plus 2–4 bullets. Do not exceed 900 characters.
//       `,
//       };

//       const updatedHistory = [
//         systemMessage,
//         ...chatHistory,
//         { role: "user", content: newMessage },
//       ];

//       setChatHistory(updatedHistory);

//       const completion = await openai.chat.completions.create({
//         model: VISION_MODEL,
//         messages: updatedHistory,
//         temperature: 0.9,
//         top_p: 0.9,
//         presence_penalty: 0.4,
//         frequency_penalty: 0.4,
//       });

//       const reply = completion?.choices?.[0]?.message?.content;
//       if (reply) {
//         addResponseMessage(reply);
//       } else {
//         addResponseMessage("Received unexpected response from the model.");
//       }
//     } catch (error) {
//       console.error("Chat error:", error);
//       addResponseMessage(`Error: ${error.message}`);
//     } finally {
//       setIsProcessing(false);
//       toggleMsgLoader();
//     }
//   };

//   // ESTA FUNCIÓN SE ADAPTARÁ EN EL SIGUIENTE PASO PARA MANDAR IMÁGENES
//   const handleScreenshotCaptured = async (imageDataUrl) => {
//     console.log("Screenshot capture started");
//     console.log("🖼️ Screenshot base64:", imageDataUrl);

//     addResponseMessage("Analyzing the heatmap...");
//     toggleMsgLoader(); // Start loading state
//     setIsProcessing(true);

//     try {
//       const imageContent = {
//         role: "user",
//         content: [
//           {
//             type: "text",
//             text: visionPrompt.trim(),
//           },
//           {
//             type: "image_url",
//             image_url: {
//               url: imageDataUrl, // base64 inline image
//             },
//           },
//         ],
//       };

//       const completion = await openai.chat.completions.create({
//         model: VISION_MODEL,
//         messages: [imageContent],
//         temperature: 0.9,
//         top_p: 0.9,
//         presence_penalty: 0.4,
//         frequency_penalty: 0.4,
//       });

//       const reply = completion?.choices?.[0]?.message?.content;
//       if (reply) {
//         addResponseMessage(reply);
//       } else {
//         addResponseMessage("Received unexpected response from the model.");
//       }
//     } catch (error) {
//       console.error("Error analyzing screenshot:", error);
//       addResponseMessage(`Error: ${error.message}`);
//     } finally {
//       toggleMsgLoader(); // Stop loading
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <>
//       <Widget
//         handleNewUserMessage={handleNewUserMessage}
//         handleToggle={handleWidgetToggle}
//         title="Sol"
//         subtitle={t("Your WBGT data AI assistant")}
//       />

//       <div className="screenshot-button-container">
//         <ScreenshotButton
//           applicationRef={applicationRef}
//           onCapture={handleScreenshotCaptured}
//           isProcessing={isProcessing}
//         />
//       </div>
//     </>
//   );
// };

// export default AIChat;
