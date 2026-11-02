// Bed dimensions (mm) – Ender 3 builds area 220×220 mm
const BED_SIZE = 220;
const CANVAS_SIZE = 440; // pixel size (2 px per mm)
const SCALE = CANVAS_SIZE / BED_SIZE;

const canvas = document.getElementById('bedCanvas');
const ctx = canvas.getContext('2d');
const headEl = document.getElementById('head');
const gcodeDisplay = document.getElementById('gcodeDisplay');
const xInput = document.getElementById('xInput');
const yInput = document.getElementById('yInput');
const studentNameInput = document.getElementById('studentName');
const controls = document.getElementById('controls');
const status = document.getElementById('status');
const downloadBtn = document.getElementById('downloadGcode');
const initialStatusMessage = status.textContent;

function validateCoordinates() {
  let invalidCoordinate = false;
  for (const [input, axis] of [[xInput, 'X'], [yInput, 'Y']]) {
    const value = input.value === '' ? null : Number(input.value);
    const outsideBed = value !== null && (value < 0 || value > BED_SIZE);
    input.setCustomValidity(outsideBed
      ? `A coordenada ${axis} está além do espaço disponível na mesa (0 a ${BED_SIZE} mm).`
      : '');
    if (outsideBed && !invalidCoordinate) {
      status.textContent = `A coordenada ${axis} está além do espaço disponível na mesa (0 a ${BED_SIZE} mm).`;
      invalidCoordinate = true;
    }
  }

  if (!invalidCoordinate && status.textContent.startsWith('A coordenada ')) {
    status.textContent = initialStatusMessage;
  }
  return !invalidCoordinate;
}

// Initial head position (home)
let pos = { x: 0, y: 0 };
// G-code string – start with homing and absolute positioning
let gcode = 'G28 ; home all axes\nG90 ; absolute positioning\nG1 Z30 ; set Z to 30 mm\nG1 Z30; set Z to 30mm \n';
gcodeDisplay.textContent = gcode;

function drawBed() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  // Draw grid (10 mm spacing)
  ctx.strokeStyle = 'rgba(38, 65, 150, 0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= BED_SIZE; i += 10) {
    const p = i * SCALE;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(CANVAS_SIZE, p);
    ctx.stroke();
  }
  // Bed border
  ctx.strokeStyle = '#264196';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

function updateHead() {
  const displayScale = canvas.clientWidth / CANVAS_SIZE;
  headEl.style.left = (pos.x * SCALE * displayScale) + 'px';
  headEl.style.top = (pos.y * SCALE * displayScale) + 'px';
}

function addMove(event) {
  event.preventDefault();
  if (!validateCoordinates()) {
    controls.reportValidity();
    return;
  }
  if (!controls.reportValidity()) {
    return;
  }
  const x = Number(xInput.value);
  const y = Number(yInput.value);
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > BED_SIZE || y > BED_SIZE) {
    status.textContent = 'Informe coordenadas X e Y entre 0 e ' + BED_SIZE + ' mm.';
    return;
  }

  // Draw line from previous position
  ctx.strokeStyle = '#7D89FD';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pos.x * SCALE, pos.y * SCALE);
  ctx.lineTo(x * SCALE, y * SCALE);
  ctx.stroke();

  // Update position
  pos = { x, y };
  updateHead();

  // Append G-code
  gcode += `G1 X${x.toFixed(2)} Y${y.toFixed(2)}\nG1 Z0.2\n`;
  gcodeDisplay.textContent = gcode;
  downloadBtn.disabled = false;
  status.textContent = `Posição X${x.toFixed(2)} Y${y.toFixed(2)} adicionada. O G-code está pronto para download.`;
}

xInput.addEventListener('input', validateCoordinates);
yInput.addEventListener('input', validateCoordinates);
controls.addEventListener('submit', addMove);
drawBed();
updateHead();
window.addEventListener('resize', updateHead);
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([gcode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeStudentName = studentNameInput.value.trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[. ]+$/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!safeStudentName) {
    status.textContent = 'Informe um nome de aluno válido para nomear o arquivo.';
    URL.revokeObjectURL(url);
    return;
  }
  a.download = `${safeStudentName}.gcode`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
});
