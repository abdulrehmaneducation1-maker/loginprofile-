/* ===== Download CV button with progress ===== */
const downloadBtn = document.getElementById('downloadBtn');
const btnText = document.getElementById('btnText');
const progressFill = document.getElementById('progressFill');

if (downloadBtn && btnText && progressFill) {
    downloadBtn.addEventListener('click', function (e) {
        e.preventDefault();

        const fileUrl = downloadBtn.getAttribute('href');
        const fileName = downloadBtn.getAttribute('download');

        downloadBtn.style.pointerEvents = 'none';
        btnText.textContent = 'Downloading 0%';

        fetch(fileUrl)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');

                const contentLength = response.headers.get('content-length');
                if (!contentLength) {
                    triggerInstantDownload(fileUrl, fileName);
                    return;
                }

                const total = parseInt(contentLength, 10);
                let loaded = 0;

                const reader = response.body.getReader();
                const stream = new ReadableStream({
                    start(controller) {
                        function push() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                loaded += value.byteLength;
                                let percent = Math.round((loaded / total) * 100);

                                progressFill.style.width = percent + '%';
                                btnText.textContent = 'Downloading ' + percent + '%';

                                controller.enqueue(value);
                                push();
                            }).catch(error => {
                                controller.error(error);
                            });
                        }
                        push();
                    }
                });

                return new Response(stream);
            })
            .then(res => res.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const tempLink = document.createElement('a');
                tempLink.href = blobUrl;
                tempLink.download = fileName;
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
                window.URL.revokeObjectURL(blobUrl);

                btnText.textContent = 'Downloaded!';
                setTimeout(() => {
                    progressFill.style.width = '0%';
                    btnText.textContent = 'Download CV';
                    downloadBtn.style.pointerEvents = 'auto';
                }, 2000);
            })
            .catch(() => {
                triggerInstantDownload(fileUrl, fileName);
            });
    });
}

function triggerInstantDownload(url, filename) {
    progressFill.style.width = '100%';
    btnText.textContent = 'Downloaded!';

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
        progressFill.style.width = '0%';
        btnText.textContent = 'Download CV';
        downloadBtn.style.pointerEvents = 'auto';
    }, 2000);
}

/* ===== Mobile nav toggle (hamburger menu) ===== */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
        const isOpen = mainNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        navToggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });

    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            mainNav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });
}

/* ===== Back to Top button ===== */
const scrollTopBtn = document.getElementById('scrollTopBtn');

if (scrollTopBtn) {
    window.onscroll = function() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
          scrollTopBtn.style.display = "block";
        } else {
          scrollTopBtn.style.display = "none";
        }
    };

    scrollTopBtn.onclick = function() {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
    };
}

/* ===== Star rating (feedback form) ===== */
let selectedRating = 0;
const stars = document.querySelectorAll('#starPicker .star');
const submitBtn = document.getElementById('submitBtn');
const nameInput = document.getElementById('nameInput');
const formMsg = document.getElementById('formMsg');
const messageInput = document.getElementById('messageInput');

stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.value);
        updateStarDisplay();
    });
    star.addEventListener('mouseenter', () => {
        highlightStars(parseInt(star.dataset.value));
    });
});
const starPicker = document.getElementById('starPicker');
if (starPicker) {
    starPicker.addEventListener('mouseleave', updateStarDisplay);
}

function highlightStars(value) {
    stars.forEach(s => {
        s.classList.toggle('filled', parseInt(s.dataset.value) <= value);
    });
}
function updateStarDisplay() { highlightStars(selectedRating); }

function showMsg(text, type) {
    if (!formMsg) return;
    formMsg.textContent = text;
    formMsg.className = 'msg ' + type;
    setTimeout(() => { formMsg.textContent = ''; formMsg.className = 'msg'; }, 3000);
}

async function loadReviews() {
    try {
        if (window.storage && typeof window.storage.get === 'function') {
            const result = await window.storage.get('feedback:all', true);
            const reviews = result && result.value ? JSON.parse(result.value) : [];
            renderReviews(reviews);
        } else {
            renderReviews([]);
        }
    } catch (e) {
        renderReviews([]);
    }
}

