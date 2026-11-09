import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "./styles/global.css";
import { initializeApp } from "./app/App.js";
import { initializeSiteAssets } from "./utils/site-assets.js";

initializeSiteAssets();
initializeApp();
