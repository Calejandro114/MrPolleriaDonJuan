import { renderNavUI } from '../../componentes/ui-nav.js';
import { renderFooterUI } from '../../componentes/ui-footer.js';
import { initModal } from '../../componentes/ui-modal.js';
import { initCarousel } from './ui-carousel.js';
import { initDestacadosNovedades } from './destacados-novedades.js';
import { initResenasInicio } from './resenas-inicio.js';
import { initScrollNavbar } from './scroll-navbar.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Componentes Base Globales
    renderNavUI();    
    renderFooterUI(); 
    initModal();

    // 2. Módulos Específicos de la Portada
    initCarousel();
    initDestacadosNovedades();
    initResenasInicio();
    initScrollNavbar();
});