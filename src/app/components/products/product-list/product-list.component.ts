import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CartService } from 'src/app/services/cart.service';

import { ProductService } from 'src/app/services/product.service';
import { AuthService } from 'src/app/services/auth.service';

import { Product } from 'src/app/models/Product';
import { User } from 'src/app/models/User';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit{
  products$!: Observable<Product[]>;
  filteredProducts$!: Observable<Product[]>;
  // userId!: Pick<User, "id">;
  userId!: number;
  apiUrl: string = 'http://localhost:3000/';

  constructor(private cartService: CartService, private productService: ProductService, private authService: AuthService, private route: ActivatedRoute) { }

  getAuthService(): AuthService {
    return this.authService;
  }

  ngOnInit(): void {
    this.products$ = this.fetchAll();
    this.userId = this.authService.userId;
    this.route.queryParams.subscribe(params => {
      const searchTerm = params['search'];
      const category = params['category'];
      const order = params['order'];
      this.filteredProducts$ = this.products$.pipe(
        map(products => {
          let filtered = products;
          if (searchTerm) {
            filtered = filtered.filter(product => product.title.toLowerCase().includes(searchTerm.toLowerCase()));
          }
          if (category) {
            filtered = filtered.filter(product => product.category.toLowerCase() === category.toLowerCase());
          }
          if (order) {
            filtered = filtered.sort((a, b) => order === 'ascendente' ? a.sale_price - b.sale_price : b.sale_price - a.sale_price);
          }
          return filtered;
        })
      );
    });
  }

  fetchAll(): Observable<Product[]> {
    return this.productService.fetchAll();
  }
  
  addToCart(product : any) {
    this.cartService.addToCart(product,1);
  }

  createProduct(): void {
    this.products$ = this.fetchAll();
  }

  delete(productId: Pick<Product, "id">): void {
    console.log("Borrando producto: "+productId.id);
    this.productService.deleteProduct(productId).subscribe(() => (this.products$ = this.fetchAll()));
  }
}

