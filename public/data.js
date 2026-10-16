/* =========================================================
   Coco's Mall – product catalogue
   7 shops, each split into shelf sections of 6 products.
   Every section has its own colour/flavour + size categories.
   ========================================================= */
/* name, swatch, CSS filter that recolours the 3D emoji */
const COLORS = {
  black:   ["Black",      "#23232b", "grayscale(1) brightness(.35)"],
  white:   ["White",      "#f5f5f5", "grayscale(1) brightness(1.8)"],
  silver:  ["Silver",     "#b7bcc7", "grayscale(1)"],
  blue:    ["Blue",       "#1e63d6", "grayscale(1) sepia(1) saturate(4) hue-rotate(170deg)"],
  red:     ["Red",        "#d32f2f", "grayscale(1) sepia(1) saturate(5) hue-rotate(-40deg)"],
  green:   ["Green",      "#2e8b3d", "grayscale(1) sepia(1) saturate(4) hue-rotate(80deg)"],
  pink:    ["Pink",       "#ec6fa1", "grayscale(1) sepia(1) saturate(3) hue-rotate(290deg) brightness(1.3)"],
  purple:  ["Purple",     "#7b3fc4", "grayscale(1) sepia(1) saturate(4) hue-rotate(230deg)"],
  orange:  ["Orange",     "#f57c00", "grayscale(1) sepia(1) saturate(5)"],
  beige:   ["Beige",      "#d8c3a0", "grayscale(1) sepia(.6) brightness(1.4)"],
  /* flavours / varieties for food & care */
  plain:   ["Classic",    "#e8d9b5", "none"],
  organic: ["Organic",    "#5aa55f", "grayscale(1) sepia(1) saturate(3) hue-rotate(60deg)"],
  choc:    ["Chocolate",  "#6d4430", "grayscale(1) sepia(1) saturate(1.5) brightness(.6)"],
  straw:   ["Strawberry", "#ef5a7a", "grayscale(1) sepia(1) saturate(5) hue-rotate(-30deg) brightness(1.1)"],
  mint:    ["Mint",       "#59c7a5", "grayscale(1) sepia(1) saturate(3) hue-rotate(110deg)"],
  spicy:   ["Spicy",      "#d8432a", "grayscale(1) sepia(1) saturate(6) hue-rotate(-50deg)"],
  cheese:  ["Cheese",     "#f2b632", "grayscale(1) sepia(1) saturate(5) brightness(1.2)"],
  vanilla: ["Vanilla",    "#f1e2b8", "grayscale(1) sepia(.5) brightness(1.5)"],
  lemon:   ["Lemon",      "#f4d942", "grayscale(1) sepia(1) saturate(5) hue-rotate(15deg) brightness(1.3)"]
};

/* section(title, icon, blurb, colour keys, sizes, option label, [emoji, name, price] x6) */
const sec = (n, i, b, c, s, ol, items) => ({ n, i, b, c, s, ol, items });
const FOOD = ["Small", "Regular", "Family"], CL = ["S", "M", "L", "XL"], SZ3 = ["Small", "Medium", "Large"], TECH = ["Standard", "Plus", "Max"];

