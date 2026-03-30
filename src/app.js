// app.js

// 1. Configuration & Data
const CONFIG = {
  currency: "USD",
  whatsappNumber: "233242674116",
};

const IMAGE_BASE = "/public/images/fleet";
const assetPath = (fileName) => `${IMAGE_BASE}/${fileName}`;

const vehicleImages = {
  prado: assetPath("prado.jpeg"),
  pajero: assetPath("pajero.jpeg"),
  corolla: assetPath("corolla.jpeg"),
  accord: assetPath("accord.jpeg"),
  tucson: assetPath("tucson.jpeg"),
  sportage: assetPath("sportage.jpeg"),
};

const fleet = [
  {
    id: "4x4-1",
    name: "Toyota Land Cruiser Prado",
    type: "4x4",
    price: 180,
    transmission: "Automatic",
    seats: 7,
    image: vehicleImages.prado,
  },
  {
    id: "4x4-2",
    name: "Mitsubishi Pajero Sport",
    type: "4x4",
    price: 165,
    transmission: "Automatic",
    seats: 7,
    image: vehicleImages.pajero,
  },
  {
    id: "saloon-1",
    name: "Toyota Corolla",
    type: "Saloon",
    price: 75,
    transmission: "Automatic",
    seats: 5,
    image: vehicleImages.corolla,
  },
  {
    id: "saloon-2",
    name: "Honda Accord",
    type: "Saloon",
    price: 95,
    transmission: "Automatic",
    seats: 5,
    image: vehicleImages.accord,
  },
  {
    id: "suv-1",
    name: "Hyundai Tucson",
    type: "SUV",
    price: 120,
    transmission: "Automatic",
    seats: 5,
    image: vehicleImages.tucson,
  },
  {
    id: "suv-2",
    name: "Kia Sportage",
    type: "SUV",
    price: 115,
    transmission: "Automatic",
    seats: 5,
    image: vehicleImages.sportage,
  },
];

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CONFIG.currency,
  maximumFractionDigits: 0,
});

const cart = [];

// 2. DOM Elements
const els = {
  themeToggle: document.getElementById("themeToggle"),
  carouselTrack: document.getElementById("carouselTrack"),
  fleetGrid: document.getElementById("fleetGrid"),
  carSelect: document.getElementById("carSelect"),
  bookingForm: document.getElementById("bookingForm"),
  cartCount: document.getElementById("cartCount"),
  cartItems: document.getElementById("cartItems"),
  cartEmpty: document.getElementById("cartEmpty"),
  cartSubtotal: document.getElementById("cartSubtotal"),
  cartCheckoutButton: document.getElementById("cartCheckoutButton"),
  clearCartButton: document.getElementById("clearCartButton"),
  inputs: {
    pickupDate: document.getElementById("pickupDate"),
    returnDate: document.getElementById("returnDate"),
    carSelect: document.getElementById("carSelect"),
    pickupLoc: document.getElementById("pickupLocation"),
    dropoffLoc: document.getElementById("dropoffLocation"),
  },
  summary: {
    car: document.getElementById("summaryCar"),
    dates: document.getElementById("summaryDates"),
    duration: document.getElementById("summaryDuration"),
    pickup: document.getElementById("summaryPickup"),
    dropoff: document.getElementById("summaryDropoff"),
    rate: document.getElementById("summaryRate"),
    total: document.getElementById("summaryTotal"),
  },
  footerYear: document.getElementById("footerYear"),
  contactWa: document.getElementById("contactWhatsAppLink"),
  floatWa: document.getElementById("floatingWhatsApp"),
};

// 3. Initialization
function init() {
  const heroBg = document.querySelector(".ol-hero-bg");
  if (heroBg && fleet[0]) {
    heroBg.style.backgroundImage = `url("${fleet[0].image}")`;
  }

  renderFleet();
  setupTheme();
  setupDateDefaults();
  setupEventListeners();
  updateSummary(); // Initial calculation
  renderCart();
  
  els.footerYear.textContent = new Date().getFullYear();
  
  updateWhatsAppLinks();
}

