import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CarritoService } from '../data-access/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent {
  carrito: any[] = [];
  constructor(private carritoService: CarritoService){}
  ngOnInit() {
    this.carrito = this.carritoService.obtenerCarrito();
  }

  generarXML() {
    this.carritoService.generarXML();
  }

  eliminarProducto(index: number) {
    this.carritoService.eliminarProducto(index);
    this.carrito = this.carritoService.obtenerCarrito();
  }
}