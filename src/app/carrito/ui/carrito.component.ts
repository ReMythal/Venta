import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../data-access/carrito.service';
import { Producto } from '../../producto/interfaces/producto';
import { InventarioService } from '../../inventario/data-access/inventario.service';
@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})

export class CarritoComponent implements OnInit {
  carrito: Producto[] = [];

  constructor(
    private carritoService: CarritoService,
    private inventarioService: InventarioService // Inyectamos el servicio de Inventario
  ) {}

  ngOnInit(): void {
    this.carrito = this.carritoService.obtenerCarrito();
  }

// Aumentar cantidad de producto en carrito
aumentarCantidad(producto: Producto): void {
  const cantidadMaxima = this.inventarioService.getCantidadDisponible(producto.id);
  if (producto.cantidad < cantidadMaxima) {
    producto.cantidad += 1; // Incrementar en 1 si no sobrepasa el límite de inventario
  } else {
    alert('No puedes agregar más de la cantidad disponible en inventario.');
  }
}

// Disminuir cantidad de producto en carrito
disminuirCantidad(producto: Producto): void {
  if (producto.cantidad > 0) {
    producto.cantidad -= 1; // Disminuir la cantidad en 1 si no es 0
  }
}

  

eliminarProducto(producto: Producto): void {
  // Llamamos al servicio para eliminar el producto del carrito
  this.carritoService.eliminarProducto(producto);

  // Actualizamos el carrito en el componente
  this.carrito = this.carritoService.obtenerCarrito();
}
  // Generar el archivo XML del carrito
  generarXML(): void {
    this.carritoService.generarXML();
  }
}