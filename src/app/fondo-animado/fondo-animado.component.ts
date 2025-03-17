import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fondo-animado',
  standalone: true,
  templateUrl: './fondo-animado.component.html',
  styleUrls: ['./fondo-animado.component.css']
})
export class FondoAnimadoComponent implements OnInit {
  ngOnInit(): void {
    this.agregarFondoAnimado();
  }

  agregarFondoAnimado() {
    document.body.style.background = "linear-gradient(to right, #2c3e50, #4ca1af)";
  }
}
