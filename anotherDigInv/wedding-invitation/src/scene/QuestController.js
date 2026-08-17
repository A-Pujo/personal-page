import * as THREE from "three";
import gsap from "gsap";
import { content, mapsUrl } from "../content.js";
import { getGuestName } from "../utils/guestName.js";
import { getQualitySettings } from "../utils/responsive.js";
import { InteractionManager, createInflatedHitProxy } from "../utils/raycastInteraction.js";
import { createSky, createHillsSilhouette } from "./assets/createEnvironment.js";
import { createLake } from "./assets/createLake.js";
import { createDock } from "./assets/createDock.js";
import { createBoat } from "./assets/createBoat.js";
import { createRod } from "./assets/createRod.js";
import { createFish } from "./assets/createFish.js";
import { createChest } from "./assets/createChest.js";
import { createTackleBox } from "./assets/createTackleBox.js";
import { createFireflies, createSplashBurst } from "./effects/particles.js";

const QUEST_ORDER = [
  "intro",
  "meet2020",
  "reconnect2023",
  "proposal2025",
  "eventReveal",
  "rsvp",
];

// Titik kamera tetap per quest — TIDAK ada free-roam, kamera selalu di-tween GSAP
// dari satu titik preset ke titik preset lain (lihat USECASE.md §4).
const CAMERA_POINTS = {
  intro: { pos: new THREE.Vector3(0, 3.2, 15), lookAt: new THREE.Vector3(0, 1.2, 4) },
  meet2020: { pos: new THREE.Vector3(-1, 1.8, 9), lookAt: new THREE.Vector3(-1, 1, 4) },
  reconnect2023: { pos: new THREE.Vector3(0.4, 2.5, 7.6), lookAt: new THREE.Vector3(2.1, 1.3, 3.0) },
  proposal2025: { pos: new THREE.Vector3(0.0, 2.4, 6.4), lookAt: new THREE.Vector3(2.2, 0.9, 0.3) },
  eventReveal: { pos: new THREE.Vector3(-4, 2.1, -2), lookAt: new THREE.Vector3(-4, 1, -5) },
  rsvp: { pos: new THREE.Vector3(-6, 2.0, -6), lookAt: new THREE.Vector3(-6, 1, -9) },
};

export class QuestController {
  constructor(sceneManager, uiRoot) {
    this.sceneManager = sceneManager;
    this.uiRoot = uiRoot;
    this.quality = getQualitySettings();
    this.currentIndex = 0;
    this.guestName = getGuestName();

    this.interaction = new InteractionManager(
      sceneManager.camera,
      sceneManager.canvas
    );
    this.interaction.onMissHint = () => this._showMissHint();

    this._buildWorld();
    this._setCameraImmediate(CAMERA_POINTS.intro);
  }

  _buildWorld() {
    const scene = this.sceneManager.scene;

    scene.add(createSky());
    scene.add(createHillsSilhouette());

    this.lake = createLake({ segments: this.quality.waterSegments });
    scene.add(this.lake);

    this.dock = createDock({ length: 8, width: 2.4 });
    this.dock.position.set(-1, 0, 10);
    scene.add(this.dock);

    this.boat = createBoat();
    this.boat.position.set(2.4, 0.15, 2.5);
    this.boat.rotation.y = 0.3;
    scene.add(this.boat);

    this.rod = createRod();
    this.rod.position.set(2.1, 0.65, 3.1);
    this.rod.rotation.y = -0.4;
    scene.add(this.rod);

    this.fish = createFish();
    this.fish.position.set(2.4, 0.15, -0.5);
    scene.add(this.fish);

    this.chest = createChest();
    this.chest.position.set(-4, 0, -5);
    this.chest.rotation.y = 0.5;
    scene.add(this.chest);

    this.tackleBox = createTackleBox();
    this.tackleBox.position.set(-6, 0, -9);
    scene.add(this.tackleBox);

    this.fireflies = createFireflies(this.quality.fireflyCount);
    scene.add(this.fireflies);

    this.activeSplashes = [];

    this.sceneManager.onUpdate((delta, elapsed) => {
      this.lake.userData.update(elapsed);
      this.fireflies.userData.update(elapsed);
      this.activeSplashes = this.activeSplashes.filter((p) => {
        p.userData.update(delta);
        if (p.userData.isDead) {
          this.sceneManager.scene.remove(p);
          return false;
        }
        return true;
      });
    });
  }

