import {
  getImageURL,
  loadImage,
  tintImage,
  mirrorCanvas,
  goToNextStep,
  goToPreviousStep,
  getDoorPanelDimensionsFromInput,
  getSidescreenDimensionsFromInput,
} from "./utils.js";
import { createBasePanel } from "./panelBaseBuilder.js";
import { composeElementGroup } from "./elementGroupBuilder.js";
import { buildMoldingMask } from "./utils.js";

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
import { updateConfigurationOptionVisibility } from "./ui.js";

import { showStep } from "./main.js";
import { isStepAccessible } from "./main.js";
import { updateNavigationControls } from "./main.js";

import { doorStyles } from "./data.js";
import { finishOptions } from "./data.js";
import { hardwareColorMap } from "./data.js";
import { glazingDefs } from "./data.js";
import { letterplateDefs } from "./data.js";
import { handleDefs } from "./data.js";
import { textureDefs } from "./data.js";
import { moldingDefs } from "./data.js";
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

import {
  styleDisplayNames,
  glazingDisplayNames,
  letterplateDisplayNames,
  handleDisplayNames,
  configurations,
} from "./data.js";

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
  ctx.drawImage(
    img,
    -rect.width / 2,
    -rect.height / 2,
    rect.width,
    rect.height
  );

  ctx.restore();
}

function getCurrentFrameFinish() {
  const key = state.currentView === "external"
    ? state.selectedExternalFrameFinish
    : state.selectedInternalFrameFinish;

  return (
    finishOptions.find((f) => f.name === key) || {
      color: "#ccc",
      texture: null,
      textureBlend: "source-over",
    }
  );
}

async function applyFinishToElementGroup({
  width,
  height,
  finish,
  elements,
  mask = null,
}) {
  return await composeElementGroup({
    width,
    height,
    baseColor: finish.color || "#ccc",
    textureURL: finish.texture || null,
    textureBlend: finish.textureBlend || "overlay",
    elements,
    mask,
  });
}

/*
   ---------------------------------------------
   Build the Door Panel
   ---------------------------------------------
*/

