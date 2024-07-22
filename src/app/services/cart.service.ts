import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000';
  private cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  loadCart(): void {
    this.http.get<any[]>(`${this.apiUrl}/cart/${this.authService.getUserId()}`).subscribe((data: any[]) => {
      this.cartItems.next(data);
    });
  }

  getCartItems(): any[] {
    return this.cartItems.getValue();
  }

  addToCart(product: any, quantity: number): void {
    const item = { userId: this.authService.getUserId(), productId: product.id, quantity };
    this.http.post(`${this.apiUrl}/cart`, item).subscribe(() => {
      this.loadCart();
    });
  }

  removeItem(index: number): void {
    const cartItems = this.getCartItems();
    const productId = cartItems[index].product_id;
    this.http.delete(`${this.apiUrl}/cart/${this.authService.getUserId()}/${productId}`).subscribe(() => {
      this.loadCart();
    });
  }

  clearCart(): void {
    this.http.delete(`${this.apiUrl}/cart/${this.authService.getUserId()}`).subscribe(() => {
      this.cartItems.next([]);
    });
  }

  getTotalPrice(): number {
    return this.getCartItems().reduce((total, item) => total + item.quantity * item.sale_price, 0);
  }

  getItemsInCart(): number {
    return this.getCartItems().reduce((total, item) => total + item.quantity, 0);
  }
}
