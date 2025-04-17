import { getImageURL } from "./utils.js";
import { loadImage } from "./utils.js";
import { tintImage } from "./utils.js";
import { mirrorCanvas } from "./utils.js";
import { goToNextStep } from "./utils.js";
import { goToPreviousStep } from "./utils.js";

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


/*
   ---------------------------------------------
   Build the Door Panel (Frame, Corner Caps, etc.)
   EXACTLY as original code so sidescreens remain correct
   ---------------------------------------------
*/
async function buildPanelComposite(panelWidth, panelHeight, finish) {
  // For finish, we have a { color, texture, textureBlend }, from finishColorMap
  let baseColor = finish.color || "#ccc";
  let textureURL = finish.texture || null;

  // Step 1: draw the door panel "frame" elements onto an offscreen
  const elementsCanvas = document.createElement("canvas");
  elementsCanvas.width = panelWidth;
  elementsCanvas.height = panelHeight;
  const elementsCtx = elementsCanvas.getContext("2d");

  // The same original frame segments
  const doorPanelElements = [
    {
      id: "left-vertical-frame",
      rectFactor: { x: 0, y: 0.05, width: 0.13, height: 1 },
      options: { imageURL: getImageURL("frame"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    },
    {
      id: "right-vertical-frame",
      rectFactor: { x: 0.87, y: 0, width: 0.13, height: 1 },
      options: { imageURL: getImageURL("frame"), flipHorizontal: true, flipVertical: false, rotation: 0 }
    },
    {
      id: "bottom-left-corner",
      rectFactor: { x: 0, y: 0.97, width: 0.13, height: 0.032 },
      options: { imageURL: getImageURL("frame-cap"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    },
    {
      id: "bottom-right-corner",
      rectFactor: { x: 0.87, y: 0.97, width: 0.13, height: 0.032 },
      options: { imageURL: getImageURL("frame-cap"), flipHorizontal: true, flipVertical: false, rotation: 0 }
    },
    {
      id: "bottom-threshold",
      rectFactor: { x: 0.13, y: 0.97, width: 0.74, height: 0.032 },
      options: { imageURL: getImageURL("threshold"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    },
    {
      id: "top-left-corner",
      rectFactor: { x: 0, y: 0, width: 0.13, height: 0.06 },
      options: { imageURL: getImageURL("corner"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    },
    {
      id: "top-right-corner",
      rectFactor: { x: 0.87, y: 0, width: 0.13, height: 0.06 },
      options: { imageURL: getImageURL("corner"), flipHorizontal: true, flipVertical: false, rotation: 0 }
    },
    {
      id: "top-frame",
      rectFactor: { x: 0.125, y: 0, width: 0.75, height: 0.06 },
      options: { imageURL: getImageURL("frame-top"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    }
  ];

  // Helper to draw each piece
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

  // Draw them
  for (let elem of doorPanelElements) {
    const rect = {
      x: elem.rectFactor.x * panelWidth,
      y: elem.rectFactor.y * panelHeight,
      width: elem.rectFactor.width * panelWidth,
      height: elem.rectFactor.height * panelHeight
    };
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

  // Optional threshold or highlight overlay
  const thresholdOverlayConfig = {
    visible: true,
    xFactor: 0.07,
    yFactor: 0.989,
    widthFactor: 0.86,
    heightFactor: 0.02,
    fillStyle: "rgb(228, 228, 228)",
    blend: null
  };
  if (thresholdOverlayConfig.visible) {
    const threshX = thresholdOverlayConfig.xFactor * panelWidth;
    const threshY = thresholdOverlayConfig.yFactor * panelHeight;
    const threshW = thresholdOverlayConfig.widthFactor * panelWidth;
    const threshH = thresholdOverlayConfig.heightFactor * panelHeight;
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
    heightFactor: 0.008,
    fillStyle: "rgba(255, 255, 255, 0.5)",
    blend: "overlay"
  };
  if (panelOverlayConfig.visible) {
    const ovX = panelOverlayConfig.xFactor * panelWidth;
    const ovY = panelOverlayConfig.yFactor * panelHeight;
    const ovW = panelOverlayConfig.widthFactor * panelWidth;
    const ovH = panelOverlayConfig.heightFactor * panelHeight;
    finalCtx.globalCompositeOperation = panelOverlayConfig.blend;
    finalCtx.fillStyle = panelOverlayConfig.fillStyle;
    finalCtx.fillRect(ovX, ovY, ovW, ovH);
    finalCtx.globalCompositeOperation = "source-over";
  }

  // Multiply the frame elements onto it
  finalCtx.globalCompositeOperation = "multiply";
  finalCtx.drawImage(elementsCanvas, 0, 0);
  finalCtx.globalCompositeOperation = "source-over";

  return finalCanvas;
}


/*
   ---------------------------------------------
   Build a Sidescreen Panel
   EXACTLY as original so it doesn't break
   ---------------------------------------------
*/
async function buildSidePanelComposite(targetWidth, targetHeight, finish) {
  let baseColor = finish.color || "#ccc";
  let textureURL = finish.texture || null;
  let textureBlend = finish.textureBlend || "source-over";

  // We'll draw the sidescreen "frame" elements on an offscreen
  const elementsCanvas = document.createElement("canvas");
  elementsCanvas.width = targetWidth;
  elementsCanvas.height = targetHeight;
  const elementsCtx = elementsCanvas.getContext("2d");

  // The original sidescreen panel segments
  const sidescreenPanelElements = [
    {
      id: "sidescreen-top-frame",
      rectFactor: { x: 0.125, y: 0, width: 0.75, height: 0.06 },
      options: { imageURL: getImageURL("frame-top"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    },
    {
      id: "sidescreen-bottom-horizontal",
      rectFactor: { x: 0, y: 0.94, width: 1, height: 0.06 },
      options: { imageURL: getImageURL("frame-top"), flipHorizontal: false, flipVertical: true, rotation: 0 }
    },
    {
      id: "sidescreen-left-vertical",
      rectFactor: { x: 0, y: 0, width: 0.25, height: 1 },
      options: { imageURL: getImageURL("frame"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    },
    {
      id: "sidescreen-right-vertical",
      rectFactor: { x: 0.75, y: 0, width: 0.25, height: 1 },
      options: { imageURL: getImageURL("frame"), flipHorizontal: true, flipVertical: false, rotation: 0 }
    },
    {
      id: "sidescreen-top-left-corner",
      rectFactor: { x: 0, y: 0, width: 0.25, height: 0.06 },
      options: { imageURL: getImageURL("corner"), flipHorizontal: false, flipVertical: false, rotation: 0 }
    },
    {
      id: "sidescreen-top-right-corner",
      rectFactor: { x: 0.75, y: 0, width: 0.25, height: 0.06 },
      options: { imageURL: getImageURL("corner"), flipHorizontal: true, flipVertical: false, rotation: 0 }
    },
    {
      id: "sidescreen-bottom-left-corner",
      rectFactor: { x: 0, y: 0.94, width: 0.25, height: 0.06 },
      options: { imageURL: getImageURL("corner"), flipHorizontal: false, flipVertical: true, rotation: 0 }
    },
    {
      id: "sidescreen-bottom-right-corner",
      rectFactor: { x: 0.75, y: 0.94, width: 0.25, height: 0.06 },
      options: { imageURL: getImageURL("corner"), flipHorizontal: true, flipVertical: true, rotation: 0 }
    }
  ];

  // Reuse the panelElement drawer
  async function drawPanelElement(ctx, rect, options) {
    const img = await loadImage(options.imageURL);
    if (!img) return;
    ctx.save();
    ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
    const scaleX = options.flipHorizontal ? -1 : 1;
    const scaleY = options.flipVertical ? -1 : 1;
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(img, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
    ctx.restore();
  }

  // Draw them
  for (let el of sidescreenPanelElements) {
    const rect = {
      x: el.rectFactor.x * targetWidth,
      y: el.rectFactor.y * targetHeight,
      width: el.rectFactor.width * targetWidth,
      height: el.rectFactor.height * targetHeight
    };
    await drawPanelElement(elementsCtx, rect, el.options);
  }

  // Combine onto final
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext("2d");

  // Fill base color
  finalCtx.fillStyle = baseColor;
  finalCtx.fillRect(0, 0, targetWidth, targetHeight);

  // If there's a texture
  if (textureURL) {
    const textureImg = await loadImage(textureURL);
    if (textureImg) {
      finalCtx.globalCompositeOperation = textureBlend;
      finalCtx.drawImage(textureImg, 0, 0, targetWidth, targetHeight);
      finalCtx.globalCompositeOperation = "source-over";
    }
  }

  finalCtx.globalCompositeOperation = "multiply";
  finalCtx.drawImage(elementsCanvas, 0, 0);
  finalCtx.globalCompositeOperation = "source-over";

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
    const panelHeight = 600; // pick any size you like
    const panelWidth = 300;  // ratio 1:2, or adjust as you wish

    // Determine finish data for external or internal
    const finishKey = (state.currentView === "external") ? state.selectedExternalFinish : state.selectedInternalFinish;
    const finishData = finishColorMap[finishKey] || { color: "#ddd", texture: null, textureBlend: "source-over" };

    // Build sidescreens if needed
    let leftSidePanel = null;
    let rightSidePanel = null;
    if (state.selectedConfiguration === "single-left" || state.selectedConfiguration === "single-both") {
      leftSidePanel = await buildSidePanelComposite(panelWidth * 0.5, panelHeight, finishData);
    }
    if (state.selectedConfiguration === "single-right" || state.selectedConfiguration === "single-both") {
      rightSidePanel = await buildSidePanelComposite(panelWidth * 0.5, panelHeight, finishData);
    }

    // Build main door panel
    const panelCanvas = await buildPanelComposite(panelWidth, panelHeight, finishData);

    // Prepare preview canvas
    const previewCanvas = document.getElementById("previewCanvas");
    let totalWidth = panelWidth;
    if (leftSidePanel) totalWidth += panelWidth * 0.5;
    if (rightSidePanel) totalWidth += panelWidth * 0.5;
    previewCanvas.width = totalWidth;
    previewCanvas.height = panelHeight;
    const ctx = previewCanvas.getContext("2d");
    ctx.clearRect(0, 0, totalWidth, panelHeight);

    // Draw left sidescreen if present
    let offsetX = 0;
    if (leftSidePanel) {
      ctx.drawImage(leftSidePanel, 0, 0);
      offsetX += panelWidth * 0.5;
    }

    // Draw main door panel
    ctx.drawImage(panelCanvas, offsetX, 0);

    // 1) Look up style
    const styleObj = doorStyles.find(s => s.name === state.selectedStyle);

    // 2) If style has a texture, draw it from textureDefs
    if (styleObj && styleObj.styleAssets && styleObj.styleAssets.texture) {
      let texDef = textureDefs.find(t => t.id === styleObj.styleAssets.texture);
      if (texDef && texDef.image) {
        let textureImg = await loadImage(getImageURL(texDef.image));
        if (textureImg) {
          // We'll fill the entire door area with this texture 
          // or you can define coords in textureDefs if needed
          ctx.drawImage(textureImg, offsetX, 0, panelWidth, panelHeight);
        }
      }
    }

    // 3) If style has a molding, draw it from moldingDefs
    if (styleObj && styleObj.styleAssets && styleObj.styleAssets.molding) {
      let moldDef = moldingDefs.find(m => m.id === styleObj.styleAssets.molding);
      if (moldDef) {
        let moldImg = await loadImage(getImageURL(moldDef.image));
        if (moldImg) {
          const moldW = panelWidth * moldDef.widthFactor;
          const moldH = panelHeight * moldDef.heightFactor;
          const moldX = offsetX + (panelWidth * moldDef.xFactor);
          const moldY = panelHeight * moldDef.yFactor;
          ctx.drawImage(moldImg, moldX, moldY, moldW, moldH);
        }
      }
    }

    // 4) Glazing
    if (state.selectedGlazing !== "none") {
      let glazeDef = glazingDefs.find(g => g.id === state.selectedGlazing);
      if (glazeDef && glazeDef.image) {
        const glazeImg = await loadImage(getImageURL(glazeDef.image));
        if (glazeImg) {
          const gw = panelWidth * glazeDef.widthFactor;
          const gh = panelHeight * glazeDef.heightFactor;
          const gx = offsetX + (panelWidth * glazeDef.xFactor);
          const gy = panelHeight * glazeDef.yFactor;
          ctx.drawImage(glazeImg, gx, gy, gw, gh);
        }
      }
    }

    // 5) Letterplate
    if (state.selectedLetterplate && state.selectedLetterplate !== "letterplate-none") {
      let variantId = state.selectedLetterplate;
      if (styleObj && styleObj.letterplateOptions && styleObj.letterplateOptions[state.selectedLetterplate]) {
        variantId = styleObj.letterplateOptions[state.selectedLetterplate];
      }
      let lpDef = letterplateDefs.find(def => def.id === variantId);
      if (lpDef) {
        let lpImg = await loadImage(getImageURL("letterplate"));
        if (lpImg) {
          const scaleFactorX = panelWidth / 400; // same approach as your original
          const scaleFactorY = panelHeight / 800;
          let tintedLp = tintImage(lpImg, hardwareColorMap[state.selectedHardwareColor] || "#000");
          const lpX = offsetX + lpDef.coordinates.x * scaleFactorX;
          const lpY = lpDef.coordinates.y * scaleFactorY;
          const lpW = lpDef.width * scaleFactorX;
          const lpH = lpDef.height * scaleFactorY;
          ctx.drawImage(tintedLp, lpX, lpY, lpW, lpH);
        }
      }
    }

    // 6) Handle
    if (state.selectedHandle && state.selectedHandle !== "none") {
      let hDef = handleDefs.find(def => def.id === state.selectedHandle);
      if (hDef) {
        let hImg = await loadImage(getImageURL(state.selectedHandle));
        if (hImg) {
          const sfx = panelWidth / 400;
          const sfy = panelHeight / 800;
          let tintedH = tintImage(hImg, hardwareColorMap[state.selectedHardwareColor] || "#000");
          const hX = offsetX + hDef.coordinates.x * sfx;
          const hY = hDef.coordinates.y * sfy;
          const hW = hDef.width * sfx;
          const hH = hDef.height * sfy;
          ctx.drawImage(tintedH, hX, hY, hW, hH);

          // shading if wanted
          let shadingImg = await loadImage(getImageURL("lever"));
          if (shadingImg) {
            ctx.globalCompositeOperation = "multiply";
            ctx.drawImage(shadingImg, hX, hY, hW, hH);
            ctx.globalCompositeOperation = "source-over";
          }
        }
      }
    }

    // 7) Right sidescreen if present
    if (rightSidePanel) {
      ctx.drawImage(rightSidePanel, offsetX + panelWidth, 0);
    }

    // 8) If internal, mirror
    if (state.currentView === "internal") {
      mirrorCanvas(previewCanvas);
    }
  } catch (err) {
    console.error("Error in updateCanvasPreview:", err);
  }
}


/*
   ---------------------------------------------
   COMPOSITE & SAVE
   ---------------------------------------------
   Similar logic as updateCanvasPreview, but we do it on an offscreen 
   so we can produce a final full-size PNG.
*/
async function compositeAndSave() {
  try {
    // For simplicity, do the same scale as preview:
    const panelHeight = 1200; // double for higher resolution
    const panelWidth = 600;  
    const finishKey = (state.currentView === "external") ? state.selectedExternalFinish : state.selectedInternalFinish;
    const finishData = finishColorMap[finishKey] || { color: "#ddd", texture: null, textureBlend: "source-over" };

    let leftSidePanel = null;
    let rightSidePanel = null;
    if (state.selectedConfiguration === "single-left" || state.selectedConfiguration === "single-both") {
      leftSidePanel = await buildSidePanelComposite(panelWidth * 0.5, panelHeight, finishData);
    }
    if (state.selectedConfiguration === "single-right" || state.selectedConfiguration === "single-both") {
      rightSidePanel = await buildSidePanelComposite(panelWidth * 0.5, panelHeight, finishData);
    }

    const panelCanvas = await buildPanelComposite(panelWidth, panelHeight, finishData);

    // Offscreen
    let totalWidth = panelWidth;
    if (leftSidePanel) totalWidth += panelWidth * 0.5;
    if (rightSidePanel) totalWidth += panelWidth * 0.5;

    const offscreen = document.createElement("canvas");
    offscreen.width = totalWidth;
    offscreen.height = panelHeight;
    const ctx = offscreen.getContext("2d");
    ctx.clearRect(0, 0, totalWidth, panelHeight);

    // Draw left side
    let offsetX = 0;
    if (leftSidePanel) {
      ctx.drawImage(leftSidePanel, 0, 0);
      offsetX += panelWidth * 0.5;
    }

    // Draw main door
    ctx.drawImage(panelCanvas, offsetX, 0);

    // Style logic
    const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
    if (styleObj && styleObj.styleAssets) {
      // texture
      if (styleObj.styleAssets.texture) {
        let texDef = textureDefs.find(t => t.id === styleObj.styleAssets.texture);
        if (texDef && texDef.image) {
          let texImg = await loadImage(getImageURL(texDef.image));
          if (texImg) {
            ctx.drawImage(texImg, offsetX, 0, panelWidth, panelHeight);
          }
        }
      }
      // molding
      if (styleObj.styleAssets.molding) {
        let moldDef = moldingDefs.find(m => m.id === styleObj.styleAssets.molding);
        if (moldDef) {
          let moldImg = await loadImage(getImageURL(moldDef.image));
          if (moldImg) {
            const moldW = panelWidth * moldDef.widthFactor;
            const moldH = panelHeight * moldDef.heightFactor;
            const moldX = offsetX + panelWidth * moldDef.xFactor;
            const moldY = panelHeight * moldDef.yFactor;
            ctx.drawImage(moldImg, moldX, moldY, moldW, moldH);
          }
        }
      }
    }

    // Glazing
    if (state.selectedGlazing !== "none") {
      let glazeDef = glazingDefs.find(g => g.id === state.selectedGlazing);
      if (glazeDef && glazeDef.image) {
        let glzImg = await loadImage(getImageURL(glazeDef.image));
        if (glzImg) {
          const gw = panelWidth * glazeDef.widthFactor;
          const gh = panelHeight * glazeDef.heightFactor;
          const gx = offsetX + panelWidth * glazeDef.xFactor;
          const gy = panelHeight * glazeDef.yFactor;
          ctx.drawImage(glzImg, gx, gy, gw, gh);
        }
      }
    }

    // Letterplate
    if (state.selectedLetterplate && state.selectedLetterplate !== "letterplate-none") {
      let variantId = state.selectedLetterplate;
      if (styleObj && styleObj.letterplateOptions && styleObj.letterplateOptions[state.selectedLetterplate]) {
        variantId = styleObj.letterplateOptions[state.selectedLetterplate];
      }
      let lpDef = letterplateDefs.find(def => def.id === variantId);
      if (lpDef) {
        let lpImg = await loadImage(getImageURL("letterplate"));
        if (lpImg) {
          const scaleFactorX = panelWidth / 400;
          const scaleFactorY = panelHeight / 800;
          let tintedLp = tintImage(lpImg, hardwareColorMap[state.selectedHardwareColor] || "#000");
          const lpX = offsetX + lpDef.coordinates.x * scaleFactorX;
          const lpY = lpDef.coordinates.y * scaleFactorY;
          const lpW = lpDef.width * scaleFactorX;
          const lpH = lpDef.height * scaleFactorY;
          ctx.drawImage(tintedLp, lpX, lpY, lpW, lpH);
        }
      }
    }

    // Handle
    if (state.selectedHandle && state.selectedHandle !== "none") {
      let hDef = handleDefs.find(def => def.id === state.selectedHandle);
      if (hDef) {
        let hImg = await loadImage(getImageURL(state.selectedHandle));
        if (hImg) {
          const sfx = panelWidth / 400;
          const sfy = panelHeight / 800;
          let tintedH = tintImage(hImg, hardwareColorMap[state.selectedHardwareColor] || "#000");
          const hX = offsetX + hDef.coordinates.x * sfx;
          const hY = hDef.coordinates.y * sfy;
          const hW = hDef.width * sfx;
          const hH = hDef.height * sfy;
          ctx.drawImage(tintedH, hX, hY, hW, hH);

          let shadingImg = await loadImage(getImageURL("lever"));
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
      mirrorCanvas(offscreen);
    }

    // Produce file name
    const styleName = styleDisplayNames[state.selectedStyle] || state.selectedStyle;
    const finishName = finishDisplayNames[finishKey] || finishKey;
    const glazingName = glazingDisplayNames[state.selectedGlazing] || state.selectedGlazing;
    const fileName = `${styleName}, ${finishName}, ${glazingName} Glass.png`;

    // Download
    const dataURL = offscreen.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        state.selectedSideScreenStyle = value;
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
export {
    buildPanelComposite,
    buildSidePanelComposite,
    updateCanvasPreview,
    compositeAndSave,
    addThumbnailClick,
    markSelected,
  };
