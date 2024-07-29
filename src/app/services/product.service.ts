import { Injectable, Type } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, first } from 'rxjs';
import { catchError } from 'rxjs';

import { Product } from '../models/Product';
import { User } from '../models/User';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private url = "http://localhost:3000/products"

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" })
  };

  constructor(private http: HttpClient, private errorHandlerService: ErrorHandlerService) { }

  fetchAll(): Observable<Product[]> {
    return this.http
      .get<Product[]>(this.url, { responseType: "json" })
      .pipe(
        catchError(error => {
          return this.errorHandlerService.handleError<Product[]>("fetchAll", [])(error);
        }),
      );
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(this.url, formData).pipe(
          catchError(error => {
            return this.errorHandlerService.handleError<Product>("createProduct")(error);
          }),
        );
  }

  deleteProduct(productId: Pick<Product, "id">): Observable<{}> {
    return this.http
    .delete<Product>(`${this.url}/${productId.id}`, this.httpOptions)
    .pipe(
      first(),
      catchError(error => {
        return this.errorHandlerService.handleError<Product>("deleteProduct")(error);
      }),
    )
  }

  getProductById(productId: string): Observable<Product> {
    return this.http
    .get<Product>(`${this.url}/${productId}`)
    .pipe(
      catchError(error => {
        return this.errorHandlerService.handleError<Product>("getProductById")(error);
      }),
    )
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    const url = `${this.url}?title_like=${searchTerm}`;
    return this.http.get<Product[]>(url);
  }

  updateProduct(productId: number, formData: any): Observable<Product> {
    console.log(formData.title);
    return this.http.put<Product>(`${this.url}/${productId}`, formData);
  }

  getOrdersByStatus(status: boolean): Observable<any> {
    return this.http.get<any>(`${this.url}/orders/by-status?status=${status}`);
  }
}
