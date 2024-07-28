import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import initMercadoPago, { MercadoPagoInstance } from '@mercadopago/sdk-react/mercadoPago/initMercadoPago';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-class-event-details',
  templateUrl: './class-event-details.component.html',
  styleUrls: ['./class-event-details.component.css']
})
export class ClassEventDetailsComponent implements OnInit {
  apiUrl = "http://localhost:3000/";
  price = null;
  message = '';  // Variable para mostrar mensajes al usuario
  userId: string | null;
  isAuthenticated = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService) {
    this.message = '';
    this.userId = this.authService.getUserId();
    this.initializeMercadoPago();
    if (this.data.price)
      this.price = this.data.price;
    else
      this.price = this.data.monthly_fee;
  }

  getAuthService() {
    return this.authService;
  }

  ngOnInit(): void {
    this.checkEnrollment();
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  async checkEnrollment(): Promise<void> {
    const activityType = this.data.price ? 'event' : 'class';

    const response = await fetch(`${this.apiUrl}is-enrolled?userId=${this.userId}&classEventId=${this.data.id}&activityType=${activityType}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    this.message = await response.json();
  }

  async createPreference(): Promise<void> {
    if (this.message) return; 

    try {
      let activityType = null;
      if (this.data.price) {
        activityType = "event";
      } else {
        activityType = "class";
      }

      const orderData = {
        title: this.data.title || '',
        quantity: 1,
        price: this.price,
        userId: this.userId,
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

      if (response.status === 400) {
        const result = await response.json();
        this.message = result.message;  // Mostrar el mensaje de inscripción existente
      } else {
        const preference = await response.json();
        this.message = '';
        this.createCheckoutButton(preference.id);
      }
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
