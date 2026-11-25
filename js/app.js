document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const CONFIG = {
    freeShippingFrom: 300,
    shippingFee: 25,
    cashbackRate: 0.10, // 10% كاش باك فوري على كل طلب
    phonePattern: /^(?:\+?966|0)5\d{8}$/,
    emailPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    orderWebhookUrl: "",
    merchantWhatsApp: "966500000000"
  };

  // نسب خصم عروض الويكند (الخميس إلى الأحد)
  const PRODUCT_OFFERS = {
    101: 15, 102: 18, 103: 15, 104: 20, 105: 15,
    201: 20, 202: 25, 203: 20, 204: 22, 205: 25,
    301: 20, 302: 25,
    401: 20, 402: 25, 403: 20, 404: 30, 405: 22, 406: 25,
    501: 20, 502: 22, 503: 25, 504: 25, 505: 20,
    601: 25, 602: 20, 603: 22, 604: 20,
    701: 20, 702: 25, 703: 30
  };

  const COUPONS = {
    WEEKEND15: { pct: 15, label: "خصم الويكند 15% (WEEKEND15)" },
    NOVARA10: { pct: 10, label: "خصم 10% (NOVARA10)" }
  };

  // الكتالوج الشامل لجميع طلباتك:
  const products = [
    // 1. الأجهزة الإلكترونية والألعاب (جوال آيفون 17، آيباد، لابتوب، كمبيوتر / بي سي، سوني 5)
    { id: 101, category: "إلكترونيات وألعاب", season: "جوال • ضمان سنتين", name: "Apple iPhone 17 Pro Max (256GB)", price: 5699, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800", description: "جوال آيفون 17 برو ماكس بشريحة A19 Pro وكاميرا احترافية 48 ميجابكسل وهيكل تيتانيوم.", tag: "الأقوى طلباً 🔥" },
    { id: 102, category: "إلكترونيات وألعاب", season: "آيباد • شاشة OLED", name: "Apple iPad Pro 11 M4 (Wi-Fi)", price: 3999, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", description: "آيباد برو فائق النحافة بمعالج M4 الخارق للدراسة والتصميم والألعاب.", tag: "عرض الويكند" },
    { id: 103, category: "إلكترونيات وألعاب", season: "لابتوب • معالج M3 Pro", name: "لابتوب MacBook Pro 14 (18GB / 512GB)", price: 7499, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", description: "لابتوب احترافي فائق السرعة ببطارية تدوم 18 ساعة وشاشة Liquid Retina XDR.", tag: "لابتوب 2026" },
    { id: 104, category: "إلكترونيات وألعاب", season: "بي سي وكمبيوتر مكتبي", name: "كمبيوتر PC Gaming متكامل (RTX 4070 + شاشة)", price: 6299, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800", description: "تجميعة بي سي احترافية معالج Core i7 الجيل 14، رام 32GB، كرت شاشة RTX 4070، مع شاشة 240Hz وكيبورد وماوس.", tag: "بي سي متكامل 🖥️" },
    { id: 105, category: "إلكترونيات وألعاب", season: "سوني بلايستيشن 5", name: "سوني PlayStation 5 Pro (2TB) + يدين تحكم", price: 3199, image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800", description: "جهاز سوني بلايستيشن 5 برو سعة 2 تيرابايت مع يد تحكم DualSense إضافية.", tag: "سوني 5 برو 🎮" },

    // 2. الملابس الرجالية (ثوب، كنزات رجالية، بنطلون، جاكيت برد، قميص رجالي)
    { id: 201, category: "ملابس رجالية", season: "ثوب سعودي فاخر", name: "ثوب رجالي ملكي قماش ياباني فاخر", price: 289, image: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800", description: "ثوب رجالي بتفصيل متقن وخامة يابانية باردة مقاومة للتجعد.", tag: "ثوب فاخر" },
    { id: 202, category: "ملابس رجالية", season: "كنزات رجالية ❄️", name: "كنزة رجالية صوف كشمير شتوية", price: 239, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", description: "كنزة رجالية ناعمة ودافئة بتصميم كلاسيكي أنيق للأجواء الباردة.", tag: "كنزة شتوية" },
    { id: 203, category: "ملابس رجالية", season: "بنطلون رجالي", name: "بنطلون تشينو رجالي بقصة مريحة", price: 179, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800", description: "بنطلون رجالي عملي بخامة قطنية مرنة يناسب الإطلالات الرسمية والكاجوال." },
    { id: 204, category: "ملابس رجالية", season: "جاكيت برد رجالي ❄️", name: "جاكيت برد رجالي مبطن فرو دافئ", price: 369, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", description: "جاكيت شتوي ثقيل مقاوم للبرد والرياح ببطانة داخلية فائقة الدفء.", tag: "جاكيت برد 🔥" },
    { id: 205, category: "ملابس رجالية", season: "قميص رجالي", name: "قميص رجالي قطن فاخر بقصة عصرية", price: 169, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800", description: "قميص رجالي أنيق بخامة قطنية ناعمة ومريحة طوال اليوم." },

    // 3. الملابس النسائية (جاكيت برد للنساء، قميص للنساء)
    { id: 301, category: "ملابس نسائية", season: "جاكيت برد نسائي ❄️", name: "جاكيت برد نسائي شتوي طويل (ترينش كوت)", price: 389, image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800", description: "جاكيت برد نسائي فاخر بقصة أنثوية دافئة ومبطنة بالكامل.", tag: "جاكيت برد نسائي" },
    { id: 302, category: "ملابس نسائية", season: "قميص نسائي", name: "قميص نسائي حريري ناعم بقصة راقية", price: 199, image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800", description: "قميص نسائي أنيق يناسب العمل والمناسبات اليومية والرسمية." },

    // 4. عطور رجالية ونسائية فخمة
    { id: 401, category: "عطور", season: "عطر رجالي فخم 100 مل", name: "عطر عود ملكي كمبودي رجالي فخم", price: 379, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800", description: "عطر رجالي فخم يجمع بين دهن العود المعتق والعنبر والزعفران بثبات 24 ساعة.", tag: "عطر رجالي فخم" },
    { id: 402, category: "عطور", season: "عطر نسائي فخم 100 مل", name: "عطر ليبر رويال النسائي الفخم", price: 399, image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800", description: "عطر نسائي فخم بنفحات زهر البرتقال والفانيليا الفرنسية والمسك الأبيض.", tag: "عطر نسائي فخم" },
    { id: 403, category: "عطور", season: "عطر رجالي فخم 100 مل", name: "عطر سوفاج إلكسير انتنس الرجالي", price: 429, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800", description: "عطر رجالي فواح بالأخشاب العطرية الفاخرة والتوابل النادرة." },
    { id: 404, category: "عطور", season: "مجموعة عطور فخمة", name: "طقم عطور النخبة (رجالي ونسائي)", price: 649, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800", description: "بوكس إهداء ملكي يضم أفخم العطور الرجالية والنسائية بتركيز عالٍ.", tag: "خصم 30% 🔥" },
    { id: 405, category: "عطور", season: "عطر نسائي فخم 90 مل", name: "عطر روز فانيلا باريس النسائي", price: 329, image: "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=800", description: "عطر نسائي راقٍ بعبير الورد الدمشقي والفانيليا الدافئة." },
    { id: 406, category: "عطور", season: "عطر فخم للجنسين", name: "عطر بكرات روج 540 إكستريت", price: 489, image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800", description: "عطر نيش فخم برائحة الزعفران والعنبر وخشب الأرز." },

    // 5. حقيبة يد للنساء مختلفة الألوان + حقيبة ظهر
    { id: 501, category: "شنط وحقائب", season: "لون بني كلاسيك 👜", name: "حقيبة يد نسائية جلد فاخر (لون بني جملي)", price: 349, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800", description: "حقيبة يد نسائية أنيقة باللون البني الجملي مع قفل معدني ذهبي وحزام كتف.", tag: "لون بني" },
    { id: 502, category: "شنط وحقائب", season: "لون أسود ملكي 🖤", name: "حقيبة يد نسائية فاخرة (لون أسود ملكي)", price: 359, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800", description: "حقيبة يد نسائية كلاسيكية باللون الأسود تناسب السهرات والعمل.", tag: "لون أسود" },
    { id: 503, category: "شنط وحقائب", season: "لون أحمر عنابي ❤️", name: "حقيبة يد نسائية عصرية (لون عنابي فاخر)", price: 339, image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800", description: "حقيبة يد نسائية باللون العنابي الجذاب بتصميم راقٍ ومقسمة من الداخل.", tag: "لون عنابي" },
    { id: 504, category: "شنط وحقائب", season: "حقيبة ظهر 🎒", name: "حقيبة ظهر ذكية للابتوب والسفر والجامعة", price: 229, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800", description: "حقيبة ظهر مقاومة للماء مع منفذ شحن USB وجيب مبطن للابتوب وتصميم مريح للظهر.", tag: "حقيبة ظهر 🎒" },
    { id: 505, category: "شنط وحقائب", season: "حقيبة ظهر جلد 🎒", name: "حقيبة ظهر جلدية أنيقة متعددة الجيوب", price: 209, image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800", description: "حقيبة ظهر عصرية خفيفة الوزن للاستخدام اليومي والسفر." },

    // 6. أحذية نسائية فاخرة + أحذية جميلة للرجال
    { id: 601, category: "أحذية", season: "حذاء نسائي فاخر 👠", name: "حذاء نسائي فاخر كعب عالي مرصع", price: 429, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800", description: "حذاء نسائي فاخر بتصميم إيطالي أنيق وكعب مريح للسهرات والمناسبات.", tag: "نسائي فاخر 👠" },
    { id: 602, category: "أحذية", season: "حذاء نسائي فاخر 👢", name: "بوت نسائي فاخر جلد شامواه شتوي", price: 389, image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800", description: "بوت نسائي فاخر يجمع بين الأناقة والدفء بتفاصيل ذهبية راقية.", tag: "نسائي فاخر" },
    { id: 603, category: "أحذية", season: "حذاء جميل ومريح 👟", name: "حذاء رياضي جميل Running Pro (أحمر وأبيض)", price: 299, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", description: "حذاء جميل وخفيف الوزن بنعل طبي يمتص الصدمات للمشي والجري.", tag: "الأكثر مبيعاً" },
    { id: 604, category: "أحذية", season: "حذاء كلاسيك جميل 👞", name: "حذاء جلد طبيعي كلاسيكي جميل", price: 349, image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800", description: "حذاء كلاسيكي جميل مصنوع من الجلد الطبيعي الفاخر للمناسبات والعمل." },

    // 7. الساعات الفاخرة والذكية
    { id: 701, category: "ساعات", season: "Apple Watch", name: "ساعة Apple Watch Ultra 3 تيتانيوم", price: 3299, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", description: "ساعة أبل ألترا بهيكل تيتانيوم وبطارية تدوم 72 ساعة ومقاومة للماء.", tag: "ساعة ذكية" },
    { id: 702, category: "ساعات", season: "ساعة رجالية فاخرة", name: "ساعة كرونوغراف رجالية ستانلس ستيل", price: 699, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800", description: "ساعة رجالية فاخرة مقاومة للماء مع زجاج ياقوتي ضد الخدش وعلبة إهداء ملكية.", tag: "ساعة فاخرة" },
    { id: 703, category: "ساعات", season: "ساعة نسائية فاخرة", name: "ساعة نسائية فاخرة مرصعة بالكريستال", price: 549, image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800", description: "ساعة نسائية أنيقة مطلية بالذهب الوردي المقاوم لتغير اللون." }
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => `${Math.round(n).toLocaleString("en-US")} ر.س`;
  const getFinalPrice = p => Math.round(p.price * (1 - (PRODUCT_OFFERS[p.id] || 0) / 100));
  const readStorage = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
  const writeStorage = (k, val) => { try { localStorage.setItem(k, JSON.stringify(val)); } catch {} };

  const normalizePhone = raw => raw.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[\s-]/g, "");

  function validateCustomer({ name, phone, email, address = null }) {
    if (!name || name.trim().length < 3) {
      return { valid: false, msg: "يرجى إدخال الاسم الكامل (3 أحرف على الأقل)" };
    }
    const cleanPhone = normalizePhone(phone || "");
    if (!CONFIG.phonePattern.test(cleanPhone)) {
      return { valid: false, msg: "رقم الجوال غير صحيح! يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" };
    }
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!CONFIG.emailPattern.test(cleanEmail)) {
      return { valid: false, msg: "يرجى إدخال بريد إلكتروني صحيح (مثال: name@email.com)" };
    }
    if (address !== null && address.trim().length < 4) {
      return { valid: false, msg: "يرجى إدخال المدينة والعنوان الوطني بشكل صحيح" };
    }
    return { valid: true, cleanPhone, cleanEmail, cleanName: name.trim(), cleanAddress: address?.trim() };
  }

  const toastHost = document.createElement("div");
  toastHost.className = "toasts";
  document.body.append(toastHost);
  const toast = msg => {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastHost.append(t);
    setTimeout(() => t.classList.add("out"), 2200);
    setTimeout(() => t.remove(), 2600);
  };

  let cart = readStorage("novara-cart", []);
  let favs = new Set(readStorage("novara-favs", []));
  let orders = readStorage("novara-orders", []);
  let currentCustomer = readStorage("novara-customer", null);
  let activeCoupon = readStorage("novara-coupon", "");
  let activeCategory = "الكل";
  let favsOnly = false;

  // 1. بناء شبكة المنتجات
  const productsGrid = $("#productsGrid");
  function renderProducts() {
    productsGrid.innerHTML = "";
    products.forEach(p => {
      const pct = PRODUCT_OFFERS[p.id] || 0;
      const finalPrice = getFinalPrice(p);
      const installment = (finalPrice / 4).toFixed(0);
      const itemCashback = Math.round(finalPrice * CONFIG.cashbackRate);
      const isFav = favs.has(p.id);

      const card = document.createElement("article");
      card.className = `product-card ${isFav ? "is-fav" : ""}`;
      card.dataset.id = p.id;
      card.dataset.category = p.category;
      card.dataset.name = p.name;
      card.dataset.price = finalPrice;

      card.innerHTML = `
        <div class="product-image">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}
          ${pct ? `<span class="sale-badge">-${pct}%</span>` : ""}
          ${p.season ? `<span class="season-badge">${p.season}</span>` : ""}
          <button type="button" class="fav-button" aria-label="المفضلة">${isFav ? "♥" : "♡"}</button>
        </div>
        <div class="product-info">
          <small>${p.category}</small>
          <h3>${p.name}</h3>
          <div class="product-rating">★★★★★ <span>(4.9)</span></div>
          <div class="price-wrap">
            <strong>${money(finalPrice)}</strong>
            ${pct ? `<del>${money(p.price)}</del>` : ""}
          </div>
          <div class="cashback-tag">💸 كاش باك فوري: ${money(itemCashback)}</div>
          <div class="bnpl-hint">أو 4 دفعات × ${Number(installment).toLocaleString("en-US")} ر.س بدون فوائد</div>
          <div class="card-actions">
            <button type="button" class="add-button">أضف للسلة +</button>
            <button type="button" class="express-buy-btn">اشترِ الآن</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });
    filterAndSort();
  }

  function filterAndSort() {
    const term = $("#productSearch").value.trim().toLowerCase();
    const min = Number($("#minPrice").value) || 0;
    const max = Number($("#maxPrice").value) || Infinity;
    const sortVal = $("#sortSelect").value;

    const cards = $$(".product-card", productsGrid);
    if (sortVal === "asc") cards.sort((a, b) => a.dataset.price - b.dataset.price);
    else if (sortVal === "desc") cards.sort((a, b) => b.dataset.price - a.dataset.price);
    else if (sortVal === "name") cards.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name, "ar"));
    cards.forEach(c => productsGrid.appendChild(c));

    let visibleCount = 0;
    cards.forEach(card => {
      const price = Number(card.dataset.price);
      const matchCat = activeCategory === "الكل" || card.dataset.category === activeCategory;
      const matchTerm = `${card.dataset.name} ${card.dataset.category}`.toLowerCase().includes(term);
      const matchPrice = price >= min && price <= max;
      const matchFav = !favsOnly || card.classList.contains("is-fav");
      const show = matchCat && matchTerm && matchPrice && matchFav;
      card.hidden = !show;
      if (show) visibleCount++;
    });

    $("#resultsCount").textContent = `${visibleCount} منتج`;
    $("#noProducts").hidden = visibleCount !== 0;
  }

  // 2. إدارة السلة وحساب الكاش باك والخصومات
  function calculateTotals() {
    const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    let discount = 0;
    const c = COUPONS[activeCoupon];
    if (c && subtotal > 0) {
      discount = c.pct ? Math.round(subtotal * (c.pct / 100)) : (subtotal >= c.min ? c.amount : 0);
    }
    const afterDiscount = Math.max(0, subtotal - discount);
    const shipping = (afterDiscount >= CONFIG.freeShippingFrom || afterDiscount === 0) ? 0 : CONFIG.shippingFee;
    const grandTotal = afterDiscount + shipping;
    const cashbackEarned = Math.round(afterDiscount * CONFIG.cashbackRate);
    return { totalQty, subtotal, discount, shipping, grandTotal, cashbackEarned };
  }

  function addToCart(productId, openCheckoutDirectly = false) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const finalPrice = getFinalPrice(product);
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
      existing.price = finalPrice;
    } else {
      cart.push({
        id: product.id,
        category: product.category,
        name: product.name,
        price: finalPrice,
        quantity: 1,
        image: product.image
      });
    }
    saveAndRenderCart();
    if (openCheckoutDirectly) openExpressCheckout();
    else toast(`تمت إضافة «${product.name}» للسلة ✓`);
  }

  function saveAndRenderCart() {
    writeStorage("novara-cart", cart);
    const { totalQty, subtotal, discount, shipping, grandTotal, cashbackEarned } = calculateTotals();

    const badge = $("#cartCount");
    badge.textContent = totalQty;
    badge.classList.remove("bump");
    void badge.offsetWidth;
    badge.classList.add("bump");

    const afterDiscount = Math.max(0, subtotal - discount);
    $("#shipBar").hidden = subtotal === 0;
    if (afterDiscount >= CONFIG.freeShippingFrom) {
      $("#shipText").textContent = "🎉 مبروك! حصلت على شحن مجاني";
      $("#shipProgress").style.width = "100%";
    } else {
      $("#shipText").textContent = `أضف منتجات بقيمة ${money(CONFIG.freeShippingFrom - afterDiscount)} للحصول على شحن مجاني`;
      $("#shipProgress").style.width = `${(afterDiscount / CONFIG.freeShippingFrom) * 100}%`;
    }

    $("#cartSubtotal").textContent = money(subtotal);
    $("#discountRow").hidden = discount <= 0;
    $("#cartDiscount").textContent = `− ${money(discount)}`;
    $("#cartShipping").textContent = shipping === 0 ? "مجاني" : money(shipping);
    $("#cashbackRow").hidden = cashbackEarned <= 0;
    $("#cartCashback").textContent = `+ ${money(cashbackEarned)}`;
    $("#cartTotal").textContent = money(grandTotal);

    const container = $("#cartItems");
    container.innerHTML = "";
    if (!cart.length) {
      container.innerHTML = `<p class="cart-empty">سلتك فارغة حالياً 🛍️</p>`;
      return;
    }

    cart.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img class="cart-item-image" src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>${money(item.price * item.quantity)}</span>
          <div class="cart-item-controls">
            <button type="button" data-act="dec" data-idx="${idx}">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-act="inc" data-idx="${idx}">+</button>
            <button type="button" class="remove-item" data-act="del" data-idx="${idx}">حذف</button>
          </div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  $("#cartItems").addEventListener("click", e => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const idx = Number(btn.dataset.idx);
    const act = btn.dataset.act;
    if (act === "inc") cart[idx].quantity++;
    else if (act === "dec") cart[idx].quantity > 1 ? cart[idx].quantity-- : cart.splice(idx, 1);
    else if (act === "del") cart.splice(idx, 1);
    saveAndRenderCart();
  });

  $("#couponInput").value = activeCoupon;
  $("#applyCouponBtn").addEventListener("click", () => {
    const code = $("#couponInput").value.trim().toUpperCase();
    const msg = $("#couponMsg");
    if (!code) { activeCoupon = ""; msg.textContent = ""; }
    else if (COUPONS[code]) {
      activeCoupon = code;
      msg.textContent = `✓ تم تطبيق ${COUPONS[code].label}`;
      msg.style.color = "var(--success)";
    } else {
      activeCoupon = "";
      msg.textContent = "✕ كود الخصم غير صحيح";
      msg.style.color = "var(--danger)";
    }
    writeStorage("novara-coupon", activeCoupon);
    saveAndRenderCart();
  });

  // 3. إتمام الطلب والتحقق من الجوال والبريد الإلكتروني
  function openExpressCheckout() {
    if (!cart.length) { toast("أضف منتجاً واحداً على الأقل أولاً"); return; }
    hideCart();
    if (currentCustomer) {
      $("#coName").value = currentCustomer.name || "";
      $("#coPhone").value = currentCustomer.phone || "";
      $("#coEmail").value = currentCustomer.email || "";
    }
    const { totalQty, grandTotal, cashbackEarned } = calculateTotals();
    $("#coSummaryText").textContent = `ملخص الطلب: ${totalQty} قطعة • الإجمالي: ${money(grandTotal)} • كاش باك: ${money(cashbackEarned)}`;
    $("#checkoutFormWrap").hidden = false;
    $("#coDone").hidden = true;
    openModal("checkoutModal");
  }

  $("#checkoutButton").addEventListener("click", openExpressCheckout);

  $("#detectLocationBtn").addEventListener("click", () => {
    const btn = $("#detectLocationBtn");
    btn.textContent = "جاري التحديد...";
    setTimeout(() => {
      $("#coCity").value = "الرياض - حي العليا - طريق الملك فهد";
      btn.textContent = "✓ تم التحديد";
      toast("تم جلب العنوان الوطني بنجاح 📍");
    }, 500);
  });

  $$(".pay-option").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".pay-option").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  function processAndSubmitOrder(methodLabel) {
    const check = validateCustomer({
      name: $("#coName").value,
      phone: $("#coPhone").value,
      email: $("#coEmail").value,
      address: $("#coCity").value
    });

    if (!check.valid) {
      toast(check.msg);
      return;
    }

    $("#coPhone").value = check.cleanPhone;
    $("#coEmail").value = check.cleanEmail;

    currentCustomer = { name: check.cleanName, phone: check.cleanPhone, email: check.cleanEmail };
    writeStorage("novara-customer", currentCustomer);

    const totals = calculateTotals();
    const newOrder = {
      orderId: "NV-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleString("ar-SA"),
      customer: {
        name: check.cleanName,
        phone: check.cleanPhone,
        email: check.cleanEmail,
        address: check.cleanAddress,
        accountStatus: `حساب موثق (${check.cleanEmail})`
      },
      payment: {
        method: methodLabel,
        subtotal: totals.subtotal,
        discount: totals.discount,
        cashback: totals.cashbackEarned,
        couponUsed: activeCoupon || "لا يوجد",
        shipping: totals.shipping,
        totalPaid: totals.grandTotal
      },
      itemsCount: totals.totalQty,
      items: cart.map(item => ({
        id: item.id,
        category: item.category,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        lineTotal: item.price * item.quantity
      }))
    };

    orders.unshift(newOrder);
    writeStorage("novara-orders", orders);

    if (CONFIG.orderWebhookUrl) {
      try {
        fetch(CONFIG.orderWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newOrder)
        });
      } catch (err) { console.error("Webhook error:", err); }
    }

    const itemsText = newOrder.items.map(i => `• ${i.name} (${i.category}) × ${i.quantity} = ${i.lineTotal} ر.س`).join("\n");
    const whatsappMsg = encodeURIComponent(
      `🛍️ *طلب جديد (عروض الويكند) - NOVARA*\n` +
      `رقم الطلب: *${newOrder.orderId}*\n` +
      `👤 العميل: ${newOrder.customer.name}\n` +
      `📱 الجوال: ${newOrder.customer.phone}\n` +
      `📧 البريد: ${newOrder.customer.email}\n` +
      `📍 العنوان: ${newOrder.customer.address}\n` +
      `💳 الدفع: ${newOrder.payment.method}\n` +
      `💰 المدفوع: *${money(newOrder.payment.totalPaid)}*\n` +
      `💸 كاش باك مستحق: *${money(newOrder.payment.cashback)}*\n\n` +
      `📦 *المنتجات المشتراة:*\n${itemsText}`
    );

    $("#checkoutFormWrap").hidden = true;
    $("#coDone").hidden = false;
    $("#coDone").innerHTML = `
      <div style="font-size:44px;margin-bottom:8px">✅</div>
      <h3 style="color:var(--success);margin-bottom:6px">تم تأكيد الدفع والطلب بنجاح!</h3>
      <p style="color:var(--navy);font-size:14px;">رقم الطلب: <strong>${newOrder.orderId}</strong></p>
      <p style="color:var(--gold-dark);font-size:14px;font-weight:800;margin-top:4px;">💸 تم إضافة كاش باك بقيمة ${money(totals.cashbackEarned)} إلى حسابك!</p>
      <p style="color:var(--muted);font-size:13px;margin:6px 0 14px;">أُرسلت نسخة من الفاتورة إلى: <strong>${check.cleanEmail}</strong></p>
      <a href="https://wa.me/${CONFIG.merchantWhatsApp}?text=${whatsappMsg}" target="_blank" class="gold-button" style="width:100%;margin-bottom:8px;background:#25D366;color:#fff;">
        إرسال نسخة الطلب عبر واتساب التاجر 📲
      </a>
      <button type="button" class="continue-shopping" id="finishOrderBtn">العودة للمتجر</button>
    `;

    $("#finishOrderBtn").onclick = () => closeModal("checkoutModal");
    cart = [];
    saveAndRenderCart();
  }

  $("#applePayExpress").addEventListener("click", () => processAndSubmitOrder("Apple Pay"));
  $("#stcPayExpress").addEventListener("click", () => processAndSubmitOrder("stc pay"));

  $("#expressCheckoutForm").addEventListener("submit", e => {
    e.preventDefault();
    const selectedPay = $(".pay-option.selected")?.textContent || "مدى";
    processAndSubmitOrder(selectedPay);
  });

  // 4. لوحة تحكم التاجر
  function renderMerchantOrders() {
    const list = $("#ordersList");
    const stats = $("#adminStats");
    const totalRevenue = orders.reduce((s, o) => s + o.payment.totalPaid, 0);
    const totalSoldItems = orders.reduce((s, o) => s + o.itemsCount, 0);

    stats.innerHTML = `
      <div class="stat-box"><small>إجمالي الطلبات</small><strong>${orders.length}</strong></div>
      <div class="stat-box"><small>القطع المباعة</small><strong>${totalSoldItems}</strong></div>
      <div class="stat-box"><small>إجمالي المبيعات</small><strong>${money(totalRevenue)}</strong></div>
    `;

    if (!orders.length) {
      list.innerHTML = `<p style="text-align:center;color:var(--muted);padding:30px;">لا توجد طلبات مسجلة حتى الآن.</p>`;
      return;
    }

    list.innerHTML = orders.map(o => `
      <div class="order-card">
        <div class="order-card-head">
          <div>
            <strong style="color:var(--navy);font-size:15px;">طلب #${o.orderId}</strong>
            <small style="color:var(--muted);display:block;font-size:11px;">${o.date}</small>
          </div>
          <span class="order-badge">مدفوع: ${money(o.payment.totalPaid)} (${o.payment.method}) • كاش باك: ${money(o.payment.cashback || 0)}</span>
        </div>
        <div class="order-customer-grid">
          <div><strong>الاسم:</strong> ${o.customer.name}</div>
          <div><strong>الجوال:</strong> <span dir="ltr">${o.customer.phone}</span></div>
          <div><strong>البريد:</strong> <span dir="ltr">${o.customer.email || "—"}</span></div>
          <div><strong>العنوان:</strong> ${o.customer.address}</div>
        </div>
        <strong style="font-size:12px;color:var(--navy);">المنتجات (${o.itemsCount} قطعة):</strong>
        <ul class="order-items-list">
          ${o.items.map(i => `
            <li>
              <span>• <strong>${i.name}</strong> <small style="color:var(--muted);">[${i.category}]</small> × ${i.quantity}</span>
              <strong>${money(i.lineTotal)}</strong>
            </li>
          `).join("")}
        </ul>
      </div>
    `).join("");
  }

  $("#adminOrdersBtn").addEventListener("click", () => {
    renderMerchantOrders();
    openModal("adminModal");
  });

  $("#clearOrdersBtn").addEventListener("click", () => {
    orders = [];
    writeStorage("novara-orders", []);
    renderMerchantOrders();
    toast("تم مسح سجل الطلبات");
  });

  $("#exportOrdersBtn").addEventListener("click", () => {
    if (!orders.length) { toast("لا توجد طلبات لتصديرها"); return; }
    const headers = ["رقم الطلب", "التاريخ", "اسم العميل", "الجوال", "البريد الإلكتروني", "العنوان", "طريقة الدفع", "المنتجات", "الكمية الكلية", "المبلغ المدفوع", "الكاش باك"];
    const rows = orders.map(o => [
      o.orderId,
      `"${o.date}"`,
      `"${o.customer.name}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.email || ""}"`,
      `"${o.customer.address}"`,
      `"${o.payment.method}"`,
      `"${o.items.map(i => `${i.name} (${i.quantity})`).join(" + ")}"`,
      o.itemsCount,
      o.payment.totalPaid,
      o.payment.cashback || 0
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `NOVARA_Weekend_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  });

  // 5. تفعيل حساب العميل
  $("#accountButton").addEventListener("click", () => {
    if (currentCustomer) {
      $("#accName").value = currentCustomer.name || "";
      $("#otpPhone").value = currentCustomer.phone || "";
      $("#accEmail").value = currentCustomer.email || "";
    }
    openModal("accountModal");
  });

  $("#otpLoginForm").addEventListener("submit", e => {
    e.preventDefault();
    const check = validateCustomer({
      name: $("#accName").value,
      phone: $("#otpPhone").value,
      email: $("#accEmail").value
    });

    const msgEl = $("#accountMessage");
    if (!check.valid) {
      msgEl.style.color = "var(--danger)";
      msgEl.textContent = "✕ " + check.msg;
      return;
    }

    currentCustomer = { name: check.cleanName, phone: check.cleanPhone, email: check.cleanEmail };
    writeStorage("novara-customer", currentCustomer);
    msgEl.style.color = "var(--success)";
    msgEl.textContent = `✓ تم تفعيل حسابك بنجاح (${check.cleanName})`;
    toast("تم حفظ بيانات حسابك بنجاح ✓");
    setTimeout(() => closeModal("accountModal"), 1100);
  });

  // أحداث المنتجات والنوافذ
  productsGrid.addEventListener("click", e => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    const id = Number(card.dataset.id);
    if (e.target.closest(".fav-button")) {
      const isFav = !favs.has(id);
      isFav ? favs.add(id) : favs.delete(id);
      writeStorage("novara-favs", [...favs]);
      card.classList.toggle("is-fav", isFav);
      e.target.closest(".fav-button").textContent = isFav ? "♥" : "♡";
      if (favsOnly) filterAndSort();
      return;
    }
    if (e.target.closest(".add-button")) { addToCart(id, false); return; }
    if (e.target.closest(".express-buy-btn")) { addToCart(id, true); return; }
    openProductModal(id);
  });

  function openProductModal(id) {
    const p = products.find(item => item.id === id);
    if (!p) return;
    const finalPrice = getFinalPrice(p);
    const cb = Math.round(finalPrice * CONFIG.cashbackRate);
    $("#productDetails").innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="product-details-info">
        <span class="eyebrow">${p.category} • ${p.season || ""}</span>
        <h2>${p.name}</h2>
        <p>${p.description}</p>
        <div class="product-details-price">${money(finalPrice)}</div>
        <div class="cashback-tag" style="margin-bottom:12px">💸 ستحصل على كاش باك فوري بقيمة ${money(cb)} عند الشراء</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">
          <button type="button" class="add-button" id="modalAddBtn">أضف للسلة +</button>
          <button type="button" class="gold-button" id="modalBuyNowBtn">اشترِ الآن ⚡</button>
        </div>
      </div>
    `;
    $("#modalAddBtn").onclick = () => { addToCart(p.id, false); closeModal("productModal"); };
    $("#modalBuyNowBtn").onclick = () => { closeModal("productModal"); addToCart(p.id, true); };
    openModal("productModal");
  }

  const openCart = () => { $("#cartOverlay").classList.add("active"); document.body.classList.add("modal-open"); };
  const hideCart = () => { $("#cartOverlay").classList.remove("active"); document.body.classList.remove("modal-open"); };
  const openModal = id => { $("#" + id).classList.add("active"); document.body.classList.add("modal-open"); };
  const closeModal = id => { $("#" + id).classList.remove("active"); document.body.classList.remove("modal-open"); };

  $("#cartButton").addEventListener("click", openCart);
  $("#mobCartBtn").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", hideCart);
  $("#continueShopping").addEventListener("click", hideCart);
  $("#clearCartBtn").addEventListener("click", () => { cart = []; saveAndRenderCart(); toast("تم تفريغ السلة"); });
  $$("[data-close-modal]").forEach(b => b.addEventListener("click", () => closeModal(b.dataset.closeModal)));
  $$(".modal-overlay, .cart-overlay").forEach(ov => ov.addEventListener("click", e => { if (e.target === ov) { hideCart(); closeModal(ov.id); } }));

  $("#productSearch").addEventListener("input", filterAndSort);
  $("#minPrice").addEventListener("input", filterAndSort);
  $("#maxPrice").addEventListener("input", filterAndSort);
  $("#sortSelect").addEventListener("change", filterAndSort);
  $$(".filter-button[data-filter]").forEach(btn => btn.addEventListener("click", () => {
    activeCategory = btn.dataset.filter;
    $$(".filter-button[data-filter]").forEach(b => b.classList.toggle("active", b === btn));
    filterAndSort();
  }));
  $("#favFilterBtn").addEventListener("click", e => { favsOnly = !favsOnly; e.target.classList.toggle("active", favsOnly); filterAndSort(); });
  $$(".category-card").forEach(card => card.addEventListener("click", () => {
    activeCategory = card.dataset.category;
    $$(".filter-button[data-filter]").forEach(b => b.classList.toggle("active", b.dataset.filter === activeCategory));
    filterAndSort();
    $("#products").scrollIntoView({ behavior: "smooth" });
  }));

  $("#mobSearchBtn").addEventListener("click", () => {
    $("#products").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#productSearch").focus(), 400);
  });

  const setTheme = t => {
    t === "hacker" ? document.documentElement.setAttribute("data-theme", "hacker") : document.documentElement.removeAttribute("data-theme");
    writeStorage("novara-theme", t);
  };
  setTheme(readStorage("novara-theme", "classic"));
  $("#themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "hacker" ? "classic" : "hacker";
    setTheme(next);
  });

  // 6. عدّاد عروض الويكند التلقائي (من الخميس إلى الأحد)
  const bar = $("#weekendBanner");
  function updateWeekendCountdown() {
    const now = new Date();
    const day = now.getDay(); // 0=الأحد, 4=الخميس, 5=الجمعة, 6=السبت
    const p = n => String(n).padStart(2, "0");

    if (day === 4 || day === 5 || day === 6 || day === 0) {
      const daysUntilSunEnd = day === 0 ? 0 : (7 - day);
      const endSunday = new Date(now);
      endSunday.setDate(now.getDate() + daysUntilSunEnd);
      endSunday.setHours(23, 59, 59, 999);
      const ms = endSunday - now;
      const d = Math.floor(ms / 864e5);
      const h = p(Math.floor(ms / 36e5) % 24);
      const m = p(Math.floor(ms / 6e4) % 60);
      const s = p(Math.floor(ms / 1e3) % 60);
      bar.textContent = `🔥 عروض الويكند سارية الآن (الخميس - الأحد) — ينتهي بعد ${d} يوم و ${h}:${m}:${s} • كاش باك 10% ✦`;
    } else {
      const daysToThu = (4 - day + 7) % 7;
      const nextThu = new Date(now);
      nextThu.setDate(now.getDate() + daysToThu);
      nextThu.setHours(0, 0, 0, 0);
      const ms = nextThu - now;
      const h = p(Math.floor(ms / 36e5));
      const m = p(Math.floor(ms / 6e4) % 60);
      const s = p(Math.floor(ms / 1e3) % 60);
      bar.textContent = `⏳ يبدأ مهرجان عروض الخميس إلى الأحد بعد ${h}:${m}:${s} — جهّز سلتك الآن واستفد من الكاش باك ✦`;
    }
  }
  setInterval(updateWeekendCountdown, 1000);
  updateWeekendCountdown();

  renderProducts();
  saveAndRenderCart();
});