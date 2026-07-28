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
    const linkContacto = `${rutaPaginas}contacto.html`;

    wrapper.innerHTML = `
        <nav class="main-nav">
            <a href="${linkInicio}" id="nav-inicio-btn" class="nav-link">Inicio</a>
            <a href="${linkCatalogo}" class="nav-link">Catálogo</a>
            <a href="${linkBazares}" class="nav-link">Bazares</a>
            <a href="${linkResenas}" class="nav-link">Reseñas</a>
            <a href="#footer-container" id="nav-faq-btn" class="nav-link">FAQ</a>
            <a href="${linkContacto}" class="nav-link">Contacto</a>
            
            <!-- 🛒 BOTÓN Y BADGE DEL CARRITO -->
            <button id="open-cart-btn" class="cart-nav-btn" title="Ver Carrito">
                <i class="fa-solid fa-cart-shopping"></i>
                <span id="cart-badge-count" class="cart-badge" style="display: none;">0</span>
            </button>
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

    // 3. Manejador Global de Scroll para hacer aparecer el Logo Mini (.nav-brand)
    const navbar = document.querySelector(".sticky-navbar");
    if (navbar) {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const progress = Math.min(1, scrollY / 120);
            
            navbar.style.setProperty("--scroll-progress", progress);

            if (progress > 0.4) {
                navbar.classList.add("navbar-scrolled");
            } else {
                navbar.classList.remove("navbar-scrolled");
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
    }
}