
import { imageOverloads, doorStyles, state, stepIDs } from "./data.js";
import { showStep, updateNavigationControls } from "./main.js";

/* 
   ---------------------------------------------
   Utility Functions
   ---------------------------------------------
*/
function getImageURL(filename) {
  const baseURL = "https://crs-kd.github.io/door-designer/";
  const filePart = imageOverloads[filename] ? imageOverloads[filename] : filename;
  if (!filePart) return null;
  return (baseURL + filePart + ".png").toLowerCase();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image: " + url));
    img.src = url;
  });
}

function tintImage(img, tintColor) {
  const offscreen = document.createElement("canvas");
  offscreen.width = img.width;
  offscreen.height = img.height;
  const ctx = offscreen.getContext("2d");
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = tintColor;
  ctx.fillRect(0, 0, offscreen.width, offscreen.height);
  ctx.globalCompositeOperation = "source-over";
  return offscreen;
}

function mirrorCanvas(canvas) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempCanvas.getContext("2d").drawImage(canvas, 0, 0);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
}

function goToNextStep() {
  if (state.currentStep < stepIDs.length - 1) {
    state.currentStep++;
    showStep(state.currentStep);
    updateNavigationControls();
  }
}

function goToPreviousStep() {
  if (state.currentStep > 0) {
    state.currentStep--;
    showStep(state.currentStep);
    updateNavigationControls();
  } else {
    document.getElementById("startScreen").classList.remove("hidden");
    document.querySelector(".door-designer-container").style.display = "none";
  }
}

function getScaledPanelSize(inputWidthMM, inputHeightMM) {
  const baseHeightMM = 1980;
  const baseDisplayHeight = 600;
  const scaleFactor = baseDisplayHeight / baseHeightMM;
  return {
    width: Math.round(inputWidthMM * scaleFactor),
    height: Math.round(inputHeightMM * scaleFactor),
    scaleFactor
  };
}

function getClampedSize(inputWidth, inputHeight, minW, maxW, minH, maxH) {
  return {
    width: Math.min(Math.max(inputWidth, minW), maxW),
    height: Math.min(Math.max(inputHeight, minH), maxH)
  };
}

function getDoorPanelDimensionsFromInput() {
  const widthInput = parseInt(document.getElementById("doorWidthInput").value);
  const heightInput = parseInt(document.getElementById("doorHeightInput").value);
  const style = state.selectedStyle;
  const styleObj = doorStyles.find(s => s.name === style);
  const minW = styleObj?.minWidth || 600;
  const maxW = styleObj?.maxWidth || 1200;
  const minH = styleObj?.minHeight || 1800;
  const maxH = styleObj?.maxHeight || 2200;
  const clamped = getClampedSize(widthInput, heightInput, minW, maxW, minH, maxH);
  const scaled = getScaledPanelSize(clamped.width, clamped.height);
  return {
    inputMM: clamped,
    displayPixels: { width: scaled.width, height: scaled.height },
    scaleFactor: scaled.scaleFactor
  };
}

function getSidescreenDimensionsFromInput() {
  const leftWidth = parseInt(document.getElementById("leftSidescreenWidthInput").value);
  const rightWidth = parseInt(document.getElementById("rightSidescreenWidthInput").value);
  const height = parseInt(document.getElementById("doorHeightInput").value); // match door

  const scaled = getScaledPanelSize(1, height); // only height matters
  return {
    left: {
      inputMM: leftWidth,
      displayPixels: Math.round(leftWidth * scaled.scaleFactor)
    },
    right: {
      inputMM: rightWidth,
      displayPixels: Math.round(rightWidth * scaled.scaleFactor)
    },
    displayHeight: scaled.height,
    scaleFactor: scaled.scaleFactor
  };
}

export {
  getImageURL,
  loadImage,
  tintImage,
  mirrorCanvas,
  goToNextStep,
  goToPreviousStep,
  getDoorPanelDimensionsFromInput,
  getSidescreenDimensionsFromInput,
};
