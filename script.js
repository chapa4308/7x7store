const CATEGORY_LABELS = {
  all: "All",
  clothes: "Clothing",
  shoes: "Shoes",
  accessories: "Accessories",
  bags: "Bags",
  hats: "Hats",
  other: "Other",
};

const TELEGRAM_FALLBACK_URL = "https://t.me/suckloui";

async function loadProducts() {
  const productsGrid = document.getElementById("productsGrid");
  const emptyState = document.getElementById("emptyState");

  const searchInput = document.getElementById("searchInput");
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");
  const resetFiltersBtn = document.getElementById("resetFilters");
  const clearFiltersEmpty = document.getElementById("clearFiltersEmpty");
  const categoriesNav = document.getElementById("categoriesNav");

  let products = [];
  let filtered = [];
  let currentCategory = "all";

  try {
    const response = await fetch("products.json");
    if (!response.ok) throw new Error("Failed to load products.json");
    products = await response.json();

    // Убираем дубликаты по ID
    const seen = new Set();
    products = products.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

  } catch (e) {
    console.error(e);
    products = [];
  }

  renderCategoryChips();
  filtered = [...products];
  render();
  attachEvents();
  initScrollReveal();

  // ===== Функции =====

  function renderCategoryChips() {
    categoriesNav.innerHTML = "";
    Object.entries(CATEGORY_LABELS).forEach(([value, label]) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "category-chip";
      if (value === currentCategory) chip.classList.add("is-active");
      chip.dataset.value = value;
      chip.textContent = label;
      chip.addEventListener("click", () => {
        currentCategory = value;
        document.querySelectorAll(".category-chip").forEach(el => el.classList.remove("is-active"));
        chip.classList.add("is-active");
        applyFilters();
      });
      categoriesNav.appendChild(chip);
    });
  }

  function parsePrice(priceStr) {
    if (!priceStr) return null;
    const match = String(priceStr).match(/(\d[\d\s.,]*)/);
    if (!match) return null;
    const normalized = match[1].replace(/\s/g, "").replace(",", ".");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const minPrice = minPriceInput.value ? Number(minPriceInput.value) : null;
    const maxPrice = maxPriceInput.value ? Number(maxPriceInput.value) : null;

    filtered = products.filter((p) => {
      const text = (p.title || "") + " " + (p.description || "") + " " + (p.price || "");
      const matchesQuery = text.toLowerCase().includes(query);

      const numericPrice = parsePrice(p.price);
      let matchesPrice = true;
      if (minPrice !== null && numericPrice !== null) matchesPrice = numericPrice >= minPrice;
      if (maxPrice !== null && numericPrice !== null) matchesPrice = matchesPrice && numericPrice <= maxPrice;

      const category = (p.category || "other").toLowerCase();
      const matchesCategory = currentCategory === "all" || category === currentCategory;

      return matchesQuery && matchesPrice && matchesCategory;
    });

    render();
    initScrollReveal();
  }

  function render() {
    productsGrid.innerHTML = "";

    if (!filtered.length) {
      productsGrid.classList.add("is-hidden");
      emptyState.classList.remove("is-hidden");
      return;
    }

    productsGrid.classList.remove("is-hidden");
    emptyState.classList.add("is-hidden");

    filtered.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const imgWrapper = document.createElement("a");
      imgWrapper.className = "product-image-wrapper";
      imgWrapper.href = product.telegramLink || TELEGRAM_FALLBACK_URL;
      imgWrapper.target = "_blank";
      imgWrapper.rel = "noopener noreferrer";

      const img = document.createElement("img");
      img.src = product.imageUrl || "https://via.placeholder.com/400x400/450a0a/fef2f2?text=7x7+STORE";
      img.alt = product.title || "Product";

      imgWrapper.appendChild(img);
      card.appendChild(imgWrapper);

      const body = document.createElement("div");
      body.className = "product-body";

      const titleEl = document.createElement("h2");
      titleEl.className = "product-title";
      titleEl.textContent = product.title || "Product";

      const descEl = document.createElement("p");
      descEl.className = "product-description";
      descEl.textContent = product.description || "Description will be loaded from Telegram.";

      const footer = document.createElement("div");
      footer.className = "product-footer";

      const priceEl = document.createElement("div");
      priceEl.className = "product-price";
      priceEl.innerHTML = product.price
        ? `${product.price} <span>per item</span>`
        : "<span>Price in description</span>";

      const btn = document.createElement("button");
      btn.className = "buy-button";
      btn.textContent = "Buy in Telegram";
      btn.addEventListener("click", () => {
  // Всегда открывать чат с твоим аккаунтом
  const myAccountUrl = "https://t.me/suckloui"; // <-- сюда свой username
  window.open(myAccountUrl, "_blank", "noopener,noreferrer");
});


      footer.appendChild(priceEl);
      footer.appendChild(btn);

      body.appendChild(titleEl);
      body.appendChild(descEl);
      body.appendChild(footer);
      card.appendChild(body);

      productsGrid.appendChild(card);
    });
  }

  function resetFilters() {
    searchInput.value = "";
    minPriceInput.value = "";
    maxPriceInput.value = "";
    currentCategory = "all";
    document.querySelectorAll(".category-chip").forEach(el => el.classList.remove("is-active"));
    const allChip = document.querySelector('.category-chip[data-value="all"]');
    if (allChip) allChip.classList.add("is-active");
    filtered = [...products];
    render();
    initScrollReveal();
  }

  function attachEvents() {
    searchInput.addEventListener("input", applyFilters);
    minPriceInput.addEventListener("input", applyFilters);
    maxPriceInput.addEventListener("input", applyFilters);
    resetFiltersBtn.addEventListener("click", resetFilters);
    clearFiltersEmpty.addEventListener("click", resetFilters);
  }

  // ===== Scroll Reveal Animation =====
  function initScrollReveal() {
    const cards = document.querySelectorAll(".product-card");
    const revealOnScroll = () => {
      const windowBottom = window.innerHeight + window.scrollY;
      cards.forEach(card => {
        const cardTop = card.offsetTop + 50;
        if (windowBottom > cardTop) {
          card.classList.add("show");
        }
      });
    };
    revealOnScroll();
    window.addEventListener("scroll", revealOnScroll);
  }
}

document.addEventListener("DOMContentLoaded", loadProducts);
