// DOM Elements
const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');

// Bottom navigation links
bottomNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        bottomNavLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        const targetId = link.getAttribute('data-section');
        console.log('Navigation zu:', targetId);
    });
});

// Initialize
console.log('EcoStreak App geladen!');
