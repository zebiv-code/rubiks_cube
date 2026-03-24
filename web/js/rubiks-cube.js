// ─── Rubik's Cube ───────────────────────────────────────────────
import { M4 } from './mat4.js';
import { Cubie } from './cubie.js';

export class RubiksCube {
    constructor(gl, uModel) {
        this.gl = gl;
        this.uModel = uModel;
        this.cubies = [];
        this.animating = false;
        this.moveQueue = [];
        this.history = [];
        this.solving = false;
        this.init();
    }

    init() {
        this.cubies.forEach(c => c.destroy());
        this.cubies = [];
        for (let x = -1; x <= 1; x++)
            for (let y = -1; y <= 1; y++)
                for (let z = -1; z <= 1; z++)
                    this.cubies.push(new Cubie(this.gl, x, y, z, this.uModel));
    }

    // Get cubies in a layer: axis='x'|'y'|'z', layer=-1|0|1
    getLayer(axis, layer) {
        const idx = {x:0, y:1, z:2}[axis];
        return this.cubies.filter(c => Math.round(c.pos[idx]) === layer);
    }

    // After a 90-degree rotation, update the logical positions of cubies
    updatePositions(cubies, axis, angle) {
        const steps = Math.round(angle / (Math.PI / 2));
        for (const c of cubies) {
            let [x, y, z] = c.pos;
            for (let i = 0; i < Math.abs(steps); i++) {
                const dir = Math.sign(steps);
                if (axis === 'x') { const t = y; y = -dir * z; z = dir * t; }
                if (axis === 'y') { const t = x; x = dir * z; z = -dir * t; }
                if (axis === 'z') { const t = x; x = -dir * y; y = dir * t; }
            }
            c.pos = [Math.round(x), Math.round(y), Math.round(z)];
        }
    }

    // Animate a layer rotation
    animateMove(axis, layer, angle, duration = 300) {
        const cubies = this.getLayer(axis, layer);
        if (cubies.length === 0) return;
        this.animating = true;
        const startMatrices = cubies.map(c => new Float32Array(c.matrix));
        const start = performance.now();

        const tick = () => {
            const t = Math.min((performance.now() - start) / duration, 1);
            const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
            const a = angle * ease;

            for (let i = 0; i < cubies.length; i++) {
                // rotation * startMatrix
                let rot = M4.create();
                rot = M4.rotateAxis(rot, axis, a);
                cubies[i].matrix = M4.multiply(rot, startMatrices[i]);
            }

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                // Snap to exact final rotation
                for (let i = 0; i < cubies.length; i++) {
                    let rot = M4.create();
                    rot = M4.rotateAxis(rot, axis, angle);
                    cubies[i].matrix = M4.multiply(rot, startMatrices[i]);
                }
                this.updatePositions(cubies, axis, angle);
                this.animating = false;
                this.processQueue();
            }
        };
        requestAnimationFrame(tick);
    }

    queueMove(name, track = true) {
        this.moveQueue.push({ name, track });
        if (!this.animating) this.processQueue();
    }

    processQueue() {
        if (this.moveQueue.length === 0) {
            if (this.solving) this.solving = false;
            return;
        }
        const { name: move, track } = this.moveQueue.shift();
        if (track) this.history.push(move);
        const a = Math.PI / 2;
        const moves = {
            'U':  ['y',  1,  a], "U'": ['y',  1, -a],
            'D':  ['y', -1, -a], "D'": ['y', -1,  a],
            'R':  ['x',  1, -a], "R'": ['x',  1,  a],
            'L':  ['x', -1,  a], "L'": ['x', -1, -a],
            'F':  ['z',  1, -a], "F'": ['z',  1,  a],
            'B':  ['z', -1,  a], "B'": ['z', -1, -a],
            'M':  ['x',  0,  a], "M'": ['x',  0, -a],
            'E':  ['y',  0, -a], "E'": ['y',  0,  a],
            'S':  ['z',  0, -a], "S'": ['z',  0,  a],
        };
        const m = moves[move];
        if (m) this.animateMove(m[0], m[1], m[2]);
    }

    scramble(n = 20) {
        const names = ['U','D','R','L','F','B'];
        for (let i = 0; i < n; i++) {
            const name = names[Math.floor(Math.random() * names.length)];
            const prime = Math.random() < 0.5 ? "'" : '';
            this.queueMove(name + prime);
        }
    }

    static inverse(move) {
        return move.endsWith("'") ? move.slice(0, -1) : move + "'";
    }

    solve() {
        if (this.animating || this.solving || this.history.length === 0) return;
        this.solving = true;
        this.moveQueue = [];
        const solution = this.history.slice().reverse().map(m => RubiksCube.inverse(m));
        for (const m of solution) this.queueMove(m, false);
        this.history = [];
    }

    reset() {
        if (this.animating) return;
        this.moveQueue = [];
        this.history = [];
        this.solving = false;
        this.init();
    }
}
