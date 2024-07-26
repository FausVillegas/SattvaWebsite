// import { Component, OnInit } from '@angular/core';
// import { ClassService } from 'src/app/services/class.service';
// import { EventService } from 'src/app/services/event.service';
// import { Class } from 'src/app/models/Class';
// import { Event } from 'src/app/models/Event';
// import { AuthService } from 'src/app/services/auth.service';


// @Component({
//   selector: 'app-home',
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.css']
// })
// export class HomeComponent implements OnInit {
//   apiUrl = "http://localhost:3000/";
//   classes: Class[] = [];
//   events: Event[] = [];

//   constructor(private classService: ClassService, private eventService: EventService, private authService: AuthService) {}

//   ngOnInit(): void {
//     this.loadClasses();
//     this.loadEvents();
//   }

//   loadClasses(): void {
//     this.classService.getClasses().subscribe(classes => this.classes = classes);
//   }

//   loadEvents(): void {
//     this.eventService.getEvents().subscribe(events => this.events = events);
//   }

//   addClass(classData: Class): void {
//     this.classService.addClass(classData).subscribe(() => this.loadClasses());
//   }

//   updateClass(classData: Class): void {
//     this.classService.updateClass(classData.id, classData).subscribe(() => this.loadClasses());
//   }

//   deleteClass(classId: Pick<Class, "id">): void {
//     console.log("Borrando clase: "+classId.id);
//     this.classService.deleteClass(classId).subscribe(() => this.loadClasses());
//   }

//   addEvent(eventData: Event): void {
//     this.eventService.addEvent(eventData).subscribe(() => this.loadEvents());
//   }

//   updateEvent(eventData: Event): void {
//     this.eventService.updateEvent(eventData.id, eventData).subscribe(() => this.loadEvents());
//   }

//   deleteEvent(eventId: Pick<Event, "id">): void {
//     console.log("Borrando evento: "+eventId.id);
//     this.eventService.deleteEvent(eventId).subscribe(() => this.loadEvents());
//   }

//   getAuthService(): AuthService {
//     return this.authService;
//   }

//   registerAndPay(event: Event): void {
//     this.eventService.registerAndPay(event).subscribe(response => {
//       window.location.href = response.paymentUrl; // Redirige a la página de pago de Stripe
//     }, error => {
//       alert('Error al inscribirse y pagar el evento');
//     });
//   }
  

//   registerForEvent(eventId: number): void {
//     this.eventService.registerForEvent(eventId).subscribe((_response: any) => {
//       alert('Inscripción exitosa');
//       // Actualiza la lista de eventos
//     }, (error: string) => {
//       alert('Error al inscribirse en el evento');
//       console.error(error);
//     });
//   }
  
// }

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ClassService } from 'src/app/services/class.service';
import { EventService } from 'src/app/services/event.service';
import { SattvaClass } from 'src/app/models/Class';
import { SattvaEvent } from 'src/app/models/Event';
import { AuthService } from 'src/app/services/auth.service';
import initMercadoPago, { MercadoPagoInstance } from '@mercadopago/sdk-react/mercadoPago/initMercadoPago';
import { ClassEventDetailsComponent } from '../class-event-details/class-event-details.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  apiUrl = "http://localhost:3000/";
  classes: SattvaClass[] = [];
  events: SattvaEvent[] = [];
  isAdmin = false;
  
  constructor(private classService: ClassService, private eventService: EventService, private authService: AuthService, private dialog: MatDialog, private router: Router) {}

  navigateToAddInstructor() {
    if (this.isAdmin) {
      this.router.navigate(['/instructors']);
    }
  }

  openEventDetails(data: any): void {
    const dialogRef = this.dialog.open(ClassEventDetailsComponent, {
      width: '500px',
      data: data,
      autoFocus: false,
    });
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadEvents();
    this.isAdmin = this.authService.isAdmin();
  }

  loadClasses(): void {
    this.classService.getClasses().subscribe(classes => this.classes = classes);
  }

  loadEvents(): void {
    this.eventService.getEvents().subscribe(events => this.events = events);
  }

  addClass(classData: SattvaClass): void {
    this.classService.addClass(classData).subscribe(() => this.loadClasses());
  }

  updateClass(classData: SattvaClass): void {
    this.router.navigate(['/edit-class', classData.id]);
  }

  deleteClass(classId: Pick<SattvaClass, "id">): void {
    console.log("Borrando clase: "+classId.id);
    this.classService.deleteClass(classId).subscribe(() => this.loadClasses());
  }

  addEvent(eventData: SattvaEvent): void {
    this.eventService.addEvent(eventData).subscribe(() => this.loadEvents());
  }

  updateEvent(eventData: SattvaEvent): void {
    this.router.navigate(['/edit-event', eventData.id]);
  }

  deleteEvent(eventId: Pick<SattvaEvent, "id">): void {
    console.log("Borrando evento: "+eventId.id);
    this.eventService.deleteEvent(eventId).subscribe(() => this.loadEvents());
  }

  getAuthService(): AuthService {
    return this.authService;
  }
}
