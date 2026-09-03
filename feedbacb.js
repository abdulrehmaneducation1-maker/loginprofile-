/* =====================================================================
   Feedback form: populates #country / #service selects, handles the
   star rating, validates, and saves the submission to Firestore.
   Expects markup: #feedback-form, #stars (span.star children with
   data-value), #name, #country, #service, #message, #status.

   IMPORTANT: your HTML must load this file as a module, e.g.:
   <script type="module" src="feedback.js"></script>
   ===================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvmhNdJ2HsCbXGXRNoK21Twb_1Z0F_Sx0",
  authDomain: "maan-profile.firebaseapp.com",
  projectId: "maan-profile",
  storageBucket: "maan-profile.firebasestorage.app",
  messagingSenderId: "961180009164",
  appId: "1:961180009164:web:2e37540549a06eddafb869",
  measurementId: "G-EXZJSGWQWB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function saveFeedback(review) {
  await addDoc(collection(db, "feedback"), review);
}

async function loadFeedbackList() {
  const snap = await getDocs(collection(db, "feedback"));
  return snap.docs.map(d => d.data());
}

// ISO 3166-1 alpha-2 code + English short name, all UN-recognized countries
const COUNTRIES = [
    ["AF", "Afghanistan"], ["AL", "Albania"], ["DZ", "Algeria"], ["AD", "Andorra"],
    ["AO", "Angola"], ["AG", "Antigua and Barbuda"], ["AR", "Argentina"], ["AM", "Armenia"],
    ["AU", "Australia"], ["AT", "Austria"], ["AZ", "Azerbaijan"], ["BS", "Bahamas"],
    ["BH", "Bahrain"], ["BD", "Bangladesh"], ["BB", "Barbados"], ["BY", "Belarus"],
    ["BE", "Belgium"], ["BZ", "Belize"], ["BJ", "Benin"], ["BT", "Bhutan"],
    ["BO", "Bolivia"], ["BA", "Bosnia and Herzegovina"], ["BW", "Botswana"], ["BR", "Brazil"],
    ["BN", "Brunei"], ["BG", "Bulgaria"], ["BF", "Burkina Faso"], ["BI", "Burundi"],
    ["CV", "Cabo Verde"], ["KH", "Cambodia"], ["CM", "Cameroon"], ["CA", "Canada"],
    ["CF", "Central African Republic"], ["TD", "Chad"], ["CL", "Chile"], ["CN", "China"],
    ["CO", "Colombia"], ["KM", "Comoros"], ["CG", "Congo"], ["CD", "Congo (DRC)"],
    ["CR", "Costa Rica"], ["CI", "Côte d'Ivoire"], ["HR", "Croatia"], ["CU", "Cuba"],
    ["CY", "Cyprus"], ["CZ", "Czechia"], ["DK", "Denmark"], ["DJ", "Djibouti"],
    ["DM", "Dominica"], ["DO", "Dominican Republic"], ["EC", "Ecuador"], ["EG", "Egypt"],
    ["SV", "El Salvador"], ["GQ", "Equatorial Guinea"], ["ER", "Eritrea"], ["EE", "Estonia"],
    ["SZ", "Eswatini"], ["ET", "Ethiopia"], ["FJ", "Fiji"], ["FI", "Finland"],
    ["FR", "France"], ["GA", "Gabon"], ["GM", "Gambia"], ["GE", "Georgia"],
    ["DE", "Germany"], ["GH", "Ghana"], ["GR", "Greece"], ["GD", "Grenada"],
    ["GT", "Guatemala"], ["GN", "Guinea"], ["GW", "Guinea-Bissau"], ["GY", "Guyana"],
    ["HT", "Haiti"], ["HN", "Honduras"], ["HU", "Hungary"], ["IS", "Iceland"],
    ["IN", "India"], ["ID", "Indonesia"], ["IR", "Iran"], ["IQ", "Iraq"],
    ["IE", "Ireland"], ["IT", "Italy"], ["JM", "Jamaica"],
    ["JP", "Japan"], ["JO", "Jordan"], ["KZ", "Kazakhstan"], ["KE", "Kenya"],
    ["KI", "Kiribati"], ["KP", "Korea (North)"], ["KR", "Korea (South)"], ["KW", "Kuwait"],
    ["KG", "Kyrgyzstan"], ["LA", "Laos"], ["LV", "Latvia"], ["LB", "Lebanon"],
    ["LS", "Lesotho"], ["LR", "Liberia"], ["LY", "Libya"], ["LI", "Liechtenstein"],
    ["LT", "Lithuania"], ["LU", "Luxembourg"], ["MG", "Madagascar"], ["MW", "Malawi"],
    ["MY", "Malaysia"], ["MV", "Maldives"], ["ML", "Mali"], ["MT", "Malta"],
    ["MH", "Marshall Islands"], ["MR", "Mauritania"], ["MU", "Mauritius"], ["MX", "Mexico"],
    ["FM", "Micronesia"], ["MD", "Moldova"], ["MC", "Monaco"], ["MN", "Mongolia"],
    ["ME", "Montenegro"], ["MA", "Morocco"], ["MZ", "Mozambique"], ["MM", "Myanmar"],
    ["NA", "Namibia"], ["NR", "Nauru"], ["NP", "Nepal"], ["NL", "Netherlands"],
    ["NZ", "New Zealand"], ["NI", "Nicaragua"], ["NE", "Niger"], ["NG", "Nigeria"],
    ["MK", "North Macedonia"], ["NO", "Norway"], ["OM", "Oman"], ["PK", "Pakistan"],
    ["PW", "Palau"], ["PS", "Palestine"], ["PA", "Panama"], ["PG", "Papua New Guinea"],
    ["PY", "Paraguay"], ["PE", "Peru"], ["PH", "Philippines"], ["PL", "Poland"],
    ["PT", "Portugal"], ["QA", "Qatar"], ["RO", "Romania"], ["RU", "Russia"],
    ["RW", "Rwanda"], ["KN", "Saint Kitts and Nevis"], ["LC", "Saint Lucia"],
    ["VC", "Saint Vincent and the Grenadines"], ["WS", "Samoa"], ["SM", "San Marino"],
    ["ST", "Sao Tome and Principe"], ["SA", "Saudi Arabia"], ["SN", "Senegal"],
    ["RS", "Serbia"], ["SC", "Seychelles"], ["SL", "Sierra Leone"], ["SG", "Singapore"],
    ["SK", "Slovakia"], ["SI", "Slovenia"], ["SB", "Solomon Islands"], ["SO", "Somalia"],
    ["ZA", "South Africa"], ["SS", "South Sudan"], ["ES", "Spain"], ["LK", "Sri Lanka"],
    ["SD", "Sudan"], ["SR", "Suriname"], ["SE", "Sweden"], ["CH", "Switzerland"],
    ["SY", "Syria"], ["TW", "Taiwan"], ["TJ", "Tajikistan"], ["TZ", "Tanzania"],
    ["TH", "Thailand"], ["TL", "Timor-Leste"], ["TG", "Togo"], ["TO", "Tonga"],
    ["TT", "Trinidad and Tobago"], ["TN", "Tunisia"], ["TR", "Turkey"], ["TM", "Turkmenistan"],
    ["TV", "Tuvalu"], ["UG", "Uganda"], ["UA", "Ukraine"], ["AE", "United Arab Emirates"],
    ["GB", "United Kingdom"], ["US", "United States"], ["UY", "Uruguay"], ["UZ", "Uzbekistan"],
    ["VU", "Vanuatu"], ["VA", "Vatican City"], ["VE", "Venezuela"], ["VN", "Vietnam"],
    ["YE", "Yemen"], ["ZM", "Zambia"], ["ZW", "Zimbabwe"]
];

const SERVICES = [
    "E-commerce Specialist",
    "WordPress Website Designer",
    "Graphic Designer",
    "Virtual Assistant Freelancer",
    "UX/UI Designer",
    "Account Management"
];

// Used only to display a short country badge on review cards — the form
// itself still stores/submits the full country name.
const COUNTRY_CODE_BY_NAME = Object.fromEntries(COUNTRIES.map(([code, name]) => [name, code]));

function populateCountrySelect() {
    const select = document.getElementById("fb-country");
    if (!select) return;

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select your country";
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    COUNTRIES.forEach(([, name]) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function populateServiceSelect() {
    const select = document.getElementById("fb-service");
    if (!select) return;

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a service";
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    SERVICES.forEach(service => {
        const option = document.createElement("option");
        option.value = service;
        option.textContent = service;
        select.appendChild(option);
    });
}

// Populate the selects first, before anything reads their values.
populateCountrySelect();
populateServiceSelect();

const legacyFeedbackForm = document.getElementById("feedback-form");
const legacyStarsWrap = document.getElementById("stars");

if (legacyFeedbackForm && legacyStarsWrap) {
    let currentRating = 0;
    const legacyStatusEl = document.getElementById("status");

    legacyStarsWrap.querySelectorAll("span").forEach(star => {
        star.addEventListener("click", () => {
            currentRating = Number(star.dataset.value);
            paintLegacyStars();
        });
    });

    function paintLegacyStars() {
        legacyStarsWrap.querySelectorAll("span").forEach(star => {
            star.classList.toggle("filled", Number(star.dataset.value) <= currentRating);
        });
    }

    function setStatus(text, color) {
        if (!legacyStatusEl) return;
        legacyStatusEl.textContent = text;
        legacyStatusEl.style.color = color;
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function initials(name) {
        return name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(w => w[0].toUpperCase())
            .join("");
    }

    function avatarColor(name) {
        const palette = ["#f39c12", "#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#1abc9c"];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return palette[Math.abs(hash) % palette.length];
    }

    function renderReviews(reviews) {
        const listEl = document.getElementById("reviewList");
        const avgNum = document.getElementById("avgNum");
        const avgStars = document.getElementById("avgStars");
        const avgCount = document.getElementById("avgCount");
        if (!listEl) return;

        if (!reviews.length) {
            if (avgNum) avgNum.textContent = "–";
            if (avgStars) avgStars.textContent = "";
            if (avgCount) avgCount.textContent = "No ratings yet";
            listEl.innerHTML = '<div class="empty">Be the first to leave feedback.</div>';
            return;
        }

        const sorted = [...reviews].sort((a, b) => b.timestamp - a.timestamp);
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        if (avgNum) avgNum.textContent = avg.toFixed(1);
        if (avgStars) avgStars.textContent = "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));
        if (avgCount) avgCount.textContent = reviews.length + (reviews.length === 1 ? " rating" : " ratings");

        const cardsHtml = sorted.map(r => {
            const code = COUNTRY_CODE_BY_NAME[r.country] || (r.country || "").slice(0, 2).toUpperCase();
            return `
            <div class="review-card">
                <div class="review-card-head">
                    <div class="review-avatar" style="background:${avatarColor(r.name)}">${escapeHtml(initials(r.name))}</div>
                    <div class="review-id">
                        <div class="review-name">${escapeHtml(r.name)}</div>
                        <div class="review-meta">${escapeHtml(code)} ${escapeHtml(r.country || "")}${r.service ? " · " + escapeHtml(r.service) : ""}</div>
                    </div>
                    <div class="review-badge">${escapeHtml(code)}</div>
                </div>
                <div class="review-rating">
                    <span class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
                    <span class="review-score">(${r.rating.toFixed(1)})</span>
                </div>
                ${r.message ? `<div class="review-message">${escapeHtml(r.message)}</div>` : ""}
            </div>`;
        }).join("");

        // Cards are duplicated back-to-back so the marquee animation (which
        // slides exactly -50%) loops seamlessly instead of jumping at the end.
        listEl.innerHTML = `<div class="review-track">${cardsHtml}${cardsHtml}</div>`;
    }

    async function loadReviews() {
        try {
            const reviews = await loadFeedbackList();
            renderReviews(reviews);
        } catch (e) {
            console.error("Failed to load reviews:", e);
            renderReviews([]);
        }
    }

    loadReviews();

    legacyFeedbackForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("fb-name").value.trim();
        const country = document.getElementById("fb-country").value;
        const service = document.getElementById("fb-service").value;
        const message = document.getElementById("fb-message").value.trim();

        // Tell the user exactly which field is missing instead of a generic message.
        if (!name) return setStatus("Please enter your name.", "#d33");
        if (!country) return setStatus("Please select a country.", "#d33");
        if (!service) return setStatus("Please select a service.", "#d33");
        if (!currentRating) return setStatus("Please pick a star rating.", "#d33");
        if (!message) return setStatus("Please enter a message.", "#d33");

        setStatus("Sending...", "#555");

        try {
            const newReview = {
                name,
                country,
                service,
                rating: currentRating,
                message,
                timestamp: Date.now()
            };

            await saveFeedback(newReview);

            legacyFeedbackForm.reset();
            currentRating = 0;
            paintLegacyStars();
            // reset selects back to their placeholder after form.reset()
            document.getElementById("fb-country").value = "";
            document.getElementById("fb-service").value = "";

            // Refresh from Firestore so the list reflects everyone's submissions
            await loadReviews();
            setStatus("Thank you! Your feedback was submitted.", "#2a8f2a");
        } catch (err) {
            console.error(err);
            setStatus("Something went wrong. Please try again.", "#d33");
        }
    });
}