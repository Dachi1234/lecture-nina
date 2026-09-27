# Source files (reference only)

Original design-canvas files exactly as published. `.dc.html` files use a small canvas-specific template runtime ({{holes}}, <sc-for>, <sc-if>) and load assets from canvas-only URLs, so they do not open correctly on their own.
Use `../screens/*.html` for anything practical — those are the same designs converted to plain HTML with local assets.
`canvas.json` holds the artboard layout and the developer sticky notes (also copied into docs/cabinet-spec.md).
Main.dc.html + Main-2.dc.html = one desktop landing page (split only because of the canvas height limit); same for Landing-Mobile(-2).
