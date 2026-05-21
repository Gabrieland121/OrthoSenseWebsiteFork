# OrthoSense Medical Image Annotation Demo

A dark, modern medical image annotation demo for orthopedic X-ray review. Doctors can:

- choose a case from a dropdown
- draw freehand annotations directly on the X-ray
- change brush size
- switch to eraser mode
- undo the last stroke
- clear the canvas
- set a confidence score from 1 to 5
- toggle an expert overlay for comparison
- submit annotations to a backend API
- download the annotation payload locally as JSON

The backend stores each submission in a folder structure organized by annotator and case, with both:
- `annotation.json`
- `annotated-image.png`

## Project structure

```text
orthosense-annotation-demo/
├─ package.json
├─ .gitignore
├─ README.md
├─ client/
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ index.html
│  ├─ public/
│  │  └─ cases/
│  │     ├─ case-01-xray.svg
│  │     ├─ case-01-expert.svg
│  │     ├─ case-02-xray.svg
│  │     ├─ case-02-expert.svg
│  │     ├─ case-03-xray.svg
│  │     └─ case-03-expert.svg
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ styles.css
│     ├─ data/
│     │  └─ cases.js
│     ├─ components/
│     │  ├─ AnnotationCanvas.jsx
│     │  ├─ CaseSelector.jsx
│     │  ├─ ConfidenceSlider.jsx
│     │  └─ Toolbar.jsx
│     └─ utils/
│        └─ fileHelpers.js
└─ server/
   ├─ package.json
   ├─ submissions/
   └─ src/
      └─ index.js
```

## Fastest way to open in VS Code

1. Download and unzip the project.
2. Open the unzipped `orthosense-annotation-demo` folder in VS Code.
3. Open a terminal in the root folder.
4. Run:

```bash
npm install --workspaces
npm run dev
```
n
This repo uses npm workspaces, so the safest one-shot install command is `npm install --workspaces` from the root.

## Local URLs

After launch:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

The Vite dev server proxies `/api` requests to the Express backend.

## How submissions are stored

When a doctor clicks **Submit Annotation**, the backend saves files here:

```text
server/submissions/<annotator-name>/<case-id>/<timestamp>/
```

Each submission folder contains:

- `annotation.json`
- `annotated-image.png`

## Build and run

To build the frontend:

```bash
npm run build
```

To run only the backend server:

```bash
npm run start
```

## Notes

- The included X-ray images are stylized demo assets for prototyping.
- No database is required.
- If the API submission fails, the frontend falls back to downloading the annotation JSON locally.
