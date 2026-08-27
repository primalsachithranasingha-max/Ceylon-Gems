/**
 * CEYLON SL GEMS - MAIN INTERACTIVE APPLICATION ENGINE
 * Features: Multi-Currency, Sparkle Canvas, Live Filters, Certificate Verifier,
 * Custom Jewelry Builder, Modal Quick View, Wishlist & Inquiry Drawer.
 */

// Application State
const AppState = {
    currentCurrency: 'USD',
    activeCategory: 'all',
    activeShape: 'all',
    activeTreatment: 'all',
    searchQuery: '',
    sortBy: 'featured',
    maxPrice: 25000,
    wishlist: JSON.parse(localStorage.getItem('csg_wishlist') || '[]'),
    inquiryBag: JSON.parse(localStorage.getItem('csg_inquiry_bag') || '[]'),
    
    // Jewelry Builder State
    builder: {
        selectedGemId: GEMSTONES_DATA[0].id,
        selectedSettingId: JEWELRY_SETTINGS[0].id,
        selectedMetalId: METALS_DATA[0].id,
        ringSize: 'US 7 / UK N'
    }
};

// --- DOM Ready Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initSparkleCanvas();
    initCurrencySwitcher();
    initCatalogFilters();
    renderGemstones();
    initCertificateVerifier();
    initJewelryBuilder();
    initDrawerAndWishlist();
    initModal();
    initContactForm();
    initMobileNav();
    updateHeaderCounters();
});

// ==========================================================================
// 1. DYNAMIC CURRENCY FORMATTER & CONVERTER
// ==========================================================================
function formatCurrency(amountUsd, targetCurrency = AppState.currentCurrency) {
    const curr = CURRENCIES[targetCurrency] || CURRENCIES.USD;
    const converted = amountUsd * curr.rate;
    
    // Format appropriately
    if (targetCurrency === 'LKR') {
        return curr.symbol + Math.round(converted).toLocaleString('en-US');
    }
    return curr.symbol + Math.round(converted).toLocaleString('en-US');
}

function initCurrencySwitcher() {
    const currencySelects = document.querySelectorAll('.currency-select');
    currencySelects.forEach(select => {
        select.value = AppState.currentCurrency;
        select.addEventListener('change', (e) => {
            AppState.currentCurrency = e.target.value;
            // Sync all currency select elements on page
            currencySelects.forEach(s => s.value = AppState.currentCurrency);
            
            // Re-render components with new currency
            renderGemstones();
            updateJewelryBuilderSummary();
            renderInquiryDrawer();
            updateHeroPrice();
            showToast(`Currency changed to ${CURRENCIES[AppState.currentCurrency].name}`);
        });
    });
}

function updateHeroPrice() {
    const heroPriceEl = document.getElementById('hero-gem-price-val');
    if (heroPriceEl) {
        heroPriceEl.textContent = formatCurrency(14500);
    }
}

// ==========================================================================
// 2. HERO PARTICLES & SPARKLE CANVAS
// ==========================================================================
function initSparkleCanvas() {
    const canvas = document.getElementById('sparkle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.5 + 0.5,
            baseAlpha: Math.random() * 0.7 + 0.2,
            alpha: 0,
            speedY: -(Math.random() * 0.4 + 0.1),
            speedX: (Math.random() - 0.5) * 0.3,
            pulseSpeed: Math.random() * 0.03 + 0.01,
            pulseOffset: Math.random() * Math.PI * 2,
            color: Math.random() > 0.4 ? 'rgba(212, 175, 55, ' : 'rgba(74, 144, 226, '
        });
    }

    function animateSparkles(time) {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;

            if (p.y < 0) p.y = height;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;

            const currentAlpha = p.baseAlpha * Math.abs(Math.sin(time * 0.002 + p.pulseOffset));

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color + currentAlpha + ')';
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color + '1)';
            ctx.fill();

            // Star glint cross for larger sparkles
            if (p.size > 2 && currentAlpha > 0.4) {
                ctx.strokeStyle = p.color + (currentAlpha * 0.8) + ')';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x - p.size * 3, p.y);
                ctx.lineTo(p.x + p.size * 3, p.y);
                ctx.moveTo(p.x, p.y - p.size * 3);
                ctx.lineTo(p.x, p.y + p.size * 3);
                ctx.stroke();
            }
        });

        requestAnimationFrame(animateSparkles);
    }

    requestAnimationFrame(animateSparkles);
}

