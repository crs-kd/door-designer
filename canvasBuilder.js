
import { getImageURL, loadImage, tintImage, mirrorCanvas, goToNextStep, goToPreviousStep, getDoorPanelDimensionsFromInput, getSidescreenDimensionsFromInput} from "./utils.js";


import { populateSidescreenStyleThumbnails } from "./ui.js";
import { populateConfigurationOptions } from "./ui.js";
import { populateStylesByRange } from "./ui.js";
import { populateExternalFinishThumbnails } from "./ui.js";
import { populateInternalFinishThumbnails } from "./ui.js";
import { populateGlazingThumbnails } from "./ui.js";
import { populateLetterplateThumbnails } from "./ui.js";
import { populateHardwareColorThumbnails } from "./ui.js";
import { populateHandleThumbnails } from "./ui.js";
import { updateSummary } from "./ui.js";
import { updateViewIndicator } from "./ui.js";


import { showStep } from "./main.js";
import { isStepAccessible } from "./main.js";
import { updateNavigationControls } from "./main.js";

import { doorStyles } from "./data.js";
import { finishColorMap } from "./data.js";
import { glazingDisplayNames } from "./data.js";
import { styleDisplayNames } from "./data.js";
import { hardwareColorMap } from "./data.js";
import { glazingDefs } from "./data.js";
import { letterplateDefs } from "./data.js";
import { handleDefs } from "./data.js";
import { textureDefs } from "./data.js";
import { moldingDefs } from "./data.js";
import { finishDisplayNames } from "./data.js";
import { doorRanges } from "./data.js";
import { state } from "./data.js";
import { sidescreenStyleDefs } from "./data.js";
import { sidescreenGlazingDefs } from "./data.js";


import {
  doorOverlayMouseDown,
  doorOverlayMouseMove,
  doorOverlayMouseUp,
  doorOverlayTouchStart,
  doorOverlayTouchMove,
  doorOverlayTouchEnd,
  updateDoorOverlayCanvasSize,
  updateBackgroundCanvas,
  updateDoorOverlay,
  initializeDoorOverlay,
} from "./visualiser.js";

async function drawPanelElement(ctx, rect, options) {
  const img = await loadImage(options.imageURL);
  if (!img) return;

  ctx.save();
  ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);

  if (options.rotation) {
    ctx.rotate((options.rotation * Math.PI) / 180);
  }

  const scaleX = options.flipHorizontal ? -1 : 1;
  const scaleY = options.flipVertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);
  ctx.drawImage(img, -rect.width / 2, -rect.height / 2, rect.width, rect.height);

  ctx.restore();
}

function getElementPosition(id, panelWidth, panelHeight, width, height) {
  // Default: center element
  let x = (panelWidth - width) / 2;
  let y = (panelHeight - height) / 2;

  // Lock handle to bottom-left or bottom-right
  if (id.includes('handle')) {
    x = id.includes('right') ? panelWidth - width - 40 : 40;  // 40px offset from edge
    y = panelHeight - height - 100; // 100px from bottom
  }

  // Lock letterplate to horizontal center and fixed height from bottom
  if (id.includes('letterplate')) {
    x = (panelWidth - width) / 2;
    y = panelHeight - height - 400; // 400px from bottom
  }

  // Glazing or molding: center using factor if available
  if (id.includes('glazing') || id.includes('molding')) {
    // Already centered by default
  }

  return { x, y };
}