  _setCameraImmediate(point) {
    this.sceneManager.camera.position.copy(point.pos);
    this.sceneManager.lookAtTarget.copy(point.lookAt);
    this.sceneManager.camera.lookAt(point.lookAt);
  }

  _tweenCamera(point, duration = 2.2) {
    const camera = this.sceneManager.camera;
    const lookAtTarget = this.sceneManager.lookAtTarget;
    gsap.to(camera.position, {
      x: point.pos.x,
      y: point.pos.y,
      z: point.pos.z,
      duration,
      ease: "power2.inOut",
    });
    gsap.to(lookAtTarget, {
      x: point.lookAt.x,
      y: point.lookAt.y,
      z: point.lookAt.z,
      duration,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(lookAtTarget),
    });
  }

  _spawnSplash(origin) {
    const burst = createSplashBurst(this.quality.splashParticleCount, origin);
    this.sceneManager.scene.add(burst);
    this.activeSplashes.push(burst);
  }

  _showMissHint() {
    const hintEl = this.uiRoot.querySelector(".quest-hint");
    if (!hintEl) return;
    hintEl.classList.add("quest-hint--pulse");
    setTimeout(() => hintEl.classList.remove("quest-hint--pulse"), 900);
  }

  start() {
    this._renderIntro();
  }

  goToQuest(questKey, { skipStory = false } = {}) {
    this.interaction.clear();
    const point = CAMERA_POINTS[questKey];
    this._tweenCamera(point, skipStory ? 2.8 : 2.2);

    const card = this.uiRoot.querySelector(".quest-card");
    if (card) {
      gsap.to(card, {
        opacity: 0,
        y: 12,
        duration: 0.35,
        onComplete: () => this._renderQuest(questKey),
      });
    } else {
      this._renderQuest(questKey);
    }
  }

  _renderQuest(questKey) {
    this.currentIndex = QUEST_ORDER.indexOf(questKey);
    switch (questKey) {
      case "intro":
        this._renderIntro();
        break;
      case "meet2020":
        this._renderMeet2020();
        break;
      case "reconnect2023":
        this._renderReconnect2023();
        break;
      case "proposal2025":
        this._renderProposal2025();
        break;
      case "eventReveal":
        this._renderEventReveal();
        break;
      case "rsvp":
        this._renderRsvp();
        break;
    }
  }

  _mountCard(innerHTML) {
    this.uiRoot.innerHTML = `<div class="quest-card">${innerHTML}</div>`;
    const card = this.uiRoot.querySelector(".quest-card");
    gsap.fromTo(
      card,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power1.out" }
    );
    return card;
  }

  _renderIntro() {
    const c = content.intro;
    const card = this._mountCard(`
      <p class="quest-guest" id="guest-name-slot"></p>
      <p class="quest-eyebrow">${c.eyebrow}</p>
      <h1 class="quest-title-main">${c.title}</h1>
      <p class="quest-subtitle">${c.subtitle}</p>
      <button class="btn btn-primary" id="btn-start">${c.cta}</button>
      <button class="btn btn-skip" id="btn-skip">${c.skipCta}</button>
    `);

    const guestSlot = card.querySelector("#guest-name-slot");
    guestSlot.textContent = this.guestName
      ? `Yth. ${this.guestName}`
      : c.guestGreetingFallback;

    card.querySelector("#btn-start").addEventListener("click", () => {
      this.goToQuest("meet2020");
    });
    card.querySelector("#btn-skip").addEventListener("click", () => {
      this.goToQuest("eventReveal", { skipStory: true });
    });
  }

