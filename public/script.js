/* =========================================================
   Coco's Mall – JavaScript   (Lab 05 edition)
   ---------------------------------------------------------
   Q1  jQuery  : the product configurator, trolley, checkout form, messages,
                 drag & drop and copy-protection all use jQuery ($).
                 The old plain-JavaScript helper is kept only as qs() for the
                 3D walking-mall engine (gate, shoppers, shops).
   Q2  Public API : see api.js  ($.ajax GET -> dummyjson.com)
   Q3  Express    : see api.js + ../server.js (GET products, POST configuration)
   ========================================================= */

/* ---------- 1. Constants (product catalogue lives in data.js) ---------- */
const MAX_ENGRAVING = 16, FREE_SHIP = 75;
const sizePrice = (p, i) => Math.round(p * (1 + 0.1 * i) * 100) / 100;
let cart = [];            // [{ key, name, emoji, img, price, note, qty }]
let currentShop = "mart";

/* ---------- 2. DOM selection ----------
   BEFORE (traditional JavaScript):  const toast = document.querySelector("#toast");  toast.textContent = "Hi";
   AFTER  (jQuery, Lab 05 Q1):       const $toast = $("#toast");                       $toast.text("Hi");          */
const qs = s => document.querySelector(s);          // old helper – only the walking-mall engine still uses it
const directory = qs("#directory"), shopEl = qs("#shop"), youAreHere = qs("#youAreHere");
const $siteHeader = $("#siteHeader"), $scrollProgress = $("#scrollProgress"), $backToTop = $("#backToTop");
const $checkoutForm = $("#checkoutForm"), $customerName = $("#customerName"), $customerEmail = $("#customerEmail"), $customerPhone = $("#customerPhone");
const $formMessage = $("#formMessage"), $cardFields = $("#cardFields"), $checkoutBtn = $("#checkoutBtn"), $backToCart = $("#backToCart");
const $dropZone = $("#dropZone"), $dropText = $("#dropText"), $cartList = $("#cartList"), $cartCount = $("#cartCount");
const $cartTotal = $("#cartTotal"), $sumSub = $("#sumSub"), $sumDel = $("#sumDel"), $toast = $("#toast"), $headCount = $("#headCount");
const $shipBar = $("#shipBar"), $shipText = $("#shipText"), $resultPanel = $("#resultPanel"), $resultBody = $("#resultBody");
const $openCartBtn = $("#openCart"), $closeCartBtn = $("#closeCart"), $cartPanel = $("#cartPanel"), $overlay = $("#overlay");
const $productModal = $("#productModal"), $stage = $("#stage"), $obj = $("#obj"), $pmColors = $("#pmColors"), $pmSizes = $("#pmSizes");
const $pmPrice = $("#pmPrice"), $pmColorName = $("#pmColorName"), $receptionModal = $("#receptionModal"), $apiModal = $("#apiModal");
const $stateBadge = $("#stateBadge"), $spotlight = $("#spotlight"), $pointerReadout = $("#pointerReadout"), $copyMessage = $("#copyMessage"), $dragHandle = $("#dragHandle");

/* ---------- 3. Helpers ---------- */
const money = n => "$" + n.toFixed(2);
const escapeHTML = t => $("<div>").text(String(t ?? "")).html();      // .text() escapes, .html() reads the safe version back
const imgTag = src => '<img class="pimg" src="' + escapeHTML(src) + '" alt="">';
const face = it => it.img ? imgTag(it.img) : it.e;                   // picture (from an API) or emoji
const shopOf = it => SHOPS[it.shop] || { name: it.shopName || "Online store" };
const isShown = $el => !$el.prop("hidden");
const setBadge = (text, css) => $stateBadge.text(text).attr("class", "state-badge" + (css ? " " + css : ""));
function showToast(msg, type) {
  $toast.text(msg).attr("class", "toast show" + (type ? " " + type : ""));
  clearTimeout(showToast.t); showToast.t = setTimeout(() => $toast.removeClass("show"), 3000);
}
function setFormMessage(msg, type) { $formMessage.text(msg).attr("class", "form-message" + (type ? " " + type : "")); }
const findItem = id => PRODUCTS[id];

/* ---------- 4. Mall directory + shop interior (walk-through store with shelves) ---------- */
function renderDirectory() {
  directory.innerHTML = Object.entries(SHOPS).map(([k, s]) =>
    '<button type="button" class="door' + (view === "store" && k === currentShop ? " open" : "") + '" data-shop="' + k +
    '" style="--sc:' + s.color + '"><span>' + s.icon + "</span>" + escapeHTML(s.name) + "</button>").join("");
}
const slotHTML = p => '<div class="slot" draggable="true" data-id="' + p.id + '" title="' + escapeHTML(p.n) + '"><span class="emo">' + p.e + '</span><b class="nm">' + escapeHTML(p.n) +
  '</b><span class="pr">' + money(p.p) + '<button type="button" class="plus" aria-label="Quick add ' + escapeHTML(p.n) + '">+</button></span></div>';
function enterShop(key) {
  currentShop = key; view = "store";
  const s = SHOPS[key];
  storeW = X0 + s.sections.length * UNIT + 360;
  shopEl.style.setProperty("--sc", s.color); shopEl.hidden = false; mallView.hidden = true;
  shopEl.className = "shop"; void shopEl.offsetWidth; shopEl.className = "shop walk-in";
  youAreHere.textContent = "📍 You are here: " + s.name + " – " + s.tag + " · tap a product (or +) and your shopper walks over to pick it · use the section buttons to jump";
  const cx = X0 + s.sections.length * UNIT + 40, banner = (s.name + " · " + s.tag).toUpperCase();
  shopEl.innerHTML =
    '<div class="secbar"><b>' + s.icon + " " + escapeHTML(s.name) + "</b>" + s.sections.map((c, i) => '<button type="button" class="secchip" data-sec="' + i + '">' + c.i + " " + escapeHTML(c.n) + " →</button>").join("") + "</div>" +
    '<div class="store-view" id="storeView"><div class="world" id="storeWorld" style="width:' + storeW + 'px">' +
    '<div class="sbanner">' + Array(Math.ceil(storeW / 640)).fill("<span>" + escapeHTML(banner) + "</span>").join("") + '</div><div class="swall"></div><div class="sfloor"></div>' +
    '<div class="exitdoor" data-poi="0"><div class="glass"></div><span>← EXIT TO MALL</span><div class="dprompt">Press E to exit</div></div>' +
    s.sections.map((c, i) => '<div class="unitbox" style="left:' + (X0 + i * UNIT) + 'px"><div class="utitle">' + c.i + " " + escapeHTML(c.n) + "</div>" +
      [0, 1].map(r => '<div class="board">' + c.ids.slice(r * 3, r * 3 + 3).map(id => slotHTML(PRODUCTS[id])).join("") + "</div>").join("") + "</div>").join("") +
    '<div class="checkout" data-poi="1" style="left:' + cx + 'px"><div class="csign">CHECKOUT</div><div class="cdesk"><span class="pos">🧾</span></div><div class="dprompt">Press E – checkout</div></div>' +
    '</div></div><button type="button" class="btn btn-ghost leave" id="leaveBtn">← Leave store</button>';
  storeView = qs("#storeView"); storeWorld = qs("#storeWorld");
  pois = [{ x: 130, el: shopEl.querySelector(".exitdoor"), run: leaveStore }, { x: cx + 110, el: shopEl.querySelector(".checkout"), run: () => { reach(cashier); openCart(); } }]; near = null;
  renderDirectory();
  removeActors("store");
  const bounds = () => [60, storeW - 60], emojis = s.sections.flatMap(c => c.ids.map(id => PRODUCTS[id].e));
  cashier = makeActor({ scene: "store", fixed: true, head: "🧑‍💼", gender: "f", outfit: "#37474f", lane: 142, z: 20, x: cx + 110, dir: -1, bounds, parent: storeWorld });
  for (let i = 0; i < (key === "mart" ? 9 : 5); i++) spawnNPC("store", storeWorld, bounds, 34, emojis);
  if (pStore) { pStore.x = 220; pStore.dir = 1; pStore.target = null; storeWorld.appendChild(pStore.el); }
  camUpdate();
}