// ==========================================================================
// 3. CATALOG FILTERING, SORTING & RENDERING
// ==========================================================================
function initCatalogFilters() {
    // Category Pills
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            AppState.activeCategory = pill.dataset.category;
            renderGemstones();
        });
    });

    // Shape Filter Select
    const shapeSelect = document.getElementById('filter-shape');
    if (shapeSelect) {
        shapeSelect.addEventListener('change', (e) => {
            AppState.activeShape = e.target.value;
            renderGemstones();
        });
    }

    // Treatment Filter Select
    const treatmentSelect = document.getElementById('filter-treatment');
    if (treatmentSelect) {
        treatmentSelect.addEventListener('change', (e) => {
            AppState.activeTreatment = e.target.value;
            renderGemstones();
        });
    }

    // Sort By Select
    const sortSelect = document.getElementById('sort-gems');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            AppState.sortBy = e.target.value;
            renderGemstones();
        });
    }

    // Search Input with Debounce
    const searchInput = document.getElementById('search-gems-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            AppState.searchQuery = e.target.value.trim().toLowerCase();
            renderGemstones();
        });
    }
}

function getFilteredGemstones() {
    return GEMSTONES_DATA.filter(gem => {
        // Category Filter
        if (AppState.activeCategory !== 'all' && gem.category !== AppState.activeCategory) {
            return false;
        }

        // Shape Filter
        if (AppState.activeShape !== 'all' && gem.shape !== AppState.activeShape) {
            return false;
        }

        // Treatment Filter
        if (AppState.activeTreatment !== 'all') {
            if (AppState.activeTreatment === 'unheated' && !gem.treatment.toLowerCase().includes('unheated') && !gem.treatment.toLowerCase().includes('untreated')) {
                return false;
            }
            if (AppState.activeTreatment === 'heated' && !gem.treatment.toLowerCase().includes('heated')) {
                return false;
            }
        }

        // Search Query
        if (AppState.searchQuery) {
            const matches = gem.name.toLowerCase().includes(AppState.searchQuery) ||
                            gem.color.toLowerCase().includes(AppState.searchQuery) ||
                            gem.origin.toLowerCase().includes(AppState.searchQuery) ||
                            gem.certificateNo.toLowerCase().includes(AppState.searchQuery) ||
                            gem.cut.toLowerCase().includes(AppState.searchQuery);
            if (!matches) return false;
        }

        return true;
    }).sort((a, b) => {
        if (AppState.sortBy === 'price-low') return a.priceUsd - b.priceUsd;
        if (AppState.sortBy === 'price-high') return b.priceUsd - a.priceUsd;
        if (AppState.sortBy === 'carat-high') return b.carat - a.carat;
        if (AppState.sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return 0;
    });
}

function renderGemstones() {
    const grid = document.getElementById('gems-catalog-grid');
    const resultCountEl = document.getElementById('catalog-results-count');
    if (!grid) return;

    const filtered = getFilteredGemstones();
    
    if (resultCountEl) {
        resultCountEl.textContent = `${filtered.length} Gemstones Found`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                <i class="fas fa-gem" style="font-size: 3rem; color: var(--gold-primary); opacity: 0.5; margin-bottom: 1rem;"></i>
                <h3 style="font-family: var(--font-heading); color: #fff; margin-bottom: 0.5rem;">No Gemstones Found</h3>
                <p style="color: var(--text-muted); max-width: 400px; margin: 0 auto 1.5rem auto;">Try broadening your search query or selecting a different category filter.</p>
                <button class="btn btn-outline-gold" onclick="resetFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(gem => {
        const isWishlisted = AppState.wishlist.includes(gem.id);
        const isUnheated = gem.treatment.toLowerCase().includes('unheated') || gem.treatment.toLowerCase().includes('untreated');

        return `
            <div class="gem-card" data-gem-id="${gem.id}">
                <div class="gem-card-media">
                    <img src="${gem.image}" alt="${gem.name}" class="gem-card-img" loading="lazy">
                    <div class="gem-card-badges">
                        ${isUnheated ? '<span class="badge-tag unheated">100% Unheated</span>' : '<span class="badge-tag certified">Certified Heated</span>'}
                        <span class="badge-tag certified">${gem.lab.split('&')[0]}</span>
                    </div>
                    <button class="gem-card-wish-btn ${isWishlisted ? 'active' : ''}" 
                            title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                            onclick="toggleWishlist('${gem.id}', event)">
                        <i class="${isWishlisted ? 'fas fa-heart' : 'far fa-heart'}"></i>
                    </button>
                </div>
                <div class="gem-card-body">
                    <div class="gem-origin-lab">
                        <span><i class="fas fa-map-marker-alt"></i> ${gem.origin.split(',')[0]}</span>
                        <span><i class="fas fa-certificate"></i> ${gem.certificateNo}</span>
                    </div>
                    <h3 class="gem-title">${gem.name}</h3>
                    
                    <div class="gem-spec-matrix">
                        <div class="spec-cell">
                            <span class="k">Carat Weight</span>
                            <span class="v">${gem.carat.toFixed(2)} ct</span>
                        </div>
                        <div class="spec-cell">
                            <span class="k">Cut / Shape</span>
                            <span class="v">${gem.cut}</span>
                        </div>
                        <div class="spec-cell">
                            <span class="k">Color Tone</span>
                            <span class="v">${gem.color}</span>
                        </div>
                        <div class="spec-cell">
                            <span class="k">Clarity</span>
                            <span class="v">${gem.clarity}</span>
                        </div>
                    </div>

                    <div class="gem-card-footer">
                        <div class="gem-price-val">${formatCurrency(gem.priceUsd)}</div>
                        <div class="gem-card-actions">
                            <button class="btn btn-outline-gold btn-sm" onclick="openGemModal('${gem.id}')">
                                <i class="far fa-eye"></i> Details
                            </button>
                            <button class="btn btn-gold btn-sm" onclick="addToInquiryBag('${gem.id}')" title="Add to Inquiry Bag">
                                <i class="fas fa-plus"></i> Inquire
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function resetFilters() {
    AppState.activeCategory = 'all';
    AppState.activeShape = 'all';
    AppState.activeTreatment = 'all';
    AppState.searchQuery = '';
    
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
    const sInput = document.getElementById('search-gems-input');
    if (sInput) sInput.value = '';
    const shapeSelect = document.getElementById('filter-shape');
    if (shapeSelect) shapeSelect.value = 'all';
    const trSelect = document.getElementById('filter-treatment');
    if (trSelect) trSelect.value = 'all';
    
    renderGemstones();
}

// ==========================================================================
// 4. GEMSTONE DETAILS MODAL & CARAT COMPARATOR
// ==========================================================================
function initModal() {
    const modalBackdrop = document.getElementById('gem-modal-backdrop');
    const closeBtn = document.getElementById('modal-close-btn');

    if (closeBtn && modalBackdrop) {
        closeBtn.addEventListener('click', closeGemModal);
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeGemModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGemModal();
    });
}

function openGemModal(gemId) {
    const gem = GEMSTONES_DATA.find(g => g.id === gemId);
    if (!gem) return;

    const modalBackdrop = document.getElementById('gem-modal-backdrop');
    if (!modalBackdrop) return;

    // Fill Modal Content
    document.getElementById('modal-gem-name').textContent = gem.name;
    document.getElementById('modal-gem-rarity').textContent = gem.rarity;
    document.getElementById('modal-gem-img').src = gem.image;
    document.getElementById('modal-gem-img').alt = gem.name;
    document.getElementById('modal-gem-price').textContent = formatCurrency(gem.priceUsd);
    document.getElementById('modal-gem-desc').textContent = gem.description;
    
    // Fill Specs
    document.getElementById('modal-spec-carat').textContent = `${gem.carat.toFixed(2)} Carats`;
    document.getElementById('modal-spec-dimensions').textContent = gem.dimensions;
    document.getElementById('modal-spec-cut').textContent = gem.cut;
    document.getElementById('modal-spec-color').textContent = gem.color;
    document.getElementById('modal-spec-clarity').textContent = gem.clarity;
    document.getElementById('modal-spec-treatment').textContent = gem.treatment;
    document.getElementById('modal-spec-origin').textContent = gem.origin;
    document.getElementById('modal-spec-cert').textContent = `${gem.certificateNo} (${gem.lab})`;

    // WhatsApp Action Button
    const waBtn = document.getElementById('modal-whatsapp-btn');
    if (waBtn) {
        const text = encodeURIComponent(`Hello Ceylon SL Gems! I am inquiring about the ${gem.name} (ID: ${gem.id}, Carat: ${gem.carat}ct, Price: ${formatCurrency(gem.priceUsd)}). Certificate No: ${gem.certificateNo}. Please share high-res video and details.`);
        waBtn.href = `https://wa.me/94771234567?text=${text}`;
    }

    // Add to Bag Button
    const addBagBtn = document.getElementById('modal-add-bag-btn');
    if (addBagBtn) {
        addBagBtn.onclick = () => {
            addToInquiryBag(gem.id);
            closeGemModal();
        };
    }

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeGemModal() {
    const modalBackdrop = document.getElementById('gem-modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==========================================================================
// 5. VIRTUAL CERTIFICATE VERIFICATION TOOL
// ==========================================================================
function initCertificateVerifier() {
    const verifyBtn = document.getElementById('btn-verify-cert');
    const input = document.getElementById('cert-input-field');

    if (verifyBtn && input) {
        verifyBtn.addEventListener('click', performVerification);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performVerification();
        });
    }

    // Sample Clickable Chips
    const chips = document.querySelectorAll('.sample-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (input) {
                input.value = chip.dataset.code;
                performVerification();
            }
        });
    });
}

