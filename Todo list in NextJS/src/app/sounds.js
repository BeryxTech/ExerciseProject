let musicAudio = null;
let isMusicEnabled = false;
let unlockAttached = false;
let cachedTracks = [
  '/Sounds/Ambience/Aerie.ogg',
  '/Sounds/Ambience/Firebugs.ogg',
  '/Sounds/Ambience/Labyrinthine.ogg',
];
let shuffleQueue = [];
let lastPlayedTrack = null;

function playAudio(src, volume = 0.5) {
  if (typeof window === 'undefined') return;
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {});
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildShuffledQueue(tracks, avoidFirst = null) {
  const copy = [...tracks];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (avoidFirst && copy.length > 1 && copy[0] === avoidFirst) {
    [copy[0], copy[1]] = [copy[1], copy[0]];
  }
  return copy;
}

export function playClick() {
  playAudio('/Sounds/SFX/Click_stereo.ogg', 0.45);
}

export function playPageTurn() {
  playAudio(
    pickRandom([
      '/Sounds/SFX/Page_turn1.ogg',
      '/Sounds/SFX/Page_turn2.ogg',
      '/Sounds/SFX/Page_turn3.ogg',
    ]),
    0.55
  );
}

export function playBell() {
  playAudio(
    pickRandom(['/Sounds/SFX/Bell_use1.ogg', '/Sounds/SFX/Bell_use2.ogg']),
    0.5
  );
}

export function playXpOrb() {
  playAudio('/Sounds/SFX/Successful_hit.ogg', 0.45);
}

export function playLevelUp() {
  playAudio('/Sounds/SFX/Random_levelup.ogg', 0.5);
}

function startNextTrack() {
  if (!isMusicEnabled || typeof window === 'undefined') return;

  if (shuffleQueue.length === 0) {
    if (cachedTracks.length === 0) return;
    shuffleQueue = buildShuffledQueue(cachedTracks, lastPlayedTrack);
  }

  const nextSrc = shuffleQueue.shift();
  lastPlayedTrack = nextSrc;

  musicAudio = new Audio(nextSrc);
  musicAudio.volume = 0.35;
  musicAudio.onended = () => startNextTrack();
  musicAudio.onerror = () => {
    console.error('[Ambience] File not found or invalid audio:', nextSrc);
  };

  musicAudio.play().catch((err) => {
    console.warn('[Ambience] Waiting for first click to play:', err.name);
  });
}

function attachFirstClickUnlock() {
  if (unlockAttached || typeof window === 'undefined') return;
  unlockAttached = true;

  const unlock = () => {
    if (isMusicEnabled) {
      if (!musicAudio) {
        startNextTrack();
      } else if (musicAudio.paused) {
        musicAudio.play().catch((err) => {
          console.error('[Ambience] Play failed after click:', err);
        });
      }
    }
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    unlockAttached = false;
  };

  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

export function setFireflyAmbience(enabled) {
  if (typeof window === 'undefined') return false;

  isMusicEnabled = enabled;

  if (!enabled) {
    if (musicAudio) {
      musicAudio.pause();
      musicAudio.onended = null;
      musicAudio = null;
    }
    return false;
  }

  // Refresh dynamic track list in background for future shuffles
  fetch('/api/ambience')
    .then((res) => (res.ok ? res.json() : []))
    .then((tracks) => {
      if (Array.isArray(tracks) && tracks.length > 0) {
        cachedTracks = tracks;
      }
    })
    .catch(() => {});

  // Start immediately & register first-click unlock synchronously
  if (!musicAudio) {
    startNextTrack();
  }
  attachFirstClickUnlock();
  return true;
}