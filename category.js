/**
 * 404WEAR Fashion Category System
 * Complete JavaScript Implementation
 * Version 2.0
 */

// ===== CONFIGURATION =====
const CONFIG = {
    brandName: "404WEAR",
    currency: "RM",
    cartKey: "404wear_cart_v2",
    defaultSort: "featured",
    productsPerPage: 12,
    enablePriceFilter: true,
    enableSearch: true,
    enableQuickView: true,
    localStorageEnabled: true
};

// ===== APPLICATION STATE =====
const AppState = {
    // Product data
    allProducts: [],
    filteredProducts: [],
    displayedProducts: [],
    
    // Categories data
    categories: {
        accessories: {
            name: "Accessories",
            icon: "💎",
            description: "Jewelry and accessories to complete your look",
            subCategories: {
                necklace: "Necklaces",
                rings: "Rings",
                sunglasses: "Sunglasses"
            }
        },
        tops: {
            name: "Tops",
            icon: "👕",
            description: "Shirts, jackets, and tops for every occasion",
            subCategories: {
                oversize: "Oversize",
                casual_wear: "Casual Wear",
                slim_fit: "Slim Fit"
            }
        },
        shoes: {
            name: "Shoes",
            icon: "👟",
            description: "Footwear combining style and comfort",
            subCategories: {
                flats: "Flats",
                heels: "Heels",
                casual_shoes: "Casual Shoes"
            }
        },
        bottoms: {
            name: "Bottoms",
            icon: "👖",
            description: "Pants, jeans, skirts and shorts",
            subCategories: {
                shorts: "Shorts",
                jeans: "Jeans",
                skirt: "Skirts"
            }
        },
        facial: {
            name: "Facial Care",
            icon: "✨",
            description: "Skincare and beauty essentials",
            subCategories: {
                pimple_patch: "Pimple Patches",
                sunscreen: "Sunscreen",
                mask: "Face Masks"
            }
        }
    },
    
    // Filter state
    currentFilter: {
        mainCategory: 'all',
        subCategory: null,
        searchTerm: '',
        sortBy: CONFIG.defaultSort,
        priceRange: { min: 0, max: 250 },
        inStockOnly: false,
        featuredOnly: false
    },
    
    // Cart state
    cart: [],
    cartCount: 0,
    
    // UI state
    currentPage: 1,
    isLoading: false,
    hasError: false
};

// ===== DOM ELEMENTS CACHE =====
let DOM = {};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log(`🎯 ${CONFIG.brandName} Fashion System Initializing...`);
    
    try {
        initializeApplication();
        console.log(`✅ ${CONFIG.brandName} System Ready!`);
    } catch (error) {
        console.error(`❌ Initialization Error:`, error);
        showFatalError("Failed to initialize the system. Please refresh the page.");
    }
});

// ===== CORE FUNCTIONS =====

/**
 * Initialize the entire application
 */
function initializeApplication() {
    cacheDOMElements();
    loadCartFromStorage();
    loadProducts();
    setupEventListeners();
    setupPriceFilter();
    updateUI();
}

/**
 * Cache all DOM elements for performance
 */