async function buildPanelComposite(panelWidth, panelHeight, finish, frameFinish) {
  const styleObj = doorStyles.find((s) => s.name === state.selectedStyle);

  // Groove texture def
  const grooveTextureDef = styleObj?.styleAssets?.texture
    ? textureDefs.find((t) => t.id === styleObj.styleAssets.texture)
    : null;

  // Step 1: Create base panel
  const finalCanvas = await createBasePanel({
    width: panelWidth,
    height: panelHeight,
    baseColor: finish.color || "#ccc",
    woodTextureURL: finish.texture || null,
    grooveTextureDef,
  });
  const finalCtx = finalCanvas.getContext("2d");

  // lighting overlay
  const lightingOverlayConfig = {
    visible: true,
    xFactor: 0,
    yFactor: 0,
    widthFactor: 1,
    heightFactor: 0.8,
    blend: "overlay",
  };

  if (lightingOverlayConfig.visible) {
    const ovX = lightingOverlayConfig.xFactor * panelWidth;
    const ovY = lightingOverlayConfig.yFactor * panelHeight;
    const ovW = lightingOverlayConfig.widthFactor * panelWidth;
    const ovH = lightingOverlayConfig.heightFactor * panelHeight;

    const gradient = finalCtx.createLinearGradient(ovX, ovY, ovX, ovY + ovH);
    gradient.addColorStop(0, "rgba(208, 208, 208, 0.15)"); // Top (brighter)
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // Bottom (transparent)

    finalCtx.globalCompositeOperation = lightingOverlayConfig.blend;
    finalCtx.fillStyle = gradient;
    finalCtx.fillRect(ovX, ovY, ovW, ovH);
    finalCtx.globalCompositeOperation = "source-over";
  }

  // Glossy panel overlay
  const metalOverlayConfig = {
    visible: true,
    xFactor: 0.13,
    yFactor: 0.96,
    widthFactor: 1,
    height: 5,
    fillStyle: "rgba(255, 255, 255, 0.35)",
    blend: "overlay",
  };

  if (metalOverlayConfig.visible) {
    const ovX = metalOverlayConfig.xFactor * panelWidth;
    const ovY = metalOverlayConfig.yFactor * panelHeight;
    const ovW = metalOverlayConfig.widthFactor * panelWidth;
    const ovH = metalOverlayConfig.height;
    finalCtx.globalCompositeOperation = metalOverlayConfig.blend;
    finalCtx.fillStyle = metalOverlayConfig.fillStyle;
    finalCtx.fillRect(ovX, ovY, ovW, ovH);
    finalCtx.globalCompositeOperation = "source-over";
  }

  // Step 2: Frame
  const frameElements = JSON.parse(
    JSON.stringify([
      {
        id: "top-frame",
        mixedRect: { y: 0, height: 35, xFactor: 0, widthFactor: 1 },
        options: { imageURL: getImageURL("frame-x") },
      },
      {
        id: "bottom-frame",
        mixedRect: { y: "bottom", height: 17, xFactor: 0, widthFactor: 1 },
        options: { imageURL: getImageURL("frame-x") },
      },
      {
        id: "left-vertical-frame",
        mixedRect: { x: 0, width: 35, yFactor: 0, heightFactor: 1 },
        options: { imageURL: getImageURL("frame-y") },
      },
      {
        id: "right-vertical-frame",
        mixedRect: { x: "right", width: 35, yFactor: 0, heightFactor: 1 },
        options: { imageURL: getImageURL("frame-y"), flipHorizontal: true },
      },
      {
        id: "top-left-corner",
        rect: { x: 0, y: 0, width: 35, height: 35 },
        options: { imageURL: getImageURL("frame-corner") },
      },
      {
        id: "top-right-corner",
        rect: { x: "right", y: 0, width: 35, height: 35 },
        options: {
          imageURL: getImageURL("frame-corner"),
          flipHorizontal: true,
        },
      },
      {
        id: "bottom-right-corner",
        rect: { x: "right", y: "bottom", width: 35, height: 35 },
        options: {
          imageURL: getImageURL("frame-y"),
          flipVertical: true,
          flipHorizontal: true,
        },
      },
      {
        id: "bottom-left-corner",
        rect: { x: 0, y: "bottom", width: 35, height: 35 },
        options: { imageURL: getImageURL("frame-y"), flipVertical: true },
      },
    ])
  );

  const frameMask = buildMoldingMask(
    { elements: frameElements },
    panelWidth,
    panelHeight
  );


  const frameCanvas = await applyFinishToElementGroup({
    width: panelWidth,
    height: panelHeight,
    finish: frameFinish,
    elements: frameElements,
    mask: frameMask,
  });
  finalCtx.drawImage(frameCanvas, 0, 0);
  finalCtx.globalCompositeOperation = "source-over";

  // Step 3: Glazing
  if (state.selectedGlazing && state.selectedGlazing !== "none") {
    const glazeDef = glazingDefs.find((g) => g.id === state.selectedGlazing);
    const layout = styleObj?.glazingLayout;

    if (glazeDef && layout) {
      const mmToPx = 600 / 1980;

      const width = Math.round((layout.width ?? 0) * mmToPx);
      const height = Math.round((layout.height ?? 0) * mmToPx);
      const offsetX = Math.round((layout.offsetX ?? 0) * mmToPx);
      const offsetY = Math.round((layout.offsetY ?? 0) * mmToPx);
      const align = layout.align ?? "center";

      const modifierList = [];
      if (layout.imageModifier) modifierList.push(layout.imageModifier);
      if (state.glazingObscureEnabled) modifierList.push("obscure");

      const baseName = glazeDef.image?.toLowerCase().replace(/\.png$/, "");
      const imgKey = [baseName, ...modifierList].join("-");

      const sharedImg = await loadImage(getImageURL(imgKey)).catch(() =>
        loadImage(getImageURL(baseName))
      );

      const glazeCanvas = document.createElement("canvas");
      glazeCanvas.width = width;
      glazeCanvas.height = height;
      const glazeCtx = glazeCanvas.getContext("2d");

      if (sharedImg && layout.elements?.length) {
        for (const el of layout.elements) {
          const r = el.rect ?? {};

          const w = r.width === "full" ? width : Math.round(r.width * mmToPx);
          const h =
            r.height === "full" ? height : Math.round(r.height * mmToPx);

          const x =
            r.x === "right"
              ? width - w
              : r.x === "centre"
              ? (width - w) / 2
              : r.x !== undefined
              ? Math.round(r.x * mmToPx)
              : (r.xFactor ?? 0) * width;

          const y =
            r.y === "bottom"
              ? height - h
              : r.y === "centre"
              ? (height - h) / 2
              : r.y !== undefined
              ? Math.round(r.y * mmToPx)
              : (r.yFactor ?? 0) * height;

          glazeCtx.save();
          glazeCtx.translate(x + w / 2, y + h / 2);
          if (el.options?.rotation) {
            glazeCtx.rotate((el.options.rotation * Math.PI) / 180);
          }
          const scaleX = el.options?.flipHorizontal ? -1 : 1;
          const scaleY = el.options?.flipVertical ? -1 : 1;
          glazeCtx.scale(scaleX, scaleY);
          glazeCtx.drawImage(sharedImg, -w / 2, -h / 2, w, h);
          glazeCtx.restore();
        }
      } else if (sharedImg) {
        glazeCtx.drawImage(sharedImg, 0, 0, width, height);
      }

      const glazeX =
        align === "left"
          ? offsetX
          : align === "right"
          ? panelWidth - width + offsetX
          : (panelWidth - width) / 2 + offsetX;

      const blockAnchor = layout.blockAnchor ?? "bottom";
      const verticalAlign = layout.verticalAlign ?? "bottom";

      const anchorY =
        verticalAlign === "top"
          ? 0
          : ["center", "centre"].includes(verticalAlign)
          ? panelHeight / 2
          : panelHeight;

      const glazeY =
        blockAnchor === "centre"
          ? anchorY - height / 2 + offsetY
          : blockAnchor === "top"
          ? anchorY + offsetY
          : anchorY - height + offsetY;

      finalCtx.drawImage(glazeCanvas, glazeX, glazeY);
    }
  }

  // Step 4: Molding
  const moldingDef = styleObj?.styleAssets?.molding
    ? moldingDefs.find((m) => m.id === styleObj.styleAssets.molding)
    : null;

  let moldingElements = [];

  const mmToPx = 600 / 1980; // consistent mm-to-px scale used throughout your app

  const moldW = Math.round((moldingDef?.width ?? 0) * mmToPx);
  const moldH = Math.round((moldingDef?.height ?? 0) * mmToPx);
  const offsetX = Math.round((moldingDef?.offsetX ?? 0) * mmToPx);
  const offsetY = Math.round((moldingDef?.offsetY ?? 0) * mmToPx);

  if (moldingDef?.repeat && moldingDef?.cell?.elements) {
    const { rows, cols, gapX = 0, gapY = 0 } = moldingDef.repeat;
    const cellW = Math.round(moldingDef.cell.width * mmToPx);
    const cellH = Math.round(moldingDef.cell.height * mmToPx);
    const cellElements = moldingDef.cell.elements;

    const totalGridWidth = cols * cellW + (cols - 1) * gapX;
    const totalGridHeight = rows * cellH + (rows - 1) * gapY;

    const gridOffsetX = (moldW - totalGridWidth) / 2;
    const gridOffsetY = (moldH - totalGridHeight) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellOffsetX = gridOffsetX + col * (cellW + gapX);
        const cellOffsetY = gridOffsetY + row * (cellH + gapY);

        for (const el of cellElements) {
          const cloned = JSON.parse(JSON.stringify(el));
          const r = cloned.rect ?? {};

          const w =
            r.width !== undefined
              ? r.width === "full"
                ? cellW
                : Math.round(r.width * mmToPx)
              : (r.widthFactor ?? 0) * cellW;

          const h =
            r.height !== undefined
              ? Math.round(r.height * mmToPx)
              : (r.heightFactor ?? 0) * cellH;

          const x =
            r.x === "right"
              ? cellW - w
              : r.x === "centre"
              ? (cellW - w) / 2
              : r.x !== undefined
              ? Math.round(r.x * mmToPx)
              : (r.xFactor ?? 0) * cellW;

          const y =
            r.y === "bottom"
              ? cellH - h
              : r.y === "centre"
              ? (cellH - h) / 2
              : r.y !== undefined
              ? Math.round(r.y * mmToPx)
              : (r.yFactor ?? 0) * cellH;

          cloned.rect = {
            x: cellOffsetX + x,
            y: cellOffsetY + y,
            width: w,
            height: h,
          };

          delete cloned.mixedRect;
          moldingElements.push(cloned);
        }
      }
    }
  } else if (moldingDef?.elements) {
    moldingElements = JSON.parse(JSON.stringify(moldingDef.elements));

    for (const el of moldingElements) {
      const r = el.rect ?? {};

      const w =
        r.width !== undefined
          ? r.width === "full"
            ? moldW
            : Math.round(r.width * mmToPx)
          : (r.widthFactor ?? 0) * moldW;

      const h =
        r.height !== undefined
          ? Math.round(r.height * mmToPx)
          : (r.heightFactor ?? 0) * moldH;

      const x =
        r.x === "right"
          ? moldW - w
          : r.x === "centre"
          ? (moldW - w) / 2
          : r.x !== undefined
          ? Math.round(r.x * mmToPx)
          : (r.xFactor ?? 0) * moldW;

      const y =
        r.y === "bottom"
          ? moldH - h
          : r.y === "centre"
          ? (moldH - h) / 2
          : r.y !== undefined
          ? Math.round(r.y * mmToPx)
          : (r.yFactor ?? 0) * moldH;

      el.rect = { x, y, width: w, height: h };
      delete el.mixedRect;
    }
  }

  if (moldingElements.length > 0) {
    const moldingCanvas = await composeElementGroup({
      width: moldW,
      height: moldH,
      baseColor: finish.color,
      textureURL: finish.texture,
      elements: moldingElements,
      mask:
        moldingDef.mask === false
          ? null
          : buildMoldingMask({ elements: moldingElements }, moldW, moldH),
    });

    const align = moldingDef.align ?? "center";
    const verticalAlign = moldingDef.verticalAlign ?? "bottom";

    const moldX =
      align === "left"
        ? offsetX
        : align === "right"
        ? panelWidth - moldW + offsetX
        : (panelWidth - moldW) / 2 + offsetX;

    const blockAnchor = moldingDef.blockAnchor ?? "bottom";

    const anchorY =
      verticalAlign === "top"
        ? 0
        : ["center", "centre"].includes(verticalAlign)
        ? panelHeight / 2
        : panelHeight;

    const moldY =
      blockAnchor === "centre"
        ? anchorY - moldH / 2 + offsetY
        : blockAnchor === "top"
        ? anchorY + offsetY
        : anchorY - moldH + offsetY;

    finalCtx.drawImage(moldingCanvas, moldX, moldY);
    finalCtx.globalCompositeOperation = "source-over";
  }

  // Step 6: Handle
  if (state.selectedHandle && state.selectedHandle !== "none") {
    const hDef = handleDefs.find((def) => def.id === state.selectedHandle);
    if (hDef) {
      const handleImg = await loadImage(getImageURL(state.selectedHandle));
      if (handleImg) {
        const hW = hDef.width;
        const hH = hDef.height;

        const isLeft = state.handleSide === "left";
        const hX = isLeft ? hDef.offsetX : panelWidth - hW - hDef.offsetX;
        const hY = panelHeight - hH - hDef.offsetY;

        // 1. Tint and optionally flip
        const tintedHandle = tintImage(
          handleImg,
          hardwareColorMap[state.selectedHardwareColor] || "#000"
        );

        finalCtx.save();
        if (isLeft) {
          finalCtx.translate(hX + hW / 2, hY + hH / 2);
          finalCtx.scale(-1, 1); // Mirror horizontally
          finalCtx.drawImage(tintedHandle, -hW / 2, -hH / 2, hW, hH);
        } else {
          finalCtx.drawImage(tintedHandle, hX, hY, hW, hH);
        }
        finalCtx.restore();

        // 2. Multiply shading (same mirror logic)
        const shadingImg = await loadImage(getImageURL(state.selectedHandle));
        if (shadingImg) {
          finalCtx.globalCompositeOperation = "multiply";
          finalCtx.save();
          if (isLeft) {
            finalCtx.translate(hX + hW / 2, hY + hH / 2);
            finalCtx.scale(-1, 1);
            finalCtx.drawImage(shadingImg, -hW / 2, -hH / 2, hW, hH);
          } else {
            finalCtx.drawImage(shadingImg, hX, hY, hW, hH);
          }
          finalCtx.restore();
          finalCtx.globalCompositeOperation = "source-over";
        }
      }
      // Step 7: Internal-only Hinge
      if (state.currentView === "internal") {
        const hingeImg = await loadImage(getImageURL("hinge"));
        if (hingeImg) {
          const hW = 10;
          const hH = 40;
          const gap = 320;
          const startY = 130;

          const hingeOffsetX = hDef.hingeOffsetX ?? 24;
          const isLeft = state.handleSide === "left";
          const hingeX = isLeft ? panelWidth - hW - hingeOffsetX : hingeOffsetX;

          const internalFinishData =
          finishOptions.find(f => f.name === state.selectedInternalFinish) || {
            color: "#000",
          };
        const tintedHinge = tintImage(hingeImg, internalFinishData.color);

          for (let i = 0; i < 2; i++) {
            const y = startY + i * gap;

            // 1. Draw tinted base
            finalCtx.drawImage(tintedHinge, hingeX, y, hW, hH);

            // 2. Multiply original hinge on top
            finalCtx.globalCompositeOperation = "overlay";
            finalCtx.drawImage(hingeImg, hingeX, y, hW, hH);
            finalCtx.globalCompositeOperation = "source-over";
          }
        }
      }
    }
  }

  // Step 8: Letterplate
  if (state.selectedLetterplate && state.selectedLetterplate !== "none") {
    const lpDef = letterplateDefs.find(
      (def) => def.id === state.selectedLetterplate
    );
    if (lpDef) {
      const plateImg = await loadImage(getImageURL("letterplate")); // Always use static name
      if (plateImg) {
        const lpW = lpDef.width;
        const lpH = lpDef.height;

        const lpX = (panelWidth - lpW) / 2;
        const lpY = panelHeight - lpH - lpDef.offsetY;

        const tintedPlate = tintImage(
          plateImg,
          hardwareColorMap[state.selectedHardwareColor] || "#000"
        );

        finalCtx.drawImage(tintedPlate, lpX, lpY, lpW, lpH);

        // Multiply original image over the tinted version
        finalCtx.globalCompositeOperation = "multiply";
        finalCtx.drawImage(plateImg, lpX, lpY, lpW, lpH);
        finalCtx.globalCompositeOperation = "source-over";
      }
    }
  }

  // Optional threshold overlay
  const thresholdOverlayConfig = {
    visible: true,
    xFactor: 0.07,
    yFactor: 0.989,
    widthFactor: 0.86,
    height: 20,
    fillStyle: "rgb(236, 236, 236)",
    blend: null,
  };

  if (thresholdOverlayConfig.visible) {
    const threshX = thresholdOverlayConfig.xFactor * panelWidth;
    const threshY = thresholdOverlayConfig.yFactor * panelHeight;
    const threshW = thresholdOverlayConfig.widthFactor * panelWidth;
    const threshH = thresholdOverlayConfig.height;
    finalCtx.globalCompositeOperation = thresholdOverlayConfig.blend;
    finalCtx.fillStyle = thresholdOverlayConfig.fillStyle;
    finalCtx.fillRect(threshX, threshY, threshW, threshH);
    finalCtx.globalCompositeOperation = "source-over";
  }

  return finalCanvas;
}