// 4. Rendering
function renderFleet() {
  // Populate Carousel (Hero)
  els.carouselTrack.innerHTML = fleet
    .map(
      (car) => `
    <div class="ol-slide">
      <img src="${car.image}" alt="${car.name}" loading="lazy" />
      <h4>${car.name}</h4>
      <p style="color: var(--text-muted); font-size: 0.9rem;">${car.type}</p>
    </div>
  `
    )
    .join("");

  // Populate Grid (Fleet Section)
  els.fleetGrid.innerHTML = fleet
    .map(
      (car) => `
    <div class="ol-card">
      <img src="${car.image}" alt="${car.name}" class="ol-card-image" loading="lazy" />
      <div class="ol-card-badges">
        <span class="ol-badge">${car.type}</span>
        <span class="ol-badge ol-badge-soft">${car.transmission}</span>
      </div>
      <h3>${car.name}</h3>
      <p>${car.seats} seats · ${car.transmission}</p>
      <div class="ol-card-price">
        ${formatMoney(car.price)} <span>/ day</span>
      </div>
      <div class="ol-card-actions">
        <button class="ol-btn ol-btn-ghost ol-btn-full" data-add-car="${car.id}">
          Add to cart
        </button>
        <button class="ol-btn ol-btn-primary ol-btn-full" data-book-car="${car.id}">
          WhatsApp checkout
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Populate Select Dropdown
  els.carSelect.innerHTML = fleet
    .map((car) => `<option value="${car.id}">${car.name} (${formatMoney(car.price)}/day)</option>`)
    .join("");

  if (!els.carSelect.value && fleet[0]) {
    els.carSelect.value = fleet[0].id;
  }
}

// 5. Logic & Calculations
function setupDateDefaults() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 3); // Default 3 day rental

  els.inputs.pickupDate.valueAsDate = today;
  els.inputs.returnDate.valueAsDate = tomorrow;
  
  // Min date constraints
  els.inputs.pickupDate.min = today.toISOString().split("T")[0];
  els.inputs.returnDate.min = today.toISOString().split("T")[0];
}

function updateSummary() {
  const carId = els.inputs.carSelect.value;
  const car = fleet.find((c) => c.id === carId);
  
  const start = new Date(els.inputs.pickupDate.value);
  const end = new Date(els.inputs.returnDate.value);
  
  // Calculate duration
  const diffTime = end - start;
  // If dates are invalid or end is before start, default to 1 day
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const duration = diffDays > 0 ? diffDays : 1; 

  // Update DOM
  els.summary.car.textContent = car ? car.name : "-";
  els.summary.dates.textContent = !isNaN(start) ? `${start.toLocaleDateString()} to ${end.toLocaleDateString()}` : "Invalid dates";
  els.summary.duration.textContent = `${duration} day(s)`;
  els.summary.pickup.textContent = els.inputs.pickupLoc.value || "Not specified";
  els.summary.dropoff.textContent = els.inputs.dropoffLoc.value || "Not specified";
  els.summary.rate.textContent = car ? formatMoney(car.price) : "-";
  
  if (car) {
    const total = car.price * duration;
    els.summary.total.textContent = formatMoney(total);
  }

  renderCart();
}

function getDurationInDays() {
  const start = new Date(els.inputs.pickupDate.value);
  const end = new Date(els.inputs.returnDate.value);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

function formatMoney(amount) {
  return moneyFormatter.format(amount);
}

function getSelectedCar() {
  return fleet.find((car) => car.id === els.inputs.carSelect.value) || fleet[0];
}

function getFormValues() {
  return Object.fromEntries(new FormData(els.bookingForm).entries());
}

function getCartCarsOrSelectedCar() {
  if (cart.length) {
    return cart.map((entry) => entry.car);
  }
  return [getSelectedCar()].filter(Boolean);
}

function buildWhatsAppMessage(cars, data, sourceLabel) {
  const duration = getDurationInDays();
  const total = cars.reduce((sum, car) => sum + car.price * duration, 0);
  const pickupDate = data.pickupDate || els.inputs.pickupDate.value;
  const returnDate = data.returnDate || els.inputs.returnDate.value;
  const pickupLocation = data.pickupLocation || els.inputs.pickupLoc.value || "Not specified";
  const dropoffLocation = data.dropoffLocation || els.inputs.dropoffLoc.value || "Not specified";
  const customerName = data.fullName || "Not yet provided";
  const customerPhone = data.phone || "Not yet provided";
  const customerEmail = data.email || "N/A";
  const notes = data.notes || "None";

  const carLines = cars
    .map((car, index) => {
      const lineTotal = car.price * duration;
      return `${index + 1}. ${car.name} (${car.type}) - ${formatMoney(car.price)}/day x ${duration} day(s) = ${formatMoney(lineTotal)}`;
    })
    .join("\n");

  return [
    "*OneLink Booking Request*",
    `Source: ${sourceLabel}`,
    "",
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Email: ${customerEmail}`,
    "",
    "*Selected vehicle(s)*",
    carLines,
    "",
    `Pickup date: ${pickupDate || "Not specified"}`,
    `Return date: ${returnDate || "Not specified"}`,
    `Duration: ${duration} day(s)`,
    `Pickup location: ${pickupLocation}`,
    `Drop-off location: ${dropoffLocation}`,
    "",
    `Notes: ${notes}`,
    "",
    `Estimated total: ${formatMoney(total)}`,
    "",
    "Please confirm availability and next payment steps.",
  ].join("\n");
}

