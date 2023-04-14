import "./styles.css";
import Scene from "./Scene";

const initApp = () => {
  window.scene = new Scene();
};

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  initApp();
} else {
  document.addEventListener("DOMContentLoaded", initApp);
}