  _renderMeet2020() {
    const c = content.meet2020;
    const card = this._mountCard(`
      <p class="quest-body">${c.body}</p>
      <button class="btn btn-primary" id="btn-next">${c.cta}</button>
    `);
    card.querySelector("#btn-next").addEventListener("click", () => {
      this.goToQuest("reconnect2023");
    });
  }

  _renderReconnect2023() {
    const c = content.reconnect2023;
    const card = this._mountCard(`
      <p class="quest-hint">${c.interactionHint}</p>
      <p class="quest-body quest-body--hidden" id="story-body">${c.body}</p>
      <button class="btn btn-primary btn-hidden" id="btn-next">${c.cta}</button>
    `);

    const proxy = createInflatedHitProxy(this.rod, 2.2, 1.4);
    this.sceneManager.scene.add(proxy);

    this.interaction.register(proxy, () => {
      this.sceneManager.scene.remove(proxy);
      this._playCastAnimation(() => {
        card.querySelector("#story-body").classList.remove("quest-body--hidden");
        const btn = card.querySelector("#btn-next");
        btn.classList.remove("btn-hidden");
        btn.addEventListener("click", () => this.goToQuest("proposal2025"));
        card.querySelector(".quest-hint").style.display = "none";
      });
    }, "rod");
  }

  _playCastAnimation(onDone) {
    const rod = this.rod;
    const innerRod = rod.userData.rod;
    const restZ = Math.PI / 10;
    const tl = gsap.timeline({ onComplete: onDone });

    // Ancang-ancang: joran ditarik sedikit ke belakang sebelum diayun.
    tl.to(rod.rotation, { x: 0.2, duration: 0.22, ease: "power1.out" })
      .to(innerRod.rotation, { z: restZ + 0.35, duration: 0.22, ease: "power1.out" }, "<")
      // Ayunan ke depan — tali mulai terlempar begitu ayunan dimulai, bukan setelahnya,
      // supaya terasa satu gerakan yang sama (joran mendorong, tali mengikuti).
      .to(rod.rotation, { x: -0.55, duration: 0.32, ease: "power3.out" })
      .to(innerRod.rotation, { z: -Math.PI / 3.2, duration: 0.32, ease: "power3.out" }, "<")
      .to(
        { t: 0 },
        {
          t: 1,
          duration: 0.42,
          ease: "power1.out",
          onUpdate: function () {
            rod.userData.setLineLength(this.targets()[0].t, 1.4);
          },
          onComplete: () => {
            this._spawnSplash(new THREE.Vector3(2.4, 0.1, -0.5));
          },
        },
        "<0.05"
      )
      // Kembali ke posisi istirahat.
      .to(rod.rotation, { x: 0, duration: 0.4, ease: "power2.inOut" })
      .to(innerRod.rotation, { z: restZ, duration: 0.4, ease: "power2.inOut" }, "<");
  }

  _renderProposal2025() {
    const c = content.proposal2025;
    const card = this._mountCard(`
      <p class="quest-hint">${c.interactionHint}</p>
      <p class="quest-body quest-body--hidden" id="story-body">${c.body}</p>
      <button class="btn btn-primary btn-hidden" id="btn-next">${c.cta}</button>
    `);

    const proxy = createInflatedHitProxy(this.rod, 2.2, 1.4);
    this.sceneManager.scene.add(proxy);

    this.interaction.register(proxy, () => {
      this.sceneManager.scene.remove(proxy);
      this._playReelAnimation(() => {
        card.querySelector("#story-body").classList.remove("quest-body--hidden");
        const btn = card.querySelector("#btn-next");
        btn.classList.remove("btn-hidden");
        btn.addEventListener("click", () => this.goToQuest("eventReveal"));
        card.querySelector(".quest-hint").style.display = "none";
      });
    }, "rod");
  }

