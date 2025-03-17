import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError } from 'rxjs';
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

  cargarProductos(): void {
    const productos = localStorage.getItem('productos');

    if (productos) {
      this.productosSubject.next(this.parseXML(productos));
    } else {
      this.http.get('productos.xml', { responseType: 'text' }).pipe(
        map(xml => this.parseXML(xml)),
        catchError(error => {
          console.error('Error al cargar los productos:', error);
          return [];
        })
      ).subscribe(productos => {
        this.productosSubject.next(productos);
        this.guardarCambios();
      });
    }
  }

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
        capacidad: (prod.getElementsByTagName('capacidad')[0]?.textContent || '').toString()
      });
    });
  
    return productos;
  }
  

  agregarProducto(producto: Producto): void {
    const productos = this.productosSubject.value;
    const maxId = Math.max(...productos.map(p => p.id), 0);
    producto.id = maxId + 1;
    
    this.productosSubject.next([...productos, producto]);
    this.guardarCambios();
  }

  actualizarProducto(producto: Producto): void {
    const productos = this.productosSubject.value;
    const index = productos.findIndex(p => p.id === producto.id);
    
    if (index !== -1) {
      productos[index] = { ...producto };
      this.productosSubject.next([...productos]);
      this.guardarCambios();
    }
  }

  eliminarProducto(id: number): void {
    const productos = this.productosSubject.value;
    this.productosSubject.next(productos.filter(p => p.id !== id));
    this.guardarCambios();
  }

  private guardarCambios(): void {
    const productos = this.productosSubject.value;
    const xml = this.generarXML(productos);

    localStorage.setItem('productos', xml);
    console.log('XML actualizado:', xml);
  }

  private generarXML(productos: Producto[]): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<productos>\n`;
    
    productos.forEach(producto => {
      xml += `<producto id="${producto.id}">
            <nombre>${producto.nombre}</nombre>
            <precio>${producto.precio}</precio>
            <capacidad>${producto.capacidad}</capacidad> 
            <imagen>${producto.imagen}</imagen>
            </producto>\n`;
    });
    
    xml += '</productos>';
    return xml;
  }
}
