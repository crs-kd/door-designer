
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
      molding: "short-centre",
    },
    sidescreenOptions:  ["solid", "clear", "match-door-style", "midrail", "half-clear-top","half-clear-bottom"],
    glazingOptions: ["clear","adina", "eden", "graphite", "harmony", "iris", "joy", "murano", "satin", "virtue"],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-mid": "letterplate-mid-A",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A"
    },
    handleOptions: ["lever"]
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "lisbon",
    minWidth: 870,
    maxWidth: 980,
    minHeight: 1800,
    maxHeight: 2000,
    styleAssets: {
      texture: "vertical",
      molding: "full-centre",
    },
    sidescreenOptions: ["solid", "clear", "match-door-style", "midrail", "half-clear-top","half-clear-bottom"],
    glazingOptions: ["clear", "eden", "graphite", "harmony", "joy", "murano", "satin", "virtue"],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A"
    },
    handleOptions: ["lever"]
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
    sidescreenOptions: ["solid", "clear", "match-door-style", "midrail", "half-clear-top","half-clear-bottom"],
    glazingOptions: ["clear", "eden", "graphite", "harmony", "joy", "murano", "satin", "virtue"],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-ground": "letterplate-ground-A"
    },
    handleOptions: ["lever"]
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
    sidescreenOptions: ["solid", "clear", "match-door-style", "midrail", "half-clear-top","half-clear-bottom"],
    glazingOptions: ["clear", "eden", "graphite", "harmony", "joy", "murano", "satin", "virtue"],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
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
    image: "allure-horizontal",
    marginX: 35,
    marginY: 10,
    offsetX: 0,
    offsetY: -3

  },
  {
    id: "vertical",
    image: "allure-vertical",
    marginX: 35,
    marginY: 28,
    offsetX: 0,
    offsetY: 5
  },
];

