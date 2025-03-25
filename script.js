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