function performVerification() {
    const input = document.getElementById('cert-input-field');
    const resultBox = document.getElementById('certificate-result-display');
    const errorBox = document.getElementById('certificate-error-display');

    if (!input || !resultBox) return;

    const query = input.value.trim().toUpperCase();

    if (!query) {
        showToast('Please enter a Certificate Number', 'error');
        return;
    }

    const certData = CERTIFICATE_REGISTRY[query];

    if (certData) {
        if (errorBox) errorBox.style.display = 'none';

        // Populate Certificate Data
        document.getElementById('cert-res-id').textContent = certData.id;
        document.getElementById('cert-res-date').textContent = certData.dateIssued;
        document.getElementById('cert-res-gem-name').textContent = certData.gemName;
        document.getElementById('cert-res-species').textContent = certData.species;
        document.getElementById('cert-res-weight').textContent = certData.weight;
        document.getElementById('cert-res-shape').textContent = certData.shapeCut;
        document.getElementById('cert-res-dimensions').textContent = certData.dimensions;
        document.getElementById('cert-res-color').textContent = certData.colorGrade;
        document.getElementById('cert-res-origin').textContent = certData.origin;
        document.getElementById('cert-res-treatment').textContent = certData.treatment;
        document.getElementById('cert-res-lab').textContent = certData.issuingLab;
        document.getElementById('cert-res-seal').textContent = certData.sealNumber;

        resultBox.style.display = 'block';
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        showToast(`Certificate ${certData.id} successfully verified!`);
    } else {
        resultBox.style.display = 'none';
        if (errorBox) {
            errorBox.style.display = 'block';
            errorBox.innerHTML = `
                <div style="background: rgba(230, 57, 70, 0.15); border: 1px solid var(--ruby-red); border-radius: var(--radius-sm); padding: 1.5rem; text-align: center;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--ruby-red); margin-bottom: 0.5rem;"></i>
                    <h4 style="color: #fff; font-family: var(--font-heading);">No Record Found for "${query}"</h4>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.4rem;">
                        Please verify the code format or try our sample registered certificates: 
                        <strong style="color: var(--gold-primary); cursor: pointer;" onclick="document.getElementById('cert-input-field').value='CSG-7712-BS'; performVerification();">CSG-7712-BS</strong> or 
                        <strong style="color: var(--gold-primary); cursor: pointer;" onclick="document.getElementById('cert-input-field').value='CSG-8840-PD'; performVerification();">CSG-8840-PD</strong>.
                    </p>
                </div>
            `;
        }
    }
}