/* ---------- 5. Trolley (jQuery) ---------- */
function addToCart(key, name, emoji, price, note, img) {
  if (cartType && cart.reduce((n, c) => n + c.qty, 0) >= CARTS[cartType].cap) {
    showToast("🛒 Your " + CARTS[cartType].label.toLowerCase() + " is full! Check out or remove something.", "info"); return;
  }
  const ex = cart.find(c => c.key === key);
  if (ex) ex.qty++; else cart.push({ key, name, emoji, img: img || "", price, note: note || "", qty: 1 });
  renderCart();
  showToast("✔ Added to trolley: " + name); fly(img ? imgTag(img) : emoji);
}
function addById(id) { const i = findItem(id), c = OPTS[id].c[0]; addToCart(id + "|" + c + "|0", i.n, i.e, i.p, COLORS[c][0] + " · " + OPTS[id].s[0], i.img); }
function renderCart() {
  $cartList.html(cart.length ? cart.map((c, i) =>
    '<li><span class="ci-pic">' + (c.img ? imgTag(c.img) : c.emoji) + '</span><div class="cart-item-info"><strong>' + escapeHTML(c.name) + "</strong>" +
    (c.note ? "<small>" + escapeHTML(c.note) + "</small>" : "") + '<div class="qty"><button type="button" data-act="dec" data-i="' + i +
    '">−</button><span>' + c.qty + '</span><button type="button" data-act="inc" data-i="' + i + '">+</button></div></div><strong>' +
    money(c.qty * c.price) + '</strong><button type="button" class="remove-btn" data-act="del" data-i="' + i + '" aria-label="Remove item">&times;</button></li>').join("")
    : '<li class="cart-empty">Your trolley is empty. Walk into a shop!</li>');
  const qty = cart.reduce((s, c) => s + c.qty, 0), total = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const del = cart.length ? shipFee(total) : 0;
  $cartCount.add($headCount).text(qty);
  $sumSub.text(money(total)); $sumDel.text(!cart.length ? "$0.00" : del ? money(del) : "FREE"); $cartTotal.text(money(total + del));
  $("#shipStd").text(total >= FREE_SHIP ? "FREE" : "$4.99"); $("#placeBtn").text(cart.length ? "Place order \u00B7 " + money(total + del) : "Place order");
  $shipBar.css("width", Math.min(100, total / FREE_SHIP * 100) + "%");
  $shipText.text(total >= FREE_SHIP ? "🎉 You unlocked FREE delivery!" : "Add " + money(FREE_SHIP - total) + " more for free delivery");
  updateHeld(); $cartCount.removeClass("bump"); void $cartCount[0].offsetWidth; $cartCount.addClass("bump");
}
$cartList.on("click", "button[data-act]", function () {          // one delegated jQuery handler for + / − / ×
  const i = +$(this).data("i"), act = $(this).data("act");
  if (act === "inc") { if (!cartType || cart.reduce((n, c) => n + c.qty, 0) < CARTS[cartType].cap) cart[i].qty++; else showToast("Your cart is full.", "info"); }
  else if (act === "dec") { if (--cart[i].qty < 1) cart.splice(i, 1); }
  else { cart.splice(i, 1); showToast("Item put back on the shelf.", "info"); }
  renderCart();
});

/* trolley drawer: open / close with the x, the dimmed background or Esc */
function openCart(dim = true) { $cartPanel.addClass("open").attr("aria-hidden", "false"); $overlay.prop("hidden", !dim); }
function closeCart() { $cartPanel.removeClass("open").attr("aria-hidden", "true"); $overlay.prop("hidden", true); }
$openCartBtn.on("click", () => $cartPanel.hasClass("open") ? closeCart() : openCart());
$closeCartBtn.add($overlay).on("click", closeCart);
$checkoutBtn.on("click", () => {
  if (!cart.length) { showToast("Your trolley is empty – add something first.", "info"); return; }
  $checkoutForm.prop("hidden", false); $checkoutBtn.prop("hidden", true); $customerName.trigger("focus");
});
$backToCart.on("click", () => { $checkoutForm.prop("hidden", true); $checkoutBtn.prop("hidden", false); });
$(document).on("keydown", e => {
  if (e.key !== "Escape") return;
  if (isShown($receptionModal)) $receptionModal.prop("hidden", true);
  else if (isShown($resultPanel)) $resultPanel.prop("hidden", true);
  else if (isShown($apiModal)) $apiModal.prop("hidden", true);
  else if (isShown($productModal)) closeProduct();
  else closeCart();
});
$("#closeResult, #keepShopping").on("click", () => $resultPanel.prop("hidden", true));
$("#printBtn").on("click", () => window.print());
function confetti() {
  const $c = $("#confetti"); if (!$c.length) return; const cols = ["#d4af37", "#e91e63", "#1e88e5", "#43a047", "#fb8c00", "#8e24aa"];
  $c.html(Array.from({ length: 36 }, () => '<i style="left:' + Math.random() * 100 + "%;background:" + cols[Math.floor(Math.random() * cols.length)] + ";animation-delay:" + (Math.random() * .5).toFixed(2) + "s;--dx:" + Math.round(Math.random() * 120 - 60) + "px;--r:" + Math.round(Math.random() * 720 - 360) + 'deg"></i>').join(""));
}

/* ---------- 7. Checkout form: validation + payment (jQuery) ---------- */
function setFieldState($input, msg) {
  $input.closest(".field").find(".error").text(msg);
  $input.toggleClass("invalid", msg !== "").toggleClass("valid", msg === "" && $input.val().trim() !== "");
}
const payMethod = () => $checkoutForm.find('input[name="pay"]:checked').val();
/* delivery speeds */
const SHIPPING = {
  standard: { label: "Standard delivery", icon: "\uD83D\uDCE6", fee: t => t >= FREE_SHIP ? 0 : 4.99 },
  express:  { label: "Express delivery",  icon: "\uD83D\uDE9A", fee: () => 7.99 },
  sameday:  { label: "24-hour delivery",  icon: "\u26A1",       fee: () => 12.99 }
};
const shipKey = () => $checkoutForm.find('input[name="ship"]:checked').val();
const shipFee = t => SHIPPING[shipKey()].fee(t);
const syncOn = sel => $checkoutForm.find(sel).each(function () { $(this).toggleClass("on", $(this).find("input").prop("checked")); });
function syncShip() { syncOn(".ship"); }
function syncCardPreview() {
  const n = $("#cardNumber").val().replace(/\D/g, ""), padded = (n + "\u2022".repeat(16)).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  $("#ccNum").text(padded); $("#ccBrand").text(n[0] === "4" ? "VISA" : n[0] === "5" ? "MASTERCARD" : "CARD");
  $("#ccName").text(($customerName.val().trim() || "YOUR NAME").toUpperCase()); $("#ccExp").text($("#cardExpiry").val() || "MM/YY");
}
$("#cardNumber, #cardExpiry, #customerName").on("input", syncCardPreview);
function syncPay() { $cardFields.prop("hidden", payMethod() !== "card"); syncOn(".pay"); }
$checkoutForm.on("change", e => { const n = e.target.name; if (n === "pay") syncPay(); else if (n === "ship") { syncShip(); renderCart(); } });
const RULES = {
  customerName: v => v === "" ? "Full name is required." : v.length < 3 ? "Enter at least 3 characters." : "",
  customerEmail: v => v === "" ? "Email address is required." : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "Enter a valid email address." : "",
  customerPhone: v => !/^\+?[\d\s-]{10,15}$/.test(v) ? "Enter a valid phone number." : "",
  customerAddress: v => v.length < 8 ? "Enter your full delivery address." : "",
  customerCity: v => v.length < 2 ? "City is required." : "",
  cardNumber: v => !/^\d{16}$/.test(v.replace(/\s/g, "")) ? "Card number must be 16 digits." : "",
  cardExpiry: v => !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? "Use MM/YY format." : "",
  cardCvv: v => !/^\d{3,4}$/.test(v) ? "Enter 3 or 4 digits." : ""
};
const payFields = () => Object.keys(RULES).filter(k => payMethod() === "card" || !k.startsWith("card")).map(k => $("#" + k));
function validateField($f) { const m = RULES[$f.attr("id")]($f.val().trim()); setFieldState($f, m); return m === ""; }
Object.keys(RULES).forEach(k => {
  const $f = $("#" + k);
  $f.on("focus", () => $f.addClass("focused-field"))
    .on("blur", () => { $f.removeClass("focused-field"); validateField($f); })
    .on("input", () => { if ($f.hasClass("invalid")) validateField($f); });
});
$("#cardNumber").on("input", function () { $(this).val($(this).val().replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()); });
$("#cardExpiry").on("input", function () { const v = $(this).val().replace(/\D/g, "").slice(0, 4); $(this).val(v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v); });