function renderReviews(reviews) {
    const listEl = document.getElementById('reviewList');
    const avgNum = document.getElementById('avgNum');
    const avgStars = document.getElementById('avgStars');
    const avgCount = document.getElementById('avgCount');

    if (!listEl) return;

    if (!reviews.length) {
        if (avgNum) avgNum.textContent = '–';
        if (avgStars) avgStars.textContent = '';
        if (avgCount) avgCount.textContent = 'No ratings yet';
        listEl.innerHTML = '<div class="empty">Be the first to leave feedback.</div>';
        return;
    }

    const sorted = [...reviews].sort((a, b) => b.timestamp - a.timestamp);
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    if (avgNum) avgNum.textContent = avg.toFixed(1);
    if (avgStars) avgStars.textContent = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
    if (avgCount) avgCount.textContent = reviews.length + (reviews.length === 1 ? ' rating' : ' ratings');

    listEl.innerHTML = sorted.map(r => `
        <div class="review" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <div class="review-top" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span class="review-name" style="font-weight: 600; color: var(--text-main);">${escapeHtml(r.name)}</span>
                <span class="review-date" style="font-size: 0.85rem; color: var(--text-muted);">${formatDate(r.timestamp)}</span>
            </div>
            <div class="review-stars" style="color: #f39c12; margin-bottom: 8px;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            ${r.message ? `<div class="review-message" style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5;">${escapeHtml(r.message)}</div>` : ''}
        </div>
    `).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ===== Unified Submit Logic for Contact Form & Drag-and-Drop ===== */
const form = document.getElementById('contactForm');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const dropText = document.getElementById('dropText');
const popup = document.getElementById('formPopup');
const popupTitle = document.getElementById('popupTitle');
const popupMessage = document.getElementById('popupMessage');

if (dropZone && fileInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#f39c12';
        }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-color)';
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            if (dropText) dropText.textContent = "Selected: " + files[0].name;
        }
    });

    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            if (dropText) dropText.textContent = "Selected: " + fileInput.files[0].name;
        }
    });
}

if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // If this is the feedback form with star ratings
        if (nameInput && selectedRating > 0) {
            const name = nameInput.value.trim();
            const message = messageInput ? messageInput.value.trim() : '';

            if (!name) { showMsg('Please enter your name.', 'error'); return; }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting…';

            try {
                let reviews = [];
                if (window.storage && typeof window.storage.get === 'function') {
                    const result = await window.storage.get('feedback:all', true);
                    reviews = result && result.value ? JSON.parse(result.value) : [];
                }

                reviews.push({ name: name, rating: selectedRating, message: message, timestamp: Date.now() });

                if (window.storage && typeof window.storage.set === 'function') {
                    const saveResult = await window.storage.set('feedback:all', JSON.stringify(reviews), true);
                    if (!saveResult) throw new Error('Save failed');
                }

                renderReviews(reviews);
                showMsg('Thank you for your feedback!', 'success');

                nameInput.value = '';
                if (messageInput) messageInput.value = '';
                selectedRating = 0;
                updateStarDisplay();
            } catch (err) {
                console.error(err);
                showMsg('Something went wrong. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Feedback';
            }
            return;
        }

        // Standard FormSubmit AJAX handling for Contact Form
        const formData = new FormData(form);
        const originalBtnText = submitBtn.textContent;

        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(async response => {
            let data = {};
            try {
                data = await response.json();
            } catch (err) {}

            if (response.ok && (data.success || response.status === 200)) {
                if (popupTitle) popupTitle.textContent = "Success!";
                if (popupMessage) popupMessage.textContent = "Your message has been sent successfully.";
                if (popup) popup.style.display = 'flex';
                form.reset();
                if (dropText) dropText.innerHTML = 'Drag & drop your picture here or <span style="color: #f39c12;">browse</span>';
            } else {
                if (popupTitle) popupTitle.textContent = "Error!";
                if (popupMessage) popupMessage.textContent = data.message || "Message couldn't be sent. Please try again.";
                if (popup) popup.style.display = 'flex';
            }
        }).catch(() => {
            if (popupTitle) popupTitle.textContent = "Error!";
            if (popupMessage) popupMessage.textContent = "Connection failed. Please check your internet and try again.";
            if (popup) popup.style.display = 'flex';
        }).finally(() => {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        });
    });
}

function closePopup() {
    if (popup) popup.style.display = 'none';
}

// Initial trigger if review list exists
if (document.getElementById('reviewList')) {
    loadReviews();
}


const formData = new FormData(form);

const countryCode = document.getElementById('countryCode');
const phoneInput = document.getElementById('phone');

if (countryCode && phoneInput) {
    formData.set(
        'phone',
        `${countryCode.value} ${phoneInput.value.trim()}`
    );
}