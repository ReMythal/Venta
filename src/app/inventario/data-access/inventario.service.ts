import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError } from 'rxjs';
import { Producto } from '../../producto/interfaces/producto';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  productos$ = this.productosSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarProductos();
  }

  // Cargar los productos desde LocalStorage o desde el archivo XML
  cargarProductos(): void {
    const productos = localStorage.getItem('productos');

    if (productos) {
      this.productosSubject.next(this.parseXML(productos)); // Si existe en LocalStorage, cargar desde ahí
    } else {
      // Si no existe en LocalStorage, cargar desde el XML
      this.http.get('productos.xml', { responseType: 'text' }).pipe(
        map(xml => this.parseXML(xml)),  // Parsear XML
        catchError(error => {
          console.error('Error al cargar los productos:', error);
          return [];
        })
      ).subscribe(productos => {
        this.productosSubject.next(productos); // Actualizar el comportamiento con los productos
        this.guardarCambios(); // Guardar el XML en LocalStorage
      });
    }
  }

  // Convertir el XML en un arreglo de productos
  private parseXML(xml: string): Producto[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const productos: Producto[] = [];
    
    Array.from(xmlDoc.getElementsByTagName('producto')).forEach(prod => {
      const id = parseInt(prod.getAttribute('id') || '0');
      productos.push({
        id: id,
        nombre: prod.getElementsByTagName('nombre')[0]?.textContent || '',
        imagen: prod.getElementsByTagName('imagen')[0]?.textContent || '',
        precio: parseInt(prod.getElementsByTagName('precio')[0]?.textContent || '0'),
        capacidad: prod.getElementsByTagName('capacidad')[0]?.textContent || '',
        cantidad: parseInt(prod.getElementsByTagName('cantidad')[0]?.textContent || '0')
      });
    });
  
    return productos;
  }
  

  // Agregar un nuevo producto
  agregarProducto(producto: Producto): void {
    const productos = this.productosSubject.value;
    const maxId = Math.max(...productos.map(p => p.id), 0);
    producto.id = maxId + 1; // Asignar un nuevo ID al producto

    this.productosSubject.next([...productos, producto]); // Añadir el nuevo producto
    this.guardarCambios(); // Guardar cambios en LocalStorage
  }

  // Actualizar un producto existente
  actualizarProducto(producto: Producto): void {
    const productos = this.productosSubject.value;
    const index = productos.findIndex(p => p.id === producto.id);

    if (index !== -1) {
      productos[index] = { ...producto }; // Actualizar el producto
      this.productosSubject.next([...productos]); // Actualizar el comportamiento
      this.guardarCambios(); // Guardar cambios
    }
  }

  // Eliminar un producto
  eliminarProducto(id: number): void {
    const productos = this.productosSubject.value;
    this.productosSubject.next(productos.filter(p => p.id !== id)); // Eliminar producto
    this.guardarCambios(); // Guardar cambios
  }

  // Guardar los productos en LocalStorage y generar el archivo XML
  private guardarCambios(): void {
    const productos = this.productosSubject.value;
    const xml = this.generarXML(productos);
    localStorage.setItem('productos', xml);
    console.log('XML actualizado:', xml);
  }
  
  actualizarInventario(id: number, cantidad: number): void {
    const productos = this.productosSubject.value;
    const index = productos.findIndex(p => p.id === id);
    
    if (index !== -1) {
      productos[index].cantidad = cantidad;
      this.productosSubject.next([...productos]);
      this.guardarCambios();
    }
  }

  getCantidadDisponible(id: number): number {
    let cantidad = 0;
    this.productos$.subscribe(productos => {
      const producto = productos.find(p => p.id === id);
      cantidad = producto ? producto.cantidad : 0;  // Devuelve la cantidad disponible o 0 si no se encuentra
    }).unsubscribe();
    return cantidad;
  }
  
  // Generar el XML con los productos actuales
  private generarXML(productos: Producto[]): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<productos>\n`;

    productos.forEach(producto => {
      xml += `<producto id="${producto.id}">
            <nombre>${producto.nombre}</nombre>
            <precio>${producto.precio}</precio>
            <capacidad>${producto.capacidad}</capacidad>  <!-- Añadido capacidad -->
            <cantidad>${producto.cantidad}</cantidad>  <!-- Añadido cantidad -->
            <imagen>${producto.imagen}</imagen>
            </producto>\n`;
    });

    xml += '</productos>';
    return xml; // Devolver el XML generado
  }
  
}
