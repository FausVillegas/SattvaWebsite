import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent{
  isProductsRoute: boolean = false;
  isHomePage: boolean = false;
  searchTerm: string = '';
  showFilterMenu: boolean = false;

  constructor(private authService: AuthService, private cartService: CartService, private router: Router) {
    this.showFilterMenu = false;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isProductsRoute = this.router.url.includes('/products');
        this.isHomePage = event.urlAfterRedirects === '/';
      }
    });
  }

  getItemsInCart(): number {
    return this.cartService.getItemsInCart();
  }
  
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleFilterMenu(): void {
    this.showFilterMenu = !this.showFilterMenu;
  }

  filterByCategory(category: string): void {
    this.router.navigate(['/products'], { queryParams: { category } });
  }

  sortByPrice(order: string): void {
    this.router.navigate(['/products'], { queryParams: { order } });
  }

  filterProducts(): void {
    this.router.navigate(['/products'], { queryParams: { search: this.searchTerm } });
  }
}