/* ---------- 8. Protected content – NOW ON EVERY PRODUCT (was only the Aurora bottle) ----------
   Any element with class "protect" (product name + description in the viewer, API product cards...)
   blocks copy, cut and right-click and shows the message "cannot be copied". */
function blockClipboard(e) {
  e.preventDefault();
  const $m = $(e.currentTarget).closest(".pscope").find(".protected-message").first();
  $m.text("⛔ This text is protected – it cannot be " + (e.type === "cut" ? "cut" : "copied") + ".").removeClass("show");
  if ($m.length) void $m[0].offsetWidth;
  $m.addClass("show");
  clearTimeout(blockClipboard.t); blockClipboard.t = setTimeout(() => $(".protected-message").text(""), 3500);
  showToast("⛔ Cannot be copied – this content is protected.", "info");
}
$(document).on("copy cut", ".protect", blockClipboard)
           .on("contextmenu dragstart", ".protect", e => e.preventDefault());

/* ---------- 9. Viewer hover: spotlight follows the mouse + state badge (mousemove / mouseenter / mouseleave) ---------- */
$stage.on("mousemove", function (e) {
  const r = this.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * 100, py = (e.clientY - r.top) / r.height * 100;
  $spotlight[0].style.setProperty("--mx", px + "%"); $spotlight[0].style.setProperty("--my", py + "%");
}).on("mouseenter", () => { $stage.addClass("active"); setBadge("Hovering", "hover"); })
  .on("mouseleave", () => { $stage.removeClass("active"); setBadge("Idle"); });

/* ---------- 10. Drag & drop into the trolley (shelf products AND the product in the viewer) ---------- */
function startDrag(e, payload) {
  const dt = e.originalEvent.dataTransfer; dt.setData("text/plain", payload); dt.effectAllowed = "copy";
  $dropText.text("Drop it in the trolley!"); $dropZone.addClass("ready"); $("body").addClass("dragging-item"); setTimeout(() => openCart(false), 0);
}
function endDrag() { $dropZone.removeClass("drag-over ready"); $("body").removeClass("dragging-item"); $dropText.text("Drag any product here"); }
$(shopEl).on("dragstart", ".slot", function (e) { $(this).addClass("dragging"); startDrag(e, this.dataset.id); })
         .on("dragend", ".slot", function () { $(this).removeClass("dragging"); endDrag(); });
$dragHandle.on("dragstart", e => { $stage.addClass("dragging"); setBadge("Dragging…", "drag"); startDrag(e, "viewer"); })
           .on("dragend", () => { $stage.removeClass("dragging"); setBadge("Idle"); endDrag(); });
$dropZone.on("dragenter", e => { e.preventDefault(); $dropZone.addClass("drag-over"); $dropText.text("Release to add to trolley"); })
  .on("dragover", e => { e.preventDefault(); e.originalEvent.dataTransfer.dropEffect = "copy"; })
  .on("dragleave", e => { if (!$dropZone[0].contains(e.originalEvent.relatedTarget)) { $dropZone.removeClass("drag-over"); $dropText.text("Drop it in the trolley!"); } })
  .on("drop", e => {
    e.preventDefault(); $dropZone.removeClass("drag-over ready");
    const id = e.originalEvent.dataTransfer.getData("text/plain");
    if (id === "viewer") addCurrentConfig(false); else if (findItem(id)) addById(id); else return;
    $dropZone.removeClass("dropped"); void $dropZone[0].offsetWidth; $dropZone.addClass("dropped");
    $dropText.text("Added! Keep shopping.");
  });

/* ---------- 11. 3D drag-to-rotate (pointer events, jQuery) ---------- */
function makeRotatable($area, st, apply) {
  let down = false, lx = 0, ly = 0;
  $area.on("pointerdown", e => {
    if ($(e.target).closest(".drag-hint").length) return;           // the drag handle must stay draggable
    const o = e.originalEvent; down = true; st.drag = true; st.vy = 0; lx = o.clientX; ly = o.clientY;
    try { $area[0].setPointerCapture(o.pointerId); } catch (x) {}
    $area.addClass("grabbing"); setBadge("Rotating…", "drag");
  }).on("pointermove", e => {
    if (!down) return;
    const o = e.originalEvent, dx = o.clientX - lx, dy = o.clientY - ly; lx = o.clientX; ly = o.clientY;
    st.ry += dx * 0.8; st.vy = dx * 0.8; st.rx = Math.max(-60, Math.min(60, st.rx - dy * 0.6)); apply();
  }).on("pointerup pointercancel", () => { if (!down) return; down = false; st.drag = false; $area.removeClass("grabbing"); setBadge("Hovering", "hover"); });
}

