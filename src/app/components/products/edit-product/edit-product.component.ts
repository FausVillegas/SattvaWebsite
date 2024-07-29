import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/Product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit {
  apiUrl = 'http://localhost:3000/';
  selectedImage: File | undefined;
  productId: string | undefined;
  productData!: Product;
  categories: string[] = ['Ejercicio', 'Meditación', 'Decoración'];

  constructor(private route: ActivatedRoute, private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.productId =  this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductById(this.productId).subscribe(product => {
      this.productData = product;
    });
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedImage = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.productData.sale_price < 0 || this.productData.stock < 0) {
      alert("Valor negativo no permitido.");
      return;
    }

    const formData = new FormData();
    formData.append('title', this.productData.title);
    formData.append('description', this.productData.description);
    formData.append('sale_price', this.productData.sale_price.toString());
    formData.append('category', this.productData.category);
    formData.append('stock', this.productData.stock.toString());

    if (this.selectedImage) {
      formData.append('image_url', this.selectedImage);
    }
    console.log("Form data "+formData.get("title"));
    this.productService.updateProduct(this.productData.id, formData)
    .subscribe({
      next: (response: any) => {
        console.log('Product updated successfully', response);
        this.router.navigate(['/products']);
      },
      error: (error: any) => {
        console.error('Error updating product', error);
      }
    });
  }
}
