import { getImageURL } from "./utils.js";
import { addThumbnailClick } from "./canvasBuilder.js";
import {
  doorStyles,
  
  styleDisplayNames,
  finishDisplayNames,
  finishes,
  glazingDisplayNames,
  letterplateDisplayNames,
  handleDisplayNames,
  hardwareColorDisplayNames,
  state,
  configurations,
  hardwareColorOptions,
  handleOptions,

  doorCollections,
} from "./data.js";

/*
   ---------------------------------------------
   Summary & UI
   ---------------------------------------------
*/
function updateSummary() {
  const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
  let styleText = styleObj ? (styleDisplayNames[styleObj.name] || styleObj.name) : "None";

  let finKey = (state.currentView === "external") ? state.selectedExternalFinish : state.selectedInternalFinish;
  let finName = finishDisplayNames[finKey] || finKey;

  let glazingName = glazingDisplayNames[state.selectedGlazing] || state.selectedGlazing;
  let letterplateText = letterplateDisplayNames[state.selectedLetterplate] || state.selectedLetterplate;
  let handleText = handleDisplayNames[state.selectedHandle] 
    ? `${handleDisplayNames[state.selectedHandle]} (${hardwareColorDisplayNames[state.selectedHardwareColor]})`
    : "None";

  document.getElementById("summary").innerHTML =
    `<strong>Style:</strong> ${styleText} | ` +
    `<strong>Finish:</strong> ${finName} | ` +
    `<strong>Glazing:</strong> ${glazingName} | ` +
    `<strong>Letterplate:</strong> ${letterplateText} | ` +
    `<strong>Handle:</strong> ${handleText}`;
}

function updateViewIndicator() {
  document.getElementById("currentViewText").textContent =
    "Current View: " + (state.currentView === "external" ? "External" : "Internal");
}



/*
   ---------------------------------------------
   Populate Thumbnails
   ---------------------------------------------
*/


function populateStylesByRange() {
  const container = document.getElementById("style-list");
  const filtered = doorStyles.filter(s => s.range === state.selectedRange);
  const grouped = {};
  doorCollections.forEach(c => grouped[c] = filtered.filter(s => s.collection === c));

  let html = "";
  doorCollections.forEach(col => {
    if (grouped[col].length > 0) {
      html += `<h3 class="collection-title">${col}</h3><div class="grid-container">`;
      grouped[col].forEach(st => {
        const disp = styleDisplayNames[st.name] || st.name;
        html += `
          <div class="thumbnail start-thumb" data-type="style" data-value="${st.name}">
            <img src="${getImageURL(st.name + "-thumb")}" alt="${disp}">
            <p>${disp}</p>
          </div>
        `;
      });
      html += `</div>`;
    }
  });
  container.innerHTML = html;
  addThumbnailClick("style");
}

function populateConfigurationOptions() {
  const container = document.getElementById("configuration-list");
  container.innerHTML = configurations.map(cfg => `
    <div class="thumbnail" data-type="configuration" data-value="${cfg.value}">
      <img src="${getImageURL(cfg.value)}" alt="${cfg.name}">
      <p>${cfg.name}</p>
    </div>
  `).join("");
  addThumbnailClick("configuration");
}

function populateSidescreenStyleThumbnails() {
  const container = document.getElementById("sidescreen-style-list");
  const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
  const sidescreenStyles = styleObj?.sidescreenOptions || ["solid"];

  const html = sidescreenStyles.map(val => `
    <div class="thumbnail" data-type="sidescreenStyle" data-value="${val}">
      <img src="${getImageURL(val + "-sidescreen-thumb")}" alt="${val}">
      <p>${val === "match-door-style" ? (styleDisplayNames[state.selectedStyle] || state.selectedStyle) : val}</p>
    </div>
  `).join("");

  container.innerHTML = html;
  addThumbnailClick("sidescreenStyle");
}

function populateExternalFinishThumbnails() {
  const container = document.getElementById("external-finish-list");
  container.innerHTML = finishes.map(item => `
    <div class="thumbnail" data-type="finish" data-value="${item}">
      <img src="${getImageURL(item + "-thumb")}" alt="${finishDisplayNames[item] || item}">
      <p>${finishDisplayNames[item] || item}</p>
    </div>
  `).join("");
  addThumbnailClick("finish");
}

function populateInternalFinishThumbnails() {
  const container = document.getElementById("internal-finish-list");
  container.innerHTML = finishes.map(item => `
    <div class="thumbnail" data-type="internalFinish" data-value="${item}">
      <img src="${getImageURL(item + "-thumb")}" alt="${finishDisplayNames[item] || item}">
      <p>${finishDisplayNames[item] || item}</p>
    </div>
  `).join("");
  addThumbnailClick("internalFinish");
}

function populateGlazingThumbnails() {
  const container = document.getElementById("glazing-list");
  const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
  const glz = styleObj && styleObj.glazingOptions ? styleObj.glazingOptions : [];
  let html = glz.map(val => `
    <div class="thumbnail" data-type="glazing" data-value="${val}">
      <img src="${getImageURL(val + "-thumb")}" alt="${val}">
      <p>${val}</p>
    </div>
  `).join("");
  container.innerHTML = html;
  addThumbnailClick("glazing");
}

function populateLetterplateThumbnails() {
  const container = document.getElementById("letterplate-list");
  const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
  if (!styleObj || !styleObj.letterplateOptions) {
    container.innerHTML = "";
    return;
  }

  const entries = Object.entries(styleObj.letterplateOptions);
  let html = "";
  entries.forEach(([key, actualId]) => {
    html += `
      <div class="thumbnail" data-type="letterplate" data-value="${actualId}">
        <img src="${getImageURL(key + "-thumb")}" alt="${key}">
        <p>${letterplateDisplayNames[key] || key}</p>
      </div>
    `;
  });

  container.innerHTML = html;
  addThumbnailClick("letterplate");

}

function populateHardwareColorThumbnails() {
  const container = document.getElementById("hardware-colour-list");
  container.innerHTML = hardwareColorOptions.map(c => `
    <div class="thumbnail" data-type="hardwareColour" data-value="${c}">
      <img src="${getImageURL(c + "-hardware")}" alt="${hardwareColorDisplayNames[c]}">
      <p>${hardwareColorDisplayNames[c]}</p>
    </div>
  `).join("");
  addThumbnailClick("hardwareColour");
}

function populateHandleThumbnails() {
  const container = document.getElementById("handle-list");
  container.innerHTML = handleOptions.map(h => `
    <div class="thumbnail" data-type="handle" data-value="${h}">
      <img src="${getImageURL(h + "-thumb")}" alt="${handleDisplayNames[h]}">
      <p>${handleDisplayNames[h]}</p>
    </div>
  `).join("");
  addThumbnailClick("handle");
}

export {
  updateSummary,
  updateViewIndicator,
  populateStylesByRange,
  populateConfigurationOptions,
  populateSidescreenStyleThumbnails,
  populateExternalFinishThumbnails,
  populateInternalFinishThumbnails,
  populateGlazingThumbnails,
  populateLetterplateThumbnails,
  populateHardwareColorThumbnails,
  populateHandleThumbnails
};