/* ---------- 12. Product viewer: colours, sizes, 3D spin ---------- */
const pm = { item: null, c: "", s: 0, rx: -10, ry: -25, vy: 0.5, drag: false };
const paintObj = () => {
  $obj.css("transform", "rotateX(" + pm.rx + "deg) rotateY(" + pm.ry + "deg)");
  $pointerReadout.text("Rotation: " + Math.round(((pm.ry % 360) + 360) % 360) + "° · drag the product to spin it");
};
makeRotatable($stage, pm, paintObj);
function spin() {
  if ($productModal.prop("hidden")) return;
  if (!pm.drag) { pm.vy += (0.5 - pm.vy) * 0.04; pm.ry += pm.vy; paintObj(); }
  requestAnimationFrame(spin);
}
const FONTS = { classic: "Georgia,serif", script: "'Brush Script MT','Segoe Script',cursive", block: "Impact,'Arial Black',sans-serif" };
const $pmEngInput = $("#pmEngInput"), $pmEngrave = $("#pmEngrave"), demoStage = qs("#demoStage"), demoEmo = qs("#demoEmo"), demoEng = qs("#demoEng"), demoCap = qs("#demoCap"), demoBar = qs("#demoBar");
pm.t = ""; pm.f = "classic";
const engClass = it => it.eng ? "eng-" + it.eng[0] : "";
const engSize = t => Math.max(13, 30 - t.length * 1.1);
function paintEngraving() {
  const t = pm.t.trim(), len = pm.t.length;
  $obj.find(".eng").text(t).css({ fontFamily: FONTS[pm.f], fontSize: engSize(t) + "px" });       // live preview on the 3D product
  $("#pmEngCount").text(len + " / " + MAX_ENGRAVING).attr("class", "counter" + (len >= MAX_ENGRAVING ? " max" : len >= MAX_ENGRAVING - 4 ? " warn" : ""));
  if (pm.item && pm.item.eng) $("#pmEngHint").text((len >= MAX_ENGRAVING ? "Character limit reached" : (MAX_ENGRAVING - len) + " characters left") + " · " + pm.item.eng[1]);
}
/* how many items a size/pack label contains (Box of 4 -> 4, Twin pack -> 2 ...) */
function packCount(label) {
  let m = /(?:box|pack) of (\d+)/i.exec(label); if (m) return Math.min(12, +m[1]);
  if (/twin/i.test(label)) return 2; if (/party/i.test(label)) return 6; if (/family/i.test(label)) return 4;
  if (/gift box/i.test(label)) return 6; if (/value/i.test(label)) return 3; return 1;
}
const hasPacks = o => o.s.some(l => packCount(l) > 1);
function buildObj() {
  const it = pm.item, n = packCount(OPTS[it.id].s[pm.s]), ec = engClass(it);
  const layers = Array.from({ length: 11 }, (_, k) => '<span class="ly' + (k && k < 10 ? " in" : "") + '" style="transform:translateZ(' + (k - 5) * 3 + 'px)">' + face(it) + "</span>").join("");
  const unit = layers + (it.eng ? '<span class="eng ' + ec + '" style="transform:translateZ(18px)"></span><span class="eng ' + ec + '" style="transform:rotateY(180deg) translateZ(18px)"></span>' : "");
  const cols = n <= 1 ? 1 : n <= 4 ? 2 : n <= 6 ? 3 : 4, rows = Math.ceil(n / cols), sc = Math.min(1, 1.5 / Math.max(cols, rows)), gap = 135 * sc;
  let h = "";
  for (let i = 0; i < n; i++) {
    const x = (i % cols - (cols - 1) / 2) * gap, y = (Math.floor(i / cols) - (rows - 1) / 2) * gap;
    h += '<div class="unit3d" style="transform:translate3d(' + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) scale(" + sc.toFixed(2) + ')">' + unit + "</div>";
  }
  $obj.html(h);
  $("#packBadge").prop("hidden", n < 2).text("× " + n + " items · " + OPTS[it.id].s[pm.s]);
  fillDemoItems();
}
function fillDemoItems(k) {
  const it = pm.item; if (!it) return;
  const o = OPTS[it.id], n = packCount(o.s[k === undefined ? pm.s : k]), cols = n <= 1 ? 1 : n <= 4 ? 2 : n <= 6 ? 3 : 4;
  demoEmo.style.setProperty("--cols", cols); demoEmo.style.setProperty("--fs", (n <= 1 ? 1 : Math.max(.4, 1.5 / Math.max(cols, Math.ceil(n / cols)) * .82)).toFixed(2));
  demoEmo.innerHTML = Array(n).fill("<b>" + face(it) + "</b>").join("");
}
function renderOptions() {
  const o = OPTS[pm.item.id];
  $pmColors.html(o.c.map(k => '<button type="button" class="sw' + (k === pm.c ? " on" : "") + '" data-c="' + k + '" style="--c:' + COLORS[k][1] + '" title="' + COLORS[k][0] + '" aria-label="' + COLORS[k][0] + '"></button>').join(""));
  $pmSizes.html(o.s.map((t, i) => '<button type="button" class="chip' + (i === pm.s ? " on" : "") + '" data-s="' + i + '">' + t + "</button>").join(""));
  $("#pmOptLabel").text(o.ol); $pmColorName.text("Selected: " + COLORS[pm.c][0]); $pmPrice.text(money(sizePrice(pm.item.p, pm.s)));
  $stage.css("--tint", COLORS[pm.c][2]);
  $obj.css("--scale", (0.85 + pm.s * 0.12).toFixed(2));
}
/* ----- auto-playing demo reel (one for every product) ----- */
const demo = { k: -1, id: 0, scene: -1, t0: 0, on: true, scenes: [] };
const SCENE_MS = 2600;
function buildDemo(it) {
  const o = OPTS[it.id];
  demo.scenes = [
    { fx: "zoom", cap: "Meet the " + it.n },
    { fx: "shine", cap: it.sec + " · " + shopOf(it).name },
    { fx: "colors", cap: "Pick your " + o.ol.toLowerCase() },
    it.eng ? { fx: "type", cap: it.eng[1] + " – watch it appear" } : { fx: "sizes", cap: hasPacks(o) ? "Choose your pack size" : "Choose a size that fits" },
    { fx: "cart", cap: "Ready for your trolley!" }
  ];
  fillDemoItems(); demoEng.className = "demo-eng " + engClass(it);
  demo.scene = -1; demo.t0 = performance.now(); demo.on = true; qs("#demoPlay").innerHTML = "&#10074;&#10074;";
  const id = ++demo.id; requestAnimationFrame(t => demoTick(id));
}
function setScene(i) {
  demo.scene = i; const s = demo.scenes[i];
  demoStage.className = "demo-stage fx-" + s.fx; void demoStage.offsetWidth;
  demoCap.textContent = s.cap; demoEmo.style.filter = ""; demoEmo.style.scale = ""; demoEng.textContent = ""; if (s.fx !== "sizes") fillDemoItems();
}
function demoTick(id) {
  if (id !== demo.id || $productModal.prop("hidden")) return;
  if (demo.on) {
    const el = performance.now() - demo.t0, total = SCENE_MS * demo.scenes.length, e = el % total, i = Math.floor(e / SCENE_MS), p = (e % SCENE_MS) / SCENE_MS;
    if (i !== demo.scene) setScene(i);
    const s = demo.scenes[i], it = pm.item, o = OPTS[it.id];
    demoBar.style.width = (e / total * 100) + "%";
    if (s.fx === "colors") { const k = o.c[Math.min(o.c.length - 1, Math.floor(p * o.c.length))]; demoEmo.style.filter = COLORS[k][2]; demoCap.textContent = o.ol + ": " + COLORS[k][0]; }
    else if (s.fx === "sizes") { const k = Math.min(o.s.length - 1, Math.floor(p * o.s.length)); if (hasPacks(o)) { if (demo.k !== k) { demo.k = k; fillDemoItems(k); } } else demoEmo.style.scale = (0.7 + k * 0.25).toFixed(2); demoCap.textContent = "Size: " + o.s[k] + (packCount(o.s[k]) > 1 ? "  (" + packCount(o.s[k]) + " items)" : ""); }
    else if (s.fx === "type") { const name = (acct && acct.name ? acct.name.split(" ")[0] : "Coco").slice(0, 10), n = Math.min(name.length, Math.ceil(Math.min(1, p / 0.75) * name.length)); demoEng.textContent = name.slice(0, n); demoEng.style.fontFamily = FONTS[pm.f]; demoEng.style.fontSize = "26px"; }
  }
  requestAnimationFrame(() => demoTick(id));
}
qs("#demoPlay").addEventListener("click", () => {
  demo.on = !demo.on; qs("#demoPlay").innerHTML = demo.on ? "&#10074;&#10074;" : "&#9654;";
  if (demo.on) demo.t0 = performance.now() - Math.max(0, demo.scene) * SCENE_MS;
});
function openProduct(id) {
  const it = findItem(id);
  Object.assign(pm, { item: it, c: OPTS[id].c[0], s: 0, rx: -10, ry: -25, vy: 0.5, t: "", f: "classic" });
  $("#pmName").text(it.n); $("#pmDesc").text(it.d); $("#pmCat").text(it.sec + " · " + shopOf(it).name);
  $copyMessage.text(""); $("#pmSaveMsg").empty();
  $pmEngrave.prop("hidden", !it.eng); $("#engBadge").prop("hidden", !it.eng); $pmEngInput.val("");
  $("#pmFonts .chip").removeClass("on").filter('[data-f="classic"]').addClass("on");
  if (it.eng) $("#pmEngHint").text(it.eng[1] + " · live preview on the product");
  setBadge("Idle");
  renderOptions(); buildObj(); paintEngraving(); paintObj(); $productModal.prop("hidden", false); requestAnimationFrame(spin); buildDemo(it);
}
const closeProduct = () => $productModal.prop("hidden", true);
$pmEngInput.on("input", function () { pm.t = $(this).val(); paintEngraving(); });
$("#pmFonts").on("click", "[data-f]", function () { pm.f = $(this).data("f"); $(this).addClass("on").siblings().removeClass("on"); paintEngraving(); });
$pmColors.on("click", "[data-c]", function () { pm.c = $(this).data("c"); renderOptions(); });
$pmSizes.on("click", "[data-s]", function () { pm.s = +$(this).data("s"); demo.k = -1; renderOptions(); buildObj(); paintEngraving(); });

