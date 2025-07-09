// src/scripts/setAppHeight.js

function setAppHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial value
setAppHeight();

// Listen for resize events (e.g., keyboard appearing/disappearing, orientation change)
window.addEventListener('resize', setAppHeight);

// Optional: For iOS, listen to orientation change as well
window.addEventListener('orientationchange', setAppHeight);

// Optional: Clear listener on component unmount if this was part of a React/Vue component
// but for a global script, it's usually fine to keep it.