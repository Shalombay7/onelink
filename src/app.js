// app.js

// 1. Configuration & Data
const CONFIG = {
  currency: "USD",
  whatsappNumber: "15550109999", // REPLACE with real number (no + sign)
};

const fleet = [
  {
    id: "eco1",
    name: "Toyota Yaris",
    type: "Economy",
    price: 45,
    image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Toyota+Yaris",
  },
  {
    id: "sedan1",
    name: "Honda Civic",
    type: "Sedan",
    price: 65,
    image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Honda+Civic",
  },
  {
    id: "suv1",
    name: "Hyundai Tucson",
    type: "SUV",
    price: 95,
    image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Hyundai+Tucson",
  },
  {
    id: "lux1",
    name: "Mercedes C-Class",
    type: "Luxury",
    price: 150,
    image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Mercedes+Benz",
  },
  {
    id: "van1",
    name: "Toyota HiAce",
    type: "Van",
    price: 120,
    image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Toyota+HiAce",
  },
];

// 2. DOM Elements
const els = {
  themeToggle: document.getElementById("themeToggle"),
  carouselTrack: document.getElementById("carouselTrack"),
  fleetGrid: document.getElementById("fleetGrid"),
  carSelect: document.getElementById("carSelect"),
  bookingForm: document.getElementById("bookingForm"),
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
  renderFleet();
  setupTheme();
  setupDateDefaults();
  setupEventListeners();
  updateSummary(); // Initial calculation
  
  els.footerYear.textContent = new Date().getFullYear();
  
  // Set generic WhatsApp links
  const waLink = `https://wa.me/${CONFIG.whatsappNumber}`;
  els.contactWa.href = waLink;
  els.floatWa.href = waLink;
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
      <h3>${car.name}</h3>
      <p>${car.type}</p>
      <div class="ol-card-price">
        $${car.price} <span>/ day</span>
      </div>
      <button class="ol-btn ol-btn-ghost ol-btn-full" style="margin-top:1rem" data-select-car="${car.id}">
        Book this car
      </button>
    </div>
  `
    )
    .join("");

  // Populate Select Dropdown
  els.carSelect.innerHTML = fleet
    .map((car) => `<option value="${car.id}">${car.name} ($${car.price}/day)</option>`)
    .join("");
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
  els.summary.rate.textContent = car ? `$${car.price}` : "-";
  
  if (car) {
    const total = car.price * duration;
    els.summary.total.textContent = `$${total}`;
  }
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  const car = fleet.find(c => c.id === data.carSelect);
  
  // Construct WhatsApp Message
  const text = `
*New Booking Request* 🚗
------------------
*Customer:* ${data.fullName}
*Phone:* ${data.phone}
*Email:* ${data.email || "N/A"}

*Vehicle:* ${car.name} (${car.type})
*Dates:* ${data.pickupDate} to ${data.returnDate}
*Pickup:* ${data.pickupLocation}
*Dropoff:* ${data.dropoffLocation}

*Notes:* ${data.notes || "None"}
------------------
Please confirm availability and total price.
  `.trim();

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// 6. Event Listeners
function setupEventListeners() {
  // Recalculate summary on any input change
  els.bookingForm.addEventListener("input", updateSummary);
  
  // Handle Submit
  els.bookingForm.addEventListener("submit", handleFormSubmit);
  
  // Theme Toggle
  els.themeToggle.addEventListener("click", toggleTheme);

  // Handle "Book this car" buttons in grid (Event Delegation)
  els.fleetGrid.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-select-car]');
    if (btn) {
      const carId = btn.getAttribute('data-select-car');
      els.carSelect.value = carId;
      updateSummary();
      document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
    }
  });
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

// Run
init();