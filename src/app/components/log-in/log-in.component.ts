declare var google: any;

import { Component, Renderer2, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Token } from '@angular/compiler';
import { Router } from '@angular/router';

@Component({
   selector: 'app-log-in',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule],
   templateUrl: './log-in.component.html',
   styleUrls: ['./log-in.component.css'],
})
export class LogInComponent implements OnInit {
   signupForm: FormGroup;
   loginForm: FormGroup;
   changePasswordForm: FormGroup;
   title = 'my-app';
   private router = inject(Router);
   showLogin = false;
   showChangePassword = false;
   errorMessage: string | null = null;

   ngOnInit(): void {
      // Verificar si google.accounts está disponible antes de usarlo
      if (google && google.accounts) {
         google.accounts.id.initialize({
            client_id: '449618549015-h89mnko150rl875h68dt6qn4l0dq2nhi.apps.googleusercontent.com',
            callback: (resp: any) => this.handleGoogleLogin(resp)
         });

         google.accounts.id.renderButton(
            document.getElementsByClassName("google-btn")[0],
            {
               theme: 'filled_blue',
               size: 'large',
               shape: 'rectangle',
               width: 350
            }
         );
      }
   }

   private decodeToken(token: string){
      return JSON.parse(atob(token.split(".")[1]));
   }

   handleGoogleLogin(response: any) {
      if (response) {
          this.authService.googleLogin(response.credential).subscribe(data =>{
          });
      }
  }

   constructor(private el: ElementRef, private renderer: Renderer2, private authService: AuthService) {
      this.signupForm = this.createFormGroupSignup();
      this.loginForm = this.createFormGroupLogin();
      this.changePasswordForm = this.createFormGroupChangePassword();
   }

   showRegisterForm() {
      this.showLogin = false;
      this.showChangePassword = false;
   }

   showLoginForm() {
      this.showLogin = true;
      this.showChangePassword = false;
   }

   showChangePasswordForm() {
      this.showLogin = false;
      this.showChangePassword = true;
  }

   createFormGroupSignup(): FormGroup {
      return new FormGroup({
         name: new FormControl("", [Validators.required, Validators.minLength(5), this.fullNameValidator()]),
         email: new FormControl("", [Validators.required, Validators.email]),
         password: new FormControl("", [Validators.required, Validators.minLength(5)]),
         confirmPassword: new FormControl("", [Validators.required, Validators.minLength(5)]),
      }, { validators: this.passwordsMatchValidator });
   }

   createFormGroupLogin(): FormGroup {
      return new FormGroup({
         email: new FormControl("", [Validators.required, Validators.email]),
         password: new FormControl("", [Validators.required, Validators.minLength(5)]),
      });
   }

   createFormGroupChangePassword(): FormGroup {
      return new FormGroup({
          email: new FormControl("", [Validators.required, Validators.email]),
      });
   }

   passwordsMatchValidator: ValidatorFn = (form: AbstractControl): { [key: string]: boolean } | null => {
      const password = form.get('password')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { mismatch: true };
    };
    
   fullNameValidator(): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
        const value = control.value || '';
        const valid = value.trim().split(' ').length > 1;
        return valid ? null : { fullName: true };
      };
    }

    signup(): void {
      this.errorMessage = null;
      console.log(this.signupForm.value);
      this.authService.signup(this.signupForm.value).subscribe({
        next: (msg) => {
          console.log(msg);
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Ocurrió un error durante el registro';
        }
      });
    }
  

   login(): void {
      console.log(this.loginForm.value);
      this.authService
         .login(this.loginForm.value.email, this.loginForm.value.password)
         .subscribe();
   }

 changePassword(): void {
   console.log(this.changePasswordForm.value);
   if (this.changePasswordForm.valid) {
     this.authService.sendEmailResetPassword(this.changePasswordForm.value)
      .subscribe(response => console.log('Correo enviado:', response));
   }
 }

   googleLogin(): void {
      const token = sessionStorage.getItem("token");
      if (token) {
          this.authService.googleLogin(token).subscribe({
              next: user => {
                  sessionStorage.setItem("user", JSON.stringify(user));
                  this.router.navigate(['profile']);
              },
              error: err => {
                  console.error("Login failed", err);
              }
          });
      } else {
          console.error("No token found in session storage");
      }
  }
   

}