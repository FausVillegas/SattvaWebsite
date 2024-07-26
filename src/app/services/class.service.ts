import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { first, Observable } from 'rxjs';
import { SattvaClass } from '../models/Class';
import { catchError } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = 'http://localhost:3000/classes';

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" })
  };

  constructor(private http: HttpClient, private errorHandlerService: ErrorHandlerService) {}

  getClasses(): Observable<SattvaClass[]> {
    return this.http
    .get<SattvaClass[]>(this.apiUrl,{ responseType: "json" })
    .pipe(
      catchError(error => {
        return this.errorHandlerService.handleError<SattvaClass[]>("getClasses", [])(error);
      }),
    );
  }

  addClass(classData: any): Observable<SattvaClass> {
    return this.http.post<SattvaClass>(this.apiUrl, classData).pipe(
      catchError(error => {
        return this.errorHandlerService.handleError<SattvaClass>("addClass")(error);
      })
    );
  }
  

  updateClass(id: number, classData: SattvaClass): Observable<SattvaClass> {
    return this.http.put<SattvaClass>(`${this.apiUrl}/${id}`, classData);
  }

  deleteClass(classId: Pick<SattvaClass, "id">): Observable<{}> {
    return this.http
    .delete<SattvaClass>(`${this.apiUrl}/${classId.id}`, this.httpOptions)
    .pipe(
      first(),
      catchError(error => {
        return this.errorHandlerService.handleError<SattvaClass>("deleteClass")(error);
      }),
    )
  }

  getClassById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
