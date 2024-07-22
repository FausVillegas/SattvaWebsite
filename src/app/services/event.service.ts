import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { first, Observable } from 'rxjs';
import { Event } from '../models/Event';
import { catchError } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';
import { AuthService } from './auth.service';
import { Token } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000/events'; // Cambia esto por tu URL de la API
  
  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" })
  };

  constructor(private http: HttpClient, private errorHandlerService: ErrorHandlerService, private authService: AuthService) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl,{ responseType: "json" })
    .pipe(
      catchError(error => {
        return this.errorHandlerService.handleError<Event[]>("getEvents", [])(error);
      }),
    );
  }

  addEvent(eventData: any): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, eventData)
    .pipe(
      catchError(error => {
        return this.errorHandlerService.handleError<Event>("addEvent")(error);
      }),
    );
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(eventId: Pick<Event, "id">): Observable<{}> {
    return this.http
    .delete<Event>(`${this.apiUrl}/${eventId.id}`, this.httpOptions)
    .pipe(
      first(),
      catchError(error => {
        return this.errorHandlerService.handleError<Event>("deleteEvent")(error);
      }),
    )
  }

  registerAndPay(event: Event): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.post<any>(`${this.apiUrl}/events/${event.id}/register-pay`, { userId, price: event.price, title: event.title });
  }  

  registerForEvent(eventId: number): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.post<any>(`${this.apiUrl}/events/${eventId}/register`, { userId }).pipe(
      first(),
      catchError(error => {
        return this.errorHandlerService.handleError<Event>("registerForEvent")(error);
      }),
    );
  }  
}
