import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import initMercadoPago, { MercadoPagoInstance } from '@mercadopago/sdk-react/mercadoPago/initMercadoPago';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-class-event-details',
  templateUrl: './class-event-details.component.html',
  styleUrls: ['./class-event-details.component.css']
})
export class ClassEventDetailsComponent {
  apiUrl = "http://localhost:3000/";
  price = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService) {
    this.initializeMercadoPago();
    if(this.data.price)
      this.price = this.data.price;
    else
      this.price = this.data.monthly_fee;
  }

  async createPreference(): Promise<void> {
    console.log("checkout-btn--------------------");
      try {
        let activityType
        if(this.data.price)
          activityType = "event"
        else
          activityType = "class"
        const orderData = {
          title: this.data.title || '',
          quantity: 1,
          price: this.price,
          userId: this.authService.getUserId(), 
          classEventId: this.data.id,
          activityType: activityType 
        };

        const response = await fetch(`${this.apiUrl}payment/create-preference`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        const preference = await response.json();

        this.createCheckoutButton(preference.id);
      } catch (error) {
        alert("Error");
      }
  }

  initializeMercadoPago(): void {
    initMercadoPago("APP_USR-b16bba25-a361-4581-a38f-96df04bfce02", {
      locale: 'es-AR'
    });
  }

  async createCheckoutButton(preferenceId: string): Promise<void> {
    const mp = await MercadoPagoInstance.getInstance();
    const bricksBuilder = mp?.bricks();
      const renderComponent = async () => {
        const walletContainer = document.getElementById("wallet_container");
        if (walletContainer) walletContainer.innerHTML = "";
        await bricksBuilder?.create("wallet", "wallet_container", {
          initialization: {
            preferenceId: preferenceId,
            redirectMode: 'modal', // se abre como un cuadro dentro de la página
          },
          customization: {
            texts: {
              valueProp: 'smart_option',
            },
          },
        });
      };
      renderComponent();
  }
}
