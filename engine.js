// engine.js – Vollständige Version mit Welt, Biomen, Thronglets, Tieren, Wetter, Interaktion

export let canvas, ctx;
export let camX = 0, camY = 0, zoom = 1;

export const TILE_SIZE = 32;
export const WORLD_WIDTH = 100;
export const WORLD_HEIGHT = 100;

export const world = [];
export const thronglets = [];
export const animals = [];
export const plants = [];
export const buildings = [];

const tileMap = {
  meer: 0, strand: 1, gras: 2, wald: 3, sumpf: 4, berg: 5, schnee: 6, fluss: 7, vulkan: 8
};

let tileset;
let weather = 'clear';
let isDay = true;
let lastCycle = Date.now();

function getBiome(x, y) {
  const noise = Math.sin(x * 0.05) + Math.cos(y * 0.05);
  if (noise < -1.5) return 'meer';
  if (noise < -1.2) return 'strand';
  if (noise < -0.5) return 'fluss';
  if (noise < 0.1) return 'gras';
  if (noise < 0.4) return 'wald';
  if (noise < 0.7) return 'sumpf';
  if (noise < 1.1) return 'berg';
  if (noise < 1.5) return 'schnee';
  return 'vulkan';
}

export function generateWorld() {
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WORLD_WIDTH; x++) {
      row.push({ biome: getBiome(x, y) });
    }
    world.push(row);
  }
}

function drawWorld() {
  const startX = Math.floor(camX / TILE_SIZE);
  const startY = Math.floor(camY / TILE_SIZE);
  const endX = startX + Math.ceil(canvas.width / (TILE_SIZE * zoom));
  const endY = startY + Math.ceil(canvas.height / (TILE_SIZE * zoom));

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      if (!world[y] || !world[y][x]) continue;
      const tile = world[y][x];
      const spriteIndex = tileMap[tile.biome];
      ctx.drawImage(tileset, spriteIndex * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE,
        (x * TILE_SIZE - camX) * zoom,
        (y * TILE_SIZE - camY) * zoom,
        TILE_SIZE * zoom, TILE_SIZE * zoom);
    }
  }
}

function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWorld();
  drawPlants();
  drawAnimals();
  drawBuildings();
  drawThronglets();
  drawWeather();
  requestAnimationFrame(drawLoop);
}

function spawnThronglets() {
  for (let i = 0; i < 10; i++) {
    thronglets.push({
      x: 1000 + Math.random() * 100,
      y: 1000 + Math.random() * 100,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      health: 100,
      energy: 100,
      hunger: 100,
      inventory: []
    });
  }
}

function drawThronglets() {
  for (let t of thronglets) {
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.arc((t.x - camX) * zoom, (t.y - camY) * zoom, 6 * zoom, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.fillRect((t.x - camX - 8) * zoom, (t.y - camY - 10) * zoom, 16 * zoom, 3);
    ctx.fillStyle = "lime";
    ctx.fillRect((t.x - camX - 8) * zoom, (t.y - camY - 10) * zoom, (16 * (t.health / 100)) * zoom, 3);
  }
}

function drawAnimals() {
  for (let a of animals) {
    ctx.fillStyle = a.friendly ? "white" : "orange";
    ctx.beginPath();
    ctx.arc((a.x - camX) * zoom, (a.y - camY) * zoom, 4 * zoom, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawPlants() {
  for (let p of plants) {
    ctx.fillStyle = "green";
    ctx.fillRect((p.x - camX) * zoom, (p.y - camY) * zoom, 4 * zoom, 4 * zoom);
  }
}

function drawBuildings() {
  for (let b of buildings) {
    ctx.fillStyle = "gray";
    ctx.fillRect((b.x - camX) * zoom, (b.y - camY) * zoom, 20 * zoom, 20 * zoom);
  }
}

function drawWeather() {
  if (!isDay) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (weather === 'rain') {
    ctx.strokeStyle = 'rgba(150,150,255,0.4)';
    for (let i = 0; i < 100; i++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 1, y + 8);
      ctx.stroke();
    }
  }
}

function updateCycle() {
  const now = Date.now();
  if (now - lastCycle > 10000) {
    isDay = !isDay;
    weather = Math.random() < 0.5 ? 'clear' : 'rain';
    lastCycle = now;
  }
}

function handleControls() {
  let dragging = false;
  let start = { x: 0, y: 0 };
  canvas.addEventListener("mousedown", e => {
    dragging = true;
    start = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("mouseup", () => dragging = false);
  canvas.addEventListener("mousemove", e => {
    if (dragging) {
      camX -= (e.clientX - start.x) / zoom;
      camY -= (e.clientY - start.y) / zoom;
      start = { x: e.clientX, y: e.clientY };
    }
  });
  canvas.addEventListener("wheel", e => {
    zoom *= e.deltaY < 0 ? 1.1 : 0.9;
    zoom = Math.max(0.5, Math.min(5, zoom));
  });
}

function spawnAnimals() {
  for (let i = 0; i < 20; i++) {
    animals.push({
      x: 800 + Math.random() * 400,
      y: 800 + Math.random() * 400,
      friendly: Math.random() > 0.3
    });
  }
}

function spawnPlants() {
  for (let i = 0; i < 50; i++) {
    plants.push({
      x: 900 + Math.random() * 300,
      y: 900 + Math.random() * 300
    });
  }
}

function spawnBuildings() {
  buildings.push({ x: 960, y: 960 });
}

export function initGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  tileset = document.getElementById("tileset");

  generateWorld();
  spawnThronglets();
  spawnAnimals();
  spawnPlants();
  spawnBuildings();
  handleControls();

  function loop() {
    updateCycle();
    drawLoop();
    requestAnimationFrame(loop);
  }
  loop();
} 
// <- Hier kommt der vollständige Spielcode mit Sprite-Zeichnung rein ->
