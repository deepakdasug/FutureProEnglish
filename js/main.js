// Main JavaScript for Future Pro English website
// Navigation, mobile menu, general interactivity

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navigationLinks = document.querySelectorAll('.nav-link');

    navigationLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop() || 'index.html';
        if (linkPage === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navOverlay = document.querySelector('.nav-overlay');
    const desktopNav = document.querySelector('.nav');

    if (mobileMenuToggle && navOverlay) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            this.setAttribute('aria-expanded', !isExpanded);
            navOverlay.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navOverlay.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on a nav link
        const navLinks = navOverlay.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navOverlay.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                if (navOverlay.classList.contains('active')) {
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    navOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navOverlay.classList.contains('active')) {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});
