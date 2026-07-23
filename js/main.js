// js/main.js
import { db } from './firebase-config.js';
import { initModal } from './ui-modal.js';
import { initCarousel } from './ui-carousel.js';
import { initCategories } from './ui-categories.js';
import { initFilterListeners, aplicarFiltrosYRender, setCategoriaActiva } from './ui-filters.js';

document.addEventListener("DOMContentLoaded", () => {
    let listaProductos = [];

    // 1. Inicializar UI general
    initModal();
    initCarousel();

    // 2. Inicializar Categorías
    initCategories((categoriaSeleccionada) => {
        setCategoriaActiva(categoriaSeleccionada, listaProductos);
    });

    // 3. Inicializar Listeners de Filtros
    initFilterListeners(() => {
        aplicarFiltrosYRender(listaProductos);
    });

    // 4. Escuchar Firebase
    db.collection("productos").onSnapshot((snapshot) => {
        listaProductos = [];
        snapshot.forEach((doc) => {
            listaProductos.push({ id: doc.id, ...doc.data() });
        });
        aplicarFiltrosYRender(listaProductos);
    });
});