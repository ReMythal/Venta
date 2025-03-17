import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FondoAnimadoComponent } from './fondo-animado/fondo-animado.component';
@Component({
  selector: 'app-root',
  imports: [ RouterModule,FondoAnimadoComponent],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  title = 'proyecto1';
}