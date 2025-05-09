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
const doorCollections = [
  "Lorimer",
  "Elegance",
  "Allure",
  "Classic",
  "Country",
  "Urban",
];

// doorStyles: each style references a styleAssets object, e.g. { texture, molding }
// We keep letterplateOptions, handleOptions, and an array of glazingOptions.
const doorStyles = [
  {
    range: "Lorimer",
    collection: "Allure",
    name: "berlin",
    minWidth: 733,
    maxWidth: 1000,
    minHeight: 1800,
    maxHeight: 2233,
    styleAssets: {
      texture: "horizontal",
      molding: "short-centre",
    },
    sidescreenOptions: ["solid", "clear", "midrail"],
    glazingLayout: {
      imageModifier: null,
      width: 175,       
      height: 885,      
      offsetX: 0,
      offsetY: 825,
      align: "center",         // "left" | "center" | "right"
      verticalAlign: "bottom"     // "top" | "centre" | "bottom"
    },

    glazingOptions: [
      "clear",
      "adina",
      "eden",
      "graphite",
      "harmony",
      "iris",
      "joy",
      "murano",
      "satin",
      "virtue",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-mid": "letterplate-mid-A",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "lisbon",
    minWidth: 653,
    maxWidth: 1000,
    minHeight: 2023,
    maxHeight: 2233,
    styleAssets: {
      texture: "vertical",
      molding: "full-centre",
    },
    sidescreenOptions: [, "solid", "clear", "midrail"],
    glazingLayout: {
      imageModifier: "long",
      width: 175,       
      height: 1185,      
      offsetX: 0,
      offsetY: 525,
      align: "center",         // "left" | "center" | "right"
      verticalAlign: "bottom"     // "top" | "centre" | "bottom"
    },
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "madrid",
    minWidth: 870,
    maxWidth: 980,
    minHeight: 1800,
    maxHeight: 2000,
    styleAssets: {
      texture: null,
      molding: "squares-centre",
    },
    sidescreenOptions: [, "solid", "clear", "midrail"],
    glazingLayout: {
      imageModifier: "square",
      width: 265,       
      height: 1275,      
      offsetX: 0,
      offsetY: 480,
      align: "center",         // "left" | "center" | "right"
      verticalAlign: "bottom",     // "top" | "centre" | "bottom"
      elements: [
        {
          id: "first-glass",
          rect: { x: 45, y: 45, width: 176, height: 111 }
        },
        {
          id: "second-glass",
          rect: { x: 45, y: 403.33, width: 176, height: 111 }
        },
        {
          id: "third-glass",
          rect: { x: 45, y: 761.67, width: 176, height: 111 }
        },
        {
          id: "forth-glass",
          rect: { x: 45, y: 1120, width: 176, height: 111 }
        },
        
      ]
    },
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
    ],


    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "miami",
    minWidth: 870,
    maxWidth: 980,
    minHeight: 1800,
    maxHeight: 2000,
    styleAssets: {
      texture: "vertical",
      molding: "full-left",
    },
    sidescreenOptions: [, "solid", "clear", "midrail"],
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "paris",
    minWidth: 870,
    maxWidth: 980,
    minHeight: 1800,
    maxHeight: 2000,
    styleAssets: {
      texture: "horizontal",
      molding: "full-left",
    },
    sidescreenOptions: [, "solid", "clear", "midrail"],
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "rio",
    minWidth: 653,
    maxWidth: 1000,
    minHeight: 2023,
    maxHeight: 2233,
    styleAssets: {
      texture: "horizontal",
      molding: "full-centre",
    },
    sidescreenOptions: [, "solid", "clear", "midrail"],
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "sydney",
    minWidth: 653,
    maxWidth: 1000,
    minHeight: 2023,
    maxHeight: 2233,
    styleAssets: {
      texture: null,
      molding: "full-centre",
    },
    sidescreenOptions: [, "solid", "clear", "midrail"],
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "tokyo",
    minWidth: 733,
    maxWidth: 1000,
    minHeight: 1800,
    maxHeight: 2233,
    styleAssets: {
      texture: null,
      molding: "short-centre",
    },
    sidescreenOptions: [, "solid", "clear", "midrail"],
    glazingOptions: [
      "clear",
      "adina",
      "eden",
      "graphite",
      "harmony",
      "iris",
      "joy",
      "murano",
      "satin",
      "virtue",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-mid": "letterplate-mid-A",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "venice",
    minWidth: 653,
    maxWidth: 1000,
    minHeight: 2023,
    maxHeight: 2233,
    styleAssets: {
      texture: null,
      molding: "full-right",
    },
    sidescreenOptions: [, "solid", "clear", "midrail"],
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "vienna",
    minWidth: 653,
    maxWidth: 1000,
    minHeight: 2023,
    maxHeight: 2233,
    styleAssets: {
      texture: null,
      molding: "squares-left",
    },
    sidescreenOptions: [, "solid", "clear", "midrail"],
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A",
    },
    handleOptions: ["lever"],
  },
];

