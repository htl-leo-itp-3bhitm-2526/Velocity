// DOM Elements
const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');


bottomNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
       
        bottomNavLinks.forEach(l => l.classList.remove('active'));
        
        
        link.classList.add('active');
        
        const targetId = link.getAttribute('data-section');
        console.log('Navigation zu:', targetId);
    });
});

// Initialize
console.log('EcoStreak App geladen!');
