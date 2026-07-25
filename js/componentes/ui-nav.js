/* js/componentes/ui-nav.js */
export function renderNavUI() {
    const wrapper = document.getElementById("nav-wrapper");
    if (!wrapper) return;

    // Detecta si la página actual está dentro de la carpeta /paginas/
    const esSubcarpeta = window.location.pathname.includes('/paginas/');
    const rutaBase = esSubcarpeta ? '../' : './';
    const rutaPaginas = esSubcarpeta ? './' : './paginas/';

    // Construcción de rutas dinámicas
    const linkInicio = `${rutaBase}index.html`;
    const linkCatalogo = `${rutaPaginas}productos.html`;
    const linkBazares = `${rutaPaginas}bazares.html`;
    const linkResenas = `${rutaPaginas}resenas.html`;
    const linkContacto = `${rutaPaginas}contacto.html`; // 👈 Redirige a la página de contacto

    wrapper.innerHTML = `
        <nav class="main-nav">
            <a href="${linkInicio}" id="nav-inicio-btn" class="nav-link">Inicio</a>
            <a href="${linkCatalogo}" class="nav-link">Catálogo</a>
            <a href="${linkBazares}" class="nav-link">Bazares</a>
            <a href="${linkResenas}" class="nav-link">Reseñas</a>
            <a href="#footer-container" id="nav-faq-btn" class="nav-link">FAQ</a>
            <a href="${linkContacto}" class="nav-link">Contacto</a>
        </nav>
    `;

    // 1. Botón Inicio: Si estás en index.html, hace scroll suave hasta arriba
    const inicioBtn = document.getElementById("nav-inicio-btn");
    if (inicioBtn && !esSubcarpeta) {
        inicioBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // 2. Botón FAQ: Desplazamiento suave directo hacia el Footer
    const faqBtn = document.getElementById("nav-faq-btn");
    if (faqBtn) {
        faqBtn.addEventListener("click", (e) => {
            const footerContainer = document.getElementById("footer-container");
            if (footerContainer) {
                e.preventDefault();
                footerContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }
}