// js/ui-carousel.js
import { openModal } from './ui-modal.js';

const entregasReales = [
    {
        imagen: "img/clientes/cliente_Chimuelo.jpg",
        titulo: "Pedido Personalizado: Chimuelo"
    }
    // Aquí puedes ir agregando más fotos de entregas
];

export function initCarousel() {
    const container = document.getElementById("carousel-container");
    if (!container) return;

    // 1. Inyectar la estructura del Carrusel
    container.innerHTML = `
        <section class="gallery-section">
            <div class="gallery-header">
                <h2>Trabajos Entregados y Clientes Felices</h2>
                <p>Algunos de los pedidos personalizados pedidos por nuestros clientes</p>
            </div>
            <div class="carousel-container">
                <button id="carousel-prev" class="carousel-btn prev-btn"><i class="fa-solid fa-chevron-left"></i></button>
                <div class="carousel-track-wrapper">
                    <div id="carousel-track" class="carousel-track"></div>
                </div>
                <button id="carousel-next" class="carousel-btn next-btn"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </section>
    `;

    // 2. Llenar las tarjetas de fotos
    const track = document.getElementById("carousel-track");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");
    const wrapper = container.querySelector(".carousel-track-wrapper");

    if (!track) return;

    entregasReales.forEach(item => {
        const div = document.createElement("div");
        div.className = "carousel-item";
        div.innerHTML = `
            <img src="${item.imagen}" alt="${item.titulo}" onerror="this.onerror=null; this.src='https://placehold.co/300x200?text=Don+Juan';" />
            <div class="carousel-caption">${item.titulo}</div>
        `;

        const img = div.querySelector("img");
        img.addEventListener("click", () => {
            openModal(item.imagen);
        });

        track.appendChild(div);
    });

    // 3. Eventos de desplazamiento
    if (prevBtn && nextBtn && wrapper) {
        prevBtn.addEventListener("click", () => {
            wrapper.scrollBy({ left: -240, behavior: "smooth" });
        });

        nextBtn.addEventListener("click", () => {
            wrapper.scrollBy({ left: 240, behavior: "smooth" });
        });
    }
}