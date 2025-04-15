import React, { useState } from "react";
import html2canvas from "html2canvas";
import { BiCamera } from "react-icons/bi";
import { toggleWidget } from "react-chat-widget-react-18";

const ScreenshotButton = ({ applicationRef, onCapture, isProcessing }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async () => {
    if (isCapturing || isProcessing) return;

    if (!applicationRef || !applicationRef.current) {
      alert(
        "Unable to capture screenshot: application reference not provided."
      );
      return;
    }

    try {
      setIsCapturing(true);

      // Close the chatbox if open
      const chatWidget = document.querySelector(".rcw-widget-container");
      let closedChat = false;
      if (chatWidget && chatWidget.classList.contains("rcw-opened")) {
        toggleWidget();
        closedChat = true;
      }

      // Always wait a bit to allow layout changes (e.g., chat closing) to settle
      await new Promise((resolve) =>
        setTimeout(resolve, closedChat ? 300 : 100)
      );

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: true,
        scale: 1,
        ignoreElements: (element) =>
          element.classList.contains("rcw-widget-container"),
      });

      const imageDataUrl = canvas.toDataURL("image/png");
      onCapture(imageDataUrl);
      console.log(imageDataUrl);
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      alert("Failed to capture screenshot. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  // Determine if button should be disabled
  const isDisabled = isCapturing || isProcessing;

  return (
    <button
      onClick={captureScreenshot}
      className={`screenshot-button ${
        isDisabled ? "screenshot-button-disabled" : ""
      }`}
      disabled={isDisabled}
    >
      {isCapturing ? (
        "Capturing..."
      ) : (
        <BiCamera size={24} color={isDisabled ? "#cccccc" : "white"} />
      )}
    </button>
  );
};

export default ScreenshotButton;
