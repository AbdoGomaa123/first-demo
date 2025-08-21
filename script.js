// Global variables
let businesses = [];

// Document ready function
$(document).ready(function() {
    // Show loading indicator
    $('main').html(`
        <div id="loading-indicator" class="loading">
            <div class="spinner"></div>
            <p>Loading businesses...</p>
        </div>
    `);
    
    // Set up event listeners
    setupEventListeners();
    
    // Apply theme
    applyTheme();
    
    // Initial screen size adjustment
    adjustForScreenSize();
    
    // Fetch business data
    setTimeout(function() {
        fetchBusinessData();
    }, 100);
});

// Fetch data from Google Sheet
function fetchBusinessData() {
    const sheetId = '1cUAi6Jrl3ME6U4T0iM5N2ouplPMuTcb7uyw-R9wouxw';
    const publishedUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRWHknmx--m-5dCgGCXrPfpaZ7I3f_uqV1yIc1i9caa5cjohWf21MDsszfvoK1h1ktUsMtm2a5GwgKO/pub?output=csv`;
    
    console.log("Fetching data from Google Sheet");
    
    $.ajax({
        url: publishedUrl,
        type: 'GET',
        dataType: 'text',
        success: function(csvData) {
            console.log("CSV data received");
            businesses = parseCSV(csvData);
            populatePage(businesses);
            
            const activeCategory = sessionStorage.getItem('activeCategory') || 'all';
            filterCategory(activeCategory);
        },
        error: function(error) {
            console.error("Error fetching data:", error);
            populatePage([]);
        }
    });
}

// Fixed CSV parsing to prevent multiple cards per row
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
    
    if (lines.length <= 1) {
        console.error("CSV data is empty or has only headers");
        return [];
    }
    
    const headers = lines[0].split(',').map(header => 
        header.replace(/"/g, '').trim().toLowerCase()
    );
    
    console.log("Headers:", headers);
    
    const businesses = [];
    
    // Process each data row (skip header)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parsing - split by comma and clean quotes
        const values = line.split(',').map(value => 
            value.replace(/^"|"$/g, '').trim()
        );
        
        // Create business object with proper mapping
        const business = {};
        
        headers.forEach((header, index) => {
            if (index < values.length) {
                const value = values[index];
                
                // Map headers to business properties
                switch(header) {
                    case 'vendor':
                        business.name = value;
                        break;
                    case 'category':
                        business.category = value;
                        break;
                    case 'logo link':
                        business.logolink = value;
                        break;
                    case 'locations':
                        business.location = value;
                        break;
                    case 'location-url':
                        business.locationUrl = value;
                        break;
                    case 'contact':
                        business.contact = value;
                        break;
                    case 'discount rate':
                        business.discountrate = value;
                        break;
                    case 'service':
                        business.service = value;
                        break;
                    case 'email':
                        business.email = value;
                        break;
                    default:
                        business[header] = value;
                }
            }
        });
        
        // Only add if business has a name and avoid duplicates
        if (business.name && business.name.trim() && 
            !businesses.some(b => b.name === business.name)) {
            businesses.push(business);
        }
    }
    
    console.log("Parsed businesses:", businesses.length);
    return businesses;
}

// Populate the page with business data
function populatePage(businesses) {
    $('main').empty();
    
    generateCategoryFilters(businesses);
    
    // Create ONE card per business
    businesses.forEach((business, index) => {
        const categoryClass = (business.category || '').toLowerCase().replace(/\s+/g, '');
        
        const discountTag = business.discountrate 
            ? `<div class="discount-tag">${business.discountrate}% OFF</div>` 
            : '';
        
        // Handle logo
        let logoContent;
        if (business.logolink && (business.logolink.startsWith('http') || business.logolink.includes('.'))) {
            logoContent = `<img src="${business.logolink}" alt="${business.name}" class="business-logo" onerror="this.outerHTML='<div class=\\'image-placeholder\\'>Image</div>';">`;
        } else {
            logoContent = `<div class="image-placeholder">Image</div>`;
        }
        
        const businessElement = $(`
            <div class="category ${categoryClass}" data-category="${business.category || ''}">
                <div class="logo-container">
                    ${logoContent}
                    ${discountTag}
                </div>
                <p>${business.name}</p>
                <button class="show-details-btn">Show Details</button>
            </div>
        `);
        
        $('main').append(businessElement);
        
        // Add click events
        businessElement.find('.logo-container, .business-logo, .image-placeholder').on('click', function() {
            showPopup(`business-${index}`, business.name, business);
        });
        
        businessElement.find('.show-details-btn').on('click', function() {
            showPopup(`business-${index}`, business.name, business);
        });
    });
    
    adjustForScreenSize();
}

// Generate category filters
function generateCategoryFilters(businesses) {
    const categories = ['all'];
    
    businesses.forEach(business => {
        if (business.category && business.category.trim()) {
            const category = business.category.trim().toLowerCase();
            if (!categories.includes(category)) {
                categories.push(category);
            }
        }
    });
    
    const sidebarList = $('aside ul');
    const mobileMenuList = $('.mobile-menu-content ul');
    
    sidebarList.empty();
    mobileMenuList.empty();
    
    categories.forEach(category => {
        const displayCategory = category === 'all' ? 'ALL' : category.toUpperCase();
        
        sidebarList.append(`
            <li><button onclick="filterCategory('${category}')">${displayCategory}</button></li>
        `);
        
        mobileMenuList.append(`
            <li><button onclick="filterCategory('${category}'); closeMobileMenu();">${displayCategory}</button></li>
        `);
    });
}

// Show popup with business details
function showPopup(id, storeName, business) {
    const popup = $('.popup');
    const overlay = $('.popup-overlay');
    
    popup.find('h3').text(storeName);
    
    const discountDisplay = business.discountrate 
        ? `<p class="discount-rate">${business.discountrate}% Discount</p>`
        : '';
    
    let locationInfo = 'N/A';
    if (business.location) {
        const locations = business.location.split(',').map(loc => loc.trim());
        const locationUrls = business.locationUrl ? business.locationUrl.split(',').map(url => url.trim()) : [];
        
        const locationLinks = locations.map((location, index) => {
            if (index < locationUrls.length && locationUrls[index]) {
                return `<a href="${locationUrls[index]}" target="_blank" class="location-link">
                    <i class="fas fa-map-marker-alt"></i> ${location}
                </a>`;
            }
            return `<span class="location-link">
                <i class="fas fa-map-marker-alt"></i> ${location}
            </span>`;
        });
        
        locationInfo = `<div class="location-links-container">
            ${locationLinks.join('')}
        </div>`;
    }
    
    const serviceInfo = business.service 
        ? `<div class="service-section">
            <h4>Services</h4>
            <p class="service-info">${business.service}</p>
          </div>`
        : '';
    
    const emailDisplay = business.email
        ? `<p class="email-info">✉️ ${business.email}</p>`
        : '';
    
    popup.find('.popup-content').html(`
        <div class="contact-section">
            <h4>Contact for Assistance</h4>
            <p class="contact-info">📞 ${business.contact || 'N/A'}</p>
            ${emailDisplay}
            <div class="location-info">
                <h4>Locations</h4>
                <div class="locations-container">
                    ${locationInfo}
                </div>
            </div>
            ${discountDisplay}
            ${serviceInfo}
        </div>
        <div class="terms-section">
            <h4>Terms and Conditions</h4>
            <p class="terms-text">This offer is valid for UCE community. Must present valid UCE ID at time of purchase.</p>
        </div>
    `);
    
    overlay.css('display', 'block');
    popup.css('display', 'block');
    $('body').css('overflow', 'hidden');
}

// Filter businesses by category
function filterCategory(category) {
    sessionStorage.setItem('activeCategory', category);
    
    $('.category').each(function() {
        const item = $(this);
        const businessCat = item.attr('data-category') || '';
        
        if (category === 'all' || businessCat.toLowerCase() === category.toLowerCase()) {
            item.css('display', 'block');
        } else {
            item.css('display', 'none');
        }
    });
    
    // Update active button
    $('aside ul li button, .mobile-menu-content ul li button').removeClass('active');
    $('aside ul li button, .mobile-menu-content ul li button').each(function() {
        const button = $(this);
        if (button.text().toLowerCase() === category.toLowerCase() || 
            (button.text().toLowerCase() === 'all' && category === 'all')) {
            button.addClass('active');
        }
    });
}

// Hide popup
function hidePopup() {
    $('.popup, .popup-overlay').css('display', 'none');
    $('body').css('overflow', 'auto');
}

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = $('.mobile-menu');
    mobileMenu.toggleClass('active');
    
    if (mobileMenu.hasClass('active')) {
        mobileMenu.css('transform', 'translateX(0)');
        $('body').css('overflow', 'hidden');
    } else {
        mobileMenu.css('transform', 'translateX(-100%)');
        $('body').css('overflow', 'auto');
    }
}

// Close mobile menu
function closeMobileMenu() {
    $('.mobile-menu').removeClass('active').css('transform', 'translateX(-100%)');
    $('body').css('overflow', 'auto');
}

// Adjust for screen size
function adjustForScreenSize() {
    if ($(window).width() <= 768) {
        $('.show-details-btn').css('display', 'block');
        $('.image-placeholder, .business-logo').css('pointer-events', 'none');
        $('.mobile-menu-toggle').css('display', 'flex');
        $('aside').css('display', 'none');
    } else {
        $('.show-details-btn').css('display', 'none');
        $('.image-placeholder, .business-logo').css('pointer-events', 'auto');
        $('.mobile-menu-toggle').css('display', 'none');
        $('aside').css('display', 'block');
    }
}

// Apply theme
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        $('body').addClass('dark-mode');
        updateThemeIcons(true);
    } else {
        $('body').removeClass('dark-mode');
        updateThemeIcons(false);
    }
}

// Update theme icons
function updateThemeIcons(isDark) {
    if (isDark) {
        $('#mode-icon').text('☀️');
        $('#mode-text').text('Light Mode');
        $('#mobile-mode-icon').text('☀️');
    } else {
        $('#mode-icon').text('🌙');
        $('#mode-text').text('Dark Mode');
        $('#mobile-mode-icon').text('🌙');
    }
}

// Toggle theme
function toggleTheme() {
    const isDarkMode = $('body').toggleClass('dark-mode').hasClass('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcons(isDarkMode);
}

// Set up event listeners
function setupEventListeners() {
    $('.popup-overlay, .popup .close-btn').on('click', hidePopup);
    
    $(document).on('keydown', function(event) {
        if (event.key === 'Escape') {
            hidePopup();
        }
    });
    
    $('.mobile-menu-toggle').on('click', toggleMobileMenu);
    $('.mobile-menu-close').on('click', closeMobileMenu);
    $('.toggle-mode, .mobile-toggle-mode').on('click', toggleTheme);
    $(window).on('resize', adjustForScreenSize);
}
