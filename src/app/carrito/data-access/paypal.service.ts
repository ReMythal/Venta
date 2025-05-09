import { Injectable } from '@angular/core';
import { loadScript } from "@paypal/paypal-js";

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private clientId = 'AauWnAboFrl2JlIJmbj5G0BSSZViTsPANYXuyn_aSZu9ddpLHawq9oLhDPFexImo3CvvortRKSRCdEjc';
  private clientSecret = 'ENLhAuSUgYoJ9h-QrCmoY4FAQQpcu1ExV2CYs3QsxzYMFK_B5iMaW--elUxV4X5SNREOJRaUiEjt_fdL'; // Necesitas agregar tu Client Secret aquí

  constructor() { }

  async initializePayPal(): Promise<void> {
    try {
      await loadScript({ 
        clientId: this.clientId,
        currency: "MXN",
        intent: "capture"
      });
    } catch (error) {
      console.error("Error al cargar PayPal:", error);
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error al obtener el token de acceso:', error);
      throw error;
    }
  }

  async createOrder(total: number): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'MXN',
              value: total.toFixed(2)
            }
          }]
        })
      });

      const order = await response.json();
      console.log('Orden creada:', order);
      return order.id;
    } catch (error) {
      console.error('Error al crear la orden:', error);
      throw error;
    }
  }

  onApprove(data: any, actions: any): Promise<void> {
    console.log('Pago aprobado, capturando orden...', data);
    return actions.order.capture().then((details: any) => {
      console.log('Transacción completada:', details);
      alert('¡Pago completado! Gracias por tu compra.');
    }).catch((error: any) => {
      console.error('Error al capturar el pago:', error);
      alert('Hubo un error al procesar el pago. Por favor, intenta de nuevo.');
    });
  }

  onError(err: any): void {
    console.error('Error en PayPal:', err);
    alert('Hubo un error al procesar el pago. Por favor, intenta de nuevo.');
  }
} 