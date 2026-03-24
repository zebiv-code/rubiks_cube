// ─── Main: init, render loop, event listeners, camera orbit ─────
import { M4 } from './mat4.js';
import { createProgram } from './gl-utils.js';
import { RubiksCube } from './rubiks-cube.js';

// ─── WebGL setup ────────────────────────────────────────────────
const canvas = document.getElementById('c');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl');
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.1, 0.1, 0.1, 1);

const prog = createProgram(gl);

const uProj = gl.getUniformLocation(prog, 'uProj');
const uView = gl.getUniformLocation(prog, 'uView');
const uModel = gl.getUniformLocation(prog, 'uModel');

const proj = M4.create();
M4.perspective(proj, 45*Math.PI/180, canvas.width/canvas.height, 0.1, 100);
gl.uniformMatrix4fv(uProj, false, proj);

// ─── Cube instance ──────────────────────────────────────────────
const cube = new RubiksCube(gl, uModel);
const aPos = gl.getAttribLocation(prog, 'aPos');
const aCol = gl.getAttribLocation(prog, 'aCol');
gl.enableVertexAttribArray(aPos);
gl.enableVertexAttribArray(aCol);

// ─── Camera orbit ───────────────────────────────────────────────
let camX = 0.5, camY = 0.6;
let dragging = false, lastMX, lastMY;

canvas.addEventListener('pointerdown', e => {
    dragging = true; lastMX = e.clientX; lastMY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    camY += (e.clientX - lastMX) * 0.007;
    camX += (e.clientY - lastMY) * 0.007;
    camX = Math.max(-Math.PI/2, Math.min(Math.PI/2, camX));
    lastMX = e.clientX; lastMY = e.clientY;
});
canvas.addEventListener('pointerup', () => dragging = false);

// ─── Render loop ────────────────────────────────────────────────
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let view = M4.create();
    view = M4.translate(view, 0, 0, -8);
    view = M4.rotateX(view, camX);
    view = M4.rotateY(view, camY);
    gl.uniformMatrix4fv(uView, false, view);

    for (const c of cube.cubies) c.draw(aPos, aCol);
    requestAnimationFrame(render);
}
render();

// ─── UI Controls ────────────────────────────────────────────────
document.querySelectorAll('[data-move]').forEach(btn => {
    btn.addEventListener('click', () => cube.queueMove(btn.dataset.move));
});
document.getElementById('scramble').addEventListener('click', () => cube.scramble());
document.getElementById('solve').addEventListener('click', () => cube.solve());
document.getElementById('reset').addEventListener('click', () => cube.reset());

// ─── Keyboard controls ─────────────────────────────────────────
document.addEventListener('keydown', e => {
    const key = e.key.toUpperCase();
    if ('UDFLRB'.includes(key)) {
        e.preventDefault();
        cube.queueMove(e.shiftKey ? key + "'" : key);
    }
    if (key === 'M') { e.preventDefault(); cube.queueMove(e.shiftKey ? "M'" : 'M'); }
    if (key === 'E') { e.preventDefault(); cube.queueMove(e.shiftKey ? "E'" : 'E'); }
    if (key === 'S' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); cube.queueMove(e.shiftKey ? "S'" : 'S'); }
});

// ─── Resize handling ────────────────────────────────────────────
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    M4.perspective(proj, 45*Math.PI/180, canvas.width/canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(uProj, false, proj);
});
