import { openModal } from './ui-modal.js';

// Aquí vas agregando las fotos de pedidos reales que hayas entregado
const entregasReales = [
    {
        imagen: "img/clientes/cliente_Chimuelo.jpg",
        titulo: "Pedido Personalizado: Chimuelo"
    }
];

export function initCarousel() {
    const track = document.getElementById("carousel-track");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");
    const wrapper = document.querySelector(".carousel-track-wrapper");

    if (!track) return;

    track.innerHTML = "";

    entregasReales.forEach(item => {
        const div = document.createElement("div");
        div.className = "carousel-item";
        div.innerHTML = `
            <img src="${item.imagen}" alt="${item.titulo}" onerror="this.onerror=null; this.src='https://placehold.co/300x200?text=Don+Juan';" />
            <div class="carousel-caption">${item.titulo}</div>
        `;

        // Previsualización limpia al tocar la foto del carrusel
        const img = div.querySelector("img");
        img.addEventListener("click", () => {
            openModal(item.imagen);
        });

        track.appendChild(div);
    });

    // Mover carrusel con botones
    if (prevBtn && nextBtn && wrapper) {
        prevBtn.addEventListener("click", () => {
            wrapper.scrollBy({ left: -240, behavior: "smooth" });
        });

        nextBtn.addEventListener("click", () => {
            wrapper.scrollBy({ left: 240, behavior: "smooth" });
        });
    }
}