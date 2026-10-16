# Coco's Mall – FSD Lab 05 (Interactive Product Configurator)

jQuery + public product API + Node.js/Express backend, built on your existing Coco's Mall.

## Run it
**First:** start **MySQL** in XAMPP, open `http://localhost/phpmyadmin` -> **Import** -> choose `database.sql` -> Go (creates database `coco_mall` with `products` + `configurations`).
```
npm install        (first time only)
npm start          -> open http://localhost:3000
```
(Windows: double-click `start.bat`.) Keep the terminal visible – it prints every request (method + URL) for Q3.

Opening `public/index.html` with VS Code Live Server (port 5500) also works: type `http://localhost:3000` in the
server box in **API Lab** – CORS is enabled so the browser is allowed to call the other port.

## What changed
| Request | Where |
|---|---|
| Aurora bottle workshop removed (Aurora Bottles shop keeps its normal products) | `index.html`, `script.js`, `data.js`, `style.css` |
| Bottle features now on EVERY product (open any product): **copy / cut / right-click blocked with the message "cannot be copied"**, spotlight that follows the mouse, state badge (Idle / Hovering / Rotating… / Dragging…), live rotation read-out, live engraving counter (warn/max colours), "✋ Drag me to the trolley" handle | product viewer in `index.html` + sections 8–11 of `script.js` |
| **Q1 jQuery** – trolley, checkout form + validation, viewer controls (colour, size, engraving, fonts), messages/toasts, drag & drop, copy-protection, scroll all use `$()`; the old helper is kept as `qs()` only for the walking-mall engine. Before/after is commented at the top of `script.js` | `script.js` (jQuery 3.7.1 is stored locally in `public/js/`) |
| **Q2 public API** – `$.ajax` GET to `https://dummyjson.com/products...` when you press **Load products**; JSON → cards → Customise opens the 3D configurator with the API product's picture, name, price, description. Failure handling + "Test a failing request" button (404) | `api.js` → header button **🔌 API Lab** → *Public API* tab |
| **Q3 Express** – `server.js`: GET `/api/products` (predefined `data/products.json`), POST `/api/configurations` (JSON body), GET `/api/configurations`; middleware: custom `requestLogger` (method + URL), `express.json()`, `cors()` | `server.js`; frontend in `api.js` |

## Demo / screenshot checklist
1. **jQuery**: open any product → change colour/size, type an engraving (live preview + counter), try Ctrl+C on the description (⛔ message), drag the handle into the trolley.
2. **Q2**: 🔌 API Lab → Public API → *Load products* → F12 → **Network** → click the `products` request (Headers / Response). The inspector panel shows request, status, time, JSON, handling. Press *Test a failing request* for the error case.
3. **Q3 GET**: API Lab → *My Express server* → *Load from Express* → terminal shows `GET /api/products`.
4. **Q3 POST**: Customise a product → **Save configuration to server (POST)** → Network shows an `OPTIONS` preflight then the `POST` (Payload tab = JSON), the terminal shows the request body, the viewer shows the server's JSON reply; *Saved configurations* tab lists it.

The public API needs internet. Everything else (jQuery, Express) works offline.

## Code style
`public/api.js`: every request is a plain `$.ajax({ url, method, success, error })`; the POST sends `contentType: "application/json"` and `data: JSON.stringify(config)`. In `server.js` the middleware order is `cors()` then `express.json()`.

## MySQL (XAMPP)
`server.js` uses `mysql2` (user `root`, no password, port 3306, database `coco_mall`). Products are read from the `products` table and POSTed configurations are saved in the `configurations` table, so they stay after the server restarts. API URLs and JSON responses are unchanged, so the frontend needed no changes.
