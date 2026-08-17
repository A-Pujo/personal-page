import * as THREE from "three";
import { palette } from "../content.js";
import { getQualitySettings } from "../utils/responsive.js";

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.quality = getQualitySettings();
    this.clock = new THREE.Clock();
    this.updateCallbacks = [];

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(
      new THREE.Color(palette.duskPurple).getHex(),
      0.035
    );

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 2, 6);
    this.lookAtTarget = new THREE.Vector3(0, 1, 0);
    this.camera.lookAt(this.lookAtTarget);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, this.quality.maxPixelRatio)
    );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = this.quality.shadowsEnabled;

    this._setupLighting();

    this._handleResize = this._handleResize.bind(this);
    window.addEventListener("resize", this._handleResize);
    window.addEventListener("orientationchange", this._handleResize);

    this._tick = this._tick.bind(this);
  }

  _setupLighting() {
    const hemi = new THREE.HemisphereLight(
      new THREE.Color(palette.cream).getHex(),
      new THREE.Color(palette.lakeBlue).getHex(),
      0.9
    );
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(
      new THREE.Color(palette.sunsetOrange).getHex(),
      1.4
    );
    sun.position.set(-6, 5, 3);
    sun.castShadow = false;
    this.scene.add(sun);
    this.sunLight = sun;
  }

  _handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  onUpdate(callback) {
    this.updateCallbacks.push(callback);
  }

  start() {
    this.renderer.setAnimationLoop(this._tick);
  }

  _tick() {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    for (const cb of this.updateCallbacks) cb(delta, elapsed);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener("resize", this._handleResize);
    window.removeEventListener("orientationchange", this._handleResize);
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}
