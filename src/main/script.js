// DOM Elements
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('.nav-link');
const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');
const contentSections = document.querySelectorAll('.content-section');
const mainContent = document.querySelector('.main-content');

// Toggle Sidebar
menuBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeBtn.addEventListener('click', () => {
    closeSidebar();
});

overlay.addEventListener('click', () => {
    closeSidebar();
});

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Navigation function
function navigateToSection(sectionId) {
    // Remove active class from all nav links (sidebar and bottom)
    navLinks.forEach(l => l.classList.remove('active'));
    bottomNavLinks.forEach(l => l.classList.remove('active'));
    
    // Add active class to corresponding links
    const sidebarLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    const bottomLink = document.querySelector(`.bottom-nav-link[data-section="${sectionId}"]`);
    
    if (sidebarLink) sidebarLink.classList.add('active');
    if (bottomLink) bottomLink.classList.add('active');
    
    // Hide all sections
    contentSections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Close sidebar if open
    closeSidebar();
}

// Sidebar navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        navigateToSection(targetId);
    });
});

// Bottom navigation links
bottomNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-section');
        navigateToSection(targetId);
        navigateToSection(targetId);
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Close sidebar with Escape key
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeSidebar();
    }
});

// Initialize
console.log('EcoStreak App geladen!');