/*
   ---------------------------------------------
   Build a Sidescreen Panel
   ---------------------------------------------

*/

async function buildSidePanelComposite(targetWidth, targetHeight, frameFinish, finish){
  const baseColor = frameFinish.color || "#ccc";
  const textureURL = frameFinish.texture || null;
  const textureBlend = frameFinish.textureBlend || "overlay";

  const sidescreenStyle = sidescreenStyleDefs.find(
    (s) => s.id === state.selectedSidescreenStyle
  );
  const isMatchingStyle = sidescreenStyle?.id === "match-door-style";
  const matchedStyle = isMatchingStyle
    ? doorStyles.find((s) => s.name === state.selectedStyle)
    : null;

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext("2d");

  // Step 1: Base fill
  finalCtx.fillStyle = baseColor;
  finalCtx.fillRect(0, 0, targetWidth, targetHeight);

  // Step 2: Texture
  if (textureURL) {
    const textureImg = await loadImage(textureURL);
    if (textureImg) {
      finalCtx.globalCompositeOperation = textureBlend;
      finalCtx.drawImage(textureImg, 0, 0, targetWidth, targetHeight);
      finalCtx.globalCompositeOperation = "source-over";
    }
  }

  // Step 3: Groove
  const grooveTextureId = doorStyles.find((s) => s.name === state.selectedStyle)
    ?.styleAssets?.texture;
  const grooveDef = textureDefs.find((t) => t.id === grooveTextureId);
  if (grooveDef && grooveDef.image) {
    const grooveImg = await loadImage(getImageURL(grooveDef.image));
    if (grooveImg) {
      finalCtx.globalCompositeOperation = "multiply";
      finalCtx.drawImage(grooveImg, 0, 0, targetWidth, targetHeight);
      finalCtx.globalCompositeOperation = "source-over";
    }
  }

  // lighting overlay
  const lightingOverlayConfig = {
    visible: true,
    xFactor: 0,
    yFactor: 0,
    widthFactor: 1,
    heightFactor: 0.5,
    blend: "overlay",
  };

  if (lightingOverlayConfig.visible) {
    const ovX = lightingOverlayConfig.xFactor * targetWidth;
    const ovY = lightingOverlayConfig.yFactor * targetHeight;
    const ovW = lightingOverlayConfig.widthFactor * targetWidth;
    const ovH = lightingOverlayConfig.heightFactor * targetHeight;

    const gradient = finalCtx.createLinearGradient(ovX, ovY, ovX, ovY + ovH);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.15)"); // Top (brighter)
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // Bottom (transparent)

    finalCtx.globalCompositeOperation = lightingOverlayConfig.blend;
    finalCtx.fillStyle = gradient;
    finalCtx.fillRect(ovX, ovY, ovW, ovH);
    finalCtx.globalCompositeOperation = "source-over";
  }

  // Step 4: Frame
  const frameElements = [
    {
      id: "top-frame",
      mixedRect: { y: 0, height: 35, xFactor: 0, widthFactor: 1 },
      options: { imageURL: getImageURL("frame-x") },
    },
    {
      id: "bottom-frame",
      mixedRect: { y: "bottom", height: 35, xFactor: 0, widthFactor: 1 },
      options: { imageURL: getImageURL("frame-x"), flipVertical: true },
    },
    {
      id: "left-frame",
      mixedRect: { x: 0, width: 35, yFactor: 0, heightFactor: 1 },
      options: { imageURL: getImageURL("frame-y") },
    },
    {
      id: "right-frame",
      mixedRect: { x: "right", width: 35, yFactor: 0, heightFactor: 1 },
      options: { imageURL: getImageURL("frame-y"), flipHorizontal: true },
    },
    {
      id: "top-left",
      rect: { x: 0, y: 0, width: 35, height: 35 },
      options: { imageURL: getImageURL("frame-corner") },
    },
    {
      id: "top-right",
      rect: { x: "right", y: 0, width: 35, height: 35 },
      options: { imageURL: getImageURL("frame-corner"), flipHorizontal: true },
    },
    {
      id: "bottom-left",
      rect: { x: 0, y: "bottom", width: 35, height: 35 },
      options: { imageURL: getImageURL("frame-corner"), flipVertical: true },
    },
    {
      id: "bottom-right",
      rect: { x: "right", y: "bottom", width: 35, height: 35 },
      options: {
        imageURL: getImageURL("frame-corner"),
        flipVertical: true,
        flipHorizontal: true,
      },
    },
  ];

  const frameMask = buildMoldingMask(
    { elements: frameElements },
    targetWidth,
    targetHeight
  );
  const frameCanvas = await applyFinishToElementGroup({
    width: targetWidth,
    height: targetHeight,
    finish: finish,
    elements: frameElements,
    mask: frameMask,
  });

  finalCtx.drawImage(frameCanvas, 0, 0);
  finalCtx.globalCompositeOperation = "source-over";

  // Step 5: Glazing (from sidescreenGlazingDefs or style default)
  let glazeId = sidescreenStyle?.glazing;

  // Explicitly skip glazing if style sets it to "none"
  let glazeDef = null;
  if (glazeId !== "none") {
    glazeId = state.selectedSidescreenGlazing || glazeId || "clear";
    glazeDef =
      sidescreenGlazingDefs.find((g) => g.id === glazeId) ||
      sidescreenGlazingDefs.find((g) => g.id === "clear");
  }

  if (glazeDef && glazeDef.image) {
    const glazeImg = await loadImage(getImageURL(glazeDef.image));
    if (glazeImg) {
      const marginX = glazeDef.marginX ?? glazeDef.margin ?? 0;
      const marginY = glazeDef.marginY ?? glazeDef.margin ?? 0;
      const offsetX = glazeDef.offsetX ?? 0;
      const offsetY = glazeDef.offsetY ?? 0;

      const gx = marginX + offsetX;
      const gy = marginY + offsetY;
      const gw = targetWidth - marginX * 2;
      const gh = targetHeight - marginY * 2;

      finalCtx.drawImage(glazeImg, gx, gy, gw, gh);
    }
  }

  // Step 6: Optional Mid Frame Overlay
  if (Array.isArray(sidescreenStyle?.midFrameElements)) {
    const elements = JSON.parse(
      JSON.stringify(sidescreenStyle.midFrameElements)
    );
    const groupWidth = targetWidth;
    const groupHeight = sidescreenStyle.midFrameHeight ?? 35;
    const offsetY = sidescreenStyle.midFrameOffsetY ?? 0;

    // Update all elements to ensure rects are absolute
    for (const el of elements) {
      const r = el.rect;
      if (!r) continue;

      const w = r.width ?? (r.widthFactor ?? 0) * groupWidth;
      const h = r.height ?? (r.heightFactor ?? 0) * groupHeight;

      const x =
        r.x === "left"
          ? 0
          : r.x === "right"
          ? groupWidth - w
          : r.x === "centre"
          ? (groupWidth - w) / 2
          : r.x ?? 0;

      const y =
        r.y === "centre"
          ? (groupHeight - h) / 2
          : r.y === "bottom"
          ? groupHeight - h
          : r.y ?? 0;

      el.rect = { x, y, width: w, height: h };
      delete el.mixedRect;
    }

    const midFrameCanvas = await composeElementGroup({
      width: groupWidth,
      height: groupHeight,
      baseColor,
      textureURL,
      elements,
      mask: null, // no mask needed here
    });

    const drawY = (targetHeight - groupHeight) / 2 + offsetY;
    finalCtx.drawImage(midFrameCanvas, 0, drawY);
    finalCtx.globalCompositeOperation = "source-over";
  }

  // If match-door-style, apply matching molding and glazing
  if (sidescreenStyle?.id === "match-door-style") {
    const matchedStyle = doorStyles.find((s) => s.name === state.selectedStyle);

    // --- MOLDING ---
    const moldingDef = matchedStyle?.styleAssets?.molding
      ? moldingDefs.find((m) => m.id === matchedStyle.styleAssets.molding)
      : null;

    if (moldingDef) {
      const moldingElements = [];

      if (moldingDef?.repeat && moldingDef?.cell?.elements) {
        const { rows, cols, gapX = 0, gapY = 0 } = moldingDef.repeat;
        const {
          width: cellW,
          height: cellH,
          elements: cellElements,
        } = moldingDef.cell;

        const totalGridWidth = cols * cellW + (cols - 1) * gapX;
        const totalGridHeight = rows * cellH + (rows - 1) * gapY;
        const gridOffsetX = (moldingDef.width - totalGridWidth) / 2;
        const gridOffsetY = (moldingDef.height - totalGridHeight) / 2;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const cellOffsetX = gridOffsetX + col * (cellW + gapX);
            const cellOffsetY = gridOffsetY + row * (cellH + gapY);

            for (const el of cellElements) {
              const cloned = JSON.parse(JSON.stringify(el));
              if (cloned.rect) {
                const r = cloned.rect;
                const w = r.width === "full" ? cellW : r.width;
                const x = r.x === "right" ? cellW - w : r.x ?? 0;
                const y = r.y === "bottom" ? cellH - r.height : r.y ?? 0;
                cloned.rect = {
                  x: cellOffsetX + x,
                  y: cellOffsetY + y,
                  width: w,
                  height: r.height,
                };
              } else if (cloned.mixedRect) {
                const m = cloned.mixedRect;
                cloned.rect = {
                  x:
                    cellOffsetX +
                    (m.x === "right"
                      ? cellW - m.width
                      : m.x ?? m.xFactor * cellW),
                  y:
                    cellOffsetY +
                    (m.y === "bottom"
                      ? cellH - m.height
                      : m.y ?? m.yFactor * cellH),
                  width: m.width ?? m.widthFactor * cellW,
                  height: m.height ?? m.heightFactor * cellH,
                };
              }
              moldingElements.push(cloned);
            }
          }
        }
      } else if (moldingDef?.elements) {
        moldingElements.push(
          ...JSON.parse(JSON.stringify(moldingDef.elements))
        );
      }

      const moldW = moldingDef.width;
      const moldH = moldingDef.height;

      const moldingCanvas = await composeElementGroup({
        width: moldW,
        height: moldH,
        baseColor: baseColor,
        textureURL: textureURL,
        elements: moldingElements,
        mask: buildMoldingMask({ elements: moldingElements }, moldW, moldH),
      });

      const moldX = (targetWidth - moldW) / 2;

      const moldY = targetHeight - moldH - (moldingDef.offsetY ?? 0);

      finalCtx.drawImage(moldingCanvas, moldX, moldY);
    }

    // --- GLAZING ---
    const glazingDef = glazingDefs.find((g) => g.id === state.selectedGlazing);
    const override = glazingDef?.styleOverrides?.[state.selectedStyle] || {};
    const glazeW = override.width ?? glazingDef.width;
    const glazeH = override.height ?? glazingDef.height;
    const glazeOffsetY = override.offsetY ?? glazingDef.offsetY ?? 0;

    let imageKey = override.image ?? glazingDef.image;

    if (state.glazingObscureEnabled) {
      imageKey =
        state.currentView === "internal"
          ? override.obscureInternal ?? glazingDef.obscureInternal ?? imageKey
          : override.obscureExternal ?? glazingDef.obscureExternal ?? imageKey;
    }

    const elements = override.elements ?? glazingDef.elements;
    const glazeCanvas = document.createElement("canvas");
    glazeCanvas.width = glazeW;
    glazeCanvas.height = glazeH;
    const glazeCtx = glazeCanvas.getContext("2d");

    if (override.repeat && override.cell?.elements) {
      const { rows, cols, gapX = 0, gapY = 0 } = override.repeat;
      const cellW = override.cell.width;
      const cellH = override.cell.height;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const offsetX = col * (cellW + gapX);
          const offsetY = row * (cellH + gapY);
          for (const el of override.cell.elements) {
            let rect;
            if (el.rect) {
              const r = el.rect;
              const w = r.width === "full" ? cellW : r.width;
              const x = r.x === "right" ? cellW - w : r.x ?? 0;
              const y =
                r.align === "centerY"
                  ? (cellH - r.height) / 2
                  : r.y === "bottom"
                  ? cellH - r.height
                  : r.y ?? 0;
              rect = {
                x: offsetX + x,
                y: offsetY + y,
                width: w,
                height: r.height,
              };
            } else if (el.mixedRect) {
              const m = el.mixedRect;
              rect = {
                x:
                  offsetX +
                  (m.x === "right"
                    ? cellW - m.width
                    : m.x ?? m.xFactor * cellW),
                y:
                  offsetY +
                  (m.y === "bottom"
                    ? cellH - m.height
                    : m.y ?? m.yFactor * cellH),
                width: m.width ?? m.widthFactor * cellW,
                height: m.height ?? m.heightFactor * cellH,
              };
            }
            await drawPanelElement(glazeCtx, rect, el.options);
          }
        }
      }
    } else if (Array.isArray(elements)) {
      for (const el of elements) {
        let rect;
        if (el.rect) {
          const r = el.rect;
          const w = r.width === "full" ? glazeW : r.width;
          const x = r.x === "right" ? glazeW - w : r.x ?? 0;
          const y =
            r.align === "centerY"
              ? (glazeH - r.height) / 2
              : r.y === "bottom"
              ? glazeH - r.height
              : r.y ?? 0;
          rect = { x, y, width: w, height: r.height };
        } else if (el.mixedRect) {
          const m = el.mixedRect;
          rect = {
            x: m.x === "right" ? glazeW - m.width : m.x ?? m.xFactor * glazeW,
            y: m.y === "bottom" ? glazeH - m.height : m.y ?? m.yFactor * glazeH,
            width: m.width ?? m.widthFactor * glazeW,
            height: m.height ?? m.heightFactor * glazeH,
          };
        }
        await drawPanelElement(glazeCtx, rect, el.options);
      }
    } else if (imageKey) {
      const img = await loadImage(getImageURL(imageKey));
      if (img) glazeCtx.drawImage(img, 0, 0, glazeW, glazeH);
    }

    const glazeX = (targetWidth - glazeW) / 2;
    const glazeY = targetHeight - glazeH - glazeOffsetY;
    finalCtx.drawImage(glazeCanvas, glazeX, glazeY);
  }

  return finalCanvas;
}