function openWhatsAppCheckout(cars, sourceLabel = "Direct checkout") {
  const data = getFormValues();
  const message = buildWhatsAppMessage(cars, data, sourceLabel);
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function addCarToCart(carId) {
  const car = fleet.find((entry) => entry.id === carId);
  if (!car || cart.some((entry) => entry.car.id === car.id)) {
    return;
  }

  cart.push({ car });
  renderCart();
}

function removeCarFromCart(carId) {
  const index = cart.findIndex((entry) => entry.car.id === carId);
  if (index === -1) {
    return;
  }

  cart.splice(index, 1);
  renderCart();
}

function clearCart() {
  cart.length = 0;
  renderCart();
}

function renderCart() {
  const duration = getDurationInDays();

  if (!els.cartItems) {
    return;
  }

  els.cartCount.textContent = `${cart.length} item${cart.length === 1 ? "" : "s"}`;
  els.cartEmpty.hidden = cart.length > 0;

  if (!cart.length) {
    els.cartItems.innerHTML = "";
    els.cartSubtotal.textContent = formatMoney(0);
    els.cartCheckoutButton.disabled = true;
    return;
  }

  const subtotal = cart.reduce((sum, entry) => sum + entry.car.price * duration, 0);

  els.cartItems.innerHTML = cart
    .map(
      (entry) => `
        <div class="ol-cart-item">
          <div>
            <h4>${entry.car.name}</h4>
            <p>${entry.car.type} · ${formatMoney(entry.car.price)}/day</p>
          </div>
          <button type="button" class="ol-cart-remove" data-remove-car="${entry.car.id}">Remove</button>
        </div>
      `
    )
    .join("");

  els.cartSubtotal.textContent = formatMoney(subtotal);
  els.cartCheckoutButton.disabled = false;
}

function updateWhatsAppLinks() {
  const waLink = `https://wa.me/${CONFIG.whatsappNumber}`;
  if (els.contactWa) {
    els.contactWa.href = waLink;
  }
  if (els.floatWa) {
    els.floatWa.href = waLink;
  }
}

// 6. Event Listeners
function setupEventListeners() {
  // Recalculate summary on any input change
  els.bookingForm.addEventListener("input", updateSummary);
  
  // Handle Submit
  els.bookingForm.addEventListener("submit", handleFormSubmit);
  
  // Theme Toggle
  els.themeToggle.addEventListener("click", toggleTheme);

  // Handle fleet action buttons in grid
  els.fleetGrid.addEventListener("click", (e) => {
    const addButton = e.target.closest("[data-add-car]");
    const bookButton = e.target.closest("[data-book-car]");

    if (addButton) {
      addCarToCart(addButton.getAttribute("data-add-car"));
      return;
    }

    if (bookButton) {
      const carId = bookButton.getAttribute("data-book-car");
      const car = fleet.find((entry) => entry.id === carId);
      if (!car) {
        return;
      }

      els.carSelect.value = car.id;
      updateSummary();
      openWhatsAppCheckout([car], "Direct checkout");
    }
  });

  if (els.cartItems) {
    els.cartItems.addEventListener("click", (e) => {
      const removeButton = e.target.closest("[data-remove-car]");
      if (!removeButton) {
        return;
      }

      removeCarFromCart(removeButton.getAttribute("data-remove-car"));
    });
  }

  if (els.cartCheckoutButton) {
    els.cartCheckoutButton.addEventListener("click", () => {
      if (!cart.length) {
        return;
      }

      openWhatsAppCheckout(getCartCarsOrSelectedCar(), "Cart checkout");
    });
  }

  if (els.clearCartButton) {
    els.clearCartButton.addEventListener("click", clearCart);
  }
}

// 7. Theme Handling
function setupTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    els.themeToggle.querySelector("span").textContent = "☀️";
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  if (current === "dark") {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    els.themeToggle.querySelector("span").textContent = "🌙";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    els.themeToggle.querySelector("span").textContent = "☀️";
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  const cars = getCartCarsOrSelectedCar();
  const sourceLabel = cart.length ? "Cart checkout" : "Direct checkout";
  openWhatsAppCheckout(cars, sourceLabel);
}

// Run
init();
