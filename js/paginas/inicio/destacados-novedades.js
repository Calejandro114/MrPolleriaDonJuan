import { db } from '../../config/firebase-config.js';
import { renderProductsUI } from '../productos/ui-products.js';

export function initDestacadosNovedades() {
    const featuredContainer = document.getElementById("featured-products-grid");
    
    if (featuredContainer && db) {
        db.collection("productos")
          .limit(6)
          .onSnapshot((snapshot) => {
              const productosDestacados = [];
              snapshot.forEach((doc) => {
                  productosDestacados.push({ id: doc.id, ...doc.data() });
              });
              renderProductsUI(productosDestacados, featuredContainer);
          }, (error) => {
              console.error("Error consultando productos destacados:", error);
          });
    }
}