function cacheDOMElements() {
    DOM = {
        // Header elements
        logo: document.querySelector('.logo'),
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        cartCount: document.getElementById('cartCount'),
        
        // Category elements
        categoryCards: {
            all: document.getElementById('categoryAll'),
            accessories: document.getElementById('categoryAccessories'),
            tops: document.getElementById('categoryTops'),
            shoes: document.getElementById('categoryShoes'),
            bottoms: document.getElementById('categoryBottoms'),
            facial: document.getElementById('categoryFacial')
        },
        subCategoriesContainer: document.getElementById('subCategoriesContainer'),
        
        // Product display elements
        productsGrid: document.getElementById('productsGrid'),
        productsCount: document.getElementById('productsCount'),
        noProductsMessage: document.getElementById('noProductsMessage'),
        
        // Category count elements
        allCount: document.getElementById('allCount'),
        accessoriesCount: document.getElementById('accessoriesCount'),
        topsCount: document.getElementById('topsCount'),
        shoesCount: document.getElementById('shoesCount'),
        bottomsCount: document.getElementById('bottomsCount'),
        facialCount: document.getElementById('facialCount'),
        
        // Filter and sort elements
        sortSelect: document.getElementById('sortSelect'),
        clearFiltersBtn: document.getElementById('clearFiltersBtn'),
        resetFiltersBtn: document.getElementById('resetFiltersBtn'),
        
        // Price filter elements
        priceMin: document.getElementById('priceMin'),
        priceMax: document.getElementById('priceMax'),
        priceMinValue: document.getElementById('priceMinValue'),
        priceMaxValue: document.getElementById('priceMaxValue'),
        
        // Modal elements
        quickViewModal: document.getElementById('quickViewModal'),
        closeModal: document.getElementById('closeModal'),
        modalBody: document.getElementById('modalBody'),
        
        // Notification elements
        notification: document.getElementById('notification'),
        notificationMessage: document.getElementById('notificationMessage'),
        
        // Loading state
        loadingState: document.querySelector('.loading-state')
    };
}

/**
 * Load products from JSON file
 */
async function loadProducts() {
    try {
        showLoading(true);
        
        // Try to load from external JSON file
        const response = await fetch('data/products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.products || !Array.isArray(data.products)) {
            throw new Error('Invalid product data format');
        }
        
        // Process and validate products
        AppState.allProducts = data.products.map((product, index) => ({
            id: product.id || index + 1,
            title: product.title || 'Untitled Product',
            description: product.description || 'No description available',
            price: parseFloat(product.price) || 0,
            salePrice: product.salePrice ? parseFloat(product.salePrice) : null,
            mainCategory: product.mainCategory || 'uncategorized',
            subCategory: product.subCategory || null,
            image: product.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=500&fit=crop',
            color: product.color || 'Various',
            size: product.size || ['One Size'],
            material: product.material || 'Not specified',
            tags: Array.isArray(product.tags) ? product.tags : (product.tags ? [product.tags] : []),
            featured: Boolean(product.featured),
            inStock: product.inStock !== false,
            sku: product.sku || `404-${String(index + 1).padStart(3, '0')}`,
            rating: product.rating || Math.floor(Math.random() * 3) + 3,
            reviewCount: product.reviewCount || Math.floor(Math.random() * 50) + 10,
            createdAt: product.createdAt || new Date().toISOString()
        }));
        
        // Update categories from data if available
        if (data.categories) {
            AppState.categories = { ...AppState.categories, ...data.categories };
        }
        
        // Update currency if provided
        if (data.currency) {
            CONFIG.currency = data.currency;
        }
        
        // Update price range if provided
        if (data.priceRange) {
            AppState.currentFilter.priceRange = data.priceRange;
            if (DOM.priceMin && DOM.priceMax) {
                DOM.priceMin.value = data.priceRange.min;
                DOM.priceMax.value = data.priceRange.max;
                updatePriceDisplay();
            }
        }
        
        // Initialize filtered products
        AppState.filteredProducts = [...AppState.allProducts];
        AppState.displayedProducts = [...AppState.filteredProducts];
        
        // Update counts
        updateCategoryCounts();
        updateProductCount();
        
        // Render products
        renderProducts();
        
        showLoading(false);
        
        console.log(`✅ Loaded ${AppState.allProducts.length} products successfully`);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showLoading(false);
        showNotification('Using sample product data. Please check your data/products.json file.', 'warning');
        
        // Fallback to sample data
        loadSampleProducts();
    }
}

/**
 * Load sample products as fallback
 */