/*
   ---------------------------------------------
   Build the Door Panel
   ---------------------------------------------
*/
async function buildPanelComposite(panelWidth, panelHeight, finish, ) {
  // For finish, we have a { color, texture, textureBlend }, from finishColorMap
  let baseColor = finish.color || "#ccc";
  let textureURL = finish.texture || null;

  const styleObj = doorStyles.find(s => s.name === state.selectedStyle);



  // Step 1: draw the door panel "frame" elements onto an offscreen
  const elementsCanvas = document.createElement("canvas");
  elementsCanvas.width = panelWidth;
  elementsCanvas.height = panelHeight;
  const elementsCtx = elementsCanvas.getContext("2d");

  // The same original frame segments
  const doorPanelElements = [
    {
      id: "top-frame",
      mixedRect: { y: 0, height: 35, xFactor: 0, widthFactor: 1 },
      options: { imageURL: getImageURL("frame-top"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    },
    {
      id: "left-vertical-frame",
      mixedRect: { x: 0, width: 35, yFactor: 0, heightFactor: 1 },
      options: { imageURL: getImageURL("frame"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    },
    {
      id: "right-vertical-frame",
      mixedRect: { x: "right", width: 35, yFactor: 0, heightFactor: 1 },
      options: { imageURL: getImageURL("frame"), flipHorizontal: true, flipVertical: false, rotation: 0 }
    },
    {
      id: "top-left-corner",
      rect: { x: 0, y: 0, width: 35, height: 35 },
      options: { imageURL: getImageURL("corner"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    },
    {
      id: "top-right-corner",
      rect: { x: "right", y: 0, width: 35, height: 35 },
      options: { imageURL: getImageURL("corner"), flipHorizontal: true, flipVertical: false, rotation: 0 }
    }

  ];

  // Helper to draw each piece
  async function drawPanelElement(ctx, rectDef, options, panelWidth, panelHeight) {
    const img = await loadImage(options.imageURL);
    if (!img) return;
  
    const rect = {
      width: rectDef.width,
      height: rectDef.height,
      x: rectDef.x === "right" ? panelWidth - rectDef.width : rectDef.x,
      y: rectDef.y === "bottom" ? panelHeight - rectDef.height : rectDef.y
    };
  
    ctx.save();
    ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
    if (options.rotation) {
      ctx.rotate((options.rotation * Math.PI) / 180);
    }
    const scaleX = options.flipHorizontal ? -1 : 1;
    const scaleY = options.flipVertical ? -1 : 1;
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(img, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
    ctx.restore();
  }

  // Draw them
  for (let elem of doorPanelElements) {
    let rect;
  
    if (elem.rect) {
      rect = {
        x: elem.rect.x === "right" ? panelWidth - elem.rect.width : elem.rect.x,
        y: elem.rect.y === "bottom" ? panelHeight - elem.rect.height : elem.rect.y,
        width: elem.rect.width,
        height: elem.rect.height
      };
    } else if (elem.mixedRect) {
      const m = elem.mixedRect;
      rect = {
        x: m.x !== undefined
          ? (m.x === "right" ? panelWidth - m.width : m.x)
          : (m.xFactor !== undefined ? m.xFactor * panelWidth : 0),
        y: m.y !== undefined
          ? (m.y === "bottom" ? panelHeight - m.height : m.y)
          : (m.yFactor !== undefined ? m.yFactor * panelHeight : 0),
        width: m.width !== undefined ? m.width : (m.widthFactor * panelWidth),
        height: m.height !== undefined ? m.height : (m.heightFactor * panelHeight)
      };
    } else if (elem.rectFactor) {
      rect = {
        x: elem.rectFactor.x * panelWidth,
        y: elem.rectFactor.y * panelHeight,
        width: elem.rectFactor.width * panelWidth,
        height: elem.rectFactor.height * panelHeight
      };
    } else {
      console.warn("Missing shape data for panel element:", elem);
      continue;
    }
  
    await drawPanelElement(elementsCtx, rect, elem.options);
  }
  // Step 2: combine with base color & optional texture
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = panelWidth;
  finalCanvas.height = panelHeight;
  const finalCtx = finalCanvas.getContext("2d");

  // Fill base color
  finalCtx.fillStyle = baseColor;
  finalCtx.fillRect(0, 0, panelWidth, panelHeight);

  // If there's a texture, overlay it
  if (textureURL) {
    const textureImg = await loadImage(textureURL);
    if (textureImg) {
      // Scale texture to fill the door
      finalCtx.globalCompositeOperation = finish.textureBlend || "source-over";
      finalCtx.drawImage(textureImg, 0, 0, panelWidth, panelHeight);
      finalCtx.globalCompositeOperation = "source-over";
    }
  }

  if (styleObj && styleObj.styleAssets && styleObj.styleAssets.texture) {
    const grooveDef = textureDefs.find(t => t.id === styleObj.styleAssets.texture);
    
    if (grooveDef && grooveDef.image) {
      const grooveImg = await loadImage(getImageURL(grooveDef.image));
      if (grooveImg) {
        // Margins and Offsets
        const marginX = grooveDef.marginX ?? grooveDef.margin ?? 0;
        const marginY = grooveDef.marginY ?? grooveDef.margin ?? 0;
        const offsetX = grooveDef.offsetX ?? 0;
        const offsetY = grooveDef.offsetY ?? 0;
  
        const grooveW = panelWidth - marginX * 2;
        const grooveH = panelHeight - marginY * 2;
  
        const grooveX = marginX + offsetX;
        const grooveY = marginY + offsetY;
  
        finalCtx.globalCompositeOperation = "multiply"; // or "overlay"
        finalCtx.drawImage(grooveImg, grooveX, grooveY, grooveW, grooveH);
        finalCtx.globalCompositeOperation = "source-over";
      }
    }
  }

  // Multiply the frame elements onto it
  finalCtx.globalCompositeOperation = "multiply";
  finalCtx.drawImage(elementsCanvas, 0, 0);
  finalCtx.globalCompositeOperation = "source-over";

   // Optional threshold or highlight overlay
   const thresholdOverlayConfig = {
    visible: true,
    xFactor: 0.07,
    yFactor: 0.989,
    widthFactor: 0.86,
    height: 20,                      // <--- fixed height
    fillStyle: "rgb(236, 236, 236)",
    blend: null
  };
  
  if (thresholdOverlayConfig.visible) {
    const threshX = thresholdOverlayConfig.xFactor * panelWidth;
    const threshY = thresholdOverlayConfig.yFactor * panelHeight;
    const threshW = thresholdOverlayConfig.widthFactor * panelWidth;
    const threshH = thresholdOverlayConfig.height ?? (thresholdOverlayConfig.heightFactor * panelHeight);
    finalCtx.globalCompositeOperation = thresholdOverlayConfig.blend;
    finalCtx.fillStyle = thresholdOverlayConfig.fillStyle;
    finalCtx.fillRect(threshX, threshY, threshW, threshH);
    finalCtx.globalCompositeOperation = "source-over";
  }
  const panelOverlayConfig = {
    visible: true,
    xFactor: 0.13,
    yFactor: 0.960,
    widthFactor: 0.74,
    height: 5, // 
    fillStyle: "rgba(255, 255, 255, 0.35)",
    blend: "overlay"
  };
  
  if (panelOverlayConfig.visible) {
    const ovX = panelOverlayConfig.xFactor * panelWidth;
    const ovY = panelOverlayConfig.yFactor * panelHeight;
    const ovW = panelOverlayConfig.widthFactor * panelWidth;
    const ovH = panelOverlayConfig.height ?? (panelOverlayConfig.heightFactor * panelHeight); // fallback
    finalCtx.globalCompositeOperation = panelOverlayConfig.blend;
    finalCtx.fillStyle = panelOverlayConfig.fillStyle;
    finalCtx.fillRect(ovX, ovY, ovW, ovH);
    finalCtx.globalCompositeOperation = "source-over";
  }

  return finalCanvas;
}


/*
   ---------------------------------------------
   Build a Sidescreen Panel
   ---------------------------------------------
*/

async function buildSidePanelComposite(targetWidth, targetHeight, finish) {
  const baseColor = finish.color || "#ccc";
  const textureURL = finish.texture || null;
  const textureBlend = finish.textureBlend || "source-over";

  const sidescreenStyle = sidescreenStyleDefs.find(s => s.id === state.selectedSidescreenStyle);
  const isMatchingStyle = sidescreenStyle?.id === "match-door-style";
  const matchedStyle = isMatchingStyle
  ? doorStyles.find(s => s.name === state.selectedStyle)
  : null;

  // Offscreen canvas for frame elements
  const elementsCanvas = document.createElement("canvas");
  elementsCanvas.width = targetWidth;
  elementsCanvas.height = targetHeight;
  const elementsCtx = elementsCanvas.getContext("2d");

  const sidescreenPanelElements = [
    
    { id: "top-frame", mixedRect: { y: 0, height: 35, xFactor: 0, widthFactor: 1 }, options: { imageURL: getImageURL("frame-top") } },
  { id: "bottom-frame", mixedRect: { y: "bottom", height: 35, xFactor: 0, widthFactor: 1 }, options: { imageURL: getImageURL("frame-top"), flipVertical: true } },
  
  // Left/right vertical frames: fixed width, scaling height
  { id: "left-frame", mixedRect: { x: 0, width: 35, yFactor: 0, heightFactor: 1 }, options: { imageURL: getImageURL("frame") } },
  { id: "right-frame", mixedRect: { x: "right", width: 35, yFactor: 0, heightFactor: 1 }, options: { imageURL: getImageURL("frame"), flipHorizontal: true } },
  
  // Corners: fixed position and size
  { id: "top-left", rect: { x: 0, y: 0, width: 35, height: 35 }, options: { imageURL: getImageURL("corner") } },
  { id: "top-right", rect: { x: "right", y: 0, width: 35, height: 35 }, options: { imageURL: getImageURL("corner"), flipHorizontal: true } },
  { id: "bottom-left", rect: { x: 0, y: "bottom", width: 35, height: 35 }, options: { imageURL: getImageURL("corner"), flipVertical: true } },
  { id: "bottom-right", rect: { x: "right", y: "bottom", width: 35, height: 35 }, options: { imageURL: getImageURL("corner"), flipHorizontal: true, flipVertical: true } },
  
  ];

  
  // Append extra style-defined elements if present
  if (sidescreenStyle?.panelElements) {
    sidescreenPanelElements.push(...sidescreenStyle.panelElements);
    console.log("Extra sidescreen elements:", sidescreenStyle.panelElements);
  }
// Draw sidescreen frames
for (let el of sidescreenPanelElements) {
  let rect;

  if (el.rect) {
    const r = el.rect;

    const width = r.width === "full" ? targetWidth : r.width;
    let x = r.x;
    if (x === "right") x = targetWidth - width;
    else if (typeof x !== "number") x = 0;

    let y;
    if (r.align === "centerY") {
      y = (targetHeight - r.height) / 2;
    } else if (r.y === "bottom") {
      y = targetHeight - r.height;
    } else {
      y = r.y ?? 0;
    }

    rect = {
      x,
      y,
      width,
      height: r.height
    };
  } else if (el.mixedRect) {
    const m = el.mixedRect;
    rect = {
      x: m.x !== undefined
        ? (m.x === "right" ? targetWidth - m.width : m.x)
        : (m.xFactor !== undefined ? m.xFactor * targetWidth : 0),
      y: m.y !== undefined
        ? (m.y === "bottom" ? targetHeight - m.height : m.y)
        : (m.yFactor !== undefined ? m.yFactor * targetHeight : 0),
      width: m.width !== undefined ? m.width : (m.widthFactor * targetWidth),
      height: m.height !== undefined ? m.height : (m.heightFactor * targetHeight)
    };
  } else if (el.rectFactor) {
    rect = {
      x: el.rectFactor.x * targetWidth,
      y: el.rectFactor.y * targetHeight,
      width: el.rectFactor.width * targetWidth,
      height: el.rectFactor.height * targetHeight
    };
  } else {
    console.warn("Missing shape data in sidescreen element:", el);
    continue;
  }

  await drawPanelElement(elementsCtx, rect, el.options);
}

  // Draw the sidescreen style texture (if applicable)
  let grooveId = sidescreenStyle?.texture;

  if (grooveId === "match") {
    // Can match on any sidescreen style
    const matched = doorStyles.find(s => s.name === state.selectedStyle);
    grooveId = matched?.styleAssets?.texture;
  }

  // Create final canvas
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext("2d");

  // Fill base color
  finalCtx.fillStyle = baseColor;
  finalCtx.fillRect(0, 0, targetWidth, targetHeight);

  // Draw finish texture
  if (textureURL) {
    const textureImg = await loadImage(textureURL);
    if (textureImg) {
      finalCtx.globalCompositeOperation = textureBlend;
      finalCtx.drawImage(textureImg, 0, 0, targetWidth, targetHeight);
      finalCtx.globalCompositeOperation = "source-over";
    }
  }

  // Draw groove texture from style (if applicable)
  const grooveDef = textureDefs.find(t => t.id === grooveId);
  if (grooveDef && grooveDef.image) {
    const grooveImg = await loadImage(getImageURL(grooveDef.image));
    if (grooveImg) {
      const marginX = grooveDef.marginX ?? grooveDef.margin ?? 0;
      const marginY = grooveDef.marginY ?? grooveDef.margin ?? 0;
  
      const grooveX = marginX;
      const grooveY = marginY;
      const grooveW = targetWidth - marginX * 2;
      const grooveH = targetHeight - marginY * 2;
  
      finalCtx.globalCompositeOperation = "multiply";
      finalCtx.drawImage(grooveImg, grooveX, grooveY, grooveW, grooveH);
      finalCtx.globalCompositeOperation = "source-over";
    }
  }

  let moldingId = sidescreenStyle?.molding;

  if (sidescreenStyle?.id === "match-door-style" || moldingId === "match") {
    const matched = doorStyles.find(s => s.name === state.selectedStyle);
    moldingId = matched?.styleAssets?.molding;
  }

  // Draw frame elements
  finalCtx.globalCompositeOperation = "multiply";
  finalCtx.drawImage(elementsCanvas, 0, 0);
  finalCtx.globalCompositeOperation = "source-over";

  if (sidescreenStyle?.molding) {
    const moldDef = moldingDefs.find(m => m.id === sidescreenStyle.molding);
    if (moldDef && Array.isArray(moldDef.elements)) {
      const moldW = moldDef.width;
      const moldH = moldDef.height;
  
      const moldingCanvas = document.createElement("canvas");
      moldingCanvas.width = moldW;
      moldingCanvas.height = moldH;
      const moldingCtx = moldingCanvas.getContext("2d");
  
      // Apply color and texture
      moldingCtx.fillStyle = baseColor;
      moldingCtx.fillRect(0, 0, moldW, moldH);
  
      if (textureURL) {
        const textureImg = await loadImage(textureURL);
        if (textureImg) {
          moldingCtx.globalCompositeOperation = textureBlend;
          moldingCtx.drawImage(textureImg, 0, 0, moldW, moldH);
          moldingCtx.globalCompositeOperation = "source-over";
        }
      }
  
      // Draw molding elements
      for (const el of moldDef.elements) {
        let rect;
  
        if (el.rect) {
          const r = el.rect;
          const width = r.width === "full" ? moldW : r.width;
          const x = r.x === "right" ? moldW - width : r.x ?? 0;
          const y = r.align === "centerY"
            ? (moldH - r.height) / 2
            : r.y === "bottom"
            ? moldH - r.height
            : r.y ?? 0;
  
          rect = { x, y, width, height: r.height };
        } else if (el.mixedRect) {
          const m = el.mixedRect;
          rect = {
            x: m.x !== undefined
              ? (m.x === "right" ? moldW - m.width : m.x)
              : (m.xFactor ?? 0) * moldW,
            y: m.y !== undefined
              ? (m.y === "bottom" ? moldH - m.height : m.y)
              : (m.yFactor ?? 0) * moldH,
            width: m.width ?? m.widthFactor * moldW,
            height: m.height ?? m.heightFactor * moldH
          };
        } else {
          console.warn("Missing rect for molding element:", el);
          continue;
        }
  
        await drawPanelElement(moldingCtx, rect, el.options);
      }
  
      // Calculate position on final canvas
      const x = moldDef.align === "left"
        ? 40
        : moldDef.align === "right"
        ? targetWidth - moldW - 40
        : (targetWidth - moldW) / 2;
  
      const y = targetHeight - moldH - moldDef.offsetY;
  
      finalCtx.globalCompositeOperation = "multiply";
      finalCtx.drawImage(moldingCanvas, x, y);
      finalCtx.globalCompositeOperation = "source-over";
    }
  }

// ✅ Draw glazing from sidescreen style
let glazingId = sidescreenStyle?.glazing;
if (glazingId === "match") {
  glazingId = state.selectedGlazing;
}

const glazeDef = sidescreenGlazingDefs.find(g => g.id === glazingId);
if (glazeDef && glazeDef.image) {
  const img = await loadImage(getImageURL(glazeDef.image));
  if (img) {
    // 🔁 Margin-based full-glazing
    if ("margin" in glazeDef || "marginX" in glazeDef || "marginY" in glazeDef || glazeDef.halfPanelMargins) {
      let marginX = glazeDef.marginX ?? glazeDef.margin ?? 0;
      let topMargin = glazeDef.marginY ?? glazeDef.margin ?? 0;
      let bottomMargin = topMargin;

      if (glazeDef.halfPanelMargins) {
        marginX = 35;
        topMargin = 35;

        if (glazeDef.clearPosition === "bottom") {
          // Bottom clear → shift margin to top
          topMargin = (targetHeight / 2) + (35 / 2);
          bottomMargin = 35;
        } else {
          // Default is top clear
          bottomMargin = (targetHeight / 2) + (35 / 2);
        }
      }

      const gx = marginX;
      const gy = topMargin;
      const gw = targetWidth - marginX * 2;
      const gh = targetHeight - topMargin - bottomMargin;

      finalCtx.drawImage(img, gx, gy, gw, gh);
    } else {
      // 🎯 Fixed size, aligned glazing
      const gw = glazeDef.width;
      const gh = glazeDef.height;

      const gx = glazeDef.align === "left"
        ? 40
        : glazeDef.align === "right"
        ? targetWidth - gw - 40
        : (targetWidth - gw) / 2;

      const gy = targetHeight - gh - glazeDef.offsetY;

      finalCtx.drawImage(img, gx, gy, gw, gh);
    }
  }
}

  return finalCanvas;
}


/*
   ---------------------------------------------
   updateCanvasPreview()
   ---------------------------------------------
   Draws the door, sidescreens, plus any style-based texture/molding, glazing, hardware, etc.
*/
async function updateCanvasPreview() {
  try {
    const { displayPixels, scaleFactor } = getDoorPanelDimensionsFromInput();
    const panelHeight = displayPixels.height;
    const panelWidth = displayPixels.width
    const sidescreenDims = getSidescreenDimensionsFromInput();
const leftWidth = sidescreenDims.left.displayPixels;
const rightWidth = sidescreenDims.right.displayPixels;

    // Determine finish data for external or internal
    const finishKey = (state.currentView === "external") ? state.selectedExternalFinish : state.selectedInternalFinish;
    const finishData = finishColorMap[finishKey] || { color: "#ddd", texture: null, textureBlend: "source-over" };

    // Build sidescreens if needed
    let leftSidePanel = null;
    let rightSidePanel = null;
    if (state.selectedConfiguration === "single-left" || state.selectedConfiguration === "single-both") {
      leftSidePanel = await buildSidePanelComposite(leftWidth, panelHeight, finishData);
    }
    if (state.selectedConfiguration === "single-right" || state.selectedConfiguration === "single-both") {
      rightSidePanel = await buildSidePanelComposite(rightWidth, panelHeight, finishData);
    }

    // Build main door panel
    const panelCanvas = await buildPanelComposite(panelWidth, panelHeight, finishData);

    // Prepare preview canvas
    const previewCanvas = document.getElementById("previewCanvas");
    let totalWidth = panelWidth;
    if (leftSidePanel) totalWidth += leftWidth;
    if (rightSidePanel) totalWidth += rightWidth;
    previewCanvas.width = totalWidth;
    previewCanvas.height = panelHeight;
    const ctx = previewCanvas.getContext("2d");
    ctx.clearRect(0, 0, totalWidth, panelHeight);

    // Draw left sidescreen if present
    let offsetX = 0;
    if (leftSidePanel) {
      ctx.drawImage(leftSidePanel, 0, 0);
      offsetX += leftWidth;
      let doorOffsetX = offsetX;
    }
    
    // Draw main door panel
    ctx.drawImage(panelCanvas, offsetX, 0);

    // Look up style
    const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
  
    // Moldings

    if (styleObj?.styleAssets?.molding) {
      const moldDef = moldingDefs.find(m => m.id === styleObj.styleAssets.molding);
      if (!moldDef) return;
    
      const moldW = moldDef.width;
      const moldH = moldDef.height;
    
      // --- 1. Texture fill base layer ---
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = moldW;
      textureCanvas.height = moldH;
      const textureCtx = textureCanvas.getContext("2d");
    
      textureCtx.fillStyle = finishData.color || "#ccc";
      textureCtx.fillRect(0, 0, moldW, moldH);
    
      if (finishData.texture) {
        const textureImg = await loadImage(finishData.texture);
        if (textureImg) {
          textureCtx.globalCompositeOperation = finishData.textureBlend || "source-over";
          textureCtx.drawImage(textureImg, 0, 0, moldW, moldH);
          textureCtx.globalCompositeOperation = "source-over";
        }
      }
    
      // --- 2. Build mask canvas ---
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = moldW;
      maskCanvas.height = moldH;
      const maskCtx = maskCanvas.getContext("2d");
    
      const drawElements = async (ctx, elements, w, h, offsetX = 0, offsetY = 0, drawImages = false) => {
        for (const el of elements) {
          let rect;
          if (el.rect) {
            const r = el.rect;
            const width = r.width === "full" ? w : r.width;
            const x = offsetX + (r.x === "right" ? w - width : r.x ?? 0);
            const y = offsetY + (
              r.align === "centerY"
                ? (h - r.height) / 2
                : r.y === "bottom"
                ? h - r.height
                : r.y ?? 0
            );
            rect = { x, y, width, height: r.height };
          } else if (el.mixedRect) {
            const m = el.mixedRect;
            rect = {
              x: offsetX + (
                m.x !== undefined
                  ? (m.x === "right" ? w - m.width : m.x)
                  : (m.xFactor ?? 0) * w
              ),
              y: offsetY + (
                m.y !== undefined
                  ? (m.y === "bottom" ? h - m.height : m.y)
                  : (m.yFactor ?? 0) * h
              ),
              width: m.width ?? m.widthFactor * w,
              height: m.height ?? m.heightFactor * h
            };
          } else {
            console.warn("Missing rect for molding element:", el);
            continue;
          }
    
          const img = await loadImage(el.options.imageURL);
          if (!img) continue;
    
          ctx.save();
          ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
          if (el.options.rotation) ctx.rotate((el.options.rotation * Math.PI) / 180);
          const scaleX = el.options.flipHorizontal ? -1 : 1;
          const scaleY = el.options.flipVertical ? -1 : 1;
          ctx.scale(scaleX, scaleY);
          ctx.drawImage(img, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
          ctx.restore();
        }
      };
    
      // --- 3. Draw mask shapes ---
      if (moldDef.repeat && moldDef.cell?.elements) {
        const { rows, cols, gapX = 0, gapY = 0 } = moldDef.repeat;
        const cellW = moldDef.cell.width;
        const cellH = moldDef.cell.height;
    
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const offsetX = col * (cellW + gapX);
            const offsetY = row * (cellH + gapY);
            await drawElements(maskCtx, moldDef.cell.elements, cellW, cellH, offsetX, offsetY);
          }
        }
      } else if (Array.isArray(moldDef.elements)) {
        await drawElements(maskCtx, moldDef.elements, moldW, moldH);
      }
    
      // --- 4. Mask texture using the shape ---
      textureCtx.globalCompositeOperation = "destination-in";
      textureCtx.drawImage(maskCanvas, 0, 0);
      textureCtx.globalCompositeOperation = "source-over";
    
      // --- 5. Draw artwork elements onto the texture canvas and multiply them only ---
      const artworkCanvas = document.createElement("canvas");
      artworkCanvas.width = moldW;
      artworkCanvas.height = moldH;
      const artworkCtx = artworkCanvas.getContext("2d");
    
      if (moldDef.repeat && moldDef.cell?.elements) {
        const { rows, cols, gapX = 0, gapY = 0 } = moldDef.repeat;
        const cellW = moldDef.cell.width;
        const cellH = moldDef.cell.height;
    
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const offsetX = col * (cellW + gapX);
            const offsetY = row * (cellH + gapY);
            await drawElements(artworkCtx, moldDef.cell.elements, cellW, cellH, offsetX, offsetY);
          }
        }
      } else if (Array.isArray(moldDef.elements)) {
        await drawElements(artworkCtx, moldDef.elements, moldW, moldH);
      }
    
      textureCtx.globalCompositeOperation = "multiply";
      textureCtx.drawImage(artworkCanvas, 0, 0);
      textureCtx.globalCompositeOperation = "source-over";
    
      // --- 6. Draw final molding layer onto door canvas ---
      const moldX = moldDef.align === "left"
        ? offsetX + 40 + (moldDef.offsetX ?? 0)
        : moldDef.align === "right"
        ? offsetX + (panelWidth - moldW - 40) + (moldDef.offsetX ?? 0)
        : offsetX + (panelWidth - moldW) / 2 + (moldDef.offsetX ?? 0);
    
      const moldY = panelHeight - moldH - (moldDef.offsetY ?? 0);
    
      ctx.drawImage(textureCanvas, moldX, moldY);
    }
  

// Glazing
let doorOffsetX = offsetX;

if (state.selectedGlazing !== "none") {
  const glazeDef = glazingDefs.find(g => g.id === state.selectedGlazing);
  if (!glazeDef) return;

  const override = glazeDef.styleOverrides?.[state.selectedStyle] || {};
  const width = override.width ?? glazeDef.width;
  const height = override.height ?? glazeDef.height;
  const glazingOffsetX = override.offsetX ?? glazeDef.offsetX ?? 0;
  const offsetY = override.offsetY ?? glazeDef.offsetY ?? 0;
  const align = override.align ?? glazeDef.align ?? "center";

  const glazeCanvas = document.createElement("canvas");
  glazeCanvas.width = width;
  glazeCanvas.height = height;
  const glazeCtx = glazeCanvas.getContext("2d");

  // Helper to draw either single images or repeated cells
  const drawElements = async (ctx, elements, w, h, ox = 0, oy = 0) => {
    for (const el of elements) {
      let rect;
      const img = await loadImage(el.options.imageURL);
      if (!img) continue;

      if (el.rect) {
        const r = el.rect;
        const rw = r.width === "full" ? w : r.width;
        const rx = ox + (r.x === "right" ? w - rw : r.x ?? 0);
        const ry = oy + (
          r.align === "centerY"
            ? (h - r.height) / 2
            : r.y === "bottom"
            ? h - r.height
            : r.y ?? 0
        );
        rect = { x: rx, y: ry, width: rw, height: r.height };
      } else if (el.mixedRect) {
        const m = el.mixedRect;
        rect = {
          x: ox + (
            m.x !== undefined
              ? (m.x === "right" ? w - m.width : m.x)
              : (m.xFactor ?? 0) * w
          ),
          y: oy + (
            m.y !== undefined
              ? (m.y === "bottom" ? h - m.height : m.y)
              : (m.yFactor ?? 0) * h
          ),
          width: m.width ?? m.widthFactor * w,
          height: m.height ?? m.heightFactor * h
        };
      } else {
        continue;
      }

      ctx.save();
      ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
      if (el.options.rotation) ctx.rotate((el.options.rotation * Math.PI) / 180);
      const scaleX = el.options.flipHorizontal ? -1 : 1;
      const scaleY = el.options.flipVertical ? -1 : 1;
      ctx.scale(scaleX, scaleY);
      ctx.drawImage(img, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
      ctx.restore();
    }
  };

  // Grid-based override support
  if (override.repeat && override.cell?.elements) {
    const { rows, cols, gapX = 0, gapY = 0 } = override.repeat;
    const cellW = override.cell.width;
    const cellH = override.cell.height;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ox = col * (cellW + gapX);
        const oy = row * (cellH + gapY);
        await drawElements(glazeCtx, override.cell.elements, cellW, cellH, ox, oy);
      }
    }
  } else {
    // Default image-based fallback
    let imgKey = override.image ?? glazeDef.image;

if (state.glazingObscureEnabled) {
  imgKey = state.currentView === "internal"
    ? override.obscureInternal ?? glazeDef.obscureInternal ?? imgKey
    : override.obscureExternal ?? glazeDef.obscureExternal ?? imgKey;
}

const img = await loadImage(getImageURL(imgKey));
    if (img) {
      glazeCtx.drawImage(img, 0, 0, width, height);
    }
  }

  // Final position (respecting offsetX and alignment)
  const glazeX = align === "left"
    ? doorOffsetX + 40 + glazingOffsetX
    : align === "right"
    ? doorOffsetX + (panelWidth - width - 40) + glazingOffsetX
    : doorOffsetX + (panelWidth - width) / 2 + glazingOffsetX;

  const glazeY = panelHeight - height - offsetY;

  ctx.drawImage(glazeCanvas, glazeX, glazeY);
}



   if (state.selectedHandle && state.selectedHandle !== "none") {
  const hDef = handleDefs.find(def => def.id === state.selectedHandle);
  if (hDef) {
    const handleImg = await loadImage(getImageURL(state.selectedHandle));
    if (handleImg) {
      const hW = hDef.width;
      const hH = hDef.height;

      const hX = hDef.align === "left"
        ? offsetX + hDef.offsetX
        : offsetX + (panelWidth - hW - hDef.offsetX);

      const hY = panelHeight - hH - hDef.offsetY;

      const tintedHandle = tintImage(handleImg, hardwareColorMap[state.selectedHardwareColor] || "#000");
      ctx.drawImage(tintedHandle, hX, hY, hW, hH);

      const shadingImg = await loadImage(getImageURL(`${state.selectedHandle}`));
      if (shadingImg) {
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(shadingImg, hX, hY, hW, hH);
        ctx.globalCompositeOperation = "source-over";
      }
    }
  }
}

    // Right side
    if (rightSidePanel) {
      ctx.drawImage(rightSidePanel, offsetX + panelWidth, 0);
    }

    // Flip for internal
    if (state.currentView === "internal") {
      mirrorCanvas(previewCanvas);
    }

    // Produce file name
    const styleName = styleDisplayNames[state.selectedStyle] || state.selectedStyle;
    const finishName = finishDisplayNames[finishKey] || finishKey;
    const glazingName = glazingDisplayNames[state.selectedGlazing] || state.selectedGlazing;
    const fileName = `${styleName}, ${finishName}, ${glazingName} Glass.png`;

  } catch (err) {
    console.error("Error in compositeAndSave:", err);
  }
}


/*
   ---------------------------------------------
   Visualiser Save (compositeAndSaveVisualiser)
   ---------------------------------------------
   Takes the background + doorOverlayCanvas and merges them, 
   letting the user download the result.
*/
function compositeAndSaveVisualiser() {
  let fileName = prompt("Enter a file name for your saved image:", "visualiser-composite.png");
  if (!fileName) fileName = "visualiser-composite.png";
  if (!fileName.toLowerCase().endsWith(".png")) fileName += ".png";

  const visualiserContent = document.getElementById("visualiserContent");
  const w = visualiserContent.clientWidth;
  const h = visualiserContent.clientHeight;

  const compositeCanvas = document.createElement("canvas");
  compositeCanvas.width = w;
  compositeCanvas.height = h;
  const ctx = compositeCanvas.getContext("2d");

  const bgCanvas = document.getElementById("bgCanvas");
  const doorOverlayCanvas = document.getElementById("doorOverlayCanvas");

  ctx.drawImage(bgCanvas, 0, 0, w, h);
  ctx.drawImage(doorOverlayCanvas, 0, 0, w, h);

  const dataURL = compositeCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


/*
   ---------------------------------------------
   Handling Thumbnail Clicks
   ---------------------------------------------
*/
function addThumbnailClick(type) {
  document.querySelectorAll(`.thumbnail[data-type="${type}"]`).forEach(thumb => {
    thumb.addEventListener("click", () => {
      let value = thumb.getAttribute("data-value");
      if (type === "configuration") {
        state.selectedConfiguration = value;
        if (value === "single") {
          state.selectedLeftPanel = "none";
          state.selectedRightPanel = "none";
        } else if (value === "single-left") {
          state.selectedLeftPanel = "sidescreen";
          state.selectedRightPanel = "none";
        } else if (value === "single-right") {
          state.selectedLeftPanel = "none";
          state.selectedRightPanel = "sidescreen";
        } else if (value === "single-both") {
          state.selectedLeftPanel = "sidescreen";
          state.selectedRightPanel = "sidescreen";
        }
      
        // 🔁 Auto-select first sidescreen style option
        if (value !== "single") {
          const firstSidescreenThumb = document.querySelector(`.thumbnail[data-type="sidescreenStyle"]`);
          if (firstSidescreenThumb) {
            const firstSideValue = firstSidescreenThumb.getAttribute("data-value");
            state.selectedSidescreenStyle = firstSideValue;
            markSelected("sidescreenStyle", firstSideValue);
          }
        }

      } else if (type === "style") {
        state.selectedStyle = value;
      
        // Refresh thumbnails
        populateGlazingThumbnails(); 
        populateLetterplateThumbnails();
        populateSidescreenStyleThumbnails();
      
        // Auto-select first glazing option
        const firstGlazingThumb = document.querySelector(`.thumbnail[data-type="glazing"]`);
        if (firstGlazingThumb) {
          const firstValue = firstGlazingThumb.getAttribute("data-value");
          state.selectedGlazing = firstValue;
          markSelected("glazing", firstValue);
        }
      
        // Auto-select first sidescreen style option
        const firstSidescreenThumb = document.querySelector(`.thumbnail[data-type="sidescreenStyle"]`);
        if (firstSidescreenThumb) {
          const firstSideValue = firstSidescreenThumb.getAttribute("data-value");
          state.selectedSidescreenStyle = firstSideValue;
          markSelected("sidescreenStyle", firstSideValue);
        }
      
        updateCanvasPreview();
        updateSummary();
    
      
      } else if (type === "sidescreenStyle") {
        state.selectedSidescreenStyle = value;
      } else if (type === "finish") {
        state.selectedExternalFinish = value;
        state.currentView = "external";
        updateViewIndicator();
      } else if (type === "internalFinish") {
        state.selectedInternalFinish = value;
        state.currentView = "internal";
        updateViewIndicator();
      } else if (type === "glazing") {
        state.selectedGlazing = value;
      } else if (type === "letterplate") {
        state.selectedLetterplate = value;
      } else if (type === "hardwareColour") {
        state.selectedHardwareColor = value;
      } else if (type === "handle") {
        state.selectedHandle = value;
      }

      markSelected(type, value);
      const stepIndex = getStepIndexFromType(type);
      if (stepIndex !== -1) state.stepsCompleted[stepIndex] = true;
      updateNavigationControls();
      updateCanvasPreview();
      updateSummary();
    });
  });
}

function markSelected(type, value) {
  document.querySelectorAll(`.thumbnail[data-type="${type}"]`).forEach(el => {
    el.classList.remove("selected");
  });
  const chosen = document.querySelector(`.thumbnail[data-type="${type}"][data-value="${value}"]`);
  if (chosen) chosen.classList.add("selected");
}

function getStepIndexFromType(type) {
  if (type === "configuration") return 0;
  if (type === "style") return 1;
  if (type === "sidescreenStyle") return 2;
  if (type === "finish" || type === "internalFinish") return 3;
  if (type === "glazing") return 4;
  if (type === "hardwareColour" || type === "handle" || type === "letterplate") return 5;
  return -1;
}


/*
   ---------------------------------------------
   Start Screen
   ---------------------------------------------
*/
function populateStartRangeThumbnails() {
  const container = document.querySelector(".start-range-container");
  container.innerHTML = doorRanges.map(rng => `
    <div class="thumbnail range-thumbnail" data-range="${rng}">
      <img src="${getImageURL(rng + '-thumb')}" alt="${rng}">
      <p>${rng}</p>
    </div>
  `).join("");
  
  document.querySelectorAll(".start-range-container .range-thumbnail").forEach(thumb => {
    thumb.addEventListener("click", () => {
      state.selectedRange = thumb.getAttribute("data-range");
      populateStylesByRange();
      document.getElementById("startScreen").classList.add("hidden");
      document.querySelector(".door-designer-container").style.display = "flex";
      state.currentStep = 0;
      showStep(state.currentStep);
      updateNavigationControls();
      updateCanvasPreview();
      updateSummary();
    });
  });
}

function initializeStartScreen() {
  const startScreen = document.getElementById("startScreen");
  const doorDesignerContainer = document.querySelector(".door-designer-container");
  startScreen.classList.remove("hidden");
  doorDesignerContainer.style.display = "none";
  populateStartRangeThumbnails();
}


/*
   ---------------------------------------------
   DOMContentLoaded
   ---------------------------------------------
*/
document.addEventListener("DOMContentLoaded", () => {
  // Init the start screen (range selection)
  initializeStartScreen();

  // Step nav
  document.getElementById("backBtn").addEventListener("click", goToPreviousStep);
  document.getElementById("nextBtn").addEventListener("click", goToNextStep);

  // Populate step thumbnails
  populateConfigurationOptions();
  populateSidescreenStyleThumbnails();
  populateExternalFinishThumbnails();
  populateInternalFinishThumbnails();
  populateGlazingThumbnails();
  populateHardwareColorThumbnails();
  populateHandleThumbnails();
  populateLetterplateThumbnails();

  // Step menu clicks
  document.querySelectorAll(".step-menu-item").forEach((item, idx) => {
    item.addEventListener("click", () => {
      if (isStepAccessible(idx)) {
        state.currentStep = idx;
        showStep(idx);
        updateNavigationControls();
      }
    });
  });

  // Preview top bar
  document.getElementById("viewToggleBtn").addEventListener("click", () => {
    state.currentView = (state.currentView === "external") ? "internal" : "external";
    updateViewIndicator();
    updateCanvasPreview();
    updateSummary();
  });
  document.getElementById("saveDesignBtn").addEventListener("click", () => {
    compositeAndSave();
  });
  document.getElementById("visualiserToggleBtn").addEventListener("click", () => {
    document.querySelector(".door-designer-container").style.display = "none";
    document.getElementById("visualiserMode").style.display = "block";
    updateDoorOverlayCanvasSize();
    initializeDoorOverlay();
    updateDoorOverlay();
    updateBackgroundCanvas();
  });

  // Visualiser mode top bar
  document.getElementById("uploadImageBtn").addEventListener("click", () => {
    // Implementation of background image upload
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          state.backgroundImg = img;
          updateBackgroundCanvas();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  });

  document.getElementById("saveMockupBtn").addEventListener("click", () => {
    compositeAndSaveVisualiser();
  });

  document.getElementById("opacityToggleBtn").addEventListener("click", () => {
    state.glazingObscureEnabled = !state.glazingObscureEnabled;
    updateCanvasPreview();
    updateSummary(); // if summary reflects the glazing state
  });

  document.getElementById("toggleBackBtn").addEventListener("click", () => {
    document.getElementById("visualiserMode").style.display = "none";
    document.querySelector(".door-designer-container").style.display = "flex";
    updateCanvasPreview();
  });

  // Door overlay canvas mouse/touch events
  const doorOverlayCanvas = document.getElementById("doorOverlayCanvas");
  doorOverlayCanvas.addEventListener("mousedown", doorOverlayMouseDown);
  doorOverlayCanvas.addEventListener("mousemove", doorOverlayMouseMove);
  doorOverlayCanvas.addEventListener("mouseup", doorOverlayMouseUp);

  doorOverlayCanvas.addEventListener("touchstart", doorOverlayTouchStart, { passive: false });
  doorOverlayCanvas.addEventListener("touchmove", doorOverlayTouchMove, { passive: false });
  doorOverlayCanvas.addEventListener("touchend", doorOverlayTouchEnd, { passive: false });

  // Initial
  updateCanvasPreview();
  updateSummary();
  updateNavigationControls();
});

function compositeAndSave() {
  try {
    const previewCanvas = document.getElementById("previewCanvas");
    if (!previewCanvas) {
      console.error("Preview canvas not found");
      return;
    }

    // Flip for internal
    if (state.currentView === "internal") {
      mirrorCanvas(previewCanvas);
    }

    const styleName = styleDisplayNames[state.selectedStyle] || state.selectedStyle || "Style";
    const finishKey = (state.currentView === "external") ? state.selectedExternalFinish : state.selectedInternalFinish;
    const finishName = finishDisplayNames[finishKey] || finishKey || "Finish";
    const glazingName = glazingDisplayNames[state.selectedGlazing] || state.selectedGlazing || "Glass";

    const safeFileName = `${styleName}-${finishName}-${glazingName}.png`.replace(/[\/\\?%*:|"<>]/g, '-');

    const dataURL = previewCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Error in compositeAndSave:", err);
  }
}


export {
    buildPanelComposite,
    buildSidePanelComposite,
    updateCanvasPreview,
    compositeAndSave,
    addThumbnailClick,
    markSelected,
  };