/* the configuration the shopper has chosen right now (also what is POSTed to the Express server) */
function currentConfig() {
  const it = pm.item;
  return { productName: it.n, category: it.sec, color: COLORS[pm.c][0], size: OPTS[it.id].s[pm.s], engraving: it.eng ? pm.t.trim() : "", font: pm.f, price: sizePrice(it.p, pm.s) };
}
function addCurrentConfig(close) {
  const it = pm.item, c = currentConfig();
  if (close) { flyFrom = $("#pmAdd")[0].getBoundingClientRect(); closeProduct(); }
  addToCart(it.id + "|" + pm.c + "|" + pm.s + "|" + c.engraving + "|" + pm.f, it.n, it.e, c.price, c.color + " · " + c.size + (c.engraving ? " · “" + c.engraving + "” engraved" : ""), it.img);
}
$("#pmAdd").on("click", () => addCurrentConfig(true));
$("#pmSave").on("click", () => ApiLab.postConfig(currentConfig()));          // POST -> Express (api.js)
$("#closeModal").on("click", closeProduct);
$productModal.on("click", e => { if (e.target === $productModal[0]) closeProduct(); });

/* ---------- 13. Checkout submit + reset ---------- */
let quietReset = false;
$checkoutForm.on("submit", function (e) {
  e.preventDefault();
  const bad = payFields().filter(f => !validateField(f));
  if (bad.length) { setFormMessage("Please fix the highlighted fields.", "bad"); bad[0].trigger("focus"); return; }
  if (!cart.length) { setFormMessage("Your trolley is empty – pick something from a shop first.", "bad"); return; }
  const total = cart.reduce((s, c) => s + c.qty * c.price, 0), key = shipKey(), sh = SHIPPING[key], fee = sh.fee(total), grand = money(total + fee), pay = payMethod();
  const now = new Date(), addD = n => new Date(now.getTime() + n * 864e5);
  const fD = d => d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }), fT = d => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const promise = key === "sameday" ? { head: "Arriving in 24 hours", sub: "By " + fD(addD(1)) + ", " + fT(now), steps: ["Right now", "Within 1 hour", "Within 6 hours", "Within 24 hours"] }
    : key === "express" ? { head: "Arriving within 2 days", sub: "By " + fD(addD(2)) + ", 8:00 PM", steps: ["Right now", "Today", "Tomorrow", "Within 2 days"] }
    : { head: "Arriving in 3–5 days", sub: fD(addD(3)) + " – " + fD(addD(5)), steps: ["Right now", "Tomorrow", "Day 2–3", "Day 3–5"] };
  const payInfo = pay === "cod" ? ["💵 Cash on Delivery", "Please keep <b>" + grand + "</b> ready for the rider."]
    : pay === "card" ? ["💳 Card ending " + escapeHTML($("#cardNumber").val().replace(/\D/g, "").slice(-4)), "<b>" + grand + "</b> paid successfully."]
    : ["📱 Mobile wallet", "Payment request of <b>" + grand + "</b> sent to " + escapeHTML($customerPhone.val().trim()) + "."];
  const labels = ["Order placed", "Packed", "Out for delivery", "Delivered"], icons = ["✔", "📦", "🚚", "🏠"];
  const items = cart.map(c => '<li><span class="ri-e">' + (c.img ? imgTag(c.img) : c.emoji) + '</span><span class="ri-n"><b>' + escapeHTML(c.name) + "</b><small>" + escapeHTML(c.note) + '</small></span><span class="ri-q">× ' + c.qty + '</span><span class="ri-p">' + money(c.qty * c.price) + "</span></li>").join("");
  $resultBody.html(
    '<div class="rc-hero"><div class="confetti" id="confetti"></div><svg class="tick" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg>' +
    "<h2>Order confirmed!</h2><p>Thank you, <b>" + escapeHTML($customerName.val().trim().split(" ")[0]) + "</b>. Your order <b>#CM-" + Math.floor(100000 + Math.random() * 900000) + "</b> is on its way to being packed.</p></div>" +
    '<div class="rc-promise ' + key + '"><div class="rc-van">' + sh.icon + '</div><div class="rc-ptx"><small>ESTIMATED DELIVERY</small><b>' + promise.head + "</b><span>" + promise.sub + '</span></div><div class="rc-badge">' + sh.icon + " " + sh.label + "</div></div>" +
    '<ol class="trk"><li class="fill"><i></i></li>' + labels.map((l, i) => '<li class="' + (i === 0 ? "done" : i === 1 ? "now" : "") + '"><span class="dot">' + icons[i] + "</span><b>" + l + "</b><small>" + (i === 0 ? fT(now) : promise.steps[i]) + "</small></li>").join("") + "</ol>" +
    '<div class="rc-grid"><div class="rc-card"><h4>📍 Delivering to</h4><p><b>' + escapeHTML($customerName.val().trim()) + "</b><br>" + escapeHTML($("#customerAddress").val().trim()) + ", " + escapeHTML($("#customerCity").val().trim()) + "<br>" + escapeHTML($customerPhone.val().trim()) + "</p></div>" +
    '<div class="rc-card"><h4>' + payInfo[0] + "</h4><p>" + payInfo[1] + "<br><small>Receipt sent to " + escapeHTML($customerEmail.val().trim()) + "</small></p></div></div>" +
    '<ul class="rc-items">' + items + "</ul>" +
    '<div class="rc-total"><div><span>Subtotal</span><span>' + money(total) + "</span></div><div><span>" + sh.label + "</span><span>" + (fee ? money(fee) : "FREE") + '</span></div><div class="grand"><span>Total</span><span>' + grand + "</span></div></div>");
  confetti();
  quietReset = true; $checkoutForm[0].reset(); closeCart(); $resultPanel.prop("hidden", false);
});
$checkoutForm.on("reset", () => setTimeout(() => {
  const quiet = quietReset; quietReset = false;
  $checkoutForm.find("input").removeClass("invalid valid");
  $checkoutForm.find(".error").text("");
  syncPay(); syncShip(); syncCardPreview(); cart = []; renderCart(); $checkoutForm.prop("hidden", true); $checkoutBtn.prop("hidden", false); setFormMessage("");
  if (acct) { $customerName.val(acct.name); $customerEmail.val(acct.email); }
  if (quiet) return;
  $resultPanel.prop("hidden", true); $resultBody.empty(); $copyMessage.text("");
  showToast("Trolley emptied and mall reset.", "info");
}, 0));

/* ---------- 14. Scroll (jQuery) ---------- */
$(window).on("scroll", () => {
  const y = $(window).scrollTop(), max = $(document).height() - $(window).height();
  $scrollProgress.css("width", (max > 0 ? y / max * 100 : 0) + "%");
  $siteHeader.toggleClass("compact", y > 60); $backToTop.toggleClass("visible", y > 300);
});
$backToTop.on("click", () => $("html, body").animate({ scrollTop: 0 }, 400));

/* =========================================================
   15. Account -> shopper -> door -> cart -> walking mall
   ========================================================= */
