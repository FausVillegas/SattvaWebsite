import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { CartService } from 'src/app/services/cart.service';

import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/Product';


@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
// export class ProductDetailsComponent implements OnInit {
//   product: any = getProduct();
  
//   constructor(private route: ActivatedRoute, private cartService: CartService) {
//   }

//   ngOnInit(): void {
//     // se ejecuta cuando inicia
//     //obtener el id del producto de la ruta
//     const routeParams = this.route.snapshot.paramMap;
//     const productIdFromRoute = Number(routeParams.get('productId'));

//     //encontrar el producto de ese id de la ruta
//     this.product = this.product.find((product: { id: number; }) => product.id === productIdFromRoute);
//   }

//   //agregar productos al carrito
  
// }

export class ProductDetailsComponent implements OnInit {
  product!: Product;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {
    this.getProduct();
  }

  ngOnInit(): void {
    // this.getProduct();
  }

  getProduct(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (product: Product) => {
          this.product = product;
          console.log("Product:", this.product.id);
        },
        error: (err) => {
          console.error('Error fetching product:', err);
          window.alert("Product not found");
        }
      });
    } else {
      window.alert("Product ID not found in route");
    }
  }

  productQuantity(): void {
    this.quantity++;
  }

  addToCart(product: Product, quantity: number): void {
    console.log(`Added ${quantity} of ${product.title} to cart.`);
    this.cartService.addToCart(product, quantity);
  }
}