  _playReelAnimation(onDone) {
    const rod = this.rod;
    const fish = this.fish;
    const tl = gsap.timeline({ onComplete: onDone });
    tl.to(rod.rotation, { x: 0.4, duration: 0.4, ease: "power2.out" })
      .to(
        { t: 1 },
        {
          t: 0,
          duration: 0.6,
          onUpdate: function () {
            rod.userData.setLineLength(this.targets()[0].t, 1.4);
          },
        },
        "<"
      )
      .call(() => this._spawnSplash(fish.position.clone()))
      .to(fish.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "back.out(1.7)" })
      .to(fish.position, { y: 0.6, duration: 0.6, ease: "power2.out" }, "<")
      .to(
        fish.userData.glowLight,
        { intensity: 2.5, duration: 0.5, yoyo: true, repeat: 1 },
        "<"
      );
  }

  _renderEventReveal() {
    const c = content.eventReveal;
    const card = this._mountCard(`
      <p class="quest-hint">${c.interactionHint}</p>
      <div class="quest-reveal quest-reveal--hidden" id="reveal-block">
        <p class="quest-date">${c.date}</p>
        <p class="quest-body">${c.body}</p>
        <p class="quest-venue-name">${c.venueName}</p>
        <p class="quest-venue-address">${c.venueAddress}</p>
        <a class="btn btn-secondary" id="btn-maps" href="${mapsUrl}" target="_blank" rel="noopener">${c.mapsCta}</a>
        <button class="btn btn-primary" id="btn-next">${c.cta}</button>
      </div>
    `);

    const revealNow = () => {
      card.querySelector(".quest-hint").style.display = "none";
      card.querySelector("#reveal-block").classList.remove("quest-reveal--hidden");
      card.querySelector("#btn-next").addEventListener("click", () => {
        this.goToQuest("rsvp");
      });
    };

    const proxy = createInflatedHitProxy(this.chest, 1.6, 1.2);
    this.sceneManager.scene.add(proxy);

    this.interaction.register(proxy, () => {
      this.sceneManager.scene.remove(proxy);
      this._playChestOpen(revealNow);
    }, "chest");
  }

  _playChestOpen(onDone) {
    const chest = this.chest;
    gsap.to(chest.userData.lidPivot.rotation, {
      x: -Math.PI * 0.75,
      duration: 1.2,
      ease: "back.out(1.7)",
    });
    gsap.fromTo(
      chest.userData.glowLight,
      { intensity: 0 },
      {
        intensity: 3,
        duration: 0.6,
        delay: 0.5,
        yoyo: true,
        repeat: 1,
        onComplete: onDone,
      }
    );
  }

  _renderRsvp() {
    const c = content.rsvp;
    const card = this._mountCard(`
      <p class="quest-hint">Ketuk kotak alat pancing untuk membuka</p>
      <div class="quest-reveal quest-reveal--hidden" id="reveal-block">
        <p class="quest-body">${c.body}</p>
        <p class="quest-sub-body">${c.subBody}</p>
        <a class="btn btn-primary" id="btn-rsvp" href="${c.rsvpUrl}" target="_blank" rel="noopener">${c.cta}</a>
        <p class="quest-closing">${c.closing}</p>
      </div>
    `);

    const revealNow = () => {
      card.querySelector(".quest-hint").style.display = "none";
      card.querySelector("#reveal-block").classList.remove("quest-reveal--hidden");
    };

    const proxy = createInflatedHitProxy(this.tackleBox, 1.7, 1.2);
    this.sceneManager.scene.add(proxy);

    this.interaction.register(proxy, () => {
      this.sceneManager.scene.remove(proxy);
      gsap.to(this.tackleBox.userData.lidPivot.rotation, {
        x: -Math.PI * 0.85,
        duration: 0.9,
        ease: "back.out(1.7)",
        onComplete: revealNow,
      });
    }, "tackleBox");
  }
}