const HUMANS = { kid: { label: "Kid", hs: .66, sp: .92, f: "👧", m: "👦" }, adult: { label: "Adult", hs: 1, sp: 1, f: "👩", m: "👨" }, elder: { label: "Elder (old)", hs: .95, sp: .78, f: "👵", m: "👴" } };
const CARTS = {
  basket: { label: "Hand basket", cap: 5, sp: 1.1, d: "Carry it by hand · holds 5 items" },
  small: { label: "Small cart", cap: 10, sp: 1, d: "Quick trips · holds 10 items" },
  big: { label: "Large cart", cap: 24, sp: .82, d: "Big haul · holds 24 items" }
};
const OUTFITS = ["#e91e63", "#1e88e5", "#43a047", "#fb8c00", "#8e24aa", "#546e7a", "#d84315", "#00897b", "#5d4037", "#c0ca33"];
const SHOP_KEYS = Object.keys(SHOPS), RECEPTION_X = 430, shopX = i => 760 + i * 470, doorX = i => shopX(i) + 160, WORLD = 760 + SHOP_KEYS.length * 470 + 120;
const UNIT = 320, X0 = 380, ALL_EMOJIS = Object.values(PRODUCTS).map(p => p.e);
let acct = null, cartType = null, view = "gate", started = false, flyFrom = null, near = null, pois = [], mallPois = [];
let pMall = null, pStore = null, pDoor = null, recep = null, cashier = null, storeView = null, storeWorld = null, storeW = 0;
let mode = "login", selCat = "adult", outfit = OUTFITS[1], selCart = null, last = 0;
const players = [], held = new Set();
const gate = qs("#gate"), mallView = qs("#mallView"), world = qs("#world");
const LS = { get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
async function sha(t) { try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); } catch (e) { return btoa(unescape(encodeURIComponent(t))); } }
const step = id => gate.querySelectorAll(".gstep").forEach(x => { x.hidden = x.id !== id; });
const humanHTML = (cat, g, o, head) => '<div class="human" style="--hs:' + HUMANS[cat].hs + ";--outfit:" + o + '"><span class="head">' + (head || HUMANS[cat][g]) + '</span><i class="torso"></i><i class="arm"></i><i class="leg l"></i><i class="leg r"></i></div>';
const cartHTML = t => t === "basket" ? '<div class="bag"><i class="bag-h"></i><div class="bag-b"><span class="citems"></span></div></div>'
  : '<div class="cart ' + t + '"><i class="ch"></i><div class="cb"><span class="citems"></span></div><i class="wh w1"></i><i class="wh w2"></i></div>';
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---- actors: the player, shoppers who roam about, and staff behind desks ---- */
function makeActor(o) {
  const cat = o.cat || "adult", p = {
    x: o.x ?? 40, dir: o.dir || 1, target: null, cb: null, onMove: null, scene: o.scene || "gate", npc: !!o.npc, fixed: !!o.fixed, player: !!o.player,
    wait: Math.random() * 2, lane: o.lane ?? 16, bounds: o.bounds || (() => [0, 600]), el: document.createElement("div")
  };
  p.el.className = "person" + (o.cart === "basket" ? " bagmode" : "");
  p.el.style.bottom = p.lane + "px"; p.el.style.zIndex = o.z ?? (100 - p.lane);
  p.el.innerHTML = '<div class="flip">' + humanHTML(cat, o.gender || "f", o.outfit || OUTFITS[1], o.head) +
    (o.cart ? '<div class="held' + (o.npc ? " nph" : "") + '"' + (o.npc ? "" : ' title="Open trolley"') + ">" + cartHTML(o.cart) + "</div>" : "") + "</div>";
  p.flip = p.el.firstChild;
  p.speed = (o.npc ? 80 + Math.random() * 60 : 200) * HUMANS[cat].sp * (o.cart ? CARTS[o.cart].sp : 1);
  players.push(p); if (o.parent) o.parent.appendChild(p.el);
  return p;
}
function spawnNPC(scene, parent, bounds, laneMax, emojis) {
  const r = Math.random, cat = r() < .7 ? "adult" : r() < .5 ? "kid" : "elder", gender = r() < .5 ? "f" : "m";
  const cart = cat === "kid" ? (r() < .35 ? "basket" : null) : r() < .6 ? pick(["basket", "small", "big"]) : null;
  const [lo, hi] = bounds();
  const a = makeActor({ scene, parent, npc: true, cat, gender, head: HUMANS[cat][gender] + pick(["", "🏻", "🏼", "🏽", "🏾", "🏿"]), outfit: pick(OUTFITS), cart, lane: 4 + Math.floor(r() * laneMax), x: lo + r() * (hi - lo), dir: r() < .5 ? 1 : -1, bounds });
  if (cart) { const x = a.el.querySelector(".citems"); if (x) x.textContent = Array.from({ length: Math.floor(r() * Math.min(5, CARTS[cart].cap)) }, () => pick(emojis)).join(""); }
  return a;
}
function removeActors(scene) {
  for (let i = players.length - 1; i >= 0; i--) { const p = players[i]; if (p.scene === scene && !p.player) { p.el.remove(); players.splice(i, 1); } }
}
function remake(old) {
  const i = players.indexOf(old); if (i >= 0) players.splice(i, 1);
  const a = makeActor({ scene: old.scene, player: true, cat: acct.cat, gender: acct.gender, outfit: acct.outfit, cart: cartType, lane: old.lane, bounds: old.bounds, x: old.x, dir: old.dir, parent: old.el.parentNode });
  a.onMove = old.onMove; old.el.remove(); return a;
}
const walkTo = (p, x, cb) => { const [lo, hi] = p.bounds(); p.target = Math.max(lo, Math.min(hi, x)); p.cb = cb || null; };
const reach = p => { if (!p) return; p.el.classList.add("reach"); setTimeout(() => p.el.classList.remove("reach"), 520); };
const modalOpen = () => isShown($productModal) || isShown($resultPanel) || isShown($receptionModal) || isShown($apiModal) || $cartPanel.hasClass("open");
const inputDir = () => {
  if (!started || !gate.hidden || modalOpen()) return 0;
  return (held.has("arrowright") || held.has("d") || held.has("padr") ? 1 : 0) - (held.has("arrowleft") || held.has("a") || held.has("padl") ? 1 : 0);
};
function tick(t) {
  const dt = Math.min(.05, (t - last) / 1000); last = t;
  const act = view === "mall" ? pMall : view === "store" ? pStore : null;
  for (const p of players) {
    if (p.scene !== view) continue;
    let v = p === act ? inputDir() : 0, boost = 1;
    if (v) p.target = null;
    else if (p.target != null) {
      const d = p.target - p.x; if (p === act) boost = 1 + Math.min(2, Math.abs(d) / 700);
      if (Math.abs(d) <= Math.max(4, p.speed * boost * dt)) { p.x = p.target; p.target = null; const cb = p.cb; p.cb = null; if (cb) cb(); } else v = Math.sign(d);
    } else if (p.npc && !p.fixed) {
      p.wait -= dt;
      if (p.wait <= 0) { const [lo, hi] = p.bounds(); p.target = lo + Math.random() * (hi - lo); p.cb = () => { p.wait = 1 + Math.random() * 3.5; if (view === "store" && Math.random() < .7) reach(p); }; }
    }
    const [lo, hi] = p.bounds();
    if (v) { p.dir = v; p.x = Math.max(lo, Math.min(hi, p.x + v * p.speed * boost * dt)); }
    p.el.classList.toggle("walking", !!v); p.flip.style.transform = "scaleX(" + p.dir + ")"; p.el.style.left = p.x + "px";
    if (p.onMove) p.onMove();
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
document.addEventListener("keydown", e => {
  if (!started || !gate.hidden || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key.toLowerCase();
  if (["arrowleft", "arrowright", "a", "d"].includes(k)) { held.add(k); e.preventDefault(); }
  else if (k === "e" && near && !modalOpen()) near.run();
});
document.addEventListener("keyup", e => held.delete(e.key.toLowerCase()));
[["padL", "padl"], ["padR", "padr"]].forEach(([id, k]) => {
  const b = qs("#" + id); b.addEventListener("pointerdown", () => held.add(k));
  ["pointerup", "pointerleave", "pointercancel"].forEach(ev => b.addEventListener(ev, () => held.delete(k)));
});

/* an item flies from the shelf / button into the cart the shopper is holding */
function fly(emoji) {
  const a = flyFrom; flyFrom = null; const p = view === "mall" ? pMall : pStore;
  const tg = p && p.el.querySelector(".cb, .bag-b"); if (!a || !tg) return;
  const b = tg.getBoundingClientRect(), dx = b.left + b.width / 2 - a.left - a.width / 2, dy = b.top + b.height / 2 - a.top - a.height / 2;
  const f = document.createElement("div"); f.className = "fly"; f.innerHTML = emoji;
  f.style.left = a.left + a.width / 2 + "px"; f.style.top = a.top + a.height / 2 + "px"; document.body.appendChild(f);
  const done = () => { f.remove(); const h = p.el.querySelector(".held"); if (h) { h.classList.remove("bump"); void h.offsetWidth; h.classList.add("bump"); } };
  if (f.animate) f.animate([{ transform: "translate(-50%,-50%) scale(1.3)" }, { transform: "translate(calc(-50% + " + dx / 2 + "px),calc(-50% + " + (dy / 2 - 70) + "px)) scale(1)" }, { transform: "translate(calc(-50% + " + dx + "px),calc(-50% + " + dy + "px)) scale(.5)" }], { duration: 600, easing: "ease-in" }).onfinish = done;
  else done();
}
function updateHeld() {
  if (!cartType) return;
  const em = cart.flatMap(c => Array(c.qty).fill(c.emoji)).slice(-CARTS[cartType].cap).join("");
  players.forEach(p => { if (!p.player) return; const x = p.el.querySelector(".citems"); if (x) x.textContent = em; });
}

/* ---- camera + "press E" points of interest (doors, reception, checkout) ---- */
function camUpdate() {
  const st = view === "store" ? { v: storeView, w: storeWorld, p: pStore, W: storeW } : { v: mallView, w: world, p: pMall, W: WORLD };
  if (!st.v || !st.p) return;
  const vw = st.v.clientWidth, cam = Math.max(0, Math.min(st.W - vw, st.p.x - vw / 2));
  st.w.style.transform = "translateX(" + -cam + "px)";
  const n = pois.find(q => Math.abs(st.p.x - q.x) < 55) || null;
  if (n !== near) { if (near && near.el) near.el.classList.remove("near"); near = n; if (n && n.el) n.el.classList.add("near"); }
}

/* ---- mall corridor: reception + one door per brand ---- */
function buildMall() {
  const list = [{ x: RECEPTION_X, run: showReception }];
  let h = '<div class="wlights"></div><div class="wfloor"></div>' +
    '<div class="reception" data-poi="0" style="left:' + (RECEPTION_X - 100) + 'px"><div class="rsign">🛎️ RECEPTION</div><div class="rdesk"></div><div class="dprompt">Press E – Reception</div></div>';
  h += SHOP_KEYS.map((k, i) => {
    const s = SHOPS[k], ids = s.sections[0].ids;
    list.push({ x: doorX(i), run: () => enterShop(k) });
    return '<div class="sfront" data-poi="' + (i + 1) + '" style="left:' + shopX(i) + "px;--sc:" + s.color + '"><div class="awning"></div><div class="ssign">' + s.icon + " " + escapeHTML(s.name) +
      '</div><div class="swin">' + ids.slice(0, 4).map(id => PRODUCTS[id].e).join("") + '</div><div class="swin r">' + s.icon + '</div><button type="button" class="sdoor" aria-label="Enter ' + escapeHTML(s.name) + '"><span>ENTER</span></button><div class="dprompt">Press E to enter</div></div>' +
      '<span class="decor" style="left:' + (shopX(i) - 120) + 'px">' + ["🪴", "⛲", "🛋️", "🌳"][i % 4] + "</span>";
  }).join("") + '<div class="wel" style="left:30px">Welcome<br>to Coco\'s Mall &rarr;</div>';
  world.style.width = WORLD + "px"; world.innerHTML = h;
  list.forEach((q, i) => { q.el = world.querySelector('[data-poi="' + i + '"]'); });
  mallPois = list;
  recep = makeActor({ scene: "mall", fixed: true, head: "👩‍💼", gender: "f", outfit: "#6a1b9a", lane: 94, z: 15, x: RECEPTION_X, dir: -1, bounds: () => [0, WORLD], parent: world });
  world.appendChild(pMall.el);
  for (let i = 0; i < 10; i++) spawnNPC("mall", world, () => [40, WORLD - 60], 54, ALL_EMOJIS);
}
function showMall() {
  view = "mall"; mallView.hidden = false; shopEl.hidden = true; renderDirectory();
  pois = mallPois; near = null;
  youAreHere.textContent = "📍 You are here: Coco's Mall corridor – visit Reception, or walk to a shop door (or use the shop tabs above)";
  world.appendChild(pMall.el); camUpdate();
}
function leaveStore() { const i = SHOP_KEYS.indexOf(currentShop); showMall(); pMall.x = doorX(i); pMall.dir = 1; pMall.target = null; camUpdate(); }
function goToShop(key) {
  if (view === "store" && key === currentShop) return;
  if (view === "store") leaveStore();
  walkTo(pMall, doorX(SHOP_KEYS.indexOf(key)), () => enterShop(key));
}
directory.addEventListener("click", e => { const d = e.target.closest(".door"); if (d && started) goToShop(d.dataset.shop); });
world.addEventListener("click", e => {
  if (e.target.closest(".held")) { openCart(); return; }
  const pe = e.target.closest("[data-poi]");
  if (pe) { const q = mallPois[+pe.dataset.poi]; walkTo(pMall, q.x, q.run); return; }
  walkTo(pMall, e.clientX - world.getBoundingClientRect().left);
});

/* ---- inside a shop: click a product -> shopper walks there, reaches out and picks it ---- */
shopEl.addEventListener("click", e => {
  if (e.target.closest(".held")) { openCart(); return; }
  if (e.target.closest("#leaveBtn")) { leaveStore(); return; }
  if (!started) return;
  const chip = e.target.closest(".secchip");
  if (chip) { walkTo(pStore, X0 + +chip.dataset.sec * UNIT + 152); return; }
  const slot = e.target.closest(".slot");
  if (slot) {
    const plus = e.target.closest(".plus"), id = slot.dataset.id, r = slot.getBoundingClientRect(), w = storeWorld.getBoundingClientRect();
    walkTo(pStore, r.left - w.left + r.width / 2, () => { reach(pStore); if (plus) { flyFrom = slot.getBoundingClientRect(); addById(id); } else openProduct(id); });
    return;
  }
  const pe = e.target.closest("[data-poi]");
  if (pe) { const q = pois[+pe.dataset.poi]; walkTo(pStore, q.x, q.run); return; }
  if (storeWorld && storeWorld.contains(e.target)) walkTo(pStore, e.clientX - storeWorld.getBoundingClientRect().left);
});

/* ---- reception: directory, swap cart, FAQ ---- */
function showReception() {
  reach(recep);
  const used = cart.reduce((n, c) => n + c.qty, 0), first = acct.name.split(" ")[0];
  qs("#recBody").innerHTML = "<h2>🛎️ Reception</h2><p class=\"hint\">Hello " + escapeHTML(first) + "! Welcome to Coco's Mall. How can I help you today?</p>" +
    "<h3>🗺️ Shop directory</h3><div class=\"rec-list\">" + SHOP_KEYS.map(k => {
      const s = SHOPS[k], n = s.sections.reduce((a, c) => a + c.ids.length, 0);
      return '<div class="rec-row"><span class="rec-ic" style="background:' + s.color + '">' + s.icon + "</span><div><b>" + escapeHTML(s.name) + "</b><small>" + escapeHTML(s.tag) + " · " + n + ' products</small></div><button type="button" class="btn btn-secondary" data-go="' + k + '">Take me there</button></div>';
    }).join("") + "</div><h3>🛒 Swap your cart</h3><div class=\"chips\">" +
    Object.entries(CARTS).map(([k, c]) => '<button type="button" class="chip' + (k === cartType ? " on" : "") + '" data-swap="' + k + '">' + c.label + " (" + c.cap + ")</button>").join("") +
    "</div><small class=\"hint\">You are carrying " + used + " item(s).</small>" +
    "<h3>ℹ️ Good to know</h3><ul class=\"faq\"><li>Free delivery on orders over $75 (otherwise $4.99).</li><li>Pay by Cash on Delivery, Card or Mobile Wallet.</li><li>Delivery takes 3–5 days.</li><li>Every shop has a checkout desk at the far end – or open your trolley any time.</li></ul>";
  $receptionModal.prop("hidden", false);
}
function swapCart(t) {
  const used = cart.reduce((n, c) => n + c.qty, 0);
  if (used > CARTS[t].cap) { showToast("A " + CARTS[t].label.toLowerCase() + " holds " + CARTS[t].cap + " items – you have " + used + ".", "info"); return; }
  cartType = t; pMall = remake(pMall); pStore = remake(pStore); updateHeld(); camUpdate();
  showToast("Swapped to a " + CARTS[t].label.toLowerCase() + ".", "info"); showReception();
}
qs("#recBody").addEventListener("click", e => {
  const g = e.target.closest("[data-go]"), s = e.target.closest("[data-swap]");
  if (g) { $receptionModal.prop("hidden", true); goToShop(g.dataset.go); } else if (s) swapCart(s.dataset.swap);
});
qs("#closeRec").addEventListener("click", () => { $receptionModal.prop("hidden", true); });
$receptionModal.on("click", e => { if (e.target === $receptionModal[0]) $receptionModal.prop("hidden", true); });

/* ---- gate: log in / create account ---- */
function setMode(m) {
  mode = m; gate.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.dataset.tab === m));
  gate.querySelectorAll("[data-s=signup]").forEach(f => { f.hidden = m !== "signup"; });
  qs("#authBtn").textContent = m === "signup" ? "Create account" : "Log in"; qs("#authMsg").textContent = "";
}
gate.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => setMode(t.dataset.tab)));
gate.querySelectorAll('input[name="gender"]').forEach(r => r.addEventListener("change", () => gate.querySelectorAll("#authForm .pay").forEach(l => l.classList.toggle("on", l.querySelector("input").checked))));
qs("#authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = $("#auName").val().trim(), email = $("#auEmail").val().trim().toLowerCase(), pass = $("#auPass").val(), age = +$("#auAge").val(), msg = qs("#authMsg");
  msg.className = "form-message bad";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = "Enter a valid email address."; return; }
  if (pass.length < 6) { msg.textContent = "Password needs at least 6 characters."; return; }
  const users = LS.get("am_users") || {}, hash = await sha(pass);
  if (mode === "signup") {
    if (name.length < 3) { msg.textContent = "Enter your full name (3+ characters)."; return; }
    if (!(age >= 3 && age <= 110)) { msg.textContent = "Enter a valid age (3–110)."; return; }
    if (users[email]) { msg.textContent = "That email already has an account – log in instead."; return; }
    users[email] = { name, email, hash, age, gender: gate.querySelector('input[name="gender"]:checked').value }; LS.set("am_users", users);
  } else if (!users[email] || users[email].hash !== hash) { msg.textContent = "Wrong email or password."; return; }
  acct = users[email]; LS.set("am_session", email); afterAuth();
});
const saveAcct = () => { const u = LS.get("am_users") || {}; u[acct.email] = acct; LS.set("am_users", u); };
function afterAuth() { if (acct.cat && acct.outfit) showDoor(); else showChar(); }