const SHOPS = {
  mart: { icon: "🛒", name: "Coco's Mall", tag: "Fresh & Fast", color: "#b71c1c", sections: [
    sec("Fruits & Veg", "🥦", "Farm-fresh produce picked daily.", ["plain", "organic"], ["500 g", "1 kg", "2 kg"], "Variety", [
      ["🍎", "Red Apples", 3.49], ["🍌", "Bananas", 1.99], ["🍇", "Green Grapes", 4.49], ["🍓", "Strawberries", 3.99], ["🥕", "Carrots", 1.49], ["🥦", "Broccoli", 2.19]]),
    sec("Bakery", "🥖", "Baked fresh every morning.", ["plain", "choc", "straw", "vanilla"], ["Single", "Box of 4", "Party box"], "Flavour", [
      ["🥖", "French Baguette", 1.99], ["🍞", "Sliced Bread", 2.49], ["🥐", "Butter Croissant", 1.79], ["🧁", "Cupcakes", 3.99], ["🍩", "Glazed Donuts", 4.5], ["🥯", "Bagels", 3.25]]),
    sec("Dairy", "🥛", "Chilled and delivered fresh.", ["plain", "organic", "vanilla", "choc"], ["250 ml", "500 ml", "1 litre"], "Variety", [
      ["🥛", "Fresh Milk", 1.89], ["🧀", "Cheddar Block", 4.29], ["🧈", "Salted Butter", 2.99], ["🥚", "Free-range Eggs", 3.49], ["🥣", "Greek Yoghurt", 2.59], ["🧀", "Mozzarella", 3.79]]),
    sec("Frozen Foods", "🧊", "Straight from the freezer aisle.", ["plain", "spicy", "cheese"], ["Single", "Twin pack", "Family pack"], "Flavour", [
      ["🍕", "Frozen Pizza", 5.99], ["🍦", "Ice-cream Tub", 6.49], ["🍟", "Crinkle Fries", 3.29], ["🍗", "Chicken Nuggets", 5.49], ["🥟", "Dumplings", 4.99], ["🌽", "Sweetcorn", 2.29]]),
    sec("Drinks", "🥤", "Cold drinks and hot favourites.", ["plain", "straw", "mint", "lemon"], ["330 ml", "500 ml", "1.5 L"], "Flavour", [
      ["🥤", "Cola", 1.49], ["🧃", "Juice Box", 1.99], ["🍵", "Green Tea", 2.79], ["☕", "Coffee Beans", 7.99], ["💧", "Spring Water", 0.99], ["🧋", "Iced Latte", 2.99]]),
    sec("Snacks", "🍿", "Crunchy, sweet and salty treats.", ["plain", "spicy", "cheese", "choc"], ["Mini", "Regular", "Party"], "Flavour", [
      ["🍿", "Popcorn", 2.49], ["🥨", "Pretzels", 2.29], ["🍪", "Cookies", 2.99], ["🍫", "Chocolate Bar", 1.79], ["🥜", "Roasted Peanuts", 2.69], ["🍬", "Candy Mix", 2.19]]),
    sec("Personal Care", "🧴", "Look after yourself every day.", ["mint", "straw", "vanilla", "plain"], ["Travel", "Regular", "Value"], "Fragrance", [
      ["🧴", "Shampoo", 5.99], ["🧼", "Hand Soap", 2.49], ["🪥", "Toothbrush", 1.99], ["🪒", "Razor Set", 6.49], ["🧻", "Tissue Rolls", 4.99], ["💄", "Lip Balm", 2.29]]),
    sec("Cleaning", "🧹", "Keep your home sparkling.", ["blue", "green", "orange"], SZ3, "Colour", [
      ["🧹", "Broom", 6.99], ["🧽", "Sponge Pack", 2.99], ["🧴", "Dish Soap", 3.19], ["🪣", "Mop Bucket", 8.99], ["🧺", "Laundry Basket", 7.49], ["🧤", "Rubber Gloves", 2.49]])
  ] },

  threads: { icon: "👕", name: "Threads & Co.", tag: "Everyday fashion", color: "#c2185b", ol: "Colour", sections: [
    sec("Tops", "👕", "Soft fabrics, relaxed fits.", ["black", "white", "blue", "red", "green"], CL, "Colour", [
      ["👕", "Classic Cotton Tee", 14.99], ["👚", "Satin Blouse", 24.99], ["👔", "Formal Shirt", 29.99], ["🧥", "Cozy Hoodie", 39], ["🧶", "Knit Sweater", 34.5], ["🧥", "Denim Jacket", 54]]),
    sec("Bottoms & Dresses", "👖", "From casual days to evenings out.", ["black", "blue", "beige", "red", "pink"], CL, "Colour", [
      ["👖", "Slim Jeans", 39.99], ["🩳", "Chino Shorts", 22.5], ["👗", "Summer Dress", 44], ["🩱", "Swimsuit", 27], ["👘", "Kimono Robe", 36], ["👖", "Cargo Pants", 42]]),
    sec("Footwear", "👟", "Comfortable steps all day.", ["black", "white", "red", "blue", "beige"], ["38", "40", "42", "44"], "Colour", [
      ["👟", "Sneakers", 59.99], ["👠", "Heels", 49], ["🥾", "Hiking Boots", 74.5], ["🩴", "Sandals", 19.99], ["🧦", "Cotton Socks", 6.99], ["🩰", "Ballet Flats", 32]]),
    sec("Accessories", "👜", "The finishing touches.", ["black", "beige", "red", "pink", "blue"], SZ3, "Colour", [
      ["🧢", "Canvas Cap", 12.5], ["🧣", "Wool Scarf", 17.99], ["🧤", "Winter Gloves", 14.5], ["👜", "Handbag", 49.99], ["🕶️", "Sunglasses", 21.99], ["🎒", "Backpack", 34.99]])
  ] },

  snacks: { icon: "🍭", name: "Snack Shack", tag: "Sweet & crunchy treats", color: "#ef6c00", sections: [
    sec("Sweets", "🍭", "Little bites of happiness.", ["straw", "choc", "vanilla", "mint", "lemon"], ["Mini", "Regular", "Gift box"], "Flavour", [
      ["🍭", "Swirl Lollipops", 1.99], ["🍬", "Fruit Candies", 2.99], ["🍫", "Truffle Box", 12.5], ["🍩", "Donut Box", 6.5], ["🍮", "Caramel Pudding", 3.25], ["🍡", "Mochi Bites", 4.99]]),
    sec("Crunchy", "🍿", "Loud, golden and delicious.", ["plain", "spicy", "cheese", "choc"], ["Mini", "Regular", "Party"], "Flavour", [
      ["🍿", "Caramel Popcorn", 3.99], ["🌮", "Nacho Chips", 3.29], ["🍘", "Rice Crackers", 2.79], ["🥨", "Giant Pretzel", 2.49], ["🥜", "Honey Peanuts", 3.19], ["🧇", "Mini Waffles", 3.75]]),
    sec("Sips", "🧋", "Cold, hot and fizzy.", ["straw", "mint", "lemon", "choc", "plain"], SZ3, "Flavour", [
      ["🧋", "Bubble Tea", 4.5], ["🥤", "Fizzy Soda", 1.99], ["🧃", "Mango Juice", 2.25], ["🍹", "Mocktail", 4.25], ["☕", "Hot Cocoa", 3.5], ["🍵", "Matcha Latte", 4.75]])
  ] },

  techhub: { icon: "🎧", name: "TechHub", tag: "Gadgets you'll love", color: "#5e35b1", sections: [
    sec("Audio", "🎧", "Hear every detail.", ["black", "white", "blue", "pink"], ["Lite", "Standard", "Pro"], "Colour", [
      ["🎧", "Wireless Headphones", 59.99], ["🔊", "Bluetooth Speaker", 34.99], ["🎤", "Karaoke Mic", 19.99], ["🎙️", "USB Microphone", 44.5], ["📻", "Retro Radio", 29], ["📢", "Megaphone Speaker", 24.99]]),
    sec("Phones & Wearables", "📱", "Stay connected on the go.", ["black", "silver", "pink", "green"], ["64 GB", "128 GB", "256 GB"], "Colour", [
      ["📱", "Smartphone", 299], ["⌚", "Fit Smart Watch", 49], ["🔋", "Power Bank", 22.5], ["🔌", "Fast Charger 30W", 17.99], ["📲", "Phone Case Pack", 12.99], ["🔦", "LED Torch", 9.99]]),
    sec("Computing", "💻", "Work and play, faster.", ["black", "silver", "white"], TECH, "Colour", [
      ["💻", "Laptop", 549], ["⌨️", "Mechanical Keyboard", 64.99], ["🖱️", "Wireless Mouse", 18.5], ["🖥️", "Monitor 24\"", 139], ["🖨️", "Inkjet Printer", 89], ["💽", "Portable SSD", 74]]),
    sec("Gaming & Cameras", "🎮", "Capture it. Play it.", ["black", "white", "red", "blue"], TECH, "Colour", [
      ["🎮", "Game Controller", 39.99], ["📷", "Mirrorless Camera", 429], ["🕹️", "Arcade Joystick", 29], ["📺", "Smart TV 43\"", 289], ["🎥", "Action Cam", 119], ["📹", "HD Webcam", 35]])
  ] },

  decor: { icon: "🪴", name: "Haven Decor", tag: "Aesthetic home & gifts", color: "#00897b", sections: [
    sec("Lights & Candles", "🕯️", "Warm glow for every corner.", ["white", "beige", "pink", "purple"], SZ3, "Colour", [
      ["🕯️", "Vanilla Candle", 11.5], ["💡", "Fairy Lights", 12.99], ["🏮", "Paper Lantern", 8.5], ["🪔", "Clay Oil Lamp", 9.99], ["🌙", "Moon Night Lamp", 21.99], ["✨", "Star String Lights", 14.5]]),
    sec("Plants & Vases", "🪴", "Bring a little green indoors.", ["green", "white", "pink", "beige"], SZ3, "Colour", [
      ["🪴", "Potted Plant", 15.99], ["🌵", "Mini Cactus", 6.99], ["🌿", "Succulent Pot", 9.99], ["🌷", "Dried Tulips", 13.5], ["🏺", "Ceramic Vase", 24], ["🌸", "Silk Blossoms", 11]]),
    sec("Wall & Cozy", "🖼️", "Make the room feel like you.", ["white", "beige", "pink", "black", "blue"], SZ3, "Colour", [
      ["🖼️", "Framed Art Print", 28], ["🪞", "Round Mirror", 35], ["🧸", "Plush Bear", 16.5], ["🧶", "Knit Throw", 32], ["⏰", "Wall Clock", 19.99], ["🛋️", "Cushion Cover Set", 18.5]])
  ] },

  paper: { icon: "✏️", name: "Paper Palace", tag: "Stationery & art supplies", color: "#2e7d32", sections: [
    sec("Writing", "✏️", "Pens, pencils and more.", ["black", "blue", "red", "green", "pink", "purple"], ["Single", "Pack of 5", "Pack of 12"], "Colour", [
      ["✏️", "HB Pencils", 2.99], ["🖊️", "Ballpoint Pens", 3.49], ["🖍️", "Wax Crayons", 4.5], ["🖌️", "Paint Brush Set", 7.99], ["✒️", "Fountain Pen", 14.99], ["🖋️", "Gel Pen Set", 5.99]]),
    sec("Paper & Books", "📓", "Ideas deserve good paper.", ["black", "blue", "red", "beige", "pink"], ["A6", "A5", "A4"], "Colour", [
      ["📓", "Spiral Notebook", 4.99], ["📒", "Ruled Ledger", 6.5], ["📔", "Leather Journal", 15.99], ["📝", "Memo Pad", 2.49], ["📅", "Weekly Planner", 9.99], ["📚", "Study Book Bundle", 18]]),
    sec("Desk & Art", "📎", "Everything for a tidy desk.", ["black", "white", "blue", "red", "green"], ["Mini", "Standard", "Jumbo"], "Colour", [
      ["📎", "Paper Clips", 1.99], ["✂️", "Scissors", 3.99], ["📏", "Steel Ruler", 2.49], ["🗂️", "File Folders", 5.5], ["🧮", "Calculator", 12.99], ["📌", "Push Pins", 1.79]])
  ] },

  aurora: { icon: "🧴", name: "Aurora Bottles", tag: "Drinkware built to last", color: "#1565c0", sections: [
    sec("Drinkware", "🥤", "Keeps drinks cold for 24 hours.", ["black", "blue", "green", "orange", "pink"], ["350 ml", "500 ml", "750 ml"], "Colour", [
      ["🥤", "Steel Tumbler", 19.99], ["☕", "Travel Mug", 17.5], ["🍶", "Glass Flask", 15.99], ["🍱", "Bento Lunch Box", 24.5], ["🥡", "Food Jar", 21], ["🧊", "Ice Cube Trays", 6.5]]),
    sec("Care & Extras", "🧽", "Look after your bottles.", ["white", "blue", "green"], ["Basic", "Standard", "Deluxe"], "Colour", [
      ["🧽", "Bottle Cleaning Kit", 8.99], ["🍵", "Tea Infuser", 7.5], ["🥄", "Cutlery Set", 11.99], ["🧴", "Soap Dispenser", 9.5], ["🧃", "Reusable Straws", 4.5], ["🧺", "Picnic Basket", 29]])
  ] }
};

