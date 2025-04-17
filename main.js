import { updateCanvasPreview } from "./canvasBuilder.js";
import { compositeAndSave } from "./canvasBuilder.js";
import { compositeAndSaveVisualiser } from "./visualiser.js";
import { initializeDoorOverlay } from "./visualiser.js";
import { updateDoorOverlayImage } from "./visualiser.js";
import { updateBackgroundCanvas } from "./visualiser.js";
import { getImageURL } from "./utils.js";
import { doorRanges } from "./data.js";


/*"use strict";


/* 
   For door color “finishes,” we still have the original array & mapping.
   This controls the door’s base color & optional texture overlay 
   (woodgrain, smooth, etc. for the main door panel).
*/
const finishes = [
  "Brilliant White",
  "Rosewood",
  "Golden Oak",
  "Anthracite Grey",
  
];
const finishDisplayNames = {
  "Brilliant White": "Brilliant White",
  "Rosewood": "Rosewood",
  "Golden Oak": "Golden Oak",
  "Anthracite Grey": "Anthracite Grey",
  "Chartwell Green": "Chartwell Green"
};
const finishColorMap = {
  "Brilliant White": { color: "rgb(240,240,240)", texture: null, textureBlend: "source-over" },
  "Rosewood": { color: "rgb(42, 21, 19)", texture: getImageURL("woodgrain"), textureBlend: "multiply"},
  "Golden Oak": {color: "rgb(170, 104, 52)",texture: getImageURL("woodgrain"),textureBlend: "multiply"},
  "Anthracite Grey": {color: "rgb(69,69,74)",texture: null,textureBlend: "multiply"},
  "Chartwell Green": {color: "rgb(165, 194, 172)",texture: null, textureBlend: "multiply"}
};

// Separate definitions for style-based assets
// 1) Textures
const textureDefs = [
  { id: "none", image: null },
  { id: "woodgrain", image: "woodgrain"}
];

// 2) Moldings
// The xFactor, yFactor, widthFactor, heightFactor specify how it’s placed on the main door panel.
const moldingDefs = [
  {
    id: "berlin",
    image: "berlin",
    xFactor: 0.38,
    yFactor: 0.15,
    widthFactor: 0.24,
    heightFactor: 0.44
  }
  // Additional moldings ...
];

// 3) Glazing definitions
const glazingDefs = [
  {
    id: "clear",
    image: "clear",
    xFactor: 0.42,
    yFactor: 0.168,
    widthFactor: 0.16,
    heightFactor: 0.40
  },
  {
    id: "adina",
    image: "adina",
    xFactor: 0.42,
    yFactor: 0.168,
    widthFactor: 0.16,
    heightFactor: 0.40
  }
];

// Letterplates, hardware, etc.
const letterplateDisplayNames = {
  "letterplate-none": "None",
  "letterplate-mid": "Mid",
  "letterplate-low": "Low",
  "letterplate-ground": "Ground"
};

const hardwareColorOptions = ["gold", "black", "chrome", "graphite"];
const hardwareColorDisplayNames = {
  gold: "Gold",
  black: "Black",
  chrome: "Chrome",
  graphite: "Graphite"
};

const handleOptions = ["lever"];
const handleDisplayNames = { lever: "Lever" };

// Coordinates for letterplates
const letterplateDefs = [
  { id: "letterplate-mid-A", coordinates: { x: 125, y: 595 }, width: 150, height: 35 },
  { id: "letterplate-low-A", coordinates: { x: 125, y: 650 }, width: 150, height: 35 },
  { id: "letterplate-ground-A", coordinates: { x: 125, y: 710 }, width: 150, height: 35 },
  // Add any other variants
];

// Coordinates for handles
const handleDefs = [
  { id: "lever", coordinates: { x: 309, y: 380 }, width: 60, height: 100 }
];

const hardwareColorMap = {
  gold: "rgba(221, 208, 166, 0.89)",
  black: "rgba(27, 27, 27, 0.90)",
  chrome: "rgba(228, 226, 221, 0.65)",
  graphite: "rgba(108, 108, 106, 0.65)"
};

const glazingDisplayNames = {
  clear: "Clear",
  adina: "Adina"
};

// Steps & wizard state
const stepIDs = [
  "configuration-step",
  "style-step",
  "sidescreen-style-step",
  "finish-step",
  "glazing-step",
  "hardware-step"
];
let currentStep = 1;
let stepsCompleted = Array(stepIDs.length).fill(true);

let selectedConfiguration = "single";
let selectedStyle = "berlin";
let selectedSideScreenStyle = "none";
let selectedExternalFinish = finishes[2];
let selectedInternalFinish = finishes[0];
let selectedGlazing = "adina";
let selectedLetterplate = "none";
let selectedHardwareColor = hardwareColorOptions[0];
let selectedHandle = "lever";
let currentView = "external";

// Range selection for the start screen
let selectedRange = doorRanges[0];

// For background images in the visualiser
let backgroundImg = null;


/*
   ---------------------------------------------
   Step Navigation & UI
   ---------------------------------------------
*/
function updateNavigationControls() {
  const nextBtn = document.getElementById("nextBtn");
  if (currentStep === stepIDs.length - 1) {
    nextBtn.disabled = true;
    nextBtn.style.opacity = 0.4;
  } else {
    nextBtn.disabled = !stepsCompleted[currentStep];
    nextBtn.style.opacity = stepsCompleted[currentStep] ? 1 : 0.4;
  }
  updateStepMenuAccessibility();
}


function isStepAccessible(index) {
  return true; // or apply logic if you want them in strict order
}

function updateStepMenuAccessibility() {
  document.querySelectorAll(".step-menu-item").forEach((item, index) => {
    if (!isStepAccessible(index) && index !== currentStep) {
      item.classList.add("disabled");
    } else {
      item.classList.remove("disabled");
    }
  });
}

function showStep(index) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("step-active"));
  const activeStep = document.getElementById(stepIDs[index]);
  if (activeStep) activeStep.classList.add("step-active");
  updateStepMenu(index);
}

function updateStepMenu(idx) {
  document.querySelectorAll(".step-menu-item").forEach((item, i) => {
    item.classList.toggle("active", i === idx);
  });
}

function goToNextStep() {
  if (currentStep < stepIDs.length - 1) {
    currentStep++;
    showStep(currentStep);
    updateNavigationControls();
  }
}

function goToPreviousStep() {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
    updateNavigationControls();
  } else {
    // This is the fix: go back to start screen
    document.getElementById("startScreen").classList.remove("hidden");
    document.querySelector(".door-designer-container").style.display = "none";
  }
}

export {
  goToNextStep,
  goToPreviousStep,
  showStep,
  updateNavigationControls,
  updateStepMenuAccessibility,
  isStepAccessible
}