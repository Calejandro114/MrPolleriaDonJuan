import { renderNavUI } from '../../componentes/ui-nav.js';
import { renderFooterUI } from '../../componentes/ui-footer.js';
import { initModal } from '../../componentes/ui-modal.js';

document.addEventListener("DOMContentLoaded", () => {
    renderNavUI();    
    renderFooterUI(); 
    initModal();

    const heroHeader = document.getElementById('inicio');
    const stickyNavbar = document.querySelector(".sticky-navbar");

    if (stickyNavbar && heroHeader) {
        window.addEventListener("scroll", () => {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const maxScroll = heroHeader.offsetHeight || 250; 
            const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
            
            stickyNavbar.style.setProperty("--scroll-progress", progress);

            if (progress >= 1) {
                stickyNavbar.classList.add('navbar-scrolled');
            } else {
                stickyNavbar.classList.remove('navbar-scrolled');
            }
        }, { passive: true });
    }
});