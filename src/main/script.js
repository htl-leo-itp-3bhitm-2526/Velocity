// DOM Elements
const menuBtn = document.getElementById('menuBtn')
const closeBtn = document.getElementById('closeBtn')
const sidebar = document.getElementById('sidebar')
const overlay = document.getElementById('overlay')
const navLinks = document.querySelectorAll('.nav-link');
const bottomNavLinks = document.querySelectorAll('.bottom-nav-link')
const contentSections = document.querySelectorAll('.content-section')
const mainContent = document.querySelector('.main-content')

// Sidebar
menuBtn.addEventListener('click', () => {
    sidebar.classList.add('active')
    overlay.classList.add('active')
    document.body.style.overflow = 'hidden'
});

closeBtn.addEventListener('click', () => {
    closeSidebar();
});

overlay.addEventListener('click', () => {
    closeSidebar();
});

function closeSidebar() {
    sidebar.classList.remove('active')
    overlay.classList.remove('active')
    document.body.style.overflow = 'auto'
}

// Navigation

function navigateToSection(sectionId) {
    
    navLinks.forEach(l => l.classList.remove('active'))
    bottomNavLinks.forEach(l => l.classList.remove('active'))
    const sidebarLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    const bottomLink = document.querySelector(`.bottom-nav-link[data-section="${sectionId}"]`);
    
    if (sidebarLink) sidebarLink.classList.add('active')
    if (bottomLink) bottomLink.classList.add('active')
    contentSections.forEach(section => section.classList.remove('active'))

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    closeSidebar();
}
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        navigateToSection(targetId);
    });
});
bottomNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-section');
        navigateToSection(targetId);
    });
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeSidebar();
    }
});

// Initialize
console.log('EcoStreak App geladen!');