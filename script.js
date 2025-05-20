// Global variables
let businesses = [];

// Document ready function - jQuery's version of DOMContentLoaded
$(document).ready(function() {
    // Fetch business data from Google Sheet
    fetchBusinessData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Apply theme
    applyTheme();
    
    // Initial screen size adjustment
    adjustForScreenSize();
});

// Fetch data from Google Sheet using jQuery AJAX with JSONP
function fetchBusinessData() {
    // Show loading indicator
    $('main').html(`
        <div id="loading-indicator" class="loading">
            <div class="spinner"></div>
            <p>Loading businesses...</p>
        </div>
    `);
    
    // Google Sheet information
    const sheetId = '1cUAi6Jrl3ME6U4T0iM5N2ouplPMuTcb7uyw-R9wouxw';
    
    // Method 1: Using Google Visualization API (most reliable for public sheets)
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    
    console.log("Fetching data from Google Sheet:", sheetId);
    
    // Use $.ajax with JSONP to avoid CORS issues
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function(data) {
            // This won't actually be called due to how Google's response is formatted
            console.log("Data received:", data);
        },
        error: function(error) {
            // Try alternative method if this fails
            console.log("Trying alternative method...");
            fetchBusinessDataAlternative();
        }
    });
    
    // Since Google's response isn't properly formatted JSON, we need to intercept the response
    // by defining the callback that the response will call
    window.google = window.google || {};
    window.google.visualization = window.google.visualization || {};
    window.google.visualization.Query = window.google.visualization.Query || {};
    window.google.visualization.Query.setResponse = function(response) {
        console.log("Google Visualization response received");
        
        if (response && response.table) {
            const data = response.table;
            
            // Get column names from the 'cols' array
            const headers = data.cols.map(col => col.label.toLowerCase());
            console.log("Headers:", headers);
            
            // Process rows into business objects
            const rows = data.rows;
            businesses = rows.map(row => {
                const business = {};
                
                // Map each cell to the corresponding header
                headers.forEach((header, index) => {
                    // Use the cell value from the current row
                    const value = row.c[index] ? (row.c[index].v || '') : '';
                    
                    // Map column names based on your CSV file structure
                    let key = header;
                    if (header === 'catogery') key = 'category';
                    if (header === 'locations') key = 'location';
                    if (header === 'location-urls') key = 'locationUrl';
                    if (header === 'contactacts') key = 'contact';
                    if (header === 'discountrate') key = 'discountrate';
                    
                    business[key] = value;
                });
                
                return business;
            }).filter(business => business.name);
            
            console.log("Businesses processed:", businesses.length);
            
            // Populate the page
            populatePage(businesses);
            
            // Apply initial category filter
            const activeCategory = sessionStorage.getItem('activeCategory') || 'all';
            filterCategory(activeCategory);
        } else {
            console.error("Invalid response format:", response);
            fetchBusinessDataAlternative();
        }
    };
}

// Alternative method to fetch data using published CSV
function fetchBusinessDataAlternative() {
    console.log("Attempting alternative CSV method...");
    
    // Try with the direct CSV published URL
    const publishedUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRWHknmx--m-5dCgGCXrPfpaZ7I3f_uqV1yIc1i9caa5cjohWf21MDsszfvoK1h1ktUsMtm2a5GwgKO/pub?output=csv';
    
    $.ajax({
        url: publishedUrl,
        type: 'GET',
        dataType: 'text',
        success: function(csvData) {
            console.log("CSV data received");
            businesses = parseCSV(csvData);
            
            // Populate the page
            populatePage(businesses);
            
            // Apply initial category filter
            const activeCategory = sessionStorage.getItem('activeCategory') || 'all';
            filterCategory(activeCategory);
        },
        error: function(error) {
            console.error("Error fetching CSV data:", error);
            
            // If all methods fail, try one last approach
            tryFinalApproach();
        }
    });
}

