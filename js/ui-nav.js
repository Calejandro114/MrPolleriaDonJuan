// js/ui-nav.js
export function renderNavUI() {
    const wrapper = document.getElementById("nav-wrapper");
    if (!wrapper) return;

    wrapper.innerHTML = `
        <nav class="main-nav">
            <a href="#" id="nav-inicio-btn" class="nav-link active">Inicio</a>
            <a href="#carousel-container" class="nav-link">Trabajos Reales</a>
            <a href="#catalogo-seccion" class="nav-link">Catálogo</a>
            <a href="#como-pedir" class="nav-link">Cómo Pedir</a>
            <a href="#faq" class="nav-link">FAQ</a>
            <a href="#contacto" class="nav-link">Contacto</a>
        </nav>
    `;

    // Botón Inicio: Desplazamiento limpio al inicio superior
    const inicioBtn = document.getElementById("nav-inicio-btn");
    if (inicioBtn) {
        inicioBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
}