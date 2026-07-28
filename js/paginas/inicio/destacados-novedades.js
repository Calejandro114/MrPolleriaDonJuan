import { db } from '../../config/firebase-config.js';
import { renderProductsUI } from '../productos/ui-products.js';

export function initDestacadosNovedades() {
    const featuredContainer = document.getElementById("featured-products-grid");
    if (!featuredContainer || !db) return;

    // 1. Obtener los 3 productos MÁS NUEVOS (ordenados por fechaCreacion descendente)
    const consultaNuevos = db.collection("productos")
        .orderBy("fechaCreacion", "desc")
        .limit(3)
        .get();

    // 2. Obtener los 3 productos MÁS VENDIDOS / SOLICITADOS (ordenados por ventas descendente)
    const consultaMasVendidos = db.collection("productos")
        .orderBy("ventas", "desc")
        .limit(3)
        .get();

    // Ejecutamos ambas consultas en paralelo
    Promise.all([consultaNuevos, consultaMasVendidos])
        .then(([snapshotNuevos, snapshotVendidos]) => {
            const mapaProductos = new Map();

            // Agregar primero los más nuevos
            snapshotNuevos.forEach((doc) => {
                mapaProductos.set(doc.id, { id: doc.id, ...doc.data() });
            });

            // Agregar los más vendidos (Evita duplicados si un producto es nuevo Y muy vendido)
            snapshotVendidos.forEach((doc) => {
                if (!mapaProductos.has(doc.id)) {
                    mapaProductos.set(doc.id, { id: doc.id, ...doc.data() });
                }
            });

            const productosDestacados = Array.from(mapaProductos.values());

            // Renderizar las tarjetas en la grilla
            renderProductsUI(productosDestacados, featuredContainer);
        })
        .catch((error) => {
            console.error("Error consultando productos destacados y novedades:", error);
        });
}