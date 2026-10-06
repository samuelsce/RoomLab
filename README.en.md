# RoomLab

A room and desk setup editor for experimenting with furniture, colors and lighting. Arrange objects in an interactive floor plan, then explore the same composition in 3D.

**[Live demo](https://samuelsce.github.io/RoomLab/) · [Gaming room](https://samuelsce.github.io/RoomLab/#/editor?scene=gamer) · [Português](README.md)**

![RoomLab home with an interactive 3D gaming room](docs/screenshots/studio-desktop.png)

A front-end portfolio project by [@samuelsce](https://github.com/samuelsce), focused on responsive interfaces, graphical interaction, complex state and browser persistence. The current application is available on `main`; changes are developed in branches and reviewed through pull requests.

## Try it in two minutes

1. Open the gaming room, click furniture to edit it, rotate the camera and switch between daylight and night lighting.
2. Choose **Planta 2D** to move objects. Select a piece and change its size, rotation or color in the properties panel.
3. Add furniture from the catalog and undo an edit.
4. Name the room, choose **Salvar** and reopen it from **Meus setups**.
5. Choose **Compartilhar → Gerar link** and open the address in another browser. The shared snapshot does not require an account and can be copied for editing.

The application UI is in Portuguese. The [technical evaluation guide](docs/AVALIACAO.md) and [architecture](docs/ARQUITETURA.md) provide deeper documentation in Portuguese.

## Features

- Four starting environments, including a gaming bedroom, plus an empty room.
- Thirteen furniture/decor objects, accent-insensitive search and category filters.
- Pointer, touch and keyboard interaction; movement, rotation, resizing, colors and layer order.
- Duplication, deletion, grid alignment and undo/redo with one history entry per drag gesture.
- 3D furniture with click/touch selection, selection feedback, materials, shadows, camera controls and daylight/night lighting.
- Responsive bottom properties panel, modal-aware shortcuts, visible focus, status messages and reduced-motion support.
- Local setup library with explicit saving, validated documents and stale-revision detection between tabs.
- JSON import/export, PNG of the current view and self-contained snapshot links.

## Engineering highlights

| Concern | Implementation |
| --- | --- |
| Gesture history | A pure reducer separates transient previews from committed edits. |
| Graphical coordinates | SVG screen coordinates are transformed into the document space; rotated bounds stay inside the room. |
| 2D/3D consistency | Both views consume one object list; projection translates floor-plan coordinates into the 3D model. |
| Data integrity | Storage and shared documents are validated, with recovery messages and revision comparisons. |
| Static sharing | A validated JSON snapshot is gzip-compressed and encoded into the URL fragment, without an application server. |
| Graphics lifecycle | Three.js loads separately; rendering responds to changes and resources are released on unmount. |

Start with [editorModel.ts](src/features/editor/editorModel.ts), [geometry.ts](src/features/editor/geometry.ts), [projection.ts](src/features/room3d/projection.ts), [storage.ts](src/features/setups/storage.ts) and [codec.ts](src/features/sharing/codec.ts).

## Stack and local setup

React 19, TypeScript, Vite, React Router, Three.js, SVG, CSS, Lucide and locally served Fontsource fonts. Playwright tests browser flows; `node:test` covers state and document rules. Exact dependency versions are recorded in the lockfile.

Requires Git, Node.js **22.12+** and npm. CI uses Node.js 24.

```sh
git clone https://github.com/samuelsce/RoomLab.git
cd RoomLab
npm ci
npm run dev
```

Open the terminal URL. No API keys, external accounts or database setup are required. Optional routing settings are documented in [.env.example](.env.example). Use `npm run build` and `npm run preview` for a production build.

## Verification

```sh
npm run lint
npm run typecheck
npm run format:check
npm run test:unit
npx playwright install chromium
npm run test:e2e -- --workers=2
npm run test:pages -- --workers=2
npm run build
```

Local validation of the [3D selection delivery](docs/SELECAO-3D.md) passed 30 unit tests, 87 browser cases and 4 Pages-build cases. Nine additional cases are skipped where their device-specific behavior does not apply. Browser coverage uses Chromium desktop, tablet and mobile profiles, not physical-device or all-browser certification.

The [workflow](.github/workflows/pages.yml) validates changes before deployment. [Verified 3D delivery run](https://github.com/samuelsce/RoomLab/actions/runs/37417938419). `npm run test:live` checks the public demo, 3D gaming scene, independent shared view and editable copy.

## Scope and tradeoffs

Saving is manual and local to the browser, with up to 30 setups and 100 objects per room. Export JSON to retain a backup. A shared URL contains the name and composition; anyone holding it can open that fixed snapshot. There is no account system, cloud synchronization or short-link service. The compressed payload is limited to 12,000 characters.

The 3D is stylized and dimensions use drawing units. Positioning happens in the floor plan; the 3D view supports click/touch selection, exploration and property/list editing. Camera and lighting preferences are temporary. The floor plan remains available without WebGL. See the [architecture](docs/ARQUITETURA.md) for compatibility and concurrency limits.

## Documentation and development

- [Documentation index and delivery history](docs/README.md)
- [Technical evaluation](docs/AVALIACAO.md)
- [Architecture and decisions](docs/ARQUITETURA.md)
- [Development workflow](docs/DESENVOLVIMENTO.md)
- [Contributing](CONTRIBUTING.md)
- [Asset credits](docs/CREDITOS.md)

Developed incrementally with an AI assistant supporting planning and implementation. Commits record changes by responsibility; delivery documents include decisions, verification and exercises for understanding and extending the code.