// Last attempt using a CORS proxy
function tryFinalApproach() {
    const sheetId = '1cUAi6Jrl3ME6U4T0iM5N2ouplPMuTcb7uyw-R9wouxw';
    const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`)}`;
    
    $.ajax({
        url: corsProxyUrl,
        type: 'GET',
        dataType: 'text',
        success: function(csvData) {
            console.log("Data received through CORS proxy");
            businesses = parseCSV(csvData);
            
            // Populate the page
            populatePage(businesses);
            
            // Apply initial category filter
            const activeCategory = sessionStorage.getItem('activeCategory') || 'all';
            filterCategory(activeCategory);
        },
        error: function(error) {
            console.error("All methods failed. Error:", error);
            showError("Could not load data from Google Sheet. Please check the console for more details.");
        }
    });
}

// Parse CSV data based on your specific column structure
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length <= 1) {
        console.error("CSV data is empty or has only headers");
        showError("The Google Sheet appears to be empty.");
        return [];
    }
    
    // Log the raw headers for debugging
    console.log("Raw CSV headers:", lines[0]);
    
    const headers = lines[0].split(',').map(header => 
        header.replace(/"/g, '').trim().toLowerCase()
    );
    
    console.log("Processed headers:", headers);
    
    return lines.slice(1).map(line => {
        if (!line.trim()) return null; // Skip empty lines
        
        // Handle commas within quoted strings
        const values = [];
        let insideQuote = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
                insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        // Add the last value
        values.push(currentValue.trim());
        
        // Create an object mapping headers to values
        const business = {};
        headers.forEach((header, index) => {
            // Convert column names to match your spreadsheet structure
            let key = header;
            
            // Map column names based on your CSV file
            if (header === 'catogery') key = 'category';
            if (header === 'locations') key = 'location';
            if (header === 'location-urls') key = 'locationUrl';
            if (header === 'contactacts') key = 'contact';
            if (header === 'discountrate') key = 'discountrate';
            
            // Set the value, handling cases where values array is shorter than headers
            if (index < values.length) {
                business[key] = values[index].replace(/"/g, '').trim();
            } else {
                business[key] = '';
            }
        });
        
        return business;
    }).filter(business => business && business.name); // Filter out empty rows and null values
}

// Display error message
function showError(message) {
    $('main').html(`
        <div class="error-message">
            <p>${message}</p>
            <button onclick="fetchBusinessData()">Retry</button>
        </div>
    `);
}

// Populate the page with business data
function populatePage(businesses) {
    // Clear main content
    $('main').empty();
    
    if (businesses.length === 0) {
        showError("No businesses found. Please check your Google Sheet.");
        return;
    }
    
    // Generate dynamic category lists
    generateCategoryFilters(businesses);
    
    // Create business cards
    businesses.forEach((business, index) => {
        // Normalize category name for CSS class
        const categoryClass = (business.category || '').toLowerCase().replace(/\s+/g, '');
        
        // Create image HTML
        const imageHtml = business.logolink 
            ? `<img src="${business.logolink}" alt="${business.name}" class="business-logo">`
            : `<div class="image-placeholder">Image</div>`;
        
        // Create business element
        const businessElement = $(`
            <div class="category ${categoryClass}" data-category="${business.category}">
                ${imageHtml}
                <p>${business.name}</p>
                <button class="show-details-btn">Show Details</button>
            </div>
        `);
        
        // Add to main container
        $('main').append(businessElement);
        
        // Add event listeners for showing details
        businessElement.find('.image-placeholder, .business-logo').on('click', function() {
            showPopup(`business-${index}`, business.name, business);
        });
        
        businessElement.find('.show-details-btn').on('click', function() {
            showPopup(`business-${index}`, business.name, business);
        });
    });
    
    // Adjust for screen size
    adjustForScreenSize();
}

// Generate dynamic category filters from business data
function generateCategoryFilters(businesses) {
    // Extract unique categories from businesses
    const categories = ['all'];
    
    businesses.forEach(business => {
        if (business.category && business.category.trim() !== '') {
            const category = business.category.trim();
            if (!categories.includes(category.toLowerCase())) {
                categories.push(category.toLowerCase());
            }
        }
    });
    
    console.log("Available categories:", categories);
    
    // Generate desktop sidebar filters
    const sidebarList = $('aside ul');
    sidebarList.empty();
    
    // Generate mobile menu filters
    const mobileMenuList = $('.mobile-menu-content ul');
    mobileMenuList.empty();
    
    // Add filters for each category
    categories.forEach(category => {
        const displayCategory = category === 'all' ? 'ALL' : category.toUpperCase();
        
        // Add to desktop sidebar
        sidebarList.append(`
            <li><button onclick="filterCategory('${category}')">${displayCategory}</button></li>
        `);
        
        // Add to mobile menu
        mobileMenuList.append(`
            <li><button onclick="filterCategory('${category}'); closeMobileMenu();">${displayCategory}</button></li>
        `);
    });
    
    // Apply any saved category filter
    const activeCategory = sessionStorage.getItem('activeCategory') || 'all';
    filterCategory(activeCategory);
}

// Show popup with business details
function showPopup(id, storeName, business) {
    const popup = $('.popup');
    const overlay = $('.popup-overlay');
    
    // Set the title
    popup.find('h3').text(storeName);
    
    // Format discount rate
    const discountDisplay = business.discountrate 
        ? `<p class="discount-rate">${business.discountrate}% Discount</p>`
        : '';
    
    // Format locations - display as separate hyperlinks horizontally
    let locationInfo = 'N/A';
    if (business.location) {
        const locations = business.location.split(',').map(loc => loc.trim());
        const locationUrls = business.locationUrl ? business.locationUrl.split(',').map(url => url.trim()) : [];
        
        if (locations.length > 0) {
            // Create individual hyperlinks for each location
            const locationLinks = locations.map((location, index) => {
                // Use URL if available, otherwise just make text
                if (index < locationUrls.length && locationUrls[index]) {
                    return `<a href="${locationUrls[index]}" target="_blank" class="location-link" title="Open map for ${location}">
                        <i class="fas fa-map-marker-alt"></i> ${location}
                    </a>`;
                } else {
                    return `<span class="location-link">
                        <i class="fas fa-map-marker-alt"></i> ${location}
                    </span>`;
                }
            });
            
            // Join the links in a flex container for better horizontal display
            locationInfo = `<div class="location-links-container">
                ${locationLinks.join('')}
            </div>`;
        } else {
            locationInfo = `<div><i class="fas fa-map-marker-alt"></i> N/A</div>`;
        }
    }
    
    // Set popup content - using 📞 phone icon and removing checkbox
    popup.find('.popup-content').html(`
        <div class="contact-section">
            <h4>Contact for Assistance</h4>
            <p class="contact-info">📞 ${business.contact || 'N/A'}</p>
            <div class="location-info">
                <h4>Locations</h4>
                <div class="locations-container">
                    ${locationInfo}
                </div>
            </div>
            ${discountDisplay}
        </div>
        <div class="terms-section">
            <h4>Terms and Conditions</h4>
            <p class="terms-text">This offer is valid for UCE community. Must present valid UCE ID at time of purchase. Cannot be combined with other discounts or promotions.</p>
        </div>
    `);
    
    // Show the popup
    overlay.css('display', 'block');
    popup.css('display', 'block');
    
    // Prevent scrolling
    $('body').css('overflow', 'hidden');
}

// Filter businesses by category
function filterCategory(category) {
    // Store the selected category
    sessionStorage.setItem('activeCategory', category);
    
    console.log("Filtering by category:", category);
    
    // Get all available categories from the actual data
    const availableCategories = businesses.map(business => 
        (business.category || '').toLowerCase().trim()
    ).filter(cat => cat); // Filter out empty categories
    
    console.log("Available categories in data:", availableCategories);
    
    // Filter business cards
    $('.category').each(function() {
        const item = $(this);
        const businessCat = item.attr('data-category') || '';
        
        console.log("Checking item:", item.find('p').text(), "Category:", businessCat, "Looking for:", category);
        
        if (category === 'all' || businessCat.toLowerCase() === category.toLowerCase()) {
            item.css('opacity', '0');
            setTimeout(() => {
                item.css('display', 'block');
                setTimeout(() => {
                    item.css('opacity', '1');
                }, 50);
            }, 300);
        } else {
            item.css('opacity', '0');
            setTimeout(() => {
                item.css('display', 'none');
            }, 300);
        }
    });
    
    // Update active button
    $('aside ul li button, .mobile-menu-content ul li button').each(function() {
        const button = $(this);
        if (button.text().toLowerCase() === category.toLowerCase() || 
            (button.text().toLowerCase() === 'all' && category === 'all')) {
            button.addClass('active');
        } else {
            button.removeClass('active');
        }
    });
}

// Hide popup
function hidePopup() {
    const popup = $('.popup');
    const overlay = $('.popup-overlay');
    
    popup.css('animation', 'zoomOut 0.4s forwards cubic-bezier(0.165, 0.84, 0.44, 1)');
    overlay.css('opacity', '0');
    
    setTimeout(() => {
        popup.css('display', 'none');
        overlay.css('display', 'none');
        popup.css('animation', 'zoomIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)');
        overlay.css('opacity', '1');
        
        // Re-enable scrolling
        $('body').css('overflow', 'auto');
    }, 400);
}

// Toggle mobile menu
function toggleMobileMenu() {
    const menuToggle = $('.mobile-menu-toggle');
    const mobileMenu = $('.mobile-menu');
    
    // Toggle active class
    menuToggle.toggleClass('active');
    mobileMenu.toggleClass('active');
    
    // Set styles based on state
    if (mobileMenu.hasClass('active')) {
        mobileMenu.css({
            'transform': 'translateX(0)',
            'visibility': 'visible',
            'opacity': '1'
        });
        $('body').css('overflow', 'hidden');
    } else {
        mobileMenu.css({
            'transform': 'translateX(-100%)',
            'visibility': 'hidden',
            'opacity': '0'
        });
        $('body').css('overflow', 'auto');
    }
}

// Close mobile menu
function closeMobileMenu() {
    const menuToggle = $('.mobile-menu-toggle');
    const mobileMenu = $('.mobile-menu');
    
    menuToggle.removeClass('active');
    mobileMenu.removeClass('active');
    
    mobileMenu.css({
        'transform': 'translateX(-100%)',
        'visibility': 'hidden',
        'opacity': '0'
    });
    
    $('body').css('overflow', 'auto');
}

// Adjust UI based on screen size
function adjustForScreenSize() {
    if ($(window).width() <= 768) {
        // Mobile view
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        $('.show-details-btn').css('display', 'block');
        $('.image-placeholder, .business-logo').css('pointerEvents', 'none');
        $('.mobile-menu-toggle').css('display', 'flex');
    } else {
        // Desktop view
        $('.show-details-btn').css('display', 'none');
        $('.image-placeholder, .business-logo').css('pointerEvents', 'auto');
        $('.mobile-menu-toggle').css('display', 'none');
    }
}

// Apply theme based on saved preference
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

// Set up all event listeners
function setupEventListeners() {
    // Popup handlers
    $('.popup-overlay, .popup .close-btn').on('click', hidePopup);
    
    // ESC key for closing popup
    $(document).on('keydown', function(event) {
        if (event.key === 'Escape') {
            hidePopup();
        }
    });
    
    // Mobile menu toggles
    $('.mobile-menu-toggle').on('click', toggleMobileMenu);
    $('.mobile-menu-close').on('click', closeMobileMenu);
    
    // Theme toggles
    $('.toggle-mode, .mobile-toggle-mode').on('click', toggleTheme);
    
    // Window resize
    $(window).on('resize', adjustForScreenSize);
}


// Append sidebar to the document when ready
$(document).ready(function() {
    $('body').append(sidebarHTML);
});