// ==========================================================================
// 6. CUSTOM JEWELRY BUILDER & ESTIMATOR
// ==========================================================================
function initJewelryBuilder() {
    renderBuilderGemOptions();
    renderBuilderSettingOptions();
    renderBuilderMetalOptions();
    updateJewelryBuilderSummary();

    const ringSizeSelect = document.getElementById('builder-ring-size');
    if (ringSizeSelect) {
        ringSizeSelect.addEventListener('change', (e) => {
            AppState.builder.ringSize = e.target.value;
            updateJewelryBuilderSummary();
        });
    }

    const builderWaBtn = document.getElementById('builder-inquire-btn');
    if (builderWaBtn) {
        builderWaBtn.addEventListener('click', handleBuilderInquiry);
    }
}

function renderBuilderGemOptions() {
    const container = document.getElementById('builder-gems-container');
    if (!container) return;

    // Pick top 4 standout gems for builder
    const selectionGems = GEMSTONES_DATA.slice(0, 4);

    container.innerHTML = selectionGems.map(gem => `
        <div class="builder-option-card ${gem.id === AppState.builder.selectedGemId ? 'active' : ''}" 
             onclick="selectBuilderGem('${gem.id}')">
            <img src="${gem.image}" alt="${gem.name}" class="builder-option-img">
            <div class="builder-option-name">${gem.name}</div>
            <div class="builder-option-price">${gem.carat.toFixed(2)}ct • ${formatCurrency(gem.priceUsd)}</div>
        </div>
    `).join('');
}

