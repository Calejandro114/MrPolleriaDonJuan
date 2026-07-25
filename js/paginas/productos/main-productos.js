/* js/paginas/productos/main-productos.js */
import { db } from '../../config/firebase-config.js';
import { renderNavUI } from '../../componentes/ui-nav.js';
import { renderFooterUI } from '../../componentes/ui-footer.js';
import { initModal } from '../../componentes/ui-modal.js';
import { initCategories } from './ui-categories.js';
import { renderFiltersUI, initFilterListeners, aplicarFiltrosYRender, setCategoriaActiva } from './ui-filters.js';

document.addEventListener("DOMContentLoaded", () => {
    let listaProductos = [];

    // 1. Inicializar componentes dinámicos
    renderNavUI();    
    renderFooterUI(); 
    initModal();
    renderFiltersUI(); 

    // 2. Control de scroll para la Navbar sobre el Hero Header
    const heroHeader = document.getElementById('inicio');
    const stickyNavbar = document.querySelector(".sticky-navbar");

    if (stickyNavbar) {
        window.addEventListener("scroll", () => {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const maxScroll = heroHeader ? (heroHeader.offsetHeight || 200) : 100; 
            const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
            
            stickyNavbar.style.setProperty("--scroll-progress", progress);

            // Mantener la clase visible o activarla progresivamente
            if (scrollY > 50 || progress >= 0.5) {
                stickyNavbar.classList.add('navbar-scrolled');
            } else {
                stickyNavbar.classList.add('navbar-scrolled'); // Garantiza que no se oculte el marca en subpáginas
            }
        }, { passive: true });
    }

    // 3. Inicializar Categorías
    initCategories((categoriaSeleccionada) => {
        setCategoriaActiva(categoriaSeleccionada, listaProductos);
    });

    // 4. Escuchar Eventos de Búsqueda y Filtros
    initFilterListeners(() => {
        aplicarFiltrosYRender(listaProductos);
    });

    // 5. Conexión a Firebase en Tiempo Real
    if (typeof db !== 'undefined' && db) {
        db.collection("productos").onSnapshot((snapshot) => {
            listaProductos = [];
            snapshot.forEach((doc) => {
                listaProductos.push({ id: doc.id, ...doc.data() });
            });
            aplicarFiltrosYRender(listaProductos);
        }, (error) => {
            console.error("Error al cargar el catálogo de Firebase:", error);
        });
    }
});