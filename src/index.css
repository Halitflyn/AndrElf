@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Spectral:wght@400;700&display=swap');
@import "tailwindcss";

@theme {
  --font-cinzel: "Cinzel Decorative", serif;
  --font-spectral: "Spectral", serif;
  
  --color-neon-cyan: #66fcf1;
  --color-neon-teal: #45a29e;
  --color-neon-green: #9effa1;
  --color-dark-bg: #1f2124;
}

/* [БАЗОВІ АНІМАЦІЇ ТА СТИЛІ] */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse-glow { 
  0% { transform: scale(1); box-shadow: 0 0 15px var(--color-neon-cyan); } 
  50% { transform: scale(1.01); box-shadow: 0 0 30px var(--color-neon-teal); } 
  100% { transform: scale(1); box-shadow: 0 0 15px var(--color-neon-cyan); } 
}
@keyframes teaSteam { 
  0% { transform: translateY(0) scale(0.5); opacity: 0.5; } 
  100% { transform: translateY(-50px) scale(1.2); opacity: 0; } 
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: rgba(26, 26, 29, 0.8); border-radius: 4px; }
::-webkit-scrollbar-thumb { background: var(--color-neon-teal); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-neon-cyan); }

body {
  background: linear-gradient(rgba(15, 15, 18, 0.85), rgba(15, 15, 18, 0.9)), url('https://i.pinimg.com/originals/8d/f3/0d/8df30db43d2c7f4a56c7028d7b326046.gif') no-repeat center center fixed;
  background-size: cover; 
  color: #c5c6c7; 
  font-family: var(--font-spectral); 
  margin: 0; 
  text-align: center; 
  line-height: 1.8;
  animation: fadeIn 2s ease-in-out;
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewport="0 0 100 100" style="fill:black;font-size:12px;"><text y="50%">🍵</text></svg>') 8 8, auto;
}

/* Custom utility classes for complex glows */
.glow-text-cyan {
  text-shadow: 0 0 20px var(--color-neon-cyan), 0 0 30px var(--color-neon-teal);
}
.glow-text-cyan:hover {
  text-shadow: 0 0 25px var(--color-neon-green), 0 0 40px var(--color-neon-cyan);
}
.glow-box-cyan {
  box-shadow: 0 0 30px rgba(102, 252, 241, 0.3);
}
.glow-box-cyan-hover:hover {
  box-shadow: 0 0 20px rgba(102, 252, 241, 0.8);
}

input[type=range] { 
  -webkit-appearance: none; 
  background: rgba(0, 0, 0, 0.5); 
  height: 6px; 
  border-radius: 5px; 
  outline: none; 
  cursor: pointer; 
  border: 1px solid var(--color-neon-teal); 
}
input[type=range]::-webkit-slider-thumb { 
  -webkit-appearance: none; 
  width: 16px; 
  height: 16px; 
  border-radius: 50%; 
  background: var(--color-neon-cyan); 
  box-shadow: 0 0 10px var(--color-neon-cyan); 
  transition: transform 0.1s; 
}
input[type=range]::-webkit-slider-thumb:hover { 
  transform: scale(1.3); 
}

/* Custom styles for rules data */
.tea-trigger { 
  color: var(--color-neon-green); 
  font-weight: bold; 
  cursor: pointer; 
  text-decoration: underline dotted var(--color-neon-teal); 
  transition: all 0.3s ease; 
  position: relative; 
  display: inline-block; 
  padding: 2px 5px; 
  border-radius: 4px; 
  user-select: none; 
}
.tea-trigger:hover { 
  color: var(--color-dark-bg); 
  background-color: var(--color-neon-green); 
  text-decoration: none; 
}
.tea-steam { 
  position: absolute; 
  bottom: 100%; 
  left: 50%; 
  transform: translateX(-50%); 
  font-size: 2em; 
  opacity: 0; 
  animation: teaSteam 3s infinite ease-out; 
  color: #e0f2f1; 
  pointer-events: none; 
  text-shadow: 0 0 5px #e0f2f1; 
}
.tea-trigger:hover .tea-steam { 
  animation-play-state: running; 
}
.whisper-anchor {
  position: relative;
}
.whisper-text { 
  position: absolute; 
  background-color: rgba(0, 0, 0, 0.9); 
  color: #ffcc00; 
  padding: 5px 12px; 
  border-radius: 5px; 
  white-space: nowrap; 
  pointer-events: none; 
  opacity: 0; 
  transition: opacity 0.3s ease; 
  z-index: 10; 
  border: 1px solid #ffcc00; 
  font-size: 0.9rem;
}
.whisper-anchor:hover .whisper-text { 
  opacity: 1; 
}
