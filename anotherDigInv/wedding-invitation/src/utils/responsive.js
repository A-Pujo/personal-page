const MOBILE_QUERY = "(max-width: 768px)";

export function isMobile() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

// Tier menentukan kompleksitas render: dipakai particle count, wave segments, bloom on/off.
export function getQualityTier() {
  if (isMobile()) {
    const cores = navigator.hardwareConcurrency || 4;
    return cores <= 4 ? "low" : "mid";
  }
  return "high";
}

export const qualitySettings = {
  low: {
    fireflyCount: 25,
    splashParticleCount: 20,
    waterSegments: 24,
    bloomEnabled: false,
    shadowsEnabled: false,
    maxPixelRatio: 1.5,
  },
  mid: {
    fireflyCount: 50,
    splashParticleCount: 35,
    waterSegments: 48,
    bloomEnabled: false,
    shadowsEnabled: false,
    maxPixelRatio: 2,
  },
  high: {
    fireflyCount: 150,
    splashParticleCount: 60,
    waterSegments: 96,
    bloomEnabled: true,
    shadowsEnabled: false,
    maxPixelRatio: 2,
  },
};

export function getQualitySettings() {
  return qualitySettings[getQualityTier()];
}

export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}