/* flatten into PRODUCTS / OPTS and give every section the ids of its products */
const PRODUCTS = {}, OPTS = {};
Object.entries(SHOPS).forEach(([k, s]) => {
  let n = 0;
  s.sections.forEach(c => {
    c.ids = c.items.map(([e, name, p, d]) => {
      const id = k + (++n);
      PRODUCTS[id] = { id, e, n: name, p, d: d || c.b, shop: k, sec: c.n };
      OPTS[id] = { c: c.c, s: c.s, ol: c.ol };
      return id;
    });
  });
});

/* ---------- Descriptions for every product ---------- */
const DESCS = {
  "Red Apples":"Crisp, juicy and naturally sweet. Picked at peak ripeness for a satisfying crunch.",
  "Bananas":"Creamy, energy-packed bananas, ripened slowly so they are perfect for breakfast or smoothies.",
  "Green Grapes":"Seedless, snappy and refreshingly sweet. Chill them for the perfect healthy snack.",
  "Strawberries":"Plump, fragrant berries with a deep red colour. Wonderful with cream or on pancakes.",
  "Carrots":"Sweet, crunchy and full of vitamin A. Great raw, roasted or in a hearty soup.",
  "Broccoli":"Tight, deep-green florets packed with fibre and vitamin C. Steam, roast or stir-fry.",
  "French Baguette":"Golden crust, soft airy middle. Baked fresh every morning in the traditional way.",
  "Sliced Bread":"Soft, evenly sliced loaf for toast, sandwiches and lazy breakfasts.",
  "Butter Croissant":"Flaky, buttery layers that shatter with every bite. Best enjoyed warm.",
  "Cupcakes":"Fluffy sponge topped with silky frosting. Add a short message in icing to make it personal.",
  "Glazed Donuts":"Light, pillowy rings dipped in a shiny sugar glaze. Impossible to stop at one.",
  "Bagels":"Chewy, dense and boiled before baking. Pair with cream cheese or smoked salmon.",
  "Fresh Milk":"Pasteurised full-cream milk, chilled and delivered fresh from local farms.",
  "Cheddar Block":"Mature, sharp and crumbly. Perfect for sandwiches, grating and cheese boards.",
  "Salted Butter":"Rich, creamy butter with a pinch of sea salt. Ideal for baking and spreading.",
  "Free-range Eggs":"Eggs from hens that roam freely. Deep golden yolks and a rich flavour.",
  "Greek Yoghurt":"Thick, tangy and high in protein. Spoon it over fruit or use it in dressings.",
  "Mozzarella":"Soft, stretchy and mild. The secret to the perfect homemade pizza.",
  "Frozen Pizza":"Stone-baked style crust with a generous layer of cheese. Ready in 12 minutes.",
  "Ice-cream Tub":"Creamy, smooth and indulgent. A family-sized tub for movie nights.",
  "Crinkle Fries":"Crispy outside, fluffy inside. Oven or air-fryer ready in minutes.",
  "Chicken Nuggets":"Tender white-meat chicken in a golden crunchy coating. A kid-friendly favourite.",
  "Dumplings":"Hand-folded parcels with a savoury filling. Steam or pan-fry for a quick meal.",
  "Sweetcorn":"Sweet golden kernels frozen at their freshest. Add to salads, soups and stir-fries.",
  "Cola":"Ice-cold, fizzy and refreshing. The classic taste that goes with everything.",
  "Juice Box":"Fruity, no-added-sugar juice in a handy box with a straw. Lunch box ready.",
  "Green Tea":"Light, grassy and calming. Packed with antioxidants for a gentle pick-me-up.",
  "Coffee Beans":"Medium-roast whole beans with notes of chocolate and caramel. Grind fresh for best flavour.",
  "Spring Water":"Naturally filtered mountain spring water. Clean, crisp and refreshing.",
  "Iced Latte":"Smooth espresso with chilled milk over ice. Your café favourite, ready to sip.",
  "Popcorn":"Light, fluffy and lightly salted. Movie night is not complete without it.",
  "Pretzels":"Crunchy twisted snacks with a satisfying salty finish.",
  "Cookies":"Soft in the middle, crisp at the edges, full of chocolate chunks. Add a name in icing for a gift.",
  "Chocolate Bar":"Smooth milk chocolate with a melt-in-the-mouth finish. Choose a name to emboss on the bar.",
  "Roasted Peanuts":"Dry-roasted and lightly salted for a rich nutty crunch.",
  "Candy Mix":"A colourful mix of chewy, fruity and sour sweets for every sweet tooth.",
  "Shampoo":"Gentle daily shampoo that cleans, softens and leaves hair smelling fresh.",
  "Hand Soap":"Moisturising liquid soap with a fresh scent. Kind to hands, tough on germs.",
  "Toothbrush":"Soft, angled bristles that clean deep and protect your gums.",
  "Razor Set":"Smooth, close shave with a comfortable grip and pivoting head.",
  "Tissue Rolls":"Soft, strong, 3-ply tissue rolls made to be gentle and durable.",
  "Lip Balm":"Nourishing balm that keeps lips soft, smooth and protected all day.",
  "Broom":"Sturdy bristles and a long, comfortable handle. Sweeps up dust and crumbs in one pass.",
  "Sponge Pack":"Dual-sided sponges: soft for delicate dishes, scrubby for stubborn stains.",
  "Dish Soap":"Powerful grease-cutting formula that leaves plates sparkling and hands soft.",
  "Mop Bucket":"Heavy-duty bucket with a built-in wringer for fast, tidy floor cleaning.",
  "Laundry Basket":"Roomy, breathable basket with sturdy handles. Easy to carry and easy to store.",
  "Rubber Gloves":"Thick, flexible latex gloves with a grippy palm to protect your hands.",
  "Classic Cotton Tee":"Breathable 100% cotton tee with a soft feel. Add your name as embroidery on the chest.",
  "Satin Blouse":"Silky-smooth drape with a graceful shine. Dress it up or keep it casual.",
  "Formal Shirt":"Crisp, wrinkle-resistant cotton blend for the office and special occasions.",
  "Cozy Hoodie":"Brushed-fleece lining and a roomy hood. Add your name in stitched lettering.",
  "Knit Sweater":"Chunky knit that keeps you warm without the bulk. A winter essential.",
  "Denim Jacket":"Durable washed denim with a classic cut. Layers over almost anything.",
  "Slim Jeans":"Stretch denim with a slim, comfortable fit that moves with you.",
  "Chino Shorts":"Lightweight cotton shorts, perfect for warm days and weekend plans.",
  "Summer Dress":"Flowy, breathable dress with a flattering waist. Made for sunny days.",
  "Swimsuit":"Quick-dry, chlorine-resistant fabric with supportive, comfortable cut.",
  "Kimono Robe":"Light, elegant robe with wide sleeves. Perfect for relaxing at home.",
  "Cargo Pants":"Relaxed fit with roomy pockets and tough, hard-wearing fabric.",
  "Sneakers":"Cushioned soles and breathable mesh for all-day comfort and style.",
  "Heels":"Elegant mid-height heels with a cushioned insole for evenings out.",
  "Hiking Boots":"Waterproof leather with grippy soles. Built for rocks, mud and long trails.",
  "Sandals":"Light, adjustable straps and a cushioned footbed for warm-weather comfort.",
  "Cotton Socks":"Soft, breathable cotton with reinforced heels and toes.",
  "Ballet Flats":"Flexible, lightweight flats you can wear from morning to night.",
  "Canvas Cap":"Washed cotton cap with an adjustable strap. Add your name embroidered on the front.",
  "Wool Scarf":"Thick, soft wool scarf that wraps warmly around your neck.",
  "Winter Gloves":"Fleece-lined gloves with touchscreen fingertips to keep hands warm.",
  "Handbag":"Structured handbag with roomy compartments. Add initials as a gold foil stamp.",
  "Sunglasses":"UV400 protection with lightweight frames and a stylish look.",
  "Backpack":"Padded straps, laptop sleeve and water-resistant fabric. Add a stitched name patch.",
  "Swirl Lollipops":"Rainbow-swirled lollipops that last and last. A burst of fruity fun.",
  "Fruit Candies":"Soft, juicy candies bursting with real fruit flavour.",
  "Truffle Box":"Handmade chocolate truffles in a gift box. Add a personal message on the lid.",
  "Donut Box":"A dozen assorted donuts, glazed, sprinkled and filled. Share them (or don't).",
  "Caramel Pudding":"Silky custard pudding with a glossy caramel topping.",
  "Mochi Bites":"Soft, chewy rice-cake bites with a creamy centre. Light, sweet and fun.",
  "Caramel Popcorn":"Crunchy popcorn coated in buttery caramel. Sweet, salty and addictive.",
  "Nacho Chips":"Crispy corn chips perfect for dipping into salsa or melted cheese.",
  "Rice Crackers":"Light, crispy and lightly seasoned. A gluten-free crunch.",
  "Giant Pretzel":"Big, soft pretzel with coarse salt. Warm, chewy and satisfying.",
  "Honey Peanuts":"Roasted peanuts coated in sweet honey glaze for a sticky crunch.",
  "Mini Waffles":"Bite-sized golden waffles. Dip in syrup, chocolate or enjoy plain.",
  "Bubble Tea":"Creamy milk tea with chewy tapioca pearls. Shake, sip, smile.",
  "Fizzy Soda":"Bubbly, ice-cold fruit soda that sparkles on the tongue.",
  "Mango Juice":"Thick, sun-ripened mango juice with no artificial colour.",
  "Mocktail":"A fruity, fizzy blend with a splash of citrus. All the fun, none of the alcohol.",
  "Hot Cocoa":"Rich, velvety cocoa topped with whipped cream. Pure comfort in a cup.",
  "Matcha Latte":"Ceremonial-grade matcha whisked with steamed milk. Smooth and earthy.",
  "Wireless Headphones":"Active noise cancelling, 30-hour battery and crystal-clear sound.",
  "Bluetooth Speaker":"Powerful 360° sound in a compact, splash-proof body.",
  "Karaoke Mic":"Wireless mic with built-in speaker and echo. Sing your heart out.",
  "USB Microphone":"Studio-quality sound for streaming, calls and podcasts. Plug and play.",
  "Retro Radio":"Vintage looks with modern Bluetooth. FM tuner and warm wooden finish.",
  "Megaphone Speaker":"Loud, clear voice amplifier with a rechargeable battery.",
  "Smartphone":"Bright OLED display, fast chip and all-day battery with a sharp camera.",
  "Fit Smart Watch":"Tracks steps, sleep and heart rate. Week-long battery and water resistant.",
  "Power Bank":"20,000 mAh fast-charging battery. Charges your phone up to five times.",
  "Fast Charger 30W":"Compact USB-C charger that powers up a phone in under an hour.",
  "Phone Case Pack":"Shock-absorbing cases in a mix of colours. Add your name or initials on the back.",
  "LED Torch":"Ultra-bright, rechargeable torch with five modes and a long beam.",
  "Laptop":"Thin, light and fast with a sharp display and a battery that lasts all day.",
  "Mechanical Keyboard":"Clicky switches, RGB backlight and a solid aluminium frame.",
  "Wireless Mouse":"Ergonomic, silent clicks with a long-life battery. Add a laser-etched name.",
  "Monitor 24\"":"Full HD IPS panel with 75 Hz refresh. Slim bezels and eye-care mode.",
  "Inkjet Printer":"Wireless colour printer with scan and copy. Sharp text and vivid photos.",
  "Portable SSD":"Blazing-fast pocket storage. Transfer large files in seconds.",
  "Game Controller":"Responsive triggers, comfortable grip and long wireless range.",
  "Mirrorless Camera":"Pro-quality photos and 4K video in a compact, interchangeable-lens body.",
  "Arcade Joystick":"Clicky arcade stick with a sturdy base for retro and fighting games.",
  "Smart TV 43\"":"4K HDR picture with built-in streaming apps and voice control.",
  "Action Cam":"Waterproof, shake-free 4K camera made for adventures.",
  "HD Webcam":"1080p video with auto-focus and a built-in noise-cancelling mic.",
  "Vanilla Candle":"Hand-poured soy wax with a warm vanilla scent. Add a name on the jar label.",
  "Fairy Lights":"Warm white LED string lights for bedrooms, balconies and parties.",
  "Paper Lantern":"Soft, glowing lantern that adds a cosy, festive touch.",
  "Clay Oil Lamp":"Traditional hand-made clay lamp that glows with a gentle flame.",
  "Moon Night Lamp":"A 3D moon with a soft glow. Add a name or date engraved on the base.",
  "Star String Lights":"Twinkling star-shaped lights that turn any wall into a night sky.",
  "Potted Plant":"Easy-care indoor plant in a ceramic pot. Brings fresh air and calm.",
  "Mini Cactus":"Tiny, tough and charming. Needs almost no water or attention.",
  "Succulent Pot":"A cluster of succulents in a modern pot, ideal for a sunny desk.",
  "Dried Tulips":"Everlasting tulips that look beautiful for months without water.",
  "Ceramic Vase":"Hand-glazed ceramic vase with a smooth finish. Add a name or date engraved on it.",
  "Silk Blossoms":"Lifelike silk flowers that never wilt. Instant colour for any room.",
  "Framed Art Print":"Gallery-quality print in a wooden frame. Add a short quote or name below the art.",
  "Round Mirror":"Slim metal frame and a crystal-clear mirror that opens up any room.",
  "Plush Bear":"Super-soft, huggable bear with a stitched message on the paw.",
  "Knit Throw":"Chunky knit blanket that is warm, snuggly and sofa-ready.",
  "Wall Clock":"Silent sweep movement and a clean face. Add a name or date engraved on the dial.",
  "Cushion Cover Set":"Soft, zip-closure covers in coordinated patterns. Add a monogram in stitching.",
  "HB Pencils":"Smooth, dark-writing HB pencils in a sturdy box. Perfect for school and sketching.",
  "Ballpoint Pens":"Smooth-flowing ink and a comfortable grip for neat, smudge-free writing.",
  "Wax Crayons":"Bright, non-toxic crayons that blend beautifully on paper.",
  "Paint Brush Set":"Assorted soft-tip brushes for watercolour, acrylic and detail work.",
  "Fountain Pen":"Elegant steel nib and a refillable cartridge. Add your name laser-engraved on the barrel.",
  "Gel Pen Set":"Vivid, quick-drying gel ink in a rainbow of colours.",
  "Spiral Notebook":"Strong spiral binding and thick pages. Add your name on the cover.",
  "Ruled Ledger":"Hard-cover ledger with ruled pages for accounts and notes.",
  "Leather Journal":"Genuine leather cover with cream pages. Add your name debossed in gold.",
  "Memo Pad":"Tear-off memo pad for quick notes and reminders.",
  "Weekly Planner":"Week-at-a-glance layout with goals, habits and notes. Add your name on the cover.",
  "Study Book Bundle":"A set of textbooks, notebooks and guides to keep your studies organised.",
  "Paper Clips":"Rust-resistant steel clips that hold everything neatly together.",
  "Scissors":"Sharp stainless blades and comfy grips for paper, card and fabric.",
  "Steel Ruler":"Rust-proof steel ruler with clear etched markings.",
  "File Folders":"Sturdy folders that keep documents flat and sorted.",
  "Calculator":"Large-display solar calculator with all the scientific functions you need.",
  "Push Pins":"Colourful pins for boards, maps and mood walls.",
  "Steel Tumbler":"Double-wall steel keeps drinks cold for 24 hours. Add your name laser-engraved.",
  "Travel Mug":"Leak-proof lid and an insulated body. Hot for 12 hours. Add your name laser-engraved.",
  "Glass Flask":"Borosilicate glass flask with a protective sleeve. Add your name etched on the glass.",
  "Bento Lunch Box":"Compartment lunch box with leak-proof lids. Add your name on the lid.",
  "Food Jar":"Insulated food jar that keeps meals hot or cold. Add your name laser-engraved.",
  "Ice Cube Trays":"Flexible silicone trays that pop out cubes easily.",
  "Bottle Cleaning Kit":"Long brush and straw cleaner to keep every bottle spotless.",
  "Tea Infuser":"Fine steel mesh infuser for loose-leaf tea. Rich flavour, no leaves in your cup.",
  "Cutlery Set":"Portable stainless-steel fork, spoon and knife in a travel pouch.",
  "Soap Dispenser":"Refillable, easy-pump dispenser for kitchen or bathroom.",
  "Reusable Straws":"Set of steel straws with a cleaning brush. Better for you and the planet.",
  "Picnic Basket":"Woven basket with sturdy handles and room for a feast."
};

