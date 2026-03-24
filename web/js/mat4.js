// ─── Matrix math ────────────────────────────────────────────────
export const M4 = {
    create() { const m = new Float32Array(16); m[0]=m[5]=m[10]=m[15]=1; return m; },
    identity(m) { m.fill(0); m[0]=m[5]=m[10]=m[15]=1; return m; },
    perspective(out, fov, aspect, near, far) {
        const f = 1/Math.tan(fov/2), nf = 1/(near-far);
        out.fill(0);
        out[0]=f/aspect; out[5]=f; out[10]=(far+near)*nf; out[11]=-1; out[14]=2*far*near*nf;
    },
    multiply(a, b) {
        const out = new Float32Array(16);
        for (let i=0;i<4;i++) for (let j=0;j<4;j++)
            for (let k=0;k<4;k++) out[j*4+i] += a[k*4+i]*b[j*4+k];
        return out;
    },
    translate(m, x, y, z) {
        const t = M4.create();
        t[12]=x; t[13]=y; t[14]=z;
        return M4.multiply(m, t);
    },
    rotateX(m, a) {
        const r = M4.create(), c=Math.cos(a), s=Math.sin(a);
        r[5]=c; r[6]=s; r[9]=-s; r[10]=c;
        return M4.multiply(m, r);
    },
    rotateY(m, a) {
        const r = M4.create(), c=Math.cos(a), s=Math.sin(a);
        r[0]=c; r[2]=-s; r[8]=s; r[10]=c;
        return M4.multiply(m, r);
    },
    rotateZ(m, a) {
        const r = M4.create(), c=Math.cos(a), s=Math.sin(a);
        r[0]=c; r[1]=s; r[4]=-s; r[5]=c;
        return M4.multiply(m, r);
    },
    rotateAxis(m, axis, a) {
        if (axis === 'x') return M4.rotateX(m, a);
        if (axis === 'y') return M4.rotateY(m, a);
        return M4.rotateZ(m, a);
    }
};