// 2) Moldings
// The xFactor, yFactor, widthFactor, heightFactor specify how it’s placed on the main door panel.
const moldingDefs = [
  {
    id: "short-centre",
    width: 70,
    height: 260,
    align: "center", // "left" | "right" | "center"
    offsetY: 250,
    elements: [
      {
        id: "molding-top",
        rect: { x: 0, y: 0, width: 70, height: 15 },
        options: { imageURL: getImageURL("allure-x"), flipHorizontal: false, flipVertical: false, rotation: 0}
      },
      {
        id: "molding-bottom",
        rect: { x: 0, y: "bottom", width: 70, height: 15 },
        options: {imageURL: getImageURL("allure-x"), flipHorizontal: false, flipVertical: true, rotation: 0}
      },
      {
        id: "molding-left",
        mixedRect: { x: 0, width: 15, yFactor: 0, heightFactor: 1 },
        options: {imageURL: getImageURL("allure-y"), flipHorizontal: false, flipVertical: false, rotation: 0}
      },
      {
        id: "molding-right", mixedRect: { x: "right", width: 15, yFactor: 0, heightFactor: 1 },
        options: {imageURL: getImageURL("allure-y"),flipHorizontal: true,flipVertical: false,rotation: 0}
      },
      {
        id: "molding-corner-top-left", mixedRect: { x:0, y:0, width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: false,flipVertical: false,rotation: 0}
      },
      {
        id: "molding-corner-top-right", mixedRect: { x:"right", y:0, width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: true,flipVertical: false,rotation: 0}
      },
      {
        id: "molding-corner-bottom-left", mixedRect: { x:0, y:"bottom", width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: false,flipVertical: true,rotation: 0}
      },
      {
        id: "molding-corner-bottom-right", mixedRect: { x:"right", y:"bottom", width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: true,flipVertical: true,rotation: 0}
      },
    ]
  },

  {
    id: "full-centre",
    width: 70,
    height: 360,
    align: "center", // "left" | "right" | "center"
    offsetY: 150,
    elements: [
      {
        id: "molding-top",
        rect: { x: 0, y: 0, width: 75, height: 15 },
        options: { imageURL: getImageURL("allure-x"), flipHorizontal: false, flipVertical: false, rotation: 0}
      },
      {
        id: "molding-bottom",
        rect: { x: 0, y: "bottom", width: 75, height: 15 },
        options: {imageURL: getImageURL("allure-x"), flipHorizontal: false, flipVertical: true, rotation: 0}
      },
      {
        id: "molding-left",
        mixedRect: { x: 0, width: 15, yFactor: 0, heightFactor: 1 },
        options: {imageURL: getImageURL("allure-y"), flipHorizontal: false, flipVertical: false, rotation: 0}
      },
      {
        id: "molding-right", mixedRect: { x: "right", width: 15, yFactor: 0, heightFactor: 1 },
        options: {imageURL: getImageURL("allure-y"),flipHorizontal: true,flipVertical: false,rotation: 0}
      },
      {
        id: "molding-corner-top-left", mixedRect: { x:0, y:0, width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: false,flipVertical: false,rotation: 0}
      },
      {
        id: "molding-corner-top-right", mixedRect: { x:"right", y:0, width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: true,flipVertical: false,rotation: 0}
      },
      {
        id: "molding-corner-bottom-left", mixedRect: { x:0, y:"bottom", width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: false,flipVertical: true,rotation: 0}
      },
      {
        id: "molding-corner-bottom-right", mixedRect: { x:"right", y:"bottom", width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: true,flipVertical: true,rotation: 0}
      },
    ]
  },

  {
    id: "full-left",
    width: 70,
    height: 360,
    align: "left", // "left" | "right" | "center"
    offsetY: 150,
    offsetX: 20,
    elements: [
      {
        id: "molding-top",
        rect: { x: 0, y: 0, width: 70, height: 15 },
        options: { imageURL: getImageURL("allure-x"), flipHorizontal: false, flipVertical: false, rotation: 0}
      },
      {
        id: "molding-bottom",
        rect: { x: 0, y: "bottom", width: 70, height: 15 },
        options: {imageURL: getImageURL("allure-x"), flipHorizontal: false, flipVertical: true, rotation: 0}
      },
      {
        id: "molding-left",
        mixedRect: { x: 0, width: 15, yFactor: 0, heightFactor: 1 },
        options: {imageURL: getImageURL("allure-y"), flipHorizontal: false, flipVertical: false, rotation: 0}
      },
      {
        id: "molding-right", mixedRect: { x: "right", width: 15, yFactor: 0, heightFactor: 1 },
        options: {imageURL: getImageURL("allure-y"),flipHorizontal: true,flipVertical: false,rotation: 0}
      },
      {
        id: "molding-corner-top-left", mixedRect: { x:0, y:0, width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: false,flipVertical: false,rotation: 0}
      },
      {
        id: "molding-corner-top-right", mixedRect: { x:"right", y:0, width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: true,flipVertical: false,rotation: 0}
      },
      {
        id: "molding-corner-bottom-left", mixedRect: { x:0, y:"bottom", width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: false,flipVertical: true,rotation: 0}
      },
      {
        id: "molding-corner-bottom-right", mixedRect: { x:"right", y:"bottom", width: 15, height: 15 },
        options: {imageURL: getImageURL("allure-corner"),flipHorizontal: true,flipVertical: true,rotation: 0}
      },
    ]
  },


  {
    id: "squares-centre",
    width: 70,
    height: 360,
    align: "center",
    offsetX: 0,
    offsetY: 150,
    repeat: {
      rows: 4,
      cols: 1,
      gapX: 0,
      gapY: 40
    },
    cell: {
      width: 70,
      height: 60,
      elements: [
        {
          id: "molding-top",
          rect: { x: 0, y: 0, width: 70, height: 15 },
          options: { imageURL: getImageURL("allure-x"), flipHorizontal: false, flipVertical: false, rotation: 0}
        },
        {
          id: "molding-bottom",
          rect: { x: 0, y: "bottom", width: 70, height: 15 },
          options: {imageURL: getImageURL("allure-x"), flipHorizontal: false, flipVertical: true, rotation: 0}
        },
        {
          id: "molding-left",
          mixedRect: { x: 0, width: 15, yFactor: 0, heightFactor: 1 },
          options: {imageURL: getImageURL("allure-y"), flipHorizontal: false, flipVertical: false, rotation: 0}
        },
        {
          id: "molding-right", mixedRect: { x: "right", width: 15, yFactor: 0, heightFactor: 1 },
          options: {imageURL: getImageURL("allure-y"),flipHorizontal: true,flipVertical: false,rotation: 0}
        },
        {
          id: "molding-corner-top-left", mixedRect: { x:0, y:0, width: 15, height: 15 },
          options: {imageURL: getImageURL("allure-corner"),flipHorizontal: false,flipVertical: false,rotation: 0}
        },
        {
          id: "molding-corner-top-right", mixedRect: { x:"right", y:0, width: 15, height: 15 },
          options: {imageURL: getImageURL("allure-corner"),flipHorizontal: true,flipVertical: false,rotation: 0}
        },
        {
          id: "molding-corner-bottom-left", mixedRect: { x:0, y:"bottom", width: 15, height: 15 },
          options: {imageURL: getImageURL("allure-corner"),flipHorizontal: false,flipVertical: true,rotation: 0}
        },
        {
          id: "molding-corner-bottom-right", mixedRect: { x:"right", y:"bottom", width: 15, height: 15 },
          options: {imageURL: getImageURL("allure-corner"),flipHorizontal: true,flipVertical: true,rotation: 0}
        },
      ]
    }
  }

];
  
