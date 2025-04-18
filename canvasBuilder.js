
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
import { sidescreenMoldingDefs } from "./data.js";
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
        // Margins
        const marginX = grooveDef.marginX ?? grooveDef.margin ?? 0;
        const marginY = grooveDef.marginY ?? grooveDef.margin ?? 0;
  
        const grooveX = marginX;
        const grooveY = marginY;
        const grooveW = panelWidth - marginX * 2;
        const grooveH = panelHeight; - marginY * 2;
  
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
   EXACTLY as original so it doesn't break
   ---------------------------------------------
*/

async function buildSidePanelComposite(targetWidth, targetHeight, finish) {
  const baseColor = finish.color || "#ccc";
  const textureURL = finish.texture || null;
  const textureBlend = finish.textureBlend || "source-over";

  const sidescreenStyle = sidescreenStyleDefs.find(s => s.id === state.selectedSidescreenStyle);
  console.log("Selected sidescreen style:", state.selectedSideScreenStyle, sidescreenStyle);

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
  const matchedStyle = doorStyles.find(s => s.name === state.selectedStyle);
  grooveId = matchedStyle?.styleAssets?.texture;
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

  // Draw frame elements
  finalCtx.globalCompositeOperation = "multiply";
  finalCtx.drawImage(elementsCanvas, 0, 0);
  finalCtx.globalCompositeOperation = "source-over";

  // ✅ Draw molding from sidescreen style
  if (sidescreenStyle?.molding) {
    const moldDef = sidescreenMoldingDefs.find(m => m.id === sidescreenStyle.molding);
    if (moldDef && moldDef.image) {
      const img = await loadImage(getImageURL(moldDef.image));
      if (img) {
        const x = moldDef.align === "left"
          ? 40
          : moldDef.align === "right"
          ? targetWidth - moldDef.width - 40
          : (targetWidth - moldDef.width) / 2;
        const y = targetHeight - moldDef.height - moldDef.offsetY;

        finalCtx.drawImage(img, x, y, moldDef.width, moldDef.height);
      }
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
    }
    
    // Draw main door panel
    ctx.drawImage(panelCanvas, offsetX, 0);

    // 1) Look up style
    const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
  
    // 2) If style has a molding, draw it from moldingDefs
    if (styleObj && styleObj.styleAssets && styleObj.styleAssets.molding) {
      let moldDef = moldingDefs.find(m => m.id === styleObj.styleAssets.molding);
      if (moldDef) {
        let moldImg = await loadImage(getImageURL(moldDef.image));
        if (moldImg) {
          const mw = moldDef.width;
          const mh = moldDef.height;
    
          const moldingX = moldDef.align === "left"
            ? offsetX + 40
            : moldDef.align === "right"
            ? offsetX + (panelWidth - mw - 40)
            : offsetX + (panelWidth - mw) / 2;
    
          const moldingY = panelHeight - mh - moldDef.offsetY;
    
          ctx.drawImage(moldImg, moldingX, moldingY, mw, mh);
        }
      }
    }

    // Glazing
    if (state.selectedGlazing !== "none") {
      let glazeDef = glazingDefs.find(g => g.id === state.selectedGlazing);
      if (glazeDef && glazeDef.image) {
        let glzImg = await loadImage(getImageURL(glazeDef.image));
        if (glzImg) {
          const gw = glazeDef.width;
          const gh = glazeDef.height;
          const glazingX = glazeDef.align === "left"
            ? offsetX + 40
            : glazeDef.align === "right"
            ? offsetX + (panelWidth - gw - 40)
            : offsetX + (panelWidth - gw) / 2;
          const glazingY = panelHeight - gh - glazeDef.offsetY;
          
          ctx.drawImage(glzImg, glazingX, glazingY, gw, gh);
        }
      }
    }

   // Letterplate
if (state.selectedLetterplate && state.selectedLetterplate !== "letterplate-none") {
  let variantId = state.selectedLetterplate;

  if (styleObj && styleObj.letterplateOptions && styleObj.letterplateOptions[state.selectedLetterplate]) {
    variantId = styleObj.letterplateOptions[state.selectedLetterplate];
  }

  const lpDef = letterplateDefs.find(def => def.id === variantId);
  if (lpDef) {
    const lpImg = await loadImage(getImageURL("letterplate"));
    const overlayImg = await loadImage(getImageURL("letterplate"));

    if (lpImg) {
      const lpW = lpDef.width;
      const lpH = lpDef.height;

      const lpX = lpDef.align === "left"
        ? offsetX + 40
        : lpDef.align === "right"
        ? offsetX + (panelWidth - lpW - 40)
        : offsetX + (panelWidth - lpW) / 2;

      const lpY = panelHeight - lpH - lpDef.offsetY;

      const tintedLp = tintImage(lpImg, hardwareColorMap[state.selectedHardwareColor] || "#000");
      ctx.drawImage(tintedLp, lpX, lpY, lpW, lpH);

      if (overlayImg) {
        const overlayOpacity = 0.45
        ctx.globalAlpha = overlayOpacity;
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(overlayImg, lpX, lpY, lpW, lpH);
        ctx.globalAlpha = 1.0; // reset
        ctx.globalCompositeOperation = "source-over";
      }
    }
  }
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
      } else if (type === "style") {
        state.selectedStyle = value;
        populateGlazingThumbnails(); 
        populateLetterplateThumbnails();
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