/* products that can be personalised: name -> [style, where the text goes] */
const ENGRAVE = {
  "Cupcakes":["icing","Write a message in icing"], "Cookies":["icing","Write a name in icing"],
  "Chocolate Bar":["emboss","Emboss a name on the bar"], "Truffle Box":["gold","Gold-foil message on the lid"],
  "Glazed Donuts":["icing","Write a message in icing"], "Caramel Pudding":["icing","Write a message in caramel"],
  "Classic Cotton Tee":["stitch","Embroider a name on the chest"], "Cozy Hoodie":["stitch","Stitch a name on the front"],
  "Canvas Cap":["stitch","Embroider a name on the cap"], "Backpack":["stitch","Stitch a name patch"],
  "Handbag":["gold","Gold foil initials"], "Knit Sweater":["stitch","Stitch a name on the front"],
  "Steel Tumbler":["laser","Laser-engrave a name"], "Travel Mug":["laser","Laser-engrave a name"],
  "Glass Flask":["laser","Etch a name on the glass"], "Food Jar":["laser","Laser-engrave a name"],
  "Bento Lunch Box":["laser","Print a name on the lid"],
  "Leather Journal":["gold","Deboss a name in gold"], "Spiral Notebook":["gold","Print a name on the cover"],
  "Weekly Planner":["gold","Print a name on the cover"], "Fountain Pen":["laser","Laser-engrave the barrel"],
  "Framed Art Print":["gold","Add a quote or name"], "Ceramic Vase":["laser","Engrave a name or date"],
  "Plush Bear":["stitch","Stitch a message on the paw"], "Cushion Cover Set":["stitch","Stitch a monogram"],
  "Wall Clock":["laser","Engrave a name on the dial"], "Vanilla Candle":["emboss","Label the jar"],
  "Moon Night Lamp":["laser","Engrave the base"], "Phone Case Pack":["laser","Print a name on the case"],
  "Wireless Mouse":["laser","Laser-etch a name"], "Power Bank":["laser","Laser-etch a name"]
};
Object.values(PRODUCTS).forEach(p => { p.d = DESCS[p.n] || p.d; p.eng = ENGRAVE[p.n] || null; });
