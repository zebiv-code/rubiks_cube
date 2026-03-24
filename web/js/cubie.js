// ─── Cubie geometry & rendering ──────────────────────────────────
import { M4 } from './mat4.js';

const COLORS = {
    W: [1, 1, 1],       // white  - Up
    Y: [1, 0.85, 0],    // yellow - Down
    R: [0.8, 0, 0],     // red    - Front
    O: [1, 0.4, 0],     // orange - Back
    B: [0, 0.27, 0.68], // blue   - Right
    G: [0, 0.6, 0.1],   // green  - Left
    K: [0.12, 0.12, 0.12] // black (internal)
};

// Build a cubie mesh: 6 faces, each face gets a color based on position
function buildCubie(gx, gy, gz) {
    const s = 0.43; // half-size (with gap between cubies)
    const verts = [];
    const idxs = [];
    let vi = 0;

    const faceColor = (condition, color) => condition ? COLORS[color] : COLORS.K;

    // Vertices offset by grid position (gx, gy, gz) so cubies don't overlap
    const x = gx, y = gy, z = gz;
    // All faces wound CCW when viewed from outside the cube
    const faces = [
        { n: 'front',  verts: [[x-s,y-s,z+s],[x+s,y-s,z+s],[x+s,y+s,z+s],[x-s,y+s,z+s]], col: faceColor(gz=== 1,'R') },  // +Z
        { n: 'back',   verts: [[x+s,y-s,z-s],[x-s,y-s,z-s],[x-s,y+s,z-s],[x+s,y+s,z-s]], col: faceColor(gz===-1,'O') },  // -Z
        { n: 'up',     verts: [[x-s,y+s,z+s],[x+s,y+s,z+s],[x+s,y+s,z-s],[x-s,y+s,z-s]], col: faceColor(gy=== 1,'W') },  // +Y
        { n: 'down',   verts: [[x-s,y-s,z-s],[x+s,y-s,z-s],[x+s,y-s,z+s],[x-s,y-s,z+s]], col: faceColor(gy===-1,'Y') },  // -Y
        { n: 'right',  verts: [[x+s,y-s,z+s],[x+s,y-s,z-s],[x+s,y+s,z-s],[x+s,y+s,z+s]], col: faceColor(gx=== 1,'B') },  // +X
        { n: 'left',   verts: [[x-s,y-s,z-s],[x-s,y-s,z+s],[x-s,y+s,z+s],[x-s,y+s,z-s]], col: faceColor(gx===-1,'G') },  // -X
    ];

    for (const f of faces) {
        for (const v of f.verts) verts.push(...v, ...f.col);
        idxs.push(vi,vi+1,vi+2, vi,vi+2,vi+3);
        vi += 4;
    }
    return { verts: new Float32Array(verts), idxs: new Uint16Array(idxs) };
}

export class Cubie {
    constructor(gl, gx, gy, gz, uModel) {
        this.gl = gl;
        this.uModel = uModel;
        // Grid position tracks which layer this cubie is in (-1, 0, 1)
        this.pos = [gx, gy, gz];
        // Accumulated rotation matrix
        this.matrix = M4.create();
        // Build geometry and GPU buffers
        const mesh = buildCubie(gx, gy, gz);
        this.numIndices = mesh.idxs.length;
        this.vBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuf);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.verts, gl.STATIC_DRAW);
        this.iBuf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.idxs, gl.STATIC_DRAW);
    }

    draw(aPos, aCol) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuf);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuf);
        const stride = 6 * 4;
        gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, stride, 12);
        gl.uniformMatrix4fv(this.uModel, false, this.matrix);
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }

    destroy() {
        this.gl.deleteBuffer(this.vBuf);
        this.gl.deleteBuffer(this.iBuf);
    }
}
