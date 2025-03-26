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

// Toggle mobile menu
function toggleMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    // Toggle body scroll
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Close mobile menu
function closeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    menuToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
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
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    menuToggle.addEventListener('click', toggleMobileMenu);
    
    // Mobile menu close button
    const menuClose = document.querySelector('.mobile-menu-close');
    menuClose.addEventListener('click', closeMobileMenu);
    
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
    
    // Prevent accidental clicks on mobile when scrolling
    const placeholders = document.querySelectorAll('.image-placeholder');
    
    // Solution to prevent accidental clicks while scrolling
    if ('ontouchstart' in window) {
        let touchStartY = 0;
        let touchEndY = 0;
        let isTouching = false;
        const scrollThreshold = 10; // pixels of movement to consider a scroll vs a tap
        
        document.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
            isTouching = true;
            
            // Disable all click events on image placeholders during scroll
            placeholders.forEach(p => p.classList.remove('can-click'));
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            if (!isTouching) return;
            touchEndY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', function() {
            if (!isTouching) return;
            
            // If it wasn't a significant vertical movement, enable clicking
            if (Math.abs(touchEndY - touchStartY) < scrollThreshold) {
                placeholders.forEach(p => p.classList.add('can-click'));
                setTimeout(() => {
                    placeholders.forEach(p => p.classList.remove('can-click'));
                }, 300); // Remove after a short period
            }
            
            isTouching = false;
        }, { passive: true });
    }
    
    // Add click handlers to image placeholders
    placeholders.forEach((placeholder, index) => {
        // Get the name of the store from the next sibling paragraph
        const storeName = placeholder.nextElementSibling.textContent;
        
        // Remove any existing event listeners
        const newPlaceholder = placeholder.cloneNode(true);
        placeholder.parentNode.replaceChild(newPlaceholder, placeholder);
        
        // Add new event listener with passive option for better performance
        newPlaceholder.addEventListener('click', () => showPopup(`offer-${index + 1}`, storeName), { passive: true });
        
        // Add tap listener for mobile
        if ('ontouchstart' in window) {
            addTapListener(newPlaceholder, () => showPopup(`offer-${index + 1}`, storeName));
        }
    });

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
});

// Add a resize handler to adjust UI for orientation changes
window.addEventListener('resize', () => {
    // Adjust height for mobile devices in landscape mode
    if (window.innerWidth <= 768) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
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