function loadSampleProducts() {
    AppState.allProducts = [
        {
            id: 1,
            title: "Cowboy Like Me",
            description: "Vintage inspired denim jacket with embroidered western details",
            price: 250.00,
            salePrice: 225.00,
            mainCategory: "tops",
            subCategory: "oversize",
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
            color: "Blue",
            size: ["S", "M", "L", "XL"],
            material: "Premium Denim",
            tags: ["denim", "jacket", "vintage", "western"],
            featured: true,
            inStock: true,
            sku: "404-TOPS-001",
            rating: 4.5,
            reviewCount: 42
        },
        {
            id: 2,
            title: "Oat Silk",
            description: "Premium silk blend oversized shirt in natural oat color",
            price: 180.00,
            salePrice: 162.00,
            mainCategory: "tops",
            subCategory: "oversize",
            image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
            color: "Beige",
            size: ["S", "M", "L"],
            material: "Silk Blend",
            tags: ["silk", "shirt", "oversized", "premium"],
            featured: true,
            inStock: true,
            sku: "404-TOPS-002",
            rating: 4.7,
            reviewCount: 38
        },
        {
            id: 3,
            title: "Midnight Necklace",
            description: "Sterling silver necklace with geometric pendant",
            price: 90.00,
            mainCategory: "accessories",
            subCategory: "necklace",
            image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop",
            color: "Silver",
            size: ["One Size"],
            material: "Sterling Silver",
            tags: ["necklace", "silver", "geometric", "jewelry"],
            featured: true,
            inStock: true,
            sku: "404-ACC-001",
            rating: 4.8,
            reviewCount: 56
        }
    ];
    
    AppState.filteredProducts = [...AppState.allProducts];
    AppState.displayedProducts = [...AppState.filteredProducts];
    
    updateCategoryCounts();
    updateProductCount();
    renderProducts();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Category selection
    Object.entries(DOM.categoryCards).forEach(([category, element]) => {
        if (element) {
            element.addEventListener('click', () => selectMainCategory(category === 'all' ? 'all' : category));
        }
    });
    
    // Search functionality
    if (CONFIG.enableSearch) {
        DOM.searchInput.addEventListener('keyup', debounce(performSearch, 300));
        DOM.searchBtn.addEventListener('click', performSearch);
    }
    
    // Sort functionality
    DOM.sortSelect.addEventListener('change', () => {
        AppState.currentFilter.sortBy = DOM.sortSelect.value;
        applyFilters();
    });
    
    // Clear filters
    DOM.clearFiltersBtn.addEventListener('click', clearAllFilters);
    DOM.resetFiltersBtn.addEventListener('click', clearAllFilters);
    
    // Modal
    DOM.closeModal.addEventListener('click', closeQuickView);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeQuickView();
    });
    
    // Notification auto-hide
    if (DOM.notification) {
        DOM.notification.addEventListener('click', () => {
            DOM.notification.classList.remove('show');
        });
    }
}

/**
 * Setup price range filter
 */
function setupPriceFilter() {
    if (!CONFIG.enablePriceFilter || !DOM.priceMin || !DOM.priceMax) return;
    
    DOM.priceMin.addEventListener('input', debounce(() => {
        AppState.currentFilter.priceRange.min = parseInt(DOM.priceMin.value);
        updatePriceDisplay();
        applyFilters();
    }, 300));
    
    DOM.priceMax.addEventListener('input', debounce(() => {
        AppState.currentFilter.priceRange.max = parseInt(DOM.priceMax.value);
        updatePriceDisplay();
        applyFilters();
    }, 300));
}

/**
 * Update price range display
 */
function updatePriceDisplay() {
    if (DOM.priceMinValue) {
        DOM.priceMinValue.textContent = `${CONFIG.currency} ${DOM.priceMin.value}`;
    }
    if (DOM.priceMaxValue) {
        DOM.priceMaxValue.textContent = `${CONFIG.currency} ${DOM.priceMax.value}`;
    }
}

// ===== CATEGORY FUNCTIONS =====

/**
 * Select main category
 */
