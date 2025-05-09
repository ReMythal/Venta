import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../data-access/carrito.service';
import { Producto } from '../../producto/interfaces/producto';
import { InventarioService } from '../../inventario/data-access/inventario.service';
import { PaypalService } from '../data-access/paypal.service';

declare var paypal: any;

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  carrito: Producto[] = [];
  total: number = 0;

  constructor(
    private carritoService: CarritoService,
    private inventarioService: InventarioService,
    private paypalService: PaypalService
  ) {}

  ngOnInit(): void {
    this.carrito = this.carritoService.obtenerCarrito();
    this.calcularTotal();
    this.initializePayPal();
  }

  calcularTotal(): void {
    this.total = this.carrito.reduce((sum, producto) => 
      sum + (producto.precio * producto.cantidad), 0);
  }

  async initializePayPal(): Promise<void> {
    await this.paypalService.initializePayPal();
    paypal.Buttons({
      createOrder: async () => {
        try {
          const orderId = await this.paypalService.createOrder(this.total);
          return orderId;
        } catch (error) {
          console.error('Error al crear la orden:', error);
          throw error;
        }
      },
      onApprove: (data: any, actions: any) => this.paypalService.onApprove(data, actions),
      onError: (err: any) => this.paypalService.onError(err)
    }).render('#paypal-button-container');
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