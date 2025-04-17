import { imageOverloads } from "./data.js";
import { state, stepIDs } from "./data.js";
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

// Mirror the final canvas horizontally
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
    // This is the fix: go back to start screen
    document.getElementById("startScreen").classList.remove("hidden");
    document.querySelector(".door-designer-container").style.display = "none";
  }
}
export {
    getImageURL,
    loadImage,
    tintImage,
    mirrorCanvas,
    goToNextStep,
    goToPreviousStep
};


