import { Injectable } from "@angular/core";
import { Producto } from "../../producto/interfaces/producto";
import { InventarioService } from "../../inventario/data-access/inventario.service";  // Asegúrate de importar el servicio Inventario

@Injectable({
  providedIn: "root"
})
export class CarritoService {
  private carrito: Producto[] = [];

  constructor(private inventarioService: InventarioService) {}

  agregarProducto(producto: Producto, cantidad: number) {
    const productoEnCarrito = this.carrito.find(p => p.id === producto.id);
  
    // Verifica si la cantidad que el usuario quiere agregar no supera la cantidad disponible
    if (productoEnCarrito) {
      if (productoEnCarrito.cantidad + cantidad <= producto.cantidad) {  // Producto disponible en inventario
        productoEnCarrito.cantidad += cantidad;
      } else {
        alert('No puedes agregar más de la cantidad disponible en inventario.');
      }
    } else {
      // Si el producto no está en el carrito, lo agregamos con la cantidad especificada
      if (cantidad <= producto.cantidad) {
        this.carrito.push({...producto, cantidad});
      } else {
        alert('No puedes agregar más de la cantidad disponible en inventario.');
      }
    }
  }

  obtenerCarrito(): Producto[] {
    return this.carrito;
  }

  generarXML() {
    let subtotal = 0;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;

    this.carrito.forEach((producto) => {
      xml += `<producto id="${producto.id}">
            <nombre>${producto.nombre}</nombre>
            <precio>${producto.precio}</precio>
            <cantidad>${producto.cantidad}</cantidad>
            </producto>\n`;
      subtotal += producto.precio * producto.cantidad;
    });

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    xml += `<subtotal>${subtotal.toFixed(2)}</subtotal>
        <iva>${iva.toFixed(2)}</iva>
        <total>${total.toFixed(2)}</total>
        </recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'recibo.xml';
    a.href = url;

    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  eliminarProducto(producto: Producto): void {
    // Buscamos el índice del producto en el carrito
    const index = this.carrito.findIndex(p => p.id === producto.id);
  
    // Si el producto existe en el carrito, lo eliminamos
    if (index !== -1) {
      this.carrito.splice(index, 1);
    }
  }
  

  actualizarCantidadProducto(id: number, cantidad: number) {
    const producto = this.carrito.find(p => p.id === id);
    if (producto && cantidad >= 0) {
      if (cantidad <= producto.cantidad) {
        producto.cantidad = cantidad;
      } else {
        alert('No puedes agregar más de la cantidad disponible en inventario.');
      }
    }
  }
}