/* ---- gate: choose a human (female / male  x  kid / adult / elder) ---- */
function showChar() {
  step("stChar");
  const sg = acct.age < 13 ? "kid" : acct.age >= 60 ? "elder" : "adult";
  selCat = acct.cat || sg; outfit = acct.outfit || (acct.gender === "f" ? OUTFITS[0] : OUTFITS[1]);
  qs("#charHint").textContent = "You are " + acct.age + ", so we suggest “" + HUMANS[sg].label + "” – but you can pick any shopper.";
  drawChars();
}
function drawChars() {
  qs("#genderSw").innerHTML = [["f", "👩 Female"], ["m", "👨 Male"]].map(([g, t]) => '<button type="button" class="chip' + (acct.gender === g ? " on" : "") + '" data-g="' + g + '">' + t + "</button>").join("");
  qs("#charGrid").innerHTML = Object.entries(HUMANS).map(([k, c]) => '<button type="button" class="char' + (k === selCat ? " on" : "") + '" data-cat="' + k + '"><div class="cstage">' + humanHTML(k, acct.gender, outfit) + "</div><b>" + c.label + "</b></button>").join("");
  qs("#outfitSw").innerHTML = OUTFITS.map(o => '<button type="button" class="sw' + (o === outfit ? " on" : "") + '" data-o="' + o + '" style="--c:' + o + '"></button>').join("");
}
qs("#stChar").addEventListener("click", e => {
  const g = e.target.closest("[data-g]"), c = e.target.closest("[data-cat]"), o = e.target.closest("[data-o]");
  if (g) acct.gender = g.dataset.g; else if (c) selCat = c.dataset.cat; else if (o) outfit = o.dataset.o; else return;
  drawChars();
});
qs("#charNext").addEventListener("click", () => { acct.cat = selCat; acct.outfit = outfit; saveAcct(); showDoor(); });

