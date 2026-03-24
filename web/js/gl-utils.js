// ─── WebGL shader compilation & program creation ────────────────

const VERTEX_SHADER_SRC = `
    attribute vec3 aPos;
    attribute vec3 aCol;
    uniform mat4 uProj, uView, uModel;
    varying vec3 vCol;
    void main() {
        vCol = aCol;
        gl_Position = uProj * uView * uModel * vec4(aPos, 1.0);
    }`;

const FRAGMENT_SHADER_SRC = `
    precision mediump float;
    varying vec3 vCol;
    void main() { gl_FragColor = vec4(vCol, 1.0); }`;

function compileShader(gl, src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
    }
    return s;
}

export function createProgram(gl) {
    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl, VERTEX_SHADER_SRC, gl.VERTEX_SHADER));
    gl.attachShader(prog, compileShader(gl, FRAGMENT_SHADER_SRC, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);
    return prog;
}
