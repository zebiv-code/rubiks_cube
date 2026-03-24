# Rubik's Cube

Interactive 3D Rubik's Cube simulator with animated layer rotations, keyboard controls, and drag-to-orbit camera.

**[Live Demo](https://zebiv.com/rubiks-cube/)**

## Controls

- **Drag** to rotate the view
- **Keys**: U, D, F, B, L, R (hold Shift for inverse moves)
- **M/E/S** for middle, equator, and standing layer moves
- **Scramble** randomizes with 20 moves
- **Reset** returns to solved state

## Tech

- WebGL 1.0 (no libraries)
- Per-cubie rendering with individual transform matrices
- Move queue with eased animation
- Single HTML file, no build step

## License

MIT — see [LICENSE.md](LICENSE.md)
