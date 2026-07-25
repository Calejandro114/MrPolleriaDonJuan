/* js/paginas/reseñas/main-reseñas.js */
import { renderNavUI } from '../../componentes/ui-nav.js';
import { renderFooterUI } from '../../componentes/ui-footer.js';
import { initModal } from '../../componentes/ui-modal.js';
// Opcional: Descomenta esto si luego vas a jalar las reseñas desde Firebase
// import { db } from '../../config/firebase-config.js'; 

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar la interfaz compartida
    renderNavUI();    
    renderFooterUI(); 
    initModal();

    // 2. Aquí irá la función para cargar las fotos/comentarios de clientes
    // cargarReseñas();
});

/* 
function cargarReseñas() {
    // Lógica futura para leer testimonios de la base de datos
} 
*/