/*
   ---------------------------------------------
   Build a Fanlight
   ---------------------------------------------
*/

async function buildFanlightComposite(targetWidth, targetHeight, frameFinish, finish) {
  const baseColor = frameFinish.color || "#ccc";
  const textureURL = frameFinish.texture || null;
  const textureBlend = frameFinish.textureBlend || "source-over";

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext("2d");

  // 1. Base Fill
  finalCtx.fillStyle = baseColor;
  finalCtx.fillRect(0, 0, targetWidth, targetHeight);

  // 2. Texture
  if (textureURL) {
    const textureImg = await loadImage(textureURL);
    if (textureImg) {
      finalCtx.globalCompositeOperation = textureBlend;
      finalCtx.drawImage(textureImg, 0, 0, targetWidth, targetHeight);
      finalCtx.globalCompositeOperation = "source-over";
    }
  }

  // 3. Frame
  const frameElements = [
    {
      id: "top-frame",
      mixedRect: { y: 0, height: 35, xFactor: 0, widthFactor: 1 },
      options: { imageURL: getImageURL("frame-x") },
    },
    {
      id: "bottom-frame",
      mixedRect: { y: "bottom", height: 35, xFactor: 0, widthFactor: 1 },
      options: { imageURL: getImageURL("frame-x"), flipVertical: true },
    },
    {
      id: "left-frame",
      mixedRect: { x: 0, width: 35, yFactor: 0, heightFactor: 1 },
      options: { imageURL: getImageURL("frame-y") },
    },
    {
      id: "right-frame",
      mixedRect: { x: "right", width: 35, yFactor: 0, heightFactor: 1 },
      options: { imageURL: getImageURL("frame-y"), flipHorizontal: true },
    },
    {
      id: "top-left",
      rect: { x: 0, y: 0, width: 35, height: 35 },
      options: { imageURL: getImageURL("frame-corner") },
    },
    {
      id: "top-right",
      rect: { x: "right", y: 0, width: 35, height: 35 },
      options: { imageURL: getImageURL("frame-corner"), flipHorizontal: true },
    },
    {
      id: "bottom-left",
      rect: { x: 0, y: "bottom", width: 35, height: 35 },
      options: { imageURL: getImageURL("frame-corner"), flipVertical: true },
    },
    {
      id: "bottom-right",
      rect: { x: "right", y: "bottom", width: 35, height: 35 },
      options: {
        imageURL: getImageURL("frame-corner"),
        flipVertical: true,
        flipHorizontal: true,
      },
    },
  ];

  const frameMask = buildMoldingMask(
    { elements: frameElements },
    targetWidth,
    targetHeight
  );
  const frameCanvas = await applyFinishToElementGroup({
    width: targetWidth,
    height: targetHeight,
    finish: finish,
    elements: frameElements,
    mask: frameMask,
  });

  finalCtx.drawImage(frameCanvas, 0, 0);

  // 4. Glazing
  const glazeId = state.selectedSidescreenGlazing || "clear";
  const glazeDef = sidescreenGlazingDefs.find((g) => g.id === glazeId);
  if (glazeDef && glazeDef.image) {
    const glazeImg = await loadImage(getImageURL(glazeDef.image));
    if (glazeImg) {
      const margin = glazeDef.margin ?? 35;
      const gx = margin;
      const gy = margin;
      const gw = targetWidth - 2 * margin;
      const gh = targetHeight - 2 * margin;
      finalCtx.drawImage(glazeImg, gx, gy, gw, gh);
    }
  }

  return finalCanvas;
}