function selectBuilderGem(gemId) {
    AppState.builder.selectedGemId = gemId;
    renderBuilderGemOptions();
    updateJewelryBuilderSummary();
}

function renderBuilderSettingOptions() {
    const container = document.getElementById('builder-settings-container');
    if (!container) return;

    container.innerHTML = JEWELRY_SETTINGS.map(setting => `
        <div class="builder-option-card ${setting.id === AppState.builder.selectedSettingId ? 'active' : ''}" 
             onclick="selectBuilderSetting('${setting.id}')">
            <img src="${setting.image}" alt="${setting.name}" class="builder-option-img">
            <div class="builder-option-name">${setting.name}</div>
            <div class="builder-option-price">+ ${formatCurrency(setting.basePriceUsd)}</div>
        </div>
    `).join('');
}

function selectBuilderSetting(settingId) {
    AppState.builder.selectedSettingId = settingId;
    renderBuilderSettingOptions();
    updateJewelryBuilderSummary();
}

function renderBuilderMetalOptions() {
    const container = document.getElementById('builder-metals-container');
    if (!container) return;

    container.innerHTML = METALS_DATA.map(metal => `
        <div class="metal-pill ${metal.id === AppState.builder.selectedMetalId ? 'active' : ''}" 
             onclick="selectBuilderMetal('${metal.id}')">
            <span class="metal-color-circle" style="background: ${metal.hex};"></span>
            <div class="metal-pill-info">
                <span class="metal-pill-name">${metal.name}</span>
                <span class="metal-pill-purity">${metal.purity}</span>
            </div>
        </div>
    `).join('');
}

function selectBuilderMetal(metalId) {
    AppState.builder.selectedMetalId = metalId;
    renderBuilderMetalOptions();
    updateJewelryBuilderSummary();
}

function updateJewelryBuilderSummary() {
    const gem = GEMSTONES_DATA.find(g => g.id === AppState.builder.selectedGemId) || GEMSTONES_DATA[0];
    const setting = JEWELRY_SETTINGS.find(s => s.id === AppState.builder.selectedSettingId) || JEWELRY_SETTINGS[0];
    const metal = METALS_DATA.find(m => m.id === AppState.builder.selectedMetalId) || METALS_DATA[0];

    const gemPrice = gem.priceUsd;
    const settingPrice = setting.basePriceUsd * metal.priceMultiplier;
    const totalPriceUsd = gemPrice + settingPrice;

    // Update Summary Elements
    const previewImg = document.getElementById('builder-summary-preview-img');
    if (previewImg) previewImg.src = setting.image;

    const gemNameEl = document.getElementById('builder-summary-gem');
    if (gemNameEl) gemNameEl.textContent = `${gem.name} (${gem.carat.toFixed(2)}ct)`;

    const gemPriceEl = document.getElementById('builder-summary-gem-price');
    if (gemPriceEl) gemPriceEl.textContent = formatCurrency(gemPrice);

    const settingNameEl = document.getElementById('builder-summary-setting');
    if (settingNameEl) settingNameEl.textContent = setting.name;

    const metalNameEl = document.getElementById('builder-summary-metal');
    if (metalNameEl) metalNameEl.textContent = metal.name;

    const settingPriceEl = document.getElementById('builder-summary-setting-price');
    if (settingPriceEl) settingPriceEl.textContent = formatCurrency(settingPrice);

    const totalPriceEl = document.getElementById('builder-summary-total-price');
    if (totalPriceEl) totalPriceEl.textContent = formatCurrency(totalPriceUsd);
}