// 3) Glazing definitions
const glazingDefs = [
  {
    id: "adina",
    image: "adina", // fallback
    obscureExternal: "Adina-external",
    obscureInternal: "Adina-internal",
    width: 38,
    height: 230,
    offsetY: 266,
    align: "center",
  },

  // Clear Glass 
  {
    id: "clear",
    image: "clear", // fallback
    obscureExternal: "clear",
    obscureInternal: "clear",
    width: 38,
    height: 230,
    offsetY: 266,
    align: "center",
    styleOverrides: {
      lisbon: {
        image: "clear",
        obscureExternal: "clear",
        obscureInternal: "clear",
        width: 38,
        height: 330,
        offsetY: 166,
      },
      
      madrid: {
        width: 38,
        height: 360,
        offsetY: 134,
        align: "center",
        repeat: {
          rows: 4,
          cols: 1,
          gapY: 72,
          gapX: 0
        },
        cell: {
          width: 38,
          height: 28,
          elements: [
            {
              rect: { x: 0, y: 0, width: 38, height: 28 },
              options: {
                imageURL: getImageURL("clear"),
                flipHorizontal: false,
                flipVertical: false,
                rotation: 0
              }
            }
          ]
        }
      },

      miami: {
        image: "clear",
        obscureExternal: "clear",
        obscureInternal: "clear",
        width: 38,
        height: 330,
        align: "left",
        offsetY: 166,
        offsetX: 36,
      },
    }
  },
  // Eden Glass 
  {
    id: "eden",
    image: "eden", // fallback
    obscureExternal: "eden-external",
    obscureInternal: "eden-internal",
    width: 38,
    height: 230,
    offsetY: 266,
    align: "center",
    styleOverrides: {
      lisbon: {
        image: "eden-long",
        obscureExternal: "eden-long-external",
        obscureInternal: "eden-long-internal",
        width: 38,
        height: 330,
        offsetY: 166,
      },
      
      madrid: {
        width: 38,
        height: 360,
        offsetY: 134,
        align: "center",
        repeat: {
          rows: 4,
          cols: 1,
          gapY: 72,
          gapX: 0
        },
        cell: {
          width: 38,
          height: 28,
          elements: [
            {
              rect: { x: 0, y: 0, width: 38, height: 28 },
              options: {
                imageURL: getImageURL("eden-square"),
                flipHorizontal: false,
                flipVertical: false,
                rotation: 0
              }
            }
          ]
        }
      },
      miami: {
        image: "eden",
        obscureExternal: "eden-external",
        obscureInternal: "eden-internal",
        width: 38,
        height: 330,
        align: "left",
        offsetY: 166,
        offsetX: 36,
      },
    }
  },

  // Graphite Glass
  
  {
    id: "graphite",
    image: "graphite", // fallback
    obscureExternal: "graphite-external",
    obscureInternal: "graphite-internal",
    width: 38,
    height: 230,
    offsetY: 266,
    align: "center",
    styleOverrides: {
      lisbon: {
        image: "graphite-long",
        obscureExternal: "graphite-long-external",
        obscureInternal: "graphite-long-internal",
        width: 38,
        height: 330,
        offsetY: 166,
      },
      
      madrid: {
        width: 38,
        height: 360,
        offsetY: 134,
        align: "center",
        repeat: {
          rows: 4,
          cols: 1,
          gapY: 72,
          gapX: 0
        },
        cell: {
          width: 38,
          height: 28,
          elements: [
            {
              rect: { x: 0, y: 0, width: 38, height: 28 },
              options: {
                imageURL: getImageURL("graphite-square"),
                flipHorizontal: false,
                flipVertical: false,
                rotation: 0
              }
            }
          ]
        }
      },
      miami: {
        image: "graphite-long",
        obscureExternal: "graphite-long-internal",
        obscureInternal: "graphite-long-external",
        width: 38,
        height: 330,
        align: "left",
        offsetY: 166,
        offsetX: 36,
      },
    }
  },

   // Harmony Glass
  
   {
    id: "harmony",
    image: "harmony", // fallback
    obscureExternal: "harmony-external",
    obscureInternal: "harmony-internal",
    width: 38,
    height: 230,
    offsetY: 266,
    align: "center",
    styleOverrides: {
      lisbon: {
        image: "harmony-long",
        obscureExternal: "harmony-long-external",
        obscureInternal: "harmony-long-internal",
        width: 38,
        height: 330,
        offsetY: 166,
      },
      
      madrid: {
        width: 38,
        height: 360,
        offsetY: 134,
        align: "center",
        repeat: {
          rows: 4,
          cols: 1,
          gapY: 72,
          gapX: 0
        },
        cell: {
          width: 38,
          height: 28,
          elements: [
            {
              rect: { x: 0, y: 0, width: 38, height: 28 },
              options: {
                imageURL: getImageURL("harmony-square"),
                flipHorizontal: false,
                flipVertical: false,
                rotation: 0
              }
            }
          ]
        }
      },
      miami: {
        image: "harmony-long",
        obscureExternal: "harmony-long-internal",
        obscureInternal: "harmony-long-external",
        width: 38,
        height: 330,
        align: "left",
        offsetY: 166,
        offsetX: 36,
      },
    }
  },
  
   // Joy Glass
  
   {
    id: "joy",
    image: "joy", // fallback
    obscureExternal: "joy-external",
    obscureInternal: "joy-internal",
    width: 38,
    height: 230,
    offsetY: 266,
    align: "center",
    styleOverrides: {
      lisbon: {
        image: "joy-long",
        obscureExternal: "joy-long-external",
        obscureInternal: "joy-long-internal",
        width: 38,
        height: 330,
        offsetY: 166,
      },
      
      madrid: {
        width: 38,
        height: 360,
        offsetY: 134,
        align: "center",
        repeat: {
          rows: 4,
          cols: 1,
          gapY: 72,
          gapX: 0
        },
        cell: {
          width: 38,
          height: 28,
          elements: [
            {
              rect: { x: 0, y: 0, width: 38, height: 28 },
              options: {
                imageURL: getImageURL("joy-square"),
                flipHorizontal: false,
                flipVertical: false,
                rotation: 0
              }
            }
          ]
        }
      },
      miami: {
        image: "joy-long",
        obscureExternal: "joy-long-internal",
        obscureInternal: "joy-long-external",
        width: 38,
        height: 330,
        align: "left",
        offsetY: 166,
        offsetX: 36,
      },
    }
  },

  // Murano Glass
  
  {
    id: "murano",
    image: "murano", // fallback
    obscureExternal: "murano-external",
    obscureInternal: "murano-internal",
    width: 38,
    height: 230,
    offsetY: 266,
    align: "center",
    styleOverrides: {
      lisbon: {
        image: "murano-long",
        obscureExternal: "murano-long-external",
        obscureInternal: "murano-long-internal",
        width: 38,
        height: 330,
        offsetY: 166,
      },
      
      madrid: {
        width: 38,
        height: 360,
        offsetY: 134,
        align: "center",
        repeat: {
          rows: 4,
          cols: 1,
          gapY: 72,
          gapX: 0
        },
        cell: {
          width: 38,
          height: 28,
          elements: [
            {
              rect: { x: 0, y: 0, width: 38, height: 28 },
              options: {
                imageURL: getImageURL("murano-square"),
                flipHorizontal: false,
                flipVertical: false,
                rotation: 0
              }
            }
          ]
        }
      },
      miami: {
        image: "murano-long",
        obscureExternal: "murano-long-internal",
        obscureInternal: "murano-long-external",
        width: 38,
        height: 330,
        align: "left",
        offsetY: 166,
        offsetX: 36,
      },
    }
  },

  // Murano Glass
  
  {
    id: "murano",
    image: "murano", // fallback
    obscureExternal: "murano-external",
    obscureInternal: "murano-internal",
    width: 38,
    height: 230,
    offsetY: 266,
    align: "center",
    styleOverrides: {
      lisbon: {
        image: "murano-long",
        obscureExternal: "murano-long-external",
        obscureInternal: "murano-long-internal",
        width: 38,
        height: 330,
        offsetY: 166,
      },
      
      madrid: {
        width: 38,
        height: 360,
        offsetY: 134,
        align: "center",
        repeat: {
          rows: 4,
          cols: 1,
          gapY: 72,
          gapX: 0
        },
        cell: {
          width: 38,
          height: 28,
          elements: [
            {
              rect: { x: 0, y: 0, width: 38, height: 28 },
              options: {
                imageURL: getImageURL("murano-square"),
                flipHorizontal: false,
                flipVertical: false,
                rotation: 0
              }
            }
          ]
        }
      },
      miami: {
        image: "murano-long",
        obscureExternal: "murano-long-internal",
        obscureInternal: "murano-long-external",
        width: 38,
        height: 330,
        align: "left",
        offsetY: 166,
        offsetX: 36,
      },
    }
  },
// Satin Glass
  
  {
    id: "satin",
    image: "satin", // fallback
    obscureExternal: "satin-external",
    obscureInternal: "satin-internal",
    width: 38,
    height: 230,
    offsetY: 266,
    align: "center",
    styleOverrides: {
      lisbon: {
        image: "satin-long",
        obscureExternal: "satin-long-external",
        obscureInternal: "satin-long-internal",
        width: 38,
        height: 330,
        offsetY: 166,
      },
      
      madrid: {
        width: 38,
        height: 360,
        offsetY: 134,
        align: "center",
        repeat: {
          rows: 4,
          cols: 1,
          gapY: 72,
          gapX: 0
        },
        cell: {
          width: 38,
          height: 28,
          elements: [
            {
              rect: { x: 0, y: 0, width: 38, height: 28 },
              options: {
                imageURL: getImageURL("satin-square"),
                flipHorizontal: false,
                flipVertical: false,
                rotation: 0
              }
            }
          ]
        }
      },
      miami: {
        image: "satin-long",
        obscureExternal: "satin-long-internal",
        obscureInternal: "satin-long-external",
        width: 38,
        height: 330,
        align: "left",
        offsetY: 166,
        offsetX: 36,
      },
    }
  },

  // Virtue Glass
  
  {
    id: "virtue",
    image: "virtue", // fallback
    obscureExternal: "virtue-external",
    obscureInternal: "virtue-internal",
    width: 38,
    height: 230,
    offsetY: 266,
    align: "center",
    styleOverrides: {
      lisbon: {
        image: "virtue-long",
        obscureExternal: "virtue-long-external",
        obscureInternal: "virtue-long-internal",
        width: 38,
        height: 330,
        offsetY: 166,
      },
      
      madrid: {
        width: 38,
        height: 360,
        offsetY: 134,
        align: "center",
        repeat: {
          rows: 4,
          cols: 1,
          gapY: 72,
          gapX: 0
        },
        cell: {
          width: 38,
          height: 28,
          elements: [
            {
              rect: { x: 0, y: 0, width: 38, height: 28 },
              options: {
                imageURL: getImageURL("virtue-square"),
                flipHorizontal: false,
                flipVertical: false,
                rotation: 0
              }
            }
          ]
        }
      },
      miami: {
        image: "virtue-long",
        obscureExternal: "virtue-long-internal",
        obscureInternal: "virtue-long-external",
        width: 38,
        height: 330,
        align: "left",
        offsetY: 166,
        offsetX: 36,
      },
    }
  },

];