function selectMainCategory(categoryId) {
    // Update active state
    Object.entries(DOM.categoryCards).forEach(([cat, element]) => {
        if (element) {
            element.classList.toggle('active', cat === categoryId);
        }
    });
    
    // Update filter state
    AppState.currentFilter.mainCategory = categoryId;
    AppState.currentFilter.subCategory = null;
    
    // Show/hide sub-categories
    if (categoryId !== 'all' && AppState.categories[categoryId]) {
        renderSubCategories(categoryId);
        DOM.subCategoriesContainer.style.display = 'flex';
    } else {
        DOM.subCategoriesContainer.style.display = 'none';
        DOM.subCategoriesContainer.innerHTML = '';
    }
    
    // Apply filters
    applyFilters();
}

/**
 * Render sub-categories
 */
function renderSubCategories(mainCategoryId) {
    if (!DOM.subCategoriesContainer) return;
    
    const category = AppState.categories[mainCategoryId];
    if (!category || !category.subCategories) return;
    
    DOM.subCategoriesContainer.innerHTML = '';
    
    // Add "All" button
    const allButton = createSubCategoryButton('all', 'All', true);
    DOM.subCategoriesContainer.appendChild(allButton);
    
    // Add sub-category buttons
    Object.entries(category.subCategories).forEach(([id, name]) => {
        const button = createSubCategoryButton(id, name, false);
        DOM.subCategoriesContainer.appendChild(button);
    });
}

/**
 * Create sub-category button
 */
function createSubCategoryButton(id, name, isActive) {
    const button = document.createElement('button');
    button.className = `sub-category-btn ${isActive ? 'active' : ''}`;
    button.textContent = name;
    button.dataset.subCategory = id;
    
    button.addEventListener('click', () => {
        // Update all buttons
        document.querySelectorAll('.sub-category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update filter
        AppState.currentFilter.subCategory = id === 'all' ? null : id;
        applyFilters();
    });
    
    return button;
}

// ===== FILTER FUNCTIONS =====

/**
 * Apply all active filters
 */
function applyFilters() {
    showLoading(true);
    
    let filtered = [...AppState.allProducts];
    
    // Apply main category filter
    if (AppState.currentFilter.mainCategory && AppState.currentFilter.mainCategory !== 'all') {
        filtered = filtered.filter(product => 
            product.mainCategory === AppState.currentFilter.mainCategory
        );
    }
    
    // Apply sub-category filter
    if (AppState.currentFilter.subCategory) {
        filtered = filtered.filter(product => 
            product.subCategory === AppState.currentFilter.subCategory
        );
    }
    
    // Apply search filter
    if (AppState.currentFilter.searchTerm) {
        const searchTerm = AppState.currentFilter.searchTerm.toLowerCase().trim();
        filtered = filtered.filter(product => {
            const searchableText = [
                product.title,
                product.description,
                ...(product.tags || []),
                product.color,
                product.material
            ].join(' ').toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
    }
    
    // Apply price filter
    if (CONFIG.enablePriceFilter) {
        filtered = filtered.filter(product => {
            const price = product.salePrice || product.price;
            return price >= AppState.currentFilter.priceRange.min && 
                   price <= AppState.currentFilter.priceRange.max;
        });
    }
    
    // Apply in-stock filter
    if (AppState.currentFilter.inStockOnly) {
        filtered = filtered.filter(product => product.inStock);
    }
    
    // Apply featured filter
    if (AppState.currentFilter.featuredOnly) {
        filtered = filtered.filter(product => product.featured);
    }
    
    // Apply sorting
    filtered = sortProducts(filtered, AppState.currentFilter.sortBy);
    
    // Update state
    AppState.filteredProducts = filtered;
    AppState.displayedProducts = filtered.slice(0, CONFIG.productsPerPage);
    AppState.currentPage = 1;
    
    // Update UI
    updateProductCount();
    renderProducts();
    
    // Show/hide no products message
    if (DOM.noProductsMessage) {
        if (filtered.length === 0) {
            DOM.noProductsMessage.style.display = 'block';
            DOM.productsGrid.style.display = 'none';
        } else {
            DOM.noProductsMessage.style.display = 'none';
            DOM.productsGrid.style.display = 'grid';
        }
    }
    
    showLoading(false);
}

/**
 * Perform search
 */
function performSearch() {
    if (!CONFIG.enableSearch) return;
    
    AppState.currentFilter.searchTerm = DOM.searchInput.value.trim();
    applyFilters();
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    // Reset filter state
    AppState.currentFilter = {
        mainCategory: 'all',
        subCategory: null,
        searchTerm: '',
        sortBy: CONFIG.defaultSort,
        priceRange: { min: 0, max: 250 },
        inStockOnly: false,
        featuredOnly: false
    };
    
    // Reset UI
    if (DOM.searchInput) DOM.searchInput.value = '';
    if (DOM.sortSelect) DOM.sortSelect.value = CONFIG.defaultSort;
    if (DOM.priceMin) DOM.priceMin.value = 0;
    if (DOM.priceMax) DOM.priceMax.value = 250;
    
    // Update category buttons
    Object.entries(DOM.categoryCards).forEach(([category, element]) => {
        if (element) {
            element.classList.toggle('active', category === 'all');
        }
    });
    
    // Clear sub-categories
    if (DOM.subCategoriesContainer) {
        DOM.subCategoriesContainer.style.display = 'none';
        DOM.subCategoriesContainer.innerHTML = '';
    }
    
    // Apply filters (show all products)
    applyFilters();
    
    updatePriceDisplay();
    showNotification('All filters cleared');
}

/**
 * Sort products
 */
function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => {
                const priceA = a.salePrice || a.price;
                const priceB = b.salePrice || b.price;
                return priceA - priceB;
            });
            
        case 'price-high':
            return sorted.sort((a, b) => {
                const priceA = a.salePrice || a.price;
                const priceB = b.salePrice || b.price;
                return priceB - priceA;
            });
            
        case 'newest':
            return sorted.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
        case 'popular':
            return sorted.sort((a, b) => {
                const ratingA = (a.rating || 0) * (a.reviewCount || 0);
                const ratingB = (b.rating || 0) * (b.reviewCount || 0);
                return ratingB - ratingA;
            });
            
        case 'featured':
        default:
            return sorted.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                
                // Secondary sort by creation date
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
    }
}