function handleBuilderInquiry() {
    const gem = GEMSTONES_DATA.find(g => g.id === AppState.builder.selectedGemId);
    const setting = JEWELRY_SETTINGS.find(s => s.id === AppState.builder.selectedSettingId);
    const metal = METALS_DATA.find(m => m.id === AppState.builder.selectedMetalId);

    const gemPrice = gem.priceUsd;
    const settingPrice = setting.basePriceUsd * metal.priceMultiplier;
    const totalPriceUsd = gemPrice + settingPrice;

    const message = `Hello Ceylon SL Gems! I crafted a Custom Jewelry Commission on your website:
• Center Gemstone: ${gem.name} (${gem.carat}ct - ID: ${gem.id})
• Certificate: ${gem.certificateNo}
• Setting: ${setting.name}
• Precious Metal: ${metal.name}
• Ring/Bespoke Size: ${AppState.builder.ringSize}
• Estimated Total: ${formatCurrency(totalPriceUsd)}

Please confirm master craftsmanship availability, 3D CAD modeling, and completion timeframe.`;

    const waUrl = `https://wa.me/94771234567?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
}

// ==========================================================================
// 7. WISHLIST & INQUIRY BAG MANAGEMENT
// ==========================================================================
function initDrawerAndWishlist() {
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawer = document.getElementById('inquiry-slide-drawer');
    const openBtn = document.getElementById('header-cart-btn');
    const closeBtn = document.getElementById('drawer-close-btn');

    if (openBtn && drawer && drawerBackdrop) {
        openBtn.addEventListener('click', () => openDrawer());
        closeBtn.addEventListener('click', () => closeDrawer());
        drawerBackdrop.addEventListener('click', () => closeDrawer());
    }

    const checkoutWaBtn = document.getElementById('drawer-checkout-wa-btn');
    if (checkoutWaBtn) {
        checkoutWaBtn.addEventListener('click', sendBagInquiryToWhatsApp);
    }
}

function openDrawer() {
    renderInquiryDrawer();
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawer = document.getElementById('inquiry-slide-drawer');
    if (drawerBackdrop && drawer) {
        drawerBackdrop.classList.add('active');
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeDrawer() {
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawer = document.getElementById('inquiry-slide-drawer');
    if (drawerBackdrop && drawer) {
        drawerBackdrop.classList.remove('active');
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function toggleWishlist(gemId, event) {
    if (event) event.stopPropagation();

    const index = AppState.wishlist.indexOf(gemId);
    const gem = GEMSTONES_DATA.find(g => g.id === gemId);

    if (index > -1) {
        AppState.wishlist.splice(index, 1);
        showToast(`Removed from Wishlist`);
    } else {
        AppState.wishlist.push(gemId);
        showToast(`Added ${gem ? gem.name : 'gem'} to Wishlist!`);
    }

    localStorage.setItem('csg_wishlist', JSON.stringify(AppState.wishlist));
    updateHeaderCounters();
    renderGemstones();
}

function addToInquiryBag(gemId) {
    const gem = GEMSTONES_DATA.find(g => g.id === gemId);
    if (!gem) return;

    if (!AppState.inquiryBag.includes(gemId)) {
        AppState.inquiryBag.push(gemId);
        localStorage.setItem('csg_inquiry_bag', JSON.stringify(AppState.inquiryBag));
        updateHeaderCounters();
        showToast(`Added "${gem.name}" to Inquiry Bag!`);
        openDrawer();
    } else {
        showToast(`"${gem.name}" is already in your Inquiry Bag.`);
        openDrawer();
    }
}

function removeFromInquiryBag(gemId) {
    AppState.inquiryBag = AppState.inquiryBag.filter(id => id !== gemId);
    localStorage.setItem('csg_inquiry_bag', JSON.stringify(AppState.inquiryBag));
    updateHeaderCounters();
    renderInquiryDrawer();
    showToast('Item removed from Inquiry Bag');
}

function renderInquiryDrawer() {
    const container = document.getElementById('drawer-items-container');
    const subtotalEl = document.getElementById('drawer-subtotal-val');
    if (!container) return;

    const items = AppState.inquiryBag.map(id => GEMSTONES_DATA.find(g => g.id === id)).filter(Boolean);

    if (items.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
                <i class="fas fa-shopping-bag" style="font-size: 2.5rem; opacity: 0.4; margin-bottom: 1rem;"></i>
                <h4 style="color: #fff; font-family: var(--font-heading);">Your Inquiry Bag is Empty</h4>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">Explore our certified Ceylon collection and select gemstones to inquire.</p>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = formatCurrency(0);
        return;
    }

    let subtotalUsd = 0;

    container.innerHTML = items.map(gem => {
        subtotalUsd += gem.priceUsd;
        return `
            <div class="drawer-item">
                <img src="${gem.image}" alt="${gem.name}" class="drawer-item-img">
                <div class="drawer-item-info">
                    <div class="drawer-item-title">${gem.name}</div>
                    <div class="drawer-item-spec">${gem.carat.toFixed(2)}ct • ${gem.cut} • ${gem.certificateNo}</div>
                    <div class="drawer-item-price">${formatCurrency(gem.priceUsd)}</div>
                </div>
                <button class="drawer-item-remove" onclick="removeFromInquiryBag('${gem.id}')" title="Remove">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');

    if (subtotalEl) {
        subtotalEl.textContent = formatCurrency(subtotalUsd);
    }
}

