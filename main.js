import { updateCanvasPreview } from "./canvasBuilder.js";
import { state, stepIDs} from "./data.js";

/*
   ---------------------------------------------
   Step Navigation & UI
   ---------------------------------------------
*/
function updateNavigationControls() {
  const nextBtn = document.getElementById("nextBtn");
  if (state.currentStep === stepIDs.length - 1) {
    nextBtn.disabled = true;
    nextBtn.style.opacity = 0.4;
  } else {
    nextBtn.disabled = !state.stepsCompleted[state.currentStep];
    nextBtn.style.opacity = state.stepsCompleted[state.currentStep] ? 1 : 0.4;
  }
  updateStepMenuAccessibility();
}


function isStepAccessible(index) {
  return true; // or apply logic if you want them in strict order
}

function updateStepMenuAccessibility() {
  document.querySelectorAll(".step-menu-item").forEach((item, index) => {
    if (!isStepAccessible(index) && index !== state.currentStep) {
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
  if (state.currentStep < stepIDs.length - 1) {
    state.currentStep++;
    showStep(state.currentStep);
    updateNavigationControls();
  }
}

function goToPreviousStep() {
  if (state.currentStep > 0) {
    state.currentStep--;
    showStep(state.currentStep);
    updateNavigationControls();
  } else {
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
document.getElementById("doorWidthInput").addEventListener("change", updateCanvasPreview);
document.getElementById("doorHeightInput").addEventListener("change", updateCanvasPreview);
document.getElementById("leftSidescreenWidthInput").addEventListener("change", updateCanvasPreview);
document.getElementById("rightSidescreenWidthInput").addEventListener("change", updateCanvasPreview);
document.getElementById("fanLightHeightInput")?.addEventListener("change", updateCanvasPreview);