// ===== PRODUCT RENDERING =====

/**
 * Render products to grid
 */
function renderProducts() {
    if (!DOM.productsGrid) return;
    
    DOM.productsGrid.innerHTML = '';
    
    if (AppState.displayedProducts.length === 0) {
        return;
    }
    
    AppState.displayedProducts.forEach(product => {
        const productCard = createProductCard(product);
        DOM.productsGrid.appendChild(productCard);
    });
}

/**
 * Create product card element
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    card.dataset.category = product.mainCategory;
    card.dataset.sku = product.sku;
    
    const category = AppState.categories[product.mainCategory];
    const categoryName = category ? category.name : product.mainCategory;
    const displayPrice = product.salePrice || product.price;
    const originalPrice = product.salePrice ? product.price : null;
    const discountPercent = originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;
    
    // Create rating stars
    const ratingStars = createRatingStars(product.rating || 0);
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" alt="${product.title}" class="product-image" 
                 loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=500&fit=crop'">
            
            <div class="product-badges">
                <span class="product-badge badge-category">${categoryName}</span>
                ${product.featured ? '<span class="product-badge badge-featured">Featured</span>' : ''}
                ${product.salePrice ? `<span class="product-badge badge-sale">-${discountPercent}%</span>` : ''}
                ${!product.inStock ? '<span class="product-badge badge-sale">Out of Stock</span>' : ''}
            </div>
            
            <div class="product-overlay">
                <button class="btn-quick-view">
                    <i class="fas fa-eye"></i> Quick View
                </button>
            </div>
        </div>
        
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            
            ${ratingStars}
            
            <p class="product-description">${product.description}</p>
            
            <div class="product-price">
                ${originalPrice ? `
                    <span class="original-price">${CONFIG.currency} ${originalPrice.toFixed(2)}</span>
                ` : ''}
                <span class="current-price">${CONFIG.currency} ${displayPrice.toFixed(2)}</span>
            </div>
            
            ${product.tags && product.tags.length > 0 ? `
                <div class="product-tags">
                    ${product.tags.slice(0, 3).map(tag => `
                        <span class="product-tag">${tag}</span>
                    `).join('')}
                    ${product.tags.length > 3 ? `<span class="product-tag">+${product.tags.length - 3}</span>` : ''}
                </div>
            ` : ''}
            
            <div class="product-actions">
                <button class="btn-add-to-cart" ${!product.inStock ? 'disabled' : ''}>
                    <i class="fas fa-shopping-bag"></i> 
                    ${!product.inStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button class="btn-quick-view">
                    <i class="fas fa-eye"></i> View
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addToCartBtn = card.querySelector('.btn-add-to-cart');
    const quickViewBtns = card.querySelectorAll('.btn-quick-view');
    
    if (product.inStock) {
        addToCartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(product);
        });
    }
    
    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showQuickView(product);
        });
    });
    
    // Make entire card clickable for quick view
    if (CONFIG.enableQuickView) {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-add-to-cart') && !e.target.closest('.btn-quick-view')) {
                showQuickView(product);
            }
        });
    }
    
    return card;
}

/**
 * Create rating stars HTML
 */
function createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '<div class="product-rating">';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    starsHTML += ` <span class="rating-text">${rating.toFixed(1)}</span>`;
    starsHTML += '</div>';
    
    return starsHTML;
}

// ===== QUICK VIEW MODAL =====

/**
 * Show quick view modal
 */
function showQuickView(product) {
    if (!CONFIG.enableQuickView) return;
    
    const category = AppState.categories[product.mainCategory];
    const categoryName = category ? category.name : product.mainCategory;
    const subCategoryName = category && product.subCategory ? category.subCategories[product.subCategory] : '';
    const displayPrice = product.salePrice || product.price;
    const originalPrice = product.salePrice ? product.price : null;
    const discountPercent = originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;
    
    DOM.modalBody.innerHTML = `
        <div class="quick-view-content">
            <div class="quick-view-images">
                <img src="${product.image}" alt="${product.title}" class="quick-view-main-image">
                <div class="image-thumbnails">
                    <img src="${product.image}" alt="${product.title}" class="thumbnail active">
                    <!-- Additional thumbnails could be added here -->
                </div>
            </div>
            
            <div class="quick-view-details">
                <div class="quick-view-header">
                    <div class="quick-view-categories">
                        <span class="quick-view-category">${categoryName}</span>
                        ${subCategoryName ? `<span class="quick-view-subcategory">› ${subCategoryName}</span>` : ''}
                    </div>
                    <div class="quick-view-sku">SKU: ${product.sku}</div>
                </div>
                
                <h2 class="quick-view-title">${product.title}</h2>
                
                ${createRatingStars(product.rating || 0)}
                
                <div class="quick-view-price">
                    ${originalPrice ? `
                        <div class="price-original">${CONFIG.currency} ${originalPrice.toFixed(2)}</div>
                        <div class="price-sale">${CONFIG.currency} ${displayPrice.toFixed(2)}</div>
                        <div class="price-discount">Save ${CONFIG.currency} ${(originalPrice - displayPrice).toFixed(2)} (${discountPercent}% off)</div>
                    ` : `
                        <div class="price-current">${CONFIG.currency} ${displayPrice.toFixed(2)}</div>
                    `}
                </div>
                
                <p class="quick-view-description">${product.description}</p>
                
                <div class="quick-view-specs">
                    ${product.color ? `
                        <div class="spec-item">
                            <strong>Color:</strong>
                            <span class="spec-value">${product.color}</span>
                        </div>
                    ` : ''}
                    
                    ${product.size ? `
                        <div class="spec-item">
                            <strong>Size:</strong>
                            <div class="size-options">
                                ${Array.isArray(product.size) ? product.size.map(size => `
                                    <button class="size-option">${size}</button>
                                `).join('') : `<span class="spec-value">${product.size}</span>`}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${product.material ? `
                        <div class="spec-item">
                            <strong>Material:</strong>
                            <span class="spec-value">${product.material}</span>
                        </div>
                    ` : ''}
                    
                    ${product.tags && product.tags.length > 0 ? `
                        <div class="spec-item">
                            <strong>Tags:</strong>
                            <div class="tags-container">
                                ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                    <i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    ${product.inStock ? 'In Stock - Ready to Ship' : 'Out of Stock'}
                </div>
                
                <div class="quick-view-actions">
                    <button class="btn-primary quick-view-add-to-cart" ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-bag"></i> 
                        ${!product.inStock ? 'Out of Stock' : `Add to Cart - ${CONFIG.currency} ${displayPrice.toFixed(2)}`}
                    </button>
                    <button class="btn-secondary quick-view-close">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners in modal
    const addToCartBtn = DOM.modalBody.querySelector('.quick-view-add-to-cart');
    const closeBtn = DOM.modalBody.querySelector('.quick-view-close');
    
    if (product.inStock) {
        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
            closeQuickView();
        });
    }
    
    closeBtn.addEventListener('click', closeQuickView);
    
    // Size selection
    const sizeOptions = DOM.modalBody.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Show modal
    DOM.quickViewModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Close quick view modal
 */
function closeQuickView() {
    DOM.quickViewModal.style.display = 'none';
    document.body.style.overflow = '';
}

// ===== CART FUNCTIONS =====

/**
 * Add product to cart
 */
function addToCart(product, quantity = 1) {
    const existingItem = AppState.cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        AppState.cart.push({
            ...product,
            quantity: quantity,
            addedAt: new Date().toISOString(),
            selectedSize: null,
            selectedColor: product.color
        });
    }
    
    // Update cart count
    updateCartCount();
    
    // Save to storage
    saveCartToStorage();
    
    // Show notification
    showNotification(`"${product.title}" added to cart!`, 'success');
}

/**
 * Update cart count display
 */
function updateCartCount() {
    const totalItems = AppState.cart.reduce((total, item) => total + item.quantity, 0);
    
    if (DOM.cartCount) {
        DOM.cartCount.textContent = totalItems;
        DOM.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    AppState.cartCount = totalItems;
}

/**
 * Save cart to localStorage
 */
function saveCartToStorage() {
    if (!CONFIG.localStorageEnabled) return;
    
    try {
        localStorage.setItem(CONFIG.cartKey, JSON.stringify(AppState.cart));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

/**
 * Load cart from localStorage
 */
function loadCartFromStorage() {
    if (!CONFIG.localStorageEnabled) return;
    
    try {
        const savedCart = localStorage.getItem(CONFIG.cartKey);
        if (savedCart) {
            AppState.cart = JSON.parse(savedCart);
            updateCartCount();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// ===== UI UPDATE FUNCTIONS =====

/**
 * Update product count display
 */
function updateProductCount() {
    if (!DOM.productsCount) return;
    
    const total = AppState.allProducts.length;
    const showing = AppState.filteredProducts.length;
    
    let countText = `${showing} ${showing === 1 ? 'product' : 'products'}`;
    
    if (showing < total) {
        countText += ` of ${total}`;
    }
    
    if (AppState.currentFilter.searchTerm) {
        countText += ` for "${AppState.currentFilter.searchTerm}"`;
    }
    
    if (AppState.currentFilter.mainCategory !== 'all') {
        const cat = AppState.categories[AppState.currentFilter.mainCategory];
        const catName = cat ? cat.name : AppState.currentFilter.mainCategory;
        countText += ` in ${catName}`;
    }
    
    DOM.productsCount.textContent = countText;
}

/**
 * Update category counts
 */
function updateCategoryCounts() {
    if (!DOM.allCount) return;
    
    const counts = {
        all: AppState.allProducts.length,
        accessories: AppState.allProducts.filter(p => p.mainCategory === 'accessories').length,
        tops: AppState.allProducts.filter(p => p.mainCategory === 'tops').length,
        shoes: AppState.allProducts.filter(p => p.mainCategory === 'shoes').length,
        bottoms: AppState.allProducts.filter(p => p.mainCategory === 'bottoms').length,
        facial: AppState.allProducts.filter(p => p.mainCategory === 'facial').length
    };
    
    // Update DOM elements
    DOM.allCount.textContent = counts.all;
    if (DOM.accessoriesCount) DOM.accessoriesCount.textContent = counts.accessories;
    if (DOM.topsCount) DOM.topsCount.textContent = counts.tops;
    if (DOM.shoesCount) DOM.shoesCount.textContent = counts.shoes;
    if (DOM.bottomsCount) DOM.bottomsCount.textContent = counts.bottoms;
    if (DOM.facialCount) DOM.facialCount.textContent = counts.facial;
}

/**
 * Update all UI elements
 */
function updateUI() {
    updateProductCount();
    updateCartCount();
    updatePriceDisplay();
}

/**
 * Show loading state
 */
function showLoading(isLoading) {
    AppState.isLoading = isLoading;
    
    if (DOM.loadingState) {
        DOM.loadingState.style.display = isLoading ? 'flex' : 'none';
    }
    
    if (DOM.productsGrid) {
        DOM.productsGrid.style.opacity = isLoading ? '0.5' : '1';
        DOM.productsGrid.style.pointerEvents = isLoading ? 'none' : 'auto';
    }
}

// ===== NOTIFICATION SYSTEM =====

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    if (!DOM.notification || !DOM.notificationMessage) return;
    
    DOM.notificationMessage.textContent = message;
    DOM.notification.className = 'notification';
    DOM.notification.classList.add(type);
    
    // Remove any existing show class
    DOM.notification.classList.remove('show');
    
    // Force reflow
    void DOM.notification.offsetWidth;
    
    // Add show class
    DOM.notification.classList.add('show');
    
    // Auto-hide
    setTimeout(() => {
        DOM.notification.classList.remove('show');
    }, 3000);
}

/**
 * Show fatal error
 */
function showFatalError(message) {
    if (DOM.productsGrid) {
        DOM.productsGrid.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle fa-4x" style="color: #ff3b30; margin-bottom: 20px;"></i>
                <h3 style="color: #333; margin-bottom: 15px; font-size: 24px;">System Error</h3>
                <p style="color: #666; margin-bottom: 25px; font-size: 16px; max-width: 500px; margin-left: auto; margin-right: auto;">
                    ${message}
                </p>
                <button onclick="window.location.reload()" class="btn-primary" style="padding: 12px 30px;">
                    <i class="fas fa-redo"></i> Reload Page
                </button>
            </div>
        `;
    }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format price with currency
 */
function formatPrice(amount) {
    return `${CONFIG.currency} ${parseFloat(amount).toFixed(2)}`;
}

/**
 * Truncate text
 */
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        selectMainCategory,
        applyFilters,
        addToCart,
        formatPrice
    };
}

// ===== GLOBAL ACCESS FOR DEBUGGING =====
window._404WEAR = {
    state: AppState,
    config: CONFIG,
    reload: () => {
        clearAllFilters();
        loadProducts();
    },
    debug: () => {
        console.log('=== 404WEAR DEBUG INFO ===');
        console.log('Products:', AppState.allProducts.length);
        console.log('Filtered:', AppState.filteredProducts.length);
        console.log('Cart:', AppState.cart.length, 'items');
        console.log('Current Filter:', AppState.currentFilter);
        console.log('Categories:', Object.keys(AppState.categories));
    }
};