function sendBagInquiryToWhatsApp() {
    const items = AppState.inquiryBag.map(id => GEMSTONES_DATA.find(g => g.id === id)).filter(Boolean);
    if (items.length === 0) {
        showToast('Your inquiry bag is empty', 'error');
        return;
    }

    let msg = `Hello Ceylon SL Gems! I would like to reserve & inquire about the following selected stones from your website:\n\n`;
    let totalUsd = 0;

    items.forEach((gem, idx) => {
        totalUsd += gem.priceUsd;
        msg += `${idx + 1}. ${gem.name}\n   - Carat: ${gem.carat}ct | Cut: ${gem.cut}\n   - Cert: ${gem.certificateNo}\n   - Price: ${formatCurrency(gem.priceUsd)}\n\n`;
    });

    msg += `Total Estimated Value: ${formatCurrency(totalUsd)}\n\nPlease provide high-definition microscope inspection videos, insured shipping estimates, and payment invoice details.`;

    const waUrl = `https://wa.me/94771234567?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
}

function updateHeaderCounters() {
    const wishCountEl = document.getElementById('header-wish-count');
    const bagCountEl = document.getElementById('header-bag-count');

    if (wishCountEl) wishCountEl.textContent = AppState.wishlist.length;
    if (bagCountEl) bagCountEl.textContent = AppState.inquiryBag.length;
}

// ==========================================================================
// 8. CONTACT / VIP CONSULTATION FORM
// ==========================================================================
function initContactForm() {
    const form = document.getElementById('vip-contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        const interest = document.getElementById('form-interest').value;
        
        showToast(`Thank you, ${name}! Your VIP Consultation request for ${interest} has been received. Our gemologist will contact you at ${email} shortly.`);
        form.reset();
    });
}

// ==========================================================================
// 9. MOBILE NAVIGATION & TOAST UTILITY
// ==========================================================================
function initMobileNav() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('nav-menu-list');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.querySelector('i').classList.toggle('fa-bars');
            toggle.querySelector('i').classList.toggle('fa-times');
        });

        // Close menu on link click
        menu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                if (toggle.querySelector('i')) {
                    toggle.querySelector('i').classList.add('fa-bars');
                    toggle.querySelector('i').classList.remove('fa-times');
                }
            });
        });
    }

    // Header scroll background change
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    const color = type === 'error' ? 'var(--ruby-red)' : 'var(--gold-primary)';

    toast.innerHTML = `
        <i class="fas ${icon}" style="color: ${color}; font-size: 1.2rem;"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
