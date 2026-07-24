import { db } from './firebase-config.js';
import { renderNavUI } from './ui-nav.js';
import { renderFooterUI } from './ui-footer.js';
import { initModal } from './ui-modal.js';
import { initCarousel } from './ui-carousel.js';
import { initCategories } from './ui-categories.js';
import { renderFiltersUI, initFilterListeners, aplicarFiltrosYRender, setCategoriaActiva } from './ui-filters.js';

document.addEventListener("DOMContentLoaded", () => {
    let listaProductos = [];

    // 1. Inicializar UI e inyectar HTML de módulos
    renderNavUI();    
    renderFooterUI(); 
    initModal();
    initCarousel();
    renderFiltersUI(); 

    // 2. Inicializar Categorías
    initCategories((categoriaSeleccionada) => {
        setCategoriaActiva(categoriaSeleccionada, listaProductos);
    });

    // 3. Escuchar Eventos de Búsqueda y Filtros
    initFilterListeners(() => {
        aplicarFiltrosYRender(listaProductos);
    });

    // 4. Escuchar Firebase en Tiempo Real
    db.collection("productos").onSnapshot((snapshot) => {
        listaProductos = [];
        snapshot.forEach((doc) => {
            listaProductos.push({ id: doc.id, ...doc.data() });
        });
        aplicarFiltrosYRender(listaProductos);
    });

    // 5. Scroll progresivo para la animación de la Navbar y cambio de color
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