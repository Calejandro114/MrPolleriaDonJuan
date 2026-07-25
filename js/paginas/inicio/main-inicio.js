/* js/paginas/inicio/main-inicio.js */
import { db } from '../../config/firebase-config.js';
import { renderNavUI } from '../../componentes/ui-nav.js';
import { renderFooterUI } from '../../componentes/ui-footer.js';
import { initModal } from '../../componentes/ui-modal.js';
import { initCarousel } from './ui-carousel.js';
import { renderProductsUI } from '../productos/ui-products.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar componentes globales PRIMERO (Garantiza Nav y Footer)
    renderNavUI();    
    renderFooterUI(); 
    initModal();

    // 2. Inicializar el carrusel de entregas
    initCarousel();

    // 3. Consultar 6 productos en Firebase
    const featuredContainer = document.getElementById("featured-products-grid");
    
    if (featuredContainer && db) {
        db.collection("productos")
          .limit(6)
          .onSnapshot((snapshot) => {
              const productosDestacados = [];
              snapshot.forEach((doc) => {
                  productosDestacados.push({ id: doc.id, ...doc.data() });
              });
              renderProductsUI(productosDestacados, featuredContainer);
          }, (error) => {
              console.error("Error consultando Firebase:", error);
          });
    }

    // 4. Control de opacidad de la Navbar
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