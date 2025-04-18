
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
    minWidth: 870,
    maxWidth: 980,
    minHeight: 1800,
    maxHeight: 2000,
    styleAssets: {
      texture: "horizontal",
      molding: "berlin"
    },
    sidescreenOptions: ["solid", "clear", "berlin", "midrail", "half-clear-top","half-clear-bottom"],
    glazingOptions: ["clear","adina"],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-mid": "letterplate-mid-A",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A"
    },
    handleOptions: ["lever"]
  },
];

// Configuration choices
const configurations = [
  { value: "single", name: "Single Door" },
  { value: "single-left", name: "Left Sidescreen" },
  { value: "single-right", name: "Right Sidescreen" },
  { value: "single-both", name: "Left & Right Sidescreens" }
];


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
  "Rosewood": { color: "rgb(84, 37, 33)", texture: getImageURL("woodgrain"), textureBlend: "multiply"},
  "Golden Oak": {color: "rgb(170, 104, 52)",texture: getImageURL("woodgrain"),textureBlend: "multiply"},
  "Anthracite Grey": {color: "rgb(69,69,74)",texture: null,textureBlend: "multiply"},
  "Chartwell Green": {color: "rgb(165, 194, 172)",texture: null, textureBlend: "multiply"}
};

// Separate definitions for style-based assets
// 1) Textures
const textureDefs = [
  { id: "none", image: null },
  {
    id: "horizontal",
    image: "horizontal",
    marginX: 35,
    marginY: 20
  }
];

// 2) Moldings
// The xFactor, yFactor, widthFactor, heightFactor specify how it’s placed on the main door panel.
const moldingDefs = [
  {
    id: "berlin",
    image: "berlin",
    width: 75,
    height: 260,
    align: "center",
    offsetY: 250
  }
  // Additional moldings ...
];


// 3) Glazing definitions
const glazingDefs = [
  {
    id: "adina",
    image: "adina",
    width: 48,
    height: 232,
    align: "center",   
    offsetY: 266      
},
{
  id: "clear",
  image: "clear",
  width: 48,
  height: 230,
  align: "center",   
  offsetY: 266        
}
];


const sidescreenStyleDefs = [
  {
    id: "berlin",
    name: "Berlin",
    molding: "berlin",
    glazing: "match",
    texture: "match"
  },
  {
    id: "clear",
    name: "Clear",
    molding: null,
    glazing: "clear-full",
    texture: "null"
  },
  {
    id: "solid",
    name: "Solid",
    molding: null,
    glazing: null,
    texture: "match"
  },
  {
    id: "midrail",
    name: "Midrail",
    glazing: null,
    molding: null,
    texture: "horizontal",
    panelElements: [
    {
      id: "half-divider",
      rect: {
        x: 0,
        width: "full",
        height: 35,
        align: "centerY"
      },
      options: {
        imageURL: getImageURL("frame-top"),
        flipHorizontal: false,
        flipVertical: false
      }
    }
  ]
  },
{
  id: "half-clear-top",
  name: "Half Clear Top",
  glazing: "half-clear-top",
  molding: null,
  texture: "horizontal",
  panelElements: [
  {
    id: "half-divider",
    rect: {
      x: 0,
      width: "full",
      height: 35,
      align: "centerY"
    },
    options: {
      imageURL: getImageURL("frame-top"),
      flipHorizontal: false,
      flipVertical: false
    }
  }
]
},
{
  id: "half-clear-bottom",
  name: "Half Clear Bottom",
  glazing: "half-clear-bottom",
  molding: null,
  texture: "horizontal",
  panelElements: [
    {
      id: "half-divider",
      rect: {
        x: 0,
        width: "full",
        height: 35,
        align: "centerY"
      },
      options: {
        imageURL: getImageURL("frame-top"),
        flipHorizontal: false,
        flipVertical: false
      }
    }
  ]
}
];

const sidescreenMoldingDefs = [
  {
    id: "berlin",
    image: "berlin",
    width: 75,
    height: 260,
    align: "center",
    offsetY: 250
  }
];



const sidescreenGlazingDefs = [
  {
    id: "clear-full",
    image: "clear",
    margin: 35
  },
  {
    id: "half-clear-top",
    image: "clear",
    halfPanelMargins: true,
    clearPosition: "top"
  },
  {
    id: "half-clear-bottom",
    image: "clear",
    halfPanelMargins: true,
    clearPosition: "bottom"
  },
  {
    id: "clear",
    image: "clear",
    width: 48,
    height: 232,
    align: "center",   
    offsetY: 266
  },
  {
    id: "adina",
    image: "adina",
    width: 48,
    height: 232,
    align: "center",   
    offsetY: 266
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
  {
    id: "letterplate-mid-A",
    width: 100,
    height: 25,
    align: "center",          // can be "left", "right", or "center"
    offsetY: 200              // from bottom
  },
  {
    id: "letterplate-low-A",
    width: 150,
    height: 35,
    align: "center",
    offsetY: 300
  },
  {
    id: "letterplate-ground-A",
    width: 150,
    height: 35,
    align: "center",
    offsetY: 200
  }
];

// Coordinates for handles
const handleDefs = [
  {
    id: "lever",
    width: 40,
    height: 65,
    align: "right",           // can be "left" or "right"
    offsetX: 22,              // from edge
    offsetY: 250              // from bottom
  }
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

// Range selection for the start screen
export const state = {
  currentStep: 1,
  stepsCompleted: Array(6).fill(true),
  selectedRange: doorRanges[0],
  selectedStyle: "berlin",
  selectedConfiguration: "single-left",
  selectedGlazing: "clear",
  selectedLetterplate: null,
  selectedHardwareColor: "gold",
  selectedHandle: "lever",
  selectedExternalFinish: finishes[2],
  selectedInternalFinish: finishes[0],
  selectedLeftPanel: null,
  selectedRightPanel: null,
  selectedSideScreenStyle: "berlin",
  backgroundImg: null,
  currentView: "external",

};


export {
    configurations,
    doorCollections,
    doorRanges,
    doorStyles,
    imageOverloads,
    styleDisplayNames,
    glazingDefs,
    finishDisplayNames,
    finishColorMap,
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
    handleOptions,
    sidescreenMoldingDefs,
    sidescreenGlazingDefs,
    sidescreenStyleDefs,
    

};

