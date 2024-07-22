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
import { Class } from 'src/app/models/Class';
import { Event } from 'src/app/models/Event';
import { AuthService } from 'src/app/services/auth.service';
import initMercadoPago, { MercadoPagoInstance } from '@mercadopago/sdk-react/mercadoPago/initMercadoPago';
import { ClassEventDetailsComponent } from '../class-event-details/class-event-details.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  apiUrl = "http://localhost:3000/";
  classes: Class[] = [];
  events: Event[] = [];

  constructor(private classService: ClassService, private eventService: EventService, private authService: AuthService, private dialog: MatDialog) {}

  openEventDetails(data: any): void {
    const dialogRef = this.dialog.open(ClassEventDetailsComponent, {
      width: '500px',
      data: data,
      // panelClass: 'custom-dialog-container',
      autoFocus: false,
      // position: { top: "auto", left: "auto", bottom: "auto", right: "auto" },
      // position: { left: '35%' },
    });
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadEvents();
  }

  loadClasses(): void {
    this.classService.getClasses().subscribe(classes => this.classes = classes);
  }

  loadEvents(): void {
    this.eventService.getEvents().subscribe(events => this.events = events);
  }

  addClass(classData: Class): void {
    this.classService.addClass(classData).subscribe(() => this.loadClasses());
  }

  updateClass(classData: Class): void {
    this.classService.updateClass(classData.id, classData).subscribe(() => this.loadClasses());
  }

  deleteClass(classId: Pick<Class, "id">): void {
    console.log("Borrando clase: "+classId.id);
    this.classService.deleteClass(classId).subscribe(() => this.loadClasses());
  }

  addEvent(eventData: Event): void {
    this.eventService.addEvent(eventData).subscribe(() => this.loadEvents());
  }

  updateEvent(eventData: Event): void {
    this.eventService.updateEvent(eventData.id, eventData).subscribe(() => this.loadEvents());
  }

  deleteEvent(eventId: Pick<Event, "id">): void {
    console.log("Borrando evento: "+eventId.id);
    this.eventService.deleteEvent(eventId).subscribe(() => this.loadEvents());
  }

  getAuthService(): AuthService {
    return this.authService;
  }
}
