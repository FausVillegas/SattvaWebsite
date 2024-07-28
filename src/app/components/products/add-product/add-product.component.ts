import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { first } from 'rxjs';
import { Product } from 'src/app/models/Product';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit{
  @ViewChild("formDirective") formDirective!: NgForm;
  categories: string[] = ['Ejercicio', 'Meditación', 'Decoración'];

  productForm: FormGroup;
  selectedImage: File | undefined;

  constructor(private authService: AuthService, private productService: ProductService) {
    this.productForm = this.createFormGroup();
  }

  ngOnInit(): void {
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      title: new FormControl("", [Validators.required]),
      description: new FormControl("", [Validators.required]),
      sale_price: new FormControl("", [Validators.required]),
      category: new FormControl("", [Validators.required]),
      stock: new FormControl("", [Validators.required]),
      image_url: new FormControl(null, [Validators.required]),
    });
 }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedImage = event.target.files[0];
    }
  }

 onSubmit(): void {
  if (this.productForm.get('sale_price')?.value < 0 || this.productForm.get('stock')?.value < 0) {
    alert("Valor negativo no permitido.");
    return;
  }
  if (this.productForm.valid) {
    const formData = new FormData();
    formData.append('title', this.productForm.get('title')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('sale_price', this.productForm.get('sale_price')?.value);
    formData.append('category', this.productForm.get('category')?.value);
    formData.append('stock', this.productForm.get('stock')?.value);
    formData.append('user', this.productForm.get('user')?.value);

    if (this.selectedImage) {
      formData.append('image_url', this.selectedImage);
    } else {
      console.error('No image file selected');
      return;
    }

    this.productService.createProduct(formData).subscribe({
      next: (response) => {
        console.log('Product created successfully', response);
        this.productForm.reset();
        this.formDirective.resetForm();
      },
      error: (error) => {
        console.error('Error creating product', error);
      }
    });    
  } else {
    console.log("The product form is not valid");
  }
}
}
