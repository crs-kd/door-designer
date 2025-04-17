
import { getImageURL } from "./utils.js";
/* 
   ---------------------------------------------
   Global Data & Definitions
   ---------------------------------------------
*/

// This object allows you to override certain images by specifying alternative filenames.
// If you don't need overrides, leave it empty.
const imageOverloads = {};

// Door ranges and collections
const doorRanges = ["Lorimer", "Timberluxe"];
const doorCollections = ["Allure", "Elegance", "Classic", "Country", "Urban"];

// doorStyles: each style references a styleAssets object, e.g. { texture, molding }
// We keep letterplateOptions, handleOptions, and an array of glazingOptions.
const doorStyles = [
  {
    range: "Lorimer",
    collection: "Allure",
    name: "berlin",
    styleAssets: {
      texture: "horizontal",
      molding: "berlin"
    },
    glazingOptions: ["clear", "adina"],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-mid": "letterplate-mid-A",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A"
    },
    handleOptions: ["lever"]
  },
  {
    range: "Timberluxe",
    collection: "Country",
    name: "Fuji",
    styleAssets: {
      texture: "none",
      molding: "berlin"
    },
    glazingOptions: ["clear", "adina"],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-mid": "letterplate-mid-A",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A"
    },
    handleOptions: ["lever"]
  }
];

// Configuration choices
const configurations = [
  { value: "single", name: "Single Door" },
  { value: "single-left", name: "Left Sidescreen" },
  { value: "single-right", name: "Right Sidescreen" },
  { value: "single-both", name: "Left & Right Sidescreens" }
];

let selectedLeftPanel = "none";
let selectedRightPanel = "none";

// Optional display name lookups
const styleDisplayNames = {
  berlin: "Berlin"
  // Add more if needed
};

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

// let currentStep = 1;
// let stepsCompleted = Array(stepIDs.length).fill(true);

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
export const state = {
  currentStep: 1,
  stepsCompleted: Array(6).fill(true),
  selectedRange: doorRanges[0],
  selectedStyle: "berlin",
  selectedConfiguration: "single",
  selectedGlazing: "adina",
  selectedLetterplate: "none",
  selectedHardwareColor: "gold",
  selectedHandle: "lever",
  selectedExternalFinish: finishes[2],
  selectedInternalFinish: finishes[0],
  selectedLeftPanel: "none",
  selectedRightPanel: "none",
  selectedSideScreenStyle: "none",
  backgroundImg: null,

};


export {
    configurations,
    doorCollections,
    doorRanges,
    doorStyles,
    imageOverloads,
    selectedLeftPanel,
    selectedRightPanel,
    selectedStyle,
    styleDisplayNames,
    glazingDefs,
    finishDisplayNames,
    finishColorMap,
    selectedExternalFinish,
    selectedInternalFinish,
    selectedGlazing,
    selectedLetterplate,
    selectedHardwareColor,
    selectedHandle,
    selectedConfiguration,
    selectedSideScreenStyle,
    currentView,
    handleDefs,
    hardwareColorMap,
    moldingDefs,
    letterplateDefs,
    textureDefs,
    hardwareColorDisplayNames,
    handleDisplayNames,
    letterplateDisplayNames,
    glazingDisplayNames,
    hardwareColorOptions,
    stepIDs,
    finishes,
    handleOptions

};

