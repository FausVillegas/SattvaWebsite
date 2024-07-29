import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
// import { Order } from 'src/app/models/Order';
import { ProductService } from 'src/app/services/product.service';


@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.css']
})
export class OrdersListComponent implements OnInit{
  orders: any[] = [];

  constructor(private productService: ProductService, private authService: AuthService) { }

  ngOnInit(): void {
    this.productService.getOrdersByStatus(false).subscribe((orders: any[]) => {
      this.orders = orders;
      console.log(this.orders);
      // this.authService.getUserById();
    });
  }
}
