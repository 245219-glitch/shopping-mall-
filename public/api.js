/* =========================================================
   Coco's Mall – api.js   (Lab 05)
   Q2  jQuery AJAX  GET  -> public product API  (https://dummyjson.com)
   Q3  jQuery AJAX  GET  -> my Express server   (/api/products, /api/configurations)
       jQuery AJAX  POST -> my Express server   (/api/configurations, JSON body)
   Every $.ajax({ url, method, success, error }) call shows the request, the JSON
   response, the status and any error in the "inspector" panel AND in
   the browser console / DevTools -> Network.
   ========================================================= */
const ApiLab = (function ($) {
  "use strict";
  const PUBLIC_API = "https://dummyjson.com";
  const serverBase = () => ($("#srvBase").val().trim() || "http://localhost:3000").replace(/\/+$/, "");
  let publicList = [], serverList = [];

  /* small look-up tables so API products get an emoji + an engraving style */
  const CAT_EMOJI = { smartphones: "📱", laptops: "💻", fragrances: "🧴", groceries: "🛒", furniture: "🛋️", "mens-shirts": "👔",
    "womens-bags": "👜", sunglasses: "🕶️", "mens-watches": "⌚", "kitchen-accessories": "🍳", beauty: "💄", skincare: "🧴", "home-decoration": "🏺" };
  const CAT_ENG = { smartphones: ["laser", "Laser-engrave a name"], laptops: ["laser", "Laser-engrave a name"], "mens-watches": ["laser", "Engrave the case-back"],
    sunglasses: ["laser", "Laser-etch the arm"], furniture: ["laser", "Engrave a small plate"], "kitchen-accessories": ["laser", "Laser-engrave a name"],
    "womens-bags": ["gold", "Gold-foil initials"], fragrances: ["gold", "Gold-foil label"], "mens-shirts": ["stitch", "Embroider a name"] };
  const prettyCat = c => String(c || "").replace(/-/g, " ").replace(/\b\w/g, m => m.toUpperCase());
  const colourKey = label => Object.keys(COLORS).find(k => COLORS[k][0].toLowerCase() === String(label).toLowerCase());

  /* ---------------- inspector: request -> response -> handling ---------------- */
  const pretty = d => {
    let t; try { t = typeof d === "string" ? d : JSON.stringify(d, null, 2); } catch (e) { t = String(d); }
    return t.length > 2200 ? t.slice(0, 2200) + "\n… (truncated – DevTools → Network → Response shows the full JSON)" : t;
  };
  function showRequest(method, url, bodyText) {
    $("#inReq").text(method + " " + url);
    $("#inStatus").text("⏳ waiting…").attr("class", "pill wait"); $("#inTime").text("");
    $("#inBodyRow").prop("hidden", bodyText === undefined); if (bodyText !== undefined) $("#inBody").text(bodyText);
    $("#inJson").text("…"); $("#inHandled").text("request in flight");
  }
  function showResponse(xhr, ms, data) {
    $("#inStatus").text(xhr.status + " " + (xhr.statusText || "OK")).attr("class", "pill ok"); $("#inTime").text(ms + " ms");
    $("#inJson").text(pretty(data));
    $("#inHandled").text("jQuery success() → JSON parsed automatically → page updated dynamically");
  }
  function describe(xhr, status) {
    if (xhr.status === 0) return status === "timeout" ? "The request timed out – the server took too long to answer."
      : "Network error – the server could not be reached (offline, server not started, or blocked by CORS).";
    if (status === "parsererror") return "The server replied, but not with valid JSON.";
    const j = xhr.responseJSON;
    return "The server answered " + xhr.status + " " + (xhr.statusText || "") + (j && j.message ? " – " + String(j.message).replace(/\.$/, "") : "") + ".";
  }
  function showFailure(xhr, status, ms) {
    $("#inStatus").text((xhr.status || "ERR") + " " + (xhr.statusText || status)).attr("class", "pill bad"); $("#inTime").text(ms + " ms");
    $("#inJson").text(xhr.responseJSON ? pretty(xhr.responseJSON) : (xhr.responseText || "(no response body – " + status + ")"));
    $("#inHandled").text("jQuery error() → error handled, friendly message shown (nothing crashed)");
  }

  /* ---------------- small helpers (the $.ajax calls themselves are written out in each function below) ---------------- */
  const since = t0 => Math.round(performance.now() - t0);
  function begin(method, url, body) {                  // log + show the request in the inspector, returns the start time
    const bodyText = body === undefined ? undefined : JSON.stringify(body);      // JavaScript object -> JSON text
    console.log("%c➡️ " + method + " " + url, "color:#1565c0;font-weight:bold", body !== undefined ? { jsObject: body, jsonText: bodyText } : "");
    showRequest(method, url, bodyText);
    return performance.now();
  }
  function gotResponse(t0, data, status, xhr) { console.log("%c⬅️ " + xhr.status + " " + xhr.statusText, "color:#2e7d32;font-weight:bold", data); showResponse(xhr, since(t0), data); }
  function gotError(t0, xhr, status) { console.warn("⬅️ FAILED", xhr.status, status, xhr.responseJSON || xhr.responseText); showFailure(xhr, status, since(t0)); }
  const errorBox = (xhr, status) => '<div class="api-error">⚠ ' + escapeHTML(describe(xhr, status)) + "</div>";

  /* ---------------- Q2: public API (GET) ---------------- */
  const publicCard = (p, i) => '<article class="apicard"><div class="apimg">' + imgTag(p.thumbnail) + "</div><h4>" + escapeHTML(p.title) + '</h4><div class="apmeta"><b>' +
    money(+p.price) + "</b> · " + escapeHTML(prettyCat(p.category)) + (p.rating ? " · ⭐ " + escapeHTML(p.rating) : "") + '</div><p class="apdesc protect">' + escapeHTML(p.description) +
    '</p><button type="button" class="btn btn-secondary wide" data-i="' + i + '">🎨 Customise this product</button></article>';
  function loadPublic() {
    const q = $("#apiSearch").val().trim(), cat = $("#apiCat").val();
    const url = q ? PUBLIC_API + "/products/search?q=" + encodeURIComponent(q) + "&limit=8"
      : cat === "all" ? PUBLIC_API + "/products?limit=8" : PUBLIC_API + "/products/category/" + encodeURIComponent(cat) + "?limit=8";
    $("#apiGrid").html('<p class="api-empty">⏳ Requesting products…</p>'); $("#apiLoad").prop("disabled", true);
    const t0 = begin("GET", url);
    $.ajax({
      url: url,
      method: "GET",
      timeout: 10000,
      success: function (response, status, xhr) {
        gotResponse(t0, response, status, xhr);
        publicList = response.products || [];
        $("#apiGrid").html(publicList.length ? publicList.map(publicCard).join("") : '<p class="api-empty">No products matched.</p>');
        showToast("✔ " + publicList.length + " products loaded from the public API");
        $("#apiLoad").prop("disabled", false);
      },
      error: function (xhr, status) {
        gotError(t0, xhr, status);
        $("#apiGrid").html(errorBox(xhr, status)); showToast("✖ Could not load products from the public API", "info");
        $("#apiLoad").prop("disabled", false);
      }
    });
  }
  function failTest() {                                    // an unsuccessful request on purpose (404) – shows the error handling
    $("#apiGrid").html('<p class="api-empty">⏳ Requesting a product that does not exist…</p>');
    const url = PUBLIC_API + "/products/999999", t0 = begin("GET", url);
    $.ajax({
      url: url,
      method: "GET",
      timeout: 10000,
      success: function (response, status, xhr) { gotResponse(t0, response, status, xhr); $("#apiGrid").html('<p class="api-empty">Unexpected success.</p>'); },
      error: function (xhr, status) {
        gotError(t0, xhr, status);
        $("#apiGrid").html(errorBox(xhr, status)); showToast("✖ Request failed – handled gracefully", "info");
      }
    });
  }
  function openPublic(p) {
    const id = "api" + p.id, eng = CAT_ENG[p.category] || null;
    PRODUCTS[id] = { id: id, e: CAT_EMOJI[p.category] || "🛍️", img: p.thumbnail, n: p.title, p: +p.price, d: p.description, shop: "api", shopName: "Public API store (DummyJSON)", sec: prettyCat(p.category), eng: eng };
    OPTS[id] = { c: ["black", "white", "silver", "blue"], s: ["Standard", "Plus", "Max"], ol: "Colour" };
    $("#apiModal").prop("hidden", true); openProduct(id);
  }
  $("#apiGrid").on("click", "button[data-i]", function () { openPublic(publicList[+$(this).data("i")]); });
  $("#apiLoad").on("click", loadPublic); $("#apiFail").on("click", failTest);
  $("#apiSearch").on("keydown", e => { if (e.key === "Enter") loadPublic(); });

  /* ---------------- Q3: Express server (GET products) ---------------- */
  const serverCard = (p, i) => '<article class="apicard"><div class="apimg emo">' + escapeHTML(p.emoji) + "</div><h4>" + escapeHTML(p.name) + '</h4><div class="apmeta"><b>' + money(+p.price) +
    "</b> · " + escapeHTML(p.category) + (p.engravable ? " · ✨ engravable" : "") + '</div><p class="apdesc protect">' + escapeHTML(p.description) + '</p><div class="dots">' +
    p.colors.map(c => { const k = colourKey(c); return k ? '<i style="background:' + COLORS[k][1] + '" title="' + escapeHTML(c) + '"></i>' : ""; }).join("") + "</div>" +
    '<button type="button" class="btn btn-secondary wide" data-i="' + i + '">🎨 Customise this product</button></article>';
  function loadServer() {
    const cat = $("#srvCat").val(), url = serverBase() + "/api/products" + (cat ? "?category=" + encodeURIComponent(cat) : "");
    $("#srvGrid").html('<p class="api-empty">⏳ Asking the Express server…</p>'); $("#srvLoad").prop("disabled", true);
    const t0 = begin("GET", url);
    $.ajax({
      url: url,
      method: "GET",
      timeout: 10000,
      success: function (response, status, xhr) {
        gotResponse(t0, response, status, xhr);
        serverList = response.products || [];
        $("#srvGrid").html(serverList.length ? serverList.map(serverCard).join("") : '<p class="api-empty">No products in that category.</p>');
        showToast("✔ " + serverList.length + " products received from the Express server");
        $("#srvLoad").prop("disabled", false);
      },
      error: function (xhr, status) {
        gotError(t0, xhr, status);
        $("#srvGrid").html(errorBox(xhr, status) + '<p class="api-empty">Is the server running? Open a terminal in the project folder and run <code>npm start</code>.</p>'); showToast("✖ Express server not reachable", "info");
        $("#srvLoad").prop("disabled", false);
      }
    });
  }
  function openServer(p) {
    const id = "srv" + p.id, cols = p.colors.map(colourKey).filter(Boolean);
    PRODUCTS[id] = { id: id, e: p.emoji, n: p.name, p: +p.price, d: p.description, shop: "srv", shopName: "Coco's Express server", sec: p.category,
      eng: p.engravable ? [p.engraveStyle || "laser", p.engraveHint || "Add your name"] : null };
    OPTS[id] = { c: cols.length ? cols : ["black"], s: p.sizes, ol: p.category === "Bakery" ? "Flavour" : "Colour" };
    $("#apiModal").prop("hidden", true); openProduct(id);
  }
  $("#srvGrid").on("click", "button[data-i]", function () { openServer(serverList[+$(this).data("i")]); });
  $("#srvLoad").on("click", loadServer);

  /* ---------------- Q3: saved configurations (GET) ---------------- */
  function loadSaved() {
    $("#savedLoad").prop("disabled", true);
    const url = serverBase() + "/api/configurations", t0 = begin("GET", url);
    $.ajax({
      url: url,
      method: "GET",
      timeout: 10000,
      success: function (response, status, xhr) {
        gotResponse(t0, response, status, xhr);
        const rows = (response.configurations || []).map(c => "<tr><td>" + escapeHTML(c.configId) + "</td><td>" + escapeHTML(c.productName) + "</td><td>" + escapeHTML(c.color) + "</td><td>" +
          escapeHTML(c.size) + "</td><td>" + escapeHTML(c.engraving || "—") + "</td><td>" + escapeHTML(new Date(c.receivedAt).toLocaleTimeString()) + "</td></tr>");
        $("#savedTable tbody").html(rows.length ? rows.join("") : '<tr><td colspan="6" class="api-empty">The server has no saved configurations yet.</td></tr>');
        $("#savedLoad").prop("disabled", false);
      },
      error: function (xhr, status) {
        gotError(t0, xhr, status);
        $("#savedTable tbody").html('<tr><td colspan="6">' + errorBox(xhr, status) + "</td></tr>");
        $("#savedLoad").prop("disabled", false);
      }
    });
  }
  $("#savedLoad").on("click", loadSaved);

  /* ---------------- Q3: POST a configuration to Express ---------------- */
  function postConfig(config) {
    const $msg = $("#pmSaveMsg").html('<span class="sv-wait">⏳ Sending the configuration to the Express server…</span>');
    $("#pmSave").prop("disabled", true);
    const url = serverBase() + "/api/configurations", t0 = begin("POST", url, config);
    $.ajax({
      url: url,
      method: "POST",
      contentType: "application/json",                 // tells Express the body is JSON (express.json() parses it)
      data: JSON.stringify(config),                    // JavaScript object -> JSON string
      timeout: 10000,
      success: function (response, status, xhr) {
        gotResponse(t0, response, status, xhr);
        $msg.html('<div class="sv-ok"><b>✔ ' + escapeHTML(response.message) + "</b><br>" + escapeHTML(response.summary) + " · ID <code>" + escapeHTML(response.config.configId) +
          '</code> · ' + response.totalSaved + ' saved on the server<br><button type="button" class="linklike" data-open-api>See the request &amp; response →</button></div>');
        showToast("✔ Server saved configuration " + response.config.configId);
        $("#pmSave").prop("disabled", false);
      },
      error: function (xhr, status) {
        gotError(t0, xhr, status);
        $msg.html('<div class="sv-bad">✖ ' + escapeHTML(describe(xhr, status)) + ' <button type="button" class="linklike" data-open-api>See details →</button></div>');
        showToast("✖ The server could not save the configuration", "info");
        $("#pmSave").prop("disabled", false);
      }
    });
  }
  $("#pmSaveMsg").on("click", "[data-open-api]", () => openHub());

  /* ---------------- the API Lab window ---------------- */
  function showPane(name) {
    $("#apiTabs .atab").each(function () { $(this).toggleClass("on", $(this).data("pane") === name); });
    $(".api-pane").each(function () { $(this).prop("hidden", $(this).data("pane") !== name); });
  }
  function openHub(pane) { if (pane) showPane(pane); $("#apiModal").prop("hidden", false); }
  $("#apiTabs").on("click", ".atab", function () { showPane($(this).data("pane")); });
  $("#openApi").on("click", () => openHub());
  $("#closeApi").on("click", () => $("#apiModal").prop("hidden", true));
  $("#apiModal").on("click", e => { if (e.target === e.currentTarget) $("#apiModal").prop("hidden", true); });

  return { postConfig: postConfig, openHub: openHub, openPublic: openPublic };
})(jQuery);
