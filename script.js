function filterCategory(category) {
    const categories = document.querySelectorAll('.category');
    
    // Store the current category in sessionStorage
    sessionStorage.setItem('activeCategory', category);
    
    categories.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.opacity = '0';
            setTimeout(() => {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 50);
            }, 300);
        } else {
            item.style.opacity = '0';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });

    // Add active class to the selected button
    const buttons = document.querySelectorAll('aside ul li button');
    buttons.forEach(button => {
        if (button.getAttribute('onclick').includes(category)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Show popup with contact and terms information
function showPopup(id, storeName) {
    const popup = document.querySelector('.popup');
    const overlay = document.querySelector('.popup-overlay');
    const title = popup.querySelector('h3');
    
    // Set the title to the store name
    title.textContent = `${storeName}`;

    // Reset the checkbox state
    const agreeCheckbox = document.getElementById('agree-terms');
    if (agreeCheckbox) {
        agreeCheckbox.checked = false;
    }
    
    // Show the popup with animation
    overlay.style.display = 'block';
    popup.style.display = 'block';
    
    // Prevent scrolling on the background
    document.body.style.overflow = 'hidden';
}

// Hide popup
function hidePopup() {
    const popup = document.querySelector('.popup');
    const overlay = document.querySelector('.popup-overlay');
    
    popup.style.animation = 'zoomOut 0.4s forwards cubic-bezier(0.165, 0.84, 0.44, 1)';
    overlay.style.opacity = '0';
    
    setTimeout(() => {
        popup.style.display = 'none';
        overlay.style.display = 'none';
        popup.style.animation = 'zoomIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
        overlay.style.opacity = '1';
        
        // Re-enable scrolling
        document.body.style.overflow = 'auto';
    }, 400);
}

// Toggle mobile menu - Fixed version
function toggleMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    // Debug alert to check if this function is called
    console.log("Menu toggle clicked!");
    
    // Toggle the active class 
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    // Explicitly set styles to ensure visibility 
    if (mobileMenu.classList.contains('active')) {
        mobileMenu.style.transform = 'translateX(0)';
        mobileMenu.style.visibility = 'visible';
        mobileMenu.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    } else {
        mobileMenu.style.transform = 'translateX(-100%)';
        mobileMenu.style.visibility = 'hidden';
        mobileMenu.style.opacity = '0';
        document.body.style.overflow = 'auto';
    }
}

// Close mobile menu - Fixed version
function closeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    menuToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
    
    // Explicitly set styles
    mobileMenu.style.transform = 'translateX(-100%)';
    mobileMenu.style.visibility = 'hidden';
    mobileMenu.style.opacity = '0';
    
    document.body.style.overflow = 'auto';
}

// Fix for 300ms delay on mobile devices
function addTapListener(element, callback) {
    let touchStartTime;
    const MAX_TAP_DURATION = 200;
    
    element.addEventListener('touchstart', () => {
        touchStartTime = Date.now();
    }, { passive: true });
    
    element.addEventListener('touchend', (e) => {
        if (Date.now() - touchStartTime < MAX_TAP_DURATION) {
            callback(e);
        }
    }, { passive: false });
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get stored active category or default to 'all'
    const activeCategory = sessionStorage.getItem('activeCategory') || 'all';
    filterCategory(activeCategory);
    
    // Mobile menu toggle - Ensure it's properly wired up
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    // Force display flex for the menu toggle on mobile
    if (window.innerWidth <= 768) {
        menuToggle.style.display = 'flex';
        
        // Force a standalone event listener
        menuToggle.onclick = function() {
            toggleMobileMenu();
        };
    }
    
    // Make sure the mobile menu element exists
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenu) {
        console.error("Mobile menu element not found!");
    }
    
    // Mobile menu close button
    const menuClose = document.querySelector('.mobile-menu-close');
    if (menuClose) {
        menuClose.addEventListener('click', closeMobileMenu);
    }
    
    // Mobile dark mode toggle
    const mobileModeToggle = document.querySelector('.mobile-toggle-mode');
    mobileModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            document.getElementById('mobile-mode-icon').textContent = '☀️';
            document.getElementById('mode-icon').textContent = '☀️';
            document.getElementById('mode-text').textContent = 'Light Mode';
        } else {
            localStorage.setItem('theme', 'light');
            document.getElementById('mobile-mode-icon').textContent = '🌙';
            document.getElementById('mode-icon').textContent = '🌙';
            document.getElementById('mode-text').textContent = 'Dark Mode';
        }
    });
    
    // Fixed approach: Use Show Details buttons on mobile instead of clicking container directly
    const showDetailsButtons = document.querySelectorAll('.show-details-btn');
    showDetailsButtons.forEach((button, index) => {
        // Get the name of the store from the paragraph sibling
        const categoryContainer = button.closest('.category');
        const storeName = categoryContainer.querySelector('p').textContent;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showPopup(`offer-${index + 1}`, storeName);
        });
    });
    
    // For desktop, keep the original click behavior on the image containers
    if (window.innerWidth > 768) {
        const placeholders = document.querySelectorAll('.image-placeholder');
        placeholders.forEach((placeholder, index) => {
            const storeName = placeholder.nextElementSibling.textContent;
            placeholder.addEventListener('click', () => showPopup(`offer-${index + 1}`, storeName));
        });
    }

    // Completely prevent any accidental clicks on mobile
    if ('ontouchstart' in window && window.innerWidth <= 768) {
        const placeholders = document.querySelectorAll('.image-placeholder');
        placeholders.forEach(placeholder => {
            placeholder.style.pointerEvents = 'none';
        });
    }

    // Close popup on overlay click
    const overlay = document.querySelector('.popup-overlay');
    overlay.addEventListener('click', hidePopup);

    // Close popup on close button click
    const closeButton = document.querySelector('.popup .close-btn');
    closeButton.addEventListener('click', hidePopup);
    
    // Add ESC key listener for closing popup
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hidePopup();
        }
    });
    
    // Terms and conditions checkbox
    const agreeCheckbox = document.getElementById('agree-terms');
    if (agreeCheckbox) {
        agreeCheckbox.addEventListener('change', function() {
            if (this.checked) {
                console.log('User agreed to terms and conditions');
                // Here you can add any action that should happen when user agrees
            }
        });
    }

    // Toggle light and dark mode for desktop
    const toggleModeButton = document.querySelector('.toggle-mode');
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
        document.getElementById('mode-icon').textContent = '☀️';
        document.getElementById('mode-text').textContent = 'Light Mode';
        if (document.getElementById('mobile-mode-icon')) {
            document.getElementById('mobile-mode-icon').textContent = '☀️';
        }
    } else {
        document.getElementById('mode-icon').textContent = '🌙';
        document.getElementById('mode-text').textContent = 'Dark Mode';
        if (document.getElementById('mobile-mode-icon')) {
            document.getElementById('mobile-mode-icon').textContent = '🌙';
        }
    }
    
    toggleModeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            document.getElementById('mode-icon').textContent = '☀️';
            document.getElementById('mode-text').textContent = 'Light Mode';
            if (document.getElementById('mobile-mode-icon')) {
                document.getElementById('mobile-mode-icon').textContent = '☀️';
            }
        } else {
            localStorage.setItem('theme', 'light');
            document.getElementById('mode-icon').textContent = '🌙';
            document.getElementById('mode-text').textContent = 'Dark Mode';
            if (document.getElementById('mobile-mode-icon')) {
                document.getElementById('mobile-mode-icon').textContent = '🌙';
            }
        }
    });
    
    // Add smooth scrolling for mobile
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.mobile-menu-content button').forEach(button => {
            button.addEventListener('click', function() {
                setTimeout(() => {
                    const firstVisibleItem = document.querySelector('main .category[style*="display: block"]');
                    if (firstVisibleItem) {
                        firstVisibleItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }, 400);
            });
        });
    }
    
    // Handle window resize to apply different behaviors based on screen size
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            // Mobile behavior: disable image clicks
            document.querySelectorAll('.image-placeholder').forEach(placeholder => {
                placeholder.style.pointerEvents = 'none';
            });
        } else {
            // Desktop behavior: enable image clicks
            document.querySelectorAll('.image-placeholder').forEach(placeholder => {
                placeholder.style.pointerEvents = 'auto';
            });
        }
    });
});

// Add a resize handler to adjust UI for orientation changes
window.addEventListener('resize', () => {
    // Adjust height for mobile devices in landscape mode
    if (window.innerWidth <= 768) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Ensure hamburger is visible on mobile
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (window.innerWidth <= 768) {
        menuToggle.style.display = 'flex';
    } else {
        menuToggle.style.display = 'none';
    }
});

// Trigger resize once to set initial values
window.dispatchEvent(new Event('resize'));

// Add CSS animation for zoom out
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes zoomOut {
            from {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            to {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
            }
        }
    </style>
`);
