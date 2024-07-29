declare var google: any;
import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import jwtEncode from 'jwt-encode';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { first, catchError, tap } from 'rxjs/operators';

import { User } from '../models/User';
import { ErrorHandlerService } from './error-handler.service';
import { jwtDecode } from 'jwt-decode';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = "http://localhost:3000/auth"
  private secretKey = 'secretfortoken12052004';
  token = localStorage.getItem("token");
  userId!: number;
  decodedToken: any;

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" })
  };

  constructor(
    private http: HttpClient, 
    private errorHandlerService: ErrorHandlerService,
    private router: Router,
    private location: Location
  ) { }

  encodeToken(payload: any): string {
    return jwtEncode(payload, this.secretKey);
  }

//   updateProfile(email: string, updatedProfile: any): Observable<any> {
//     return this.http
//       .put<any>(`${this.url}/update-profile`, { email, updatedProfile }, this.httpOptions)
//       .pipe(
//         first(),
//         catchError(error => {
//           console.error('Update profile error', error);
//           return throwError(() => error);
//         })
//       );
// }

updateProfile(email: string, updatedProfile: any): Observable<any> {
  return this.http
    .put<any>(`${this.url}/update-profile`, { email, updatedProfile }, this.httpOptions)
    .pipe(
      first(),
      tap(response => {
        const updatedUserData = response.updatedUserData; // Replace with actual field if different
        updatedUserData.userId = updatedUserData.id;
        const newToken = this.encodeToken(updatedUserData); // Encode the updated user data
        localStorage.setItem('token', newToken); // Update token in localStorage
      }),
      catchError(error => {
        console.error('Update profile error', error);
        return throwError(() => error);
      })
    );
}


  signup(user: Omit<User, "id">): Observable<User> {
    return this.http
      .post<User>(`${this.url}/signup`, user, this.httpOptions)
      .pipe(
        first(),
        catchError(error => {
          console.error('Signup error', error);
          return throwError(() => error); // Propaga el error
        })
      );
  }

  login(email: Pick<User, "email">, password: Pick<User, "password">): Observable<{ token: string, userId: number }> {
    return this.http.post<{ token: string, userId: number, role: string }>(`${this.url}/login`, { email, password }, this.httpOptions)
      .pipe(
        first(),
        tap((tokenObject) => {
          localStorage.setItem("token", tokenObject.token);
          this.router.navigate(['/profile']).then(() => {
            window.location.reload();
          });
        }),
        catchError(this.errorHandlerService.handleError<{ token: string, userId: number, role: string }>("login"))
      );
  }  

  googleLogin(token: string): Observable<{ token: string, user: User }> {
    return this.http.post<{ token: string, user: User }>(`${this.url}/google-login`, { token }, this.httpOptions)
      .pipe(
        first(),
        tap(response => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/profile']).then(() => {
            window.location.reload();
          });
        }),
        catchError(this.errorHandlerService.handleError<{ token: string, user: User }>("googleLogin"))
      );
  }
  

  sendEmailResetPassword(email: Pick<User, "email">): Observable<any> {
    console.log("Se ejecuta sendEmailResetPassword auth.service.ts: ", email);
    return this.http
      .put(`${this.url}/reset-password-request`, email, this.httpOptions)
      .pipe(
        first(),
        catchError(error => {
          console.error('sendEmailResetPassword', error);
          return this.errorHandlerService.handleError<{ email: string }>("sendEmailResetPassword")(error);
        }),
      );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http
      .put(`${this.url}/reset-password`, { token, newPassword }, this.httpOptions)
        .pipe(
          first(),
          catchError(error => {
            console.error('Error resetting password:', error);
            return this.errorHandlerService.handleError<{ email: string }>("resetPassword")(error);
          }),
        );
      }

      logout(): void {
        localStorage.removeItem('token');
        sessionStorage.removeItem('loggedInUser');
        google.accounts.id.disableAutoSelect();
        this.router.navigate(['/login']).then(() => {
          window.location.reload();
        });
      }
      

  isAuthenticated(): boolean {
    return !!(localStorage.getItem('token'));
  }

  isAdmin(): boolean {
    if(this.token){
      this.decodedToken = jwtDecode(this.token);
      return this.decodedToken.role === "admin";
    }
    return false;
  }

  getUserId() {
    if(this.token){
      this.decodedToken = jwtDecode(this.token);
      return this.decodedToken.userId;
    }
    return false;
  }

  getUserRegistrations(): Observable<any> {
    console.log('getUserRegistrations service '+this.getUserId());
    return this.http.get(`${this.url}/user-registrations/${this.getUserId()}`);
  }
}

