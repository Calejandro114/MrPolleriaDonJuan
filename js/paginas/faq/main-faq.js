/* js/paginas/faq/main-faq.js */
import { renderNavUI } from '../../componentes/ui-nav.js';
import { renderFooterUI } from '../../componentes/ui-footer.js';
import { initModal } from '../../componentes/ui-modal.js';

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa la navegación, footer y modal de la página de FAQ
    renderNavUI();    
    renderFooterUI(); 
    initModal();
});