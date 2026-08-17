import "./style.css";
import { supportsWebGL } from "./utils/responsive.js";

const loadingScreen = document.getElementById("loading-screen");
const loadingBarFill = document.getElementById("loading-bar-fill");
const fallbackStatic = document.getElementById("fallback-static");
const canvas = document.getElementById("scene-canvas");
const uiOverlay = document.getElementById("ui-overlay");

function showFallback() {
  loadingScreen.hidden = true;
  canvas.hidden = true;
  uiOverlay.hidden = true;
  fallbackStatic.hidden = false;
}

async function init() {
  if (!supportsWebGL()) {
    showFallback();
    return;
  }

  loadingBarFill.style.width = "35%";

  // Lazy-load Three.js/GSAP + scene modules terpisah dari bundle awal (§7 "Lazy init"),
  // supaya loading screen (HTML/CSS ringan) tampil instan sebelum payload 3D yang lebih berat masuk.
  const [{ SceneManager }, { QuestController }] = await Promise.all([
    import("./scene/SceneManager.js"),
    import("./scene/QuestController.js"),
  ]);

  loadingBarFill.style.width = "70%";

  const sceneManager = new SceneManager(canvas);
  const questController = new QuestController(sceneManager, uiOverlay);
  sceneManager.start();

  loadingBarFill.style.width = "100%";

  const minVisibleTime = new Promise((resolve) => setTimeout(resolve, 500));
  await minVisibleTime;

  loadingScreen.classList.add("loading-screen--hidden");
  setTimeout(() => {
    loadingScreen.hidden = true;
  }, 500);

  questController.start();
}

init().catch((err) => {
  console.error("Gagal inisialisasi scene 3D:", err);
  showFallback();
});
