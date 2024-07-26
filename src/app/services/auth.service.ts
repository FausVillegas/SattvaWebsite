declare var google: any;
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import jwtEncode from 'jwt-encode';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { first, catchError, tap } from 'rxjs/operators';

import { User } from '../models/User';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = "http://localhost:3000/auth"
  private secretKey = 'secretfortoken12052004';
  userId!: number;

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" })
  };

  constructor(
    private http: HttpClient, 
    private errorHandlerService: ErrorHandlerService,
    private router: Router
  ) { }

  encodeToken(payload: any): string {
    return jwtEncode(payload, this.secretKey);
  }

  updateProfile(email: string, updatedProfile: any): Observable<any> {
    return this.http
      .put<any>(`${this.url}/update-profile`, { email, updatedProfile }, this.httpOptions)
      .pipe(
        first(),
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

  // login(email: Pick<User,"email">, password: Pick<User,"password">): Observable<{ token: string, userId: Pick<User,"id"> }> {    
  //   return this.http
  //   .post<{ token: string, userId: Pick<User,"id">, name: string, email: string, role: string }>(`${this.url}/login`, { email, password }, this.httpOptions)
  //     .pipe(
  //       first(),
  //       tap((tokenObject: { token: string, userId: Pick<User,"id">, name: string, email: string, role: string }) => {
  //         this.userId = Number(tokenObject.userId);
  //         localStorage.setItem("token", tokenObject.token);
  //         localStorage.setItem("role", tokenObject.role);
  //         this.router.navigate(['profile']);
  //       }),
  //       catchError(this.errorHandlerService.handleError<{ token: string, userId: Pick<User,"id">, role: string }>("login"))
  //     );
  // }

  login(email: Pick<User, "email">, password: Pick<User, "password">): Observable<{ token: string, userId: number }> {
    return this.http.post<{ token: string, userId: number, role: string }>(`${this.url}/login`, { email, password }, this.httpOptions)
      .pipe(
        first(),
        tap((tokenObject) => {
          localStorage.setItem("token", tokenObject.token);
          localStorage.setItem("userId", tokenObject.userId.toString());
          localStorage.setItem("role", tokenObject.role);
          this.router.navigate(['profile']);
        }),
        catchError(this.errorHandlerService.handleError<{ token: string, userId: number, role: string }>("login"))
      );
  }


  // googleLogin(token: string): Observable<User> {
  //   return this.http.post<User>(`${this.url}/google-login`, { token }, this.httpOptions)
  //       .pipe(
  //           first(),
  //           tap(user => {
  //               localStorage.setItem('loggedInUser', JSON.stringify(user));
  //               this.userId = user.id;
  //               console.log("USER"+this.userId);
  //               this.router.navigate(['profile']);
  //           }),
  //           catchError(this.errorHandlerService.handleError<User>("googleLogin"))
  //       );
  // }
  googleLogin(token: string): Observable<{ token: string, user: User }> {
    return this.http.post<{ token: string, user: User }>(`${this.url}/google-login`, { token }, this.httpOptions)
        .pipe(
            first(),
            tap(response => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('userId', response.user.id.toString());
                localStorage.setItem('role', response.user.role);
                this.router.navigate(['profile']);
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
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    google.accounts.id.disableAutoSelect();
    sessionStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!(localStorage.getItem('token'));
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === "admin";
  }

  getUserId() {
    return localStorage.getItem('userId');
  }

  getUserRegistrations(): Observable<any> {
    console.log('getUserRegistrations service '+this.getUserId());
    return this.http.get(`${this.url}/user-registrations/${this.getUserId()}`);
  }
}
