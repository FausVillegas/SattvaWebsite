import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductListComponent } from './components/products/product-list/product-list.component';
// import { ProductAlertsComponent } from './products/product-alerts/product-alerts.component';
import { ProductDetailsComponent } from './components/products/product-details/product-details.component';
import { CartComponent } from './components/cart/cart.component';
import { CartService } from './services/cart.service';
import { AuthGuardService } from './services/auth-guard.service';

import { AppComponent } from './app.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { AddProductComponent } from './components/products/add-product/add-product.component';

import { AuthInterceptorService } from './services/auth-interceptor.service';
import { AdminGuardService } from './services/admin-guard.service';
import { ProfileComponent } from './components/profile/profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { HomeComponent } from './components/home/home.component';
import { ClassAddComponent } from './components/class-add/class-add.component';
import { EventAddComponent } from './components/event-add/event-add.component';
import { ClassEventDetailsComponent } from './components/class-event-details/class-event-details.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { UserRegistrationsComponent } from './components/user-registrations/user-registrations.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    ProductListComponent,
    CartComponent,
    // LogInComponent,
    AddProductComponent,
    // ProductAlertsComponent,
    ProductDetailsComponent,
    ProfileComponent,
    ResetPasswordComponent,
    HomeComponent,
    ClassAddComponent,
    EventAddComponent,
    ClassEventDetailsComponent,
    UserRegistrationsComponent,
  ],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot([
      // { path: '', redirectTo: '/products', pathMatch: 'full'},
      { path: '', component: HomeComponent},
      { path: 'my-registrations', component: UserRegistrationsComponent },
      { path: 'profile', component: ProfileComponent},
      { path: 'products', component: ProductListComponent },
      { path: 'product/:id', component: ProductDetailsComponent },
      { path: 'cart', component: CartComponent },
      { path: 'login', component: LogInComponent },
      { path: 'addProduct', component: AddProductComponent, canActivate: [AdminGuardService] },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'addClass', component: ClassAddComponent },
      { path: 'addEvent', component: EventAddComponent },
      // { path: 'shipping', component: ShippingComponent },
    ]),
    BrowserAnimationsModule,
  ],
  providers: [CartService,LogInComponent,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