/* ---- gate: the sliding door ---- */
function showDoor() {
  step("stDoor"); players.length = 0; const ef = qs("#efloor"); ef.innerHTML = ""; qs("#entrance").classList.remove("open"); qs("#enterBtn").disabled = false;
  pDoor = makeActor({ scene: "gate", cat: acct.cat, gender: acct.gender, outfit: acct.outfit, lane: 10, x: 40, bounds: () => [10, ef.clientWidth - 30], parent: ef });
}
qs("#enterBtn").addEventListener("click", () => {
  qs("#enterBtn").disabled = true; qs("#entrance").classList.add("open");
  setTimeout(() => walkTo(pDoor, qs("#efloor").clientWidth / 2, () => { pDoor.el.classList.add("fade"); setTimeout(showCarts, 500); }), 900);
});

/* ---- gate: take a basket / small cart / large cart ---- */
function showCarts() {
  step("stCart"); selCart = null; qs("#cartGo").disabled = true;
  qs("#cartGrid").innerHTML = Object.entries(CARTS).map(([k, c]) => '<button type="button" class="ccard" data-c="' + k + '"><div class="cprev">' + cartHTML(k) + "</div><b>" + c.label + "</b><small>" + c.d + "</small></button>").join("");
}
qs("#cartGrid").addEventListener("click", e => {
  const b = e.target.closest("[data-c]"); if (!b) return;
  selCart = b.dataset.c; qs("#cartGo").disabled = false; qs("#cartGrid").querySelectorAll(".ccard").forEach(x => x.classList.toggle("on", x === b));
});
qs("#cartGo").addEventListener("click", () => { cartType = selCart; startMall(); });
function startMall() {
  players.length = 0; started = true; gate.hidden = true; document.body.classList.add("playing");
  const base = { player: true, cat: acct.cat, gender: acct.gender, outfit: acct.outfit, cart: cartType };
  pMall = makeActor({ ...base, scene: "mall", lane: 20, x: 150, bounds: () => [40, WORLD - 60] });
  pStore = makeActor({ ...base, scene: "store", lane: 14, x: 200, bounds: () => [40, storeW - 60] });
  pMall.onMove = pStore.onMove = camUpdate;
  buildMall(); showMall();
  $customerName.val(acct.name); $customerEmail.val(acct.email);
  qs("#userChip").textContent = "👋 Hi, " + acct.name.split(" ")[0]; qs("#logoutBtn").hidden = false;
  cart = []; renderCart(); showToast("Welcome, " + acct.name.split(" ")[0] + "! Visit Reception, or walk to any shop door.", "info");
}
qs("#logoutBtn").addEventListener("click", () => { LS.set("am_session", null); location.reload(); });
function initGate() {
  gate.hidden = false; setMode("login");
  const u = (LS.get("am_users") || {})[LS.get("am_session")];
  if (u) { acct = u; afterAuth(); } else step("stAuth");
}

/* ---------- 16. Start (DOMContentLoaded) ---------- */
$(function () { renderDirectory(); renderCart(); initGate(); });          // jQuery document-ready
