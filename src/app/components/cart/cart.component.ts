// import { Component, OnInit } from '@angular/core';
// import { CartService } from '../../services/cart.service';
// import { AuthService } from '../../services/auth.service';
// import { FormBuilder } from '@angular/forms';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-cart',
//   templateUrl: './cart.component.html',
//   styleUrls: ['./cart.component.css'],
// })
// export class CartComponent implements OnInit {
//   items: any[] = [];
//   apiUrl = 'http://localhost:3000/';

//   checkoutForm = this.formBuilder.group({
//     name: '',
//     address: '',
//   });

//   constructor(
//     private cartService: CartService,
//     private authService: AuthService,
//     private formBuilder: FormBuilder,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.cartService.cartItems$.subscribe(items => {
//       this.items = items;
//     });
//     this.cartService.loadCart();
//   }

//   getCartService() {
//     return this.cartService;
//   }

//   onSubmit(): void {
//     this.cartService.clearCart();
//     console.warn('Your order has been submitted', this.checkoutForm.value);
//     this.checkoutForm.reset();
//   }

//   removeItem(index: number) {
//     this.cartService.removeItem(index);
//   }
// }

// cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import initMercadoPago, { MercadoPagoInstance } from '@mercadopago/sdk-react/mercadoPago/initMercadoPago';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  items: any[] = [];
  apiUrl = 'http://localhost:3000/';
  // checkoutForm = this.formBuilder.group({ name: '', address: '' });

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => { this.items = items; });
    this.cartService.loadCart();
    this.initializeMercadoPago();
  }

  async createPreference(): Promise<void> {
    try {
      const orderData = {
        items: this.items,
        userId: this.authService.getUserId()
      };

      const response = await fetch(`${this.apiUrl}products/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const preference = await response.json();
      this.createCheckoutButton(preference.id);
    } catch (error) {
      alert('Error');
      console.error('Error createPreference() cart.component');
    }
  }

  updateQuantity(index: number, event: any): void {
    const newQuantity = event.target.value;
    if (newQuantity < 1) return;
    this.cartService.updateItemQuantity(index, newQuantity);
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
      const walletContainer = document.getElementById('wallet_container');
      if (walletContainer) walletContainer.innerHTML = '';
      await bricksBuilder?.create('wallet', 'wallet_container', {
        initialization: { 
          preferenceId: preferenceId, 
          redirectMode: 'modal'
        },
        customization: { 
          texts: { 
            valueProp: 'smart_option' 
          } 
        },
      });
    };
    renderComponent();
  }

  getCartService() { return this.cartService; }

  removeItem(index: number) { this.cartService.removeItem(index); }
}
