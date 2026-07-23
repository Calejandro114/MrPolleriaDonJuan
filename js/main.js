// js/main.js
import { db } from './firebase-config.js';
import { initModal } from './ui-modal.js';
import { initCarousel } from './ui-carousel.js';
import { initCategories } from './ui-categories.js';
import { renderFiltersUI, initFilterListeners, aplicarFiltrosYRender, setCategoriaActiva } from './ui-filters.js';

document.addEventListener("DOMContentLoaded", () => {
    let listaProductos = [];

    // 1. Inicializar UI e inyectar HTML de módulos
    initModal();
    initCarousel();
    renderFiltersUI(); // 👈 Inyecta el HTML del panel desplegable

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
});