/*
   ---------------------------------------------
   updateCanvasPreview()
   ---------------------------------------------
*/


function parseConfigurationFlags(configValue) {
  return {
    hasLeft: configValue.includes("left"),
    hasRight: configValue.includes("right"),
    hasFanlight: configValue.includes("fanlight"),
    fullLeftHeight: configValue.includes("leftfull"),
    fullRightHeight: configValue.includes("rightfull"),
    fanlightFullWidth: configValue.includes("fanlightwide"),
  };
}

async function updateCanvasPreview() {
  try {
    const config = state.selectedConfiguration;
    const flags = parseConfigurationFlags(config);

    const { displayPixels } = getDoorPanelDimensionsFromInput();
    const panelHeight = displayPixels.height;
    const panelWidth = displayPixels.width;

    const sidescreenDims = getSidescreenDimensionsFromInput();
    const leftWidth = sidescreenDims.left.displayPixels;
    const rightWidth = sidescreenDims.right.displayPixels;
    const fanlightHeight = parseInt(
      document.getElementById("fanLightHeightInput")?.value || 350
    );

    const finishKey =
    state.currentView === "external"
      ? state.selectedExternalFinish
      : state.selectedInternalFinish;
  
  const finishData =
    finishOptions.find(f => f.name === finishKey) || {
      name: finishKey,
      color: "#ddd",
      texture: null,
      textureBlend: "source-over",
    };

    let leftSidePanel = null;
    let rightSidePanel = null;
    let fanlightPanel = null;

    const leftHeight = flags.fullLeftHeight
      ? panelHeight + fanlightHeight
      : panelHeight;
    const rightHeight = flags.fullRightHeight
      ? panelHeight + fanlightHeight
      : panelHeight;

      const frameFinish = getCurrentFrameFinish();
    if (flags.hasLeft) {
      leftSidePanel = await buildSidePanelComposite(
        leftWidth,
        leftHeight,
        finishData,
        frameFinish
      );
    }
    if (flags.hasRight) {
      rightSidePanel = await buildSidePanelComposite(
        rightWidth,
        rightHeight,
        finishData,
        frameFinish
      );
    }

    
    const panelCanvas = await buildPanelComposite(
      panelWidth,
      panelHeight,
      finishData,
      frameFinish
    );

    if (flags.hasFanlight) {
      const fanlightWidth = flags.fanlightFullWidth
        ? panelWidth +
          (flags.hasLeft ? leftWidth : 0) +
          (flags.hasRight ? rightWidth : 0)
        : panelWidth;
        fanlightPanel = await buildFanlightComposite(
          fanlightWidth,
          fanlightHeight,
          finishData,
          frameFinish
        );
    }

    const totalWidth =
      panelWidth +
      (flags.hasLeft ? leftWidth : 0) +
      (flags.hasRight ? rightWidth : 0);
    const totalHeight = panelHeight + (flags.hasFanlight ? fanlightHeight : 0);

    const previewCanvas = document.getElementById("previewCanvas");
    previewCanvas.width = totalWidth;
    previewCanvas.height = totalHeight;

    const ctx = previewCanvas.getContext("2d");
    ctx.clearRect(0, 0, totalWidth, totalHeight);

    let offsetX = 0;
    const offsetY = flags.hasFanlight ? fanlightHeight : 0;

    if (flags.hasFanlight && fanlightPanel) {
      const fanlightX = flags.fanlightFullWidth
        ? 0
        : flags.hasLeft
        ? leftWidth
        : 0;
      ctx.drawImage(fanlightPanel, fanlightX, 0);
    }
    // Left Sidescreen
    if (flags.hasLeft && leftSidePanel) {
      const leftOffsetY = flags.fullLeftHeight
        ? 0
        : fanlightPanel
        ? fanlightHeight
        : 0;
      ctx.drawImage(leftSidePanel, 0, leftOffsetY);
      offsetX += leftWidth;
    }

    // Door Panel
    ctx.drawImage(panelCanvas, offsetX, fanlightPanel ? fanlightHeight : 0);
    offsetX += panelWidth;

    // Right Sidescreen
    if (flags.hasRight && rightSidePanel) {
      const rightOffsetY = flags.fullRightHeight
        ? 0
        : fanlightPanel
        ? fanlightHeight
        : 0;
      ctx.drawImage(rightSidePanel, offsetX, rightOffsetY);
    }

    if (state.currentView === "internal") {
      mirrorCanvas(previewCanvas);
    }
  } catch (err) {
    console.error("Error in updateCanvasPreview:", err);
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
  const rawStyle = state.selectedStyle || "door";
  const styleName = toTitleCase(
    (typeof styleDisplayNames !== "undefined" && styleDisplayNames[rawStyle]) || rawStyle
  );

  const glazingName = toTitleCase(
    (typeof glazingDisplayNames !== "undefined" && glazingDisplayNames[state.selectedGlazing]) || state.selectedGlazing || "glass"
  );

  const externalColour = toTitleCase(state.selectedExternalFinish || "colour");

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  const datePart = `${dd}-${mm}-${yyyy}`;
  const timePart = `${hh}.${min}`;

  let fileName = `Visual of a ${styleName} panel with ${glazingName} glazing in ${externalColour} created on ${datePart} at ${timePart}.png`;
  fileName = fileName.replace(/[\/\\?%*:|"<>]/g, "-");

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
   Export Summary
   ---------------------------------------------
*/

function exportSummary() {
  const previewCanvas = document.getElementById("previewCanvas");
  if (!previewCanvas) {
    console.error("Preview canvas not found");
    return;
  }

  const originalView = state.currentView;
  state.currentView = "external";
  updateCanvasPreview();

  setTimeout(() => {
    const exportWidth = 595.276;
    const exportHeight = 841.89;
    const imageMaxHeight = exportHeight / 2;

    const compositeCanvas = document.createElement("canvas");
    compositeCanvas.width = exportWidth;
    compositeCanvas.height = exportHeight;

    const ctx = compositeCanvas.getContext("2d");
    ctx.fillStyle = "#fff"; // White background
    ctx.fillRect(0, 0, exportWidth, exportHeight);

    // --- Image Drawing ---
    const scale = Math.min(
      exportWidth / previewCanvas.width,
      imageMaxHeight / previewCanvas.height
    );
    const scaledWidth = previewCanvas.width * scale;
    const scaledHeight = previewCanvas.height * scale;
    const imageX = (exportWidth - scaledWidth) / 2;
    const imageY = 20;

    ctx.drawImage(previewCanvas, imageX, imageY, scaledWidth, scaledHeight);

    // --- Text Setup ---
    const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
    const rawStyle = state.selectedStyle || "None";
    const styleName = toTitleCase(styleDisplayNames?.[rawStyle] || rawStyle);
    const configName = configurations.find(c => c.value === state.selectedConfiguration)?.name || "None";
    const glazingName = toTitleCase(glazingDisplayNames?.[state.selectedGlazing] || state.selectedGlazing || "None");
    const sidescreenStyle = toTitleCase(sidescreenStyleDefs?.[state.selectedSidescreenStyle]?.name || state.selectedSidescreenStyle || "None");
    const sidescreenGlazing = toTitleCase(glazingDisplayNames?.[state.selectedSidescreenGlazing] || state.selectedSidescreenGlazing || "None");
    const externalColour = toTitleCase(state.selectedExternalFinish || "None");
    const internalColour = toTitleCase(state.selectedInternalFinish || "None");
    const hardwareColour = toTitleCase(state.selectedHardwareColor || "None");

    let originalLetterplateKey = "none";
    if (styleObj && state.selectedLetterplate) {
      const entry = Object.entries(styleObj.letterplateOptions || {}).find(
        ([key, val]) => val === state.selectedLetterplate
      );
      originalLetterplateKey = entry ? entry[0] : state.selectedLetterplate;
    }

    const letterplateText = toTitleCase(letterplateDisplayNames?.[originalLetterplateKey] || originalLetterplateKey);
    const handleText = toTitleCase(handleDisplayNames?.[state.selectedHandle] || state.selectedHandle || "None");

    // --- Summary Separator Line ---
    const lineY = imageY + scaledHeight + 40;
    ctx.beginPath();
    ctx.moveTo(20, lineY);
    ctx.lineTo(exportWidth - 20, lineY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    // --- Summary Items ---
    const summaryItems = [
      ["Configuration", configName],
      ["Panel", styleName],
      ["Glazing", glazingName],
      ["Sidescreen", sidescreenStyle],
      ["Sidescreen Glazing", sidescreenGlazing],
      ["External Colour", externalColour],
      ["Internal Colour", internalColour],
      ["Hardware Colour", hardwareColour],
      ["Letterplate", letterplateText],
      ["Handle", handleText]
    ];

    ctx.fillStyle = "#000";
    ctx.textAlign = "left";

    const labelX = 20;
    const valueX = 170;
    let textY = lineY + 30;

    for (const [label, value] of summaryItems) {
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`${label}:`, labelX, textY);
      ctx.font = "14px sans-serif";
      ctx.fillText(value, valueX, textY);
      textY += 24;
    }

    // --- Footer Line ---
    const footerHeight = 60;
    const footerY = exportHeight - footerHeight;
    ctx.beginPath();
    ctx.moveTo(20, footerY);
    ctx.lineTo(exportWidth - 20, footerY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    // --- Footer Date ---
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const datePart = `${dd}-${mm}-${yyyy}`;
    const timePart = `${hh}:${min}`;
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#000";
    ctx.fillText(`${datePart} | ${timePart}`, 20, exportHeight - 20);

    // --- Footer Logo ---
    const logo = new Image();
    logo.onload = () => {
      const desiredHeight = 18;
      const aspectRatio = 938 / 145;
      const logoWidth = desiredHeight * aspectRatio;
      const logoX = exportWidth - logoWidth - 20;
      const logoY = exportHeight - 20 - desiredHeight;

      ctx.drawImage(logo, logoX, logoY, logoWidth, desiredHeight);

      let fileName = `Export Summary - ${styleName} - ${datePart} at ${hh}.${min}.jpg`;
      fileName = fileName.replace(/[\/\\?%*:|"<>]/g, "-");

      const dataURL = compositeCanvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      state.currentView = originalView;
      updateCanvasPreview();
    };

    logo.crossOrigin = "anonymous";
    logo.src = "https://crs-kd.github.io/door-designer/logo-blue.png";
  }, 100);
}

/*
   ---------------------------------------------
   Handling Thumbnail Clicks
   ---------------------------------------------
*/

function markSelected(type, value) {
  document.querySelectorAll(`.thumbnail[data-type="${type}"]`).forEach((el) => {
    el.classList.remove("selected");
  });
  const chosen = document.querySelector(
    `.thumbnail[data-type="${type}"][data-value="${value}"]`
  );
  if (chosen) chosen.classList.add("selected");
}

function addThumbnailClick(type) {
  document
    .querySelectorAll(`.thumbnail[data-type="${type}"]`)
    .forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const value = thumb.getAttribute("data-value");

        switch (type) {
          case "configuration":
            state.selectedConfiguration = value;
            state.selectedLeftPanel = "none";
            state.selectedRightPanel = "none";
            state.hasFanlight = false;

            switch (value) {
              case "single":
                break;
              case "single-left":
                state.selectedLeftPanel = "sidescreen";
                break;
              case "single-right":
                state.selectedRightPanel = "sidescreen";
                break;
              case "single-both":
                state.selectedLeftPanel = "sidescreen";
                state.selectedRightPanel = "sidescreen";
                break;
              case "fanlight":
                state.hasFanlight = true;
                break;
              case "fanlight-left":
                state.hasFanlight = true;
                state.selectedLeftPanel = "sidescreen";
                break;
              case "fanlight-right":
                state.hasFanlight = true;
                state.selectedRightPanel = "sidescreen";
                break;
              case "fanlight-both":
                state.hasFanlight = true;
                state.selectedLeftPanel = "sidescreen";
                state.selectedRightPanel = "sidescreen";
                break;
            }

            updateConfigurationOptionVisibility();

            const firstSidescreenThumb = document.querySelector(
              `.thumbnail[data-type="sidescreenStyle"]`
            );
            if (firstSidescreenThumb) {
              const firstSideValue =
                firstSidescreenThumb.getAttribute("data-value");
              state.selectedSidescreenStyle = firstSideValue;
              markSelected("sidescreenStyle", firstSideValue);
            }
            break;

          case "style":
            state.selectedStyle = value;

            const selectedStyleObj = doorStyles.find((s) => s.name === value);
            const styleSizeInfoEl = document.getElementById("styleSizeInfo");
            if (selectedStyleObj && styleSizeInfoEl) {
              styleSizeInfoEl.innerHTML = `
                <div class="style-size-table">
                  <table>
                    <tr><td></td><td><strong>Min</strong></td><td><strong>Max</strong></td></tr>
                    <tr><td><strong>Width</strong></td><td>${selectedStyleObj.minWidth.toLocaleString()}</td><td>${selectedStyleObj.maxWidth.toLocaleString()}</td></tr>
                    <tr><td><strong>Height</strong></td><td>${selectedStyleObj.minHeight.toLocaleString()}</td><td>${selectedStyleObj.maxHeight.toLocaleString()}</td></tr>
                  </table>
                </div>`;
            }

            populateGlazingThumbnails();
            populateLetterplateThumbnails();
            populateSidescreenStyleThumbnails();

            const firstGlazing = document.querySelector(`.thumbnail[data-type="glazing"]`);
            if (firstGlazing) {
              const firstVal = firstGlazing.getAttribute("data-value");
              state.selectedGlazing = firstVal;
              markSelected("glazing", firstVal);
            }

            const firstSidescreen = document.querySelector(`.thumbnail[data-type="sidescreenStyle"]`);
            if (firstSidescreen) {
              const firstVal = firstSidescreen.getAttribute("data-value");
              state.selectedSidescreenStyle = firstVal;
              markSelected("sidescreenStyle", firstVal);
            }

            updateCanvasPreview();
            updateSummary();
            break;

          case "sidescreenStyle":
            state.selectedSidescreenStyle = value;
            break;

          case "glazing":
            state.selectedGlazing = value;
            break;

          case "letterplate":
            state.selectedLetterplate = value;
            break;

          case "hardwareColour":
            state.selectedHardwareColor = value;
            break;

          case "handle":
            state.selectedHandle = value;
            break;

          case "sidescreenGlazing":
            state.selectedSidescreenGlazing = value;
            break;

case "externalColour":
  state.selectedExternalFinish = value;
  state.selectedExternalFrameFinish = value;
  state.currentView = "external";
  updateViewIndicator();

  // 🔁 Force internal colour to white
  state.selectedInternalFinish = "Brilliant White";
  state.selectedInternalFrameFinish = "Brilliant White";

  populateInternalFinishThumbnails();
  markSelected("internalColour", "Brilliant White"); // optional: visually highlight it
  break;

case "internalColour":
  state.selectedInternalFinish = value;
  state.selectedInternalFrameFinish = value;
  state.currentView = "internal";
  updateViewIndicator();
  break;
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

function getStepIndexFromType(type) {
  if (type === "configuration") return 0;
  if (type === "sidescreenStyle") return 1;
  if (type === "style") return 2;
  if (
    type === "finish" ||
    type === "internalFinish" ||
    type === "frameFinish" ||
    type === "internalFrameFinish"
  )
    return 3;
  if (type === "glazing") return 4;
  return -1;
}
/*
   ---------------------------------------------
   Start Screen
   ---------------------------------------------
*/
function populateStartRangeThumbnails() {
  const container = document.querySelector(".start-range-container");
  container.innerHTML = doorRanges
    .map(
      (rng) => `
    <div class="thumbnail range-thumbnail" data-range="${rng}">
      <img src="${getImageURL(rng + "-thumb")}" alt="${rng}">
      <p>${rng}</p>
    </div>
  `
    )
    .join("");

  document
    .querySelectorAll(".start-range-container .range-thumbnail")
    .forEach((thumb) => {
      thumb.addEventListener("click", () => {
        state.selectedRange = thumb.getAttribute("data-range");
        populateStylesByRange();
        document.getElementById("startScreen").classList.add("hidden");
        document.querySelector(".door-designer-container").style.display =
          "flex";
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
  const doorDesignerContainer = document.querySelector(
    ".door-designer-container"
  );
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
  document
    .getElementById("backBtn")
    .addEventListener("click", goToPreviousStep);
  document.getElementById("nextBtn").addEventListener("click", goToNextStep);

  document.getElementById("hingeToggleBtn").addEventListener("click", () => {
    state.handleSide = state.handleSide === "left" ? "right" : "left";
    updateCanvasPreview();
    updateSummary();
  });

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
    state.currentView =
      state.currentView === "external" ? "internal" : "external";
    updateViewIndicator();
    updateCanvasPreview();
    updateSummary();
  });
  document.getElementById("saveDesignBtn").addEventListener("click", () => {
    compositeAndSave();
  });
  document
    .getElementById("visualiserToggleBtn")
    .addEventListener("click", () => {
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
      reader.onload = function (evt) {
        const img = new Image();
        img.onload = function () {
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
    document.getElementById("exportSummaryBtn").addEventListener("click", () => {
    exportSummary();
  });

  // document.getElementById("opacityToggleBtn").addEventListener("click", () => {
  //   state.glazingObscureEnabled = !state.glazingObscureEnabled;
  //   updateCanvasPreview();
  //   updateSummary(); // if summary reflects the glazing state
  // });

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

  doorOverlayCanvas.addEventListener("touchstart", doorOverlayTouchStart, {
    passive: false,
  });
  doorOverlayCanvas.addEventListener("touchmove", doorOverlayTouchMove, {
    passive: false,
  });
  doorOverlayCanvas.addEventListener("touchend", doorOverlayTouchEnd, {
    passive: false,
  });

  // Initial
  updateCanvasPreview();
  updateSummary();
  updateNavigationControls();
  updateConfigurationOptionVisibility();
});

function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function compositeAndSave() {
  try {
    const previewCanvas = document.getElementById("previewCanvas");
    if (!previewCanvas) {
      console.error("Preview canvas not found");
      return;
    }

    if (state.currentView === "internal") {
      mirrorCanvas(previewCanvas);
    }

    // Graceful fallback for missing mappings
    const rawStyle = state.selectedStyle || "door";
    const styleName = toTitleCase(
      (typeof styleDisplayNames !== "undefined" && styleDisplayNames[rawStyle]) || rawStyle
    );

    const glazingName = toTitleCase(
      (typeof glazingDisplayNames !== "undefined" && glazingDisplayNames[state.selectedGlazing]) || state.selectedGlazing || "glass"
    );

    const externalColour = toTitleCase(state.selectedExternalFinish || "colour");

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    const datePart = `${dd}-${mm}-${yyyy}`;
    const timePart = `${hh}.${min}`;

    let fileName = `${styleName} panel with ${glazingName} glazing in ${externalColour} created on ${datePart} at ${timePart}.png`;
    fileName = fileName.replace(/[\/\\?%*:|"<>]/g, "-");

    const dataURL = previewCanvas.toDataURL("image/png");
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
export {
  buildPanelComposite,
  buildSidePanelComposite,
  updateCanvasPreview,
  compositeAndSave,
  exportSummary,
  addThumbnailClick,
  markSelected,
};
