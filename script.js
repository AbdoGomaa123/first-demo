function filterCategory(category) {
    const categories = document.querySelectorAll('.category');
    categories.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
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

// Set default category to 'all' when the page loads
document.addEventListener('DOMContentLoaded', () => {
    filterCategory('all');
});

// Show popup with QR code
function showPopup(id) {
    const popup = document.querySelector('.popup');
    const overlay = document.querySelector('.popup-overlay');
    const qrCode = popup.querySelector('img');
    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?data=${id}&size=150x150`;
    popup.style.display = 'block';
    overlay.style.display = 'block';
}

// Hide popup
function hidePopup() {
    const popup = document.querySelector('.popup');
    const overlay = document.querySelector('.popup-overlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
}

// Add event listeners to image placeholders
document.addEventListener('DOMContentLoaded', () => {
    const placeholders = document.querySelectorAll('.image-placeholder');
    placeholders.forEach((placeholder, index) => {
        placeholder.addEventListener('click', () => showPopup(`offer-${index + 1}`));
    });

    const overlay = document.querySelector('.popup-overlay');
    overlay.addEventListener('click', hidePopup);
});
