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

// Add keydown event listener for ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hidePopup();
    }
});

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get stored active category or default to 'all'
    const activeCategory = sessionStorage.getItem('activeCategory') || 'all';
    filterCategory(activeCategory);
    
    const placeholders = document.querySelectorAll('.image-placeholder');
    placeholders.forEach((placeholder, index) => {
        // Get the name of the store from the next sibling paragraph
        const storeName = placeholder.nextElementSibling.textContent;
        placeholder.addEventListener('click', () => showPopup(`offer-${index + 1}`, storeName));
    });

    const overlay = document.querySelector('.popup-overlay');
    overlay.addEventListener('click', hidePopup);

    const closeButton = document.querySelector('.popup .close-btn');
    closeButton.addEventListener('click', hidePopup);
    
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

    // Toggle light and dark mode
    const toggleModeButton = document.querySelector('.toggle-mode');
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
        toggleModeButton.innerHTML = '☀️ Light Mode';
    } else {
        toggleModeButton.innerHTML = '🌙 Dark Mode';
    }
    
    toggleModeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            toggleModeButton.innerHTML = '☀️ Light Mode';
        } else {
            localStorage.setItem('theme', 'light');
            toggleModeButton.innerHTML = '🌙 Dark Mode';
        }
    });
});

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