// Configuration choices
const configurations = [
  { value: "single", name: "Single Door" },
  { value: "single-left", name: "Left Sidescreen" },
  { value: "single-right", name: "Right Sidescreen" },
  { value: "single-both", name: "Left & Right Sidescreens" },
];

// Optional display name lookups
const styleDisplayNames = {
  lorimer: "Lorimer",
  berlin: "Berlin",
  lisbon: "Lisbon",
  madrid: "madrid",
  miami: "Miami",
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
  Rosewood: "Rosewood",
  "Golden Oak": "Golden Oak",
  "Anthracite Grey": "Anthracite Grey",
  "Chartwell Green": "Chartwell Green",
};
const finishColorMap = {
  "Brilliant White": {
    color: "rgb(240,240,240)",
    texture: null,
    textureBlend: "source-over",
  },
  Rosewood: {
    color: "rgb(84, 37, 33)",
    texture: getImageURL("woodgrain"),
    textureBlend: "multiply",
  },
  "Golden Oak": {
    color: "rgb(124, 73, 34)",
    texture: getImageURL("woodgrain"),
    textureBlend: "overlay",
  },
  "Anthracite Grey": {
    color: "rgb(69,69,74)",
    texture: null,
    textureBlend: "multiply",
  },
  "Chartwell Green": {
    color: "rgb(165, 194, 172)",
    texture: null,
    textureBlend: "multiply",
  },
};

// Separate definitions for style-based assets
// 1) Textures
const textureDefs = [
  { id: "none", image: null },
  {
    id: "horizontal",
    image: "allure-horizontal",
    marginX: 35,
    marginY: 10,
    offsetX: 0,
    offsetY: -3,
  },
  {
    id: "vertical",
    image: "allure-vertical",
    marginX: 35,
    marginY: 28,
    offsetX: 0,
    offsetY: 5,
  },
];

// 2) Moldings

const moldingDefs = [
  {
    id: "RD4",
    widthFactor: 1,
    height: 75,
    align: "center",
    verticalAlign: "centre",
    offsetX: 0,
    offsetY: 75,
    mask: false,
    elements: [
      {
        id: "top-transom",
        rect: { x: 0, y: 0, widthFactor: 1, height: 20 },
        options: { imageURL: getImageURL("transom"), flipVertical: false },
      },
      {
        id: "bottom-transom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 20 },
        options: { imageURL: getImageURL("transom"), flipVertical: true },
      },
      {
        id: "left-mid-frame",
        rect: { x: 0, y: 0, width: 35, heightFactor: 1 },
        options: { imageURL: getImageURL("frame-y") },
      },
      {
        id: "right-mid-frame",
        rect: { x: "right", y: 0, width: 35, heightFactor: 1 },
        options: { imageURL: getImageURL("frame-y"), flipHorizontal: true },
      },
      {
        id: "left-top-transom-end",
        rect: { x: 0, y: 0, width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipVertical: false },
      },
      {
        id: "right-top-transom-end",
        rect: { x: "right", y: 0, width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipHorizontal: true },
      },
      {
        id: "left-bottom-transom-end",
        rect: { x: 0, y: "bottom", width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipVertical: false },
      },
      {
        id: "right-bottm-transom-end",
        rect: { x: "right", y: "bottom", width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipHorizontal: true },
      },
    ],
  },
  {
    id: "short-centre",
    width: 265,
    height: 975,
    align: "center", // "left" | "right" | "center"
    offsetY: 780,
    elements: [
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },

  {
    id: "full-centre",
    width: 265,
    height: 1275,
    align: "center", // "left" | "right" | "center"
    offsetY: 480,
    elements: [
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },

  {
    id: "full-left",
    width: 265,
    height: 1275,
    align: "left", // "left" | "right" | "center"
    offsetX: 180,
    offsetY: 480,
    elements: [
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },
  {
    id: "full-right",
    width: 265,
    height: 1275,
    align: "right", // "left" | "right" | "center"
    offsetX: -180,
    offsetY: 480,
    elements: [
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },

  {
    id: "squares-centre",
    width: 265,
    height: 1275,
    align: "centre", // "left" | "right" | "center"
    offsetY: 480,
    elements: [
      // First
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: 155, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:0,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:0,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 155, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 155, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      // Second
      {
        id: "allure-x-top",
        rect: { x: 0, y: 358.33, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
        {
        id: "allure-x-bottom",
        rect: { x: 0, y: 513.33, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:358.33,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:358.33,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 358.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 358.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 513.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 513.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      // Third
      {
        id: "allure-x-top",
        rect: { x: 0, y: 716.67, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: 871.67, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:716.67,  width: 45, height: 199 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:716.67,  width: 45, height: 199 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 716.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 716.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 871.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 871.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      // Forth
      {
        id: "allure-x-top",
        rect: { x: 0, y: 1075, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: 1230, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:1075,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:1075,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 1075, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 1075, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 1230, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 1230, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },
];

// 3) Glazing definitions
const glazingDefs = [

  // Adina Glass
  {
    id: "adina",
    image: "adina",
  },
  // Clear Glass
  {
    id: "clear",
    image: "clear",
  },
  // Eden Glass
  {
    id: "eden",
    image: "eden",
  },
    // Graphite Glass
    {
      id: "graphite",
      image: "graphite",
    },
  // Harmony Glass
  {
    id: "harmony",
    image: "harmony",
  },
  // Iris Glass
  {
    id: "iris",
    image: "iris",
  },
  // Joy Glass
  {
    id: "joy",
    image: "joy",
  },
  // Murano Glass
  {
    id: "murano",
    image: "murano",
  },
  // Satin Glass
  {
    id: "satin",
    image: "satin",
  },
  // Virtue Glass
  {
    id: "virtue",
    image: "virtue",
  },
];

const sidescreenStyleDefs = [
  {
    id: "match-door-style",
    name: "Match Door Style",
  },
  {
    id: "clear",
    name: "Clear",
    glazing: "clear-full",
  },
  {
    id: "solid",
    name: "Solid",
  },
  {
    id: "midrail",
    name: "Midrail",
    midFrameHeight: 75,
    midFrameOffsetY: 75,
    glazing: "clear-full",
    midFrameElements: [
      {
        id: "top-transom",
        rect: { x: 0, y: 0, widthFactor: 1, height: 20 },
        options: { imageURL: getImageURL("transom"), flipVertical: false },
      },
      {
        id: "bottom-transom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 20 },
        options: { imageURL: getImageURL("transom"), flipVertical: true },
      },
      {
        id: "left-mid-frame",
        rect: { x: 0, y: 0, width: 35, heightFactor: 1 },
        options: { imageURL: getImageURL("frame-y")},
      },
      {
        id: "right-mid-frame",
        rect: { x: "right", y: 0, width: 35, heightFactor: 1 },
        options: { imageURL: getImageURL("frame-y"), flipHorizontal: true  },
      },
      {
        id: "left-top-transom-end",
        rect: { x: 0, y: 0, width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipVertical: false },
      },
      {
        id: "right-top-transom-end",
        rect: { x: "right", y: 0, width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipHorizontal: true },
      },
      {
        id: "left-bottom-transom-end",
        rect: { x: 0, y: "bottom", width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipVertical: false },
      },
      {
        id: "right-bottm-transom-end",
        rect: { x: "right", y: "bottom", width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipHorizontal: true },
      },
    ],
  },
];

const sidescreenGlazingDefs = [
  {
    id: "clear-full",
    image: "clear",
    margin: 35,
  },
];

// Letterplates, hardware, etc.
const letterplateDisplayNames = {
  "letterplate-none": "None",
  "letterplate-mid": "Mid",
  "letterplate-low": "Low",
  "letterplate-ground": "Ground",
};

const hardwareColorOptions = ["gold", "black", "chrome", "graphite"];
const hardwareColorDisplayNames = {
  gold: "Gold",
  black: "Black",
  chrome: "Chrome",
  graphite: "Graphite",
};

const handleOptions = ["lever"];
const handleDisplayNames = { lever: "Lever" };

// Coordinates for letterplates
const letterplateDefs = [
  {
    id: "letterplate-mid-A",
    width: 100,
    height: 25,
    align: "center",
    offsetY: 210,
  },
  {
    id: "letterplate-low-A",
    width: 100,
    height: 25,
    align: "center",
    offsetY: 85,
  },
  {
    id: "letterplate-ground-A",
    width: 100,
    height: 25,
    align: "center",
    offsetY: 50,
  },
];

// Coordinates for handles
const handleDefs = [
  {
    id: "lever",
    width: 40,
    height: 65,
    align: "right", // visual alignment (used for positioning from panel edge)
    offsetX: 19,
    offsetY: 250,
    side: "right", // logical side it belongs on; use this to place hinge on the opposite side
    mirrorWhenLeft: true, // whether to mirror the image when used on the left
  },
];

const hardwareColorMap = {
  gold: "rgba(221, 208, 166, 0.89)",
  black: "rgba(27, 27, 27, 0.90)",
  chrome: "rgba(228, 226, 221, 0.65)",
  graphite: "rgba(108, 108, 106, 0.65)",
};

const glazingDisplayNames = {
  clear: "Clear",
  adina: "Adina",
  eden: "Eden",
  graphite: "Graphite",
  harmony: "Harmony",
  iris: "Iris",
  joy: "Joy",
  murano: "Murano Black",
  satin: "Satin",
  virtue: "Virtue",
};

// Steps & wizard state
const stepIDs = [
  "configuration-step",
  "style-step",
  "sidescreen-style-step",
  "finish-step",
  "glazing-step",
  "hardware-step",
];

// Range selection for the start screen
export const state = {
  currentStep: 0,
  stepsCompleted: Array(6).fill(true),
  selectedRange: doorRanges[0],
  selectedStyle: "berlin",
  selectedConfiguration: "single",
  selectedGlazing: "adina",
  selectedLetterplate: null,
  selectedHardwareColor: "gold",
  selectedHandle: "lever",
  handleSide: "right",
  selectedExternalFinish: finishes[2],
  selectedInternalFinish: finishes[0],
  selectedLeftPanel: null,
  selectedRightPanel: null,
  selectedSideScreenStyle: "solid",
  backgroundImg: null,
  currentView: "external",
  glazingObscureEnabled: false,
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
  sidescreenGlazingDefs,
  sidescreenStyleDefs,
};
