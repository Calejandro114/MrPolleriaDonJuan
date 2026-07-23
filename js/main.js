// js/main.js
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
    renderNavUI();    // 👈 Inyecta el menú de navegación superior
    renderFooterUI(); // 👈 Inyecta el pie de página
    initModal();
    initCarousel();
    renderFiltersUI(); // Inyecta el HTML del panel desplegable de búsqueda

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

    // 5. Muestra el mini logo y nombre solo cuando se desplaza hacia abajo
    const stickyNavbar = document.querySelector(".sticky-navbar");

    if (stickyNavbar) {
        window.addEventListener("scroll", () => {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            
            // Distancia en píxeles (altura del hero) para completar la transición
            const maxScroll = 100; 
            const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
            
            stickyNavbar.style.setProperty("--scroll-progress", progress);
        }, { passive: true });
    }
});