const sidescreenStyleDefs = [
  {
    id: "match-door-style",
    name: "Match Door Style",
    texture: "match",
    molding: "match",
    glazing: "match"
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
    texture: "match",
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
  texture: "match",
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
  texture: "match",
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
    width: 38,
    height: 232,
    align: "center",   
    offsetY: 266
  },
  {
    id: "adina",
    image: "adina",
    width: 38,
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
    offsetY: 210              // from bottom
  },
  {
    id: "letterplate-low-A",
    width: 100,
    height: 25,
    align: "center",
    offsetY: 85
  },
  {
    id: "letterplate-ground-A",
    width: 100,
    height: 25,
    align: "center",
    offsetY: 50
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
  "hardware-step"
];

// Range selection for the start screen
export const state = {
  currentStep: 1,
  stepsCompleted: Array(6).fill(true),
  selectedRange: doorRanges[0],
  selectedStyle: "blank",
  selectedConfiguration: "single",
  selectedGlazing: null,
  selectedLetterplate: null,
  selectedHardwareColor: "gold",
  selectedHandle: "lever",
  selectedExternalFinish: finishes[2],
  selectedInternalFinish: finishes[0],
  selectedLeftPanel: null,
  selectedRightPanel: null,
  selectedSideScreenStyle: "solid",
  backgroundImg: null,
  currentView: "external",
  glazingObscureEnabled: false

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

