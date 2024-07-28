import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { SattvaEvent } from 'src/app/models/Event';
import { Instructor } from 'src/app/models/Instructor';
import { InstructorService } from 'src/app/services/instructor.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-event-add',
  templateUrl: './event-add.component.html',
  styleUrls: ['./event-add.component.css']
})
export class EventAddComponent implements OnInit{
  newEvent = { title: '', description: '', imageUrl: '', dateTime: new Date(), instructor_id: 0, price: 0};
  selectedFile: File | undefined;
  instructors: any[] = [];
  isAdmin = false;

  constructor(private eventService: EventService, private router: Router, private instructorService: InstructorService, private authService: AuthService) { }

  navigateToAddInstructor() {
    if (this.isAdmin) {
      this.router.navigate(['/instructors']);
    }
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }
  
  ngOnInit() {
    this.instructorService.getInstructors().subscribe(data => {
      this.instructors = data;
    });
    this.isAdmin = this.authService.isAdmin();
  }

  addEvent(): void {
    if (this.newEvent.price < 0) {
      alert("El precio del evento no puede ser negativo.");
      return;
    }
    const formData = new FormData();
    formData.append('title', this.newEvent.title);
    formData.append('description', this.newEvent.description);
    formData.append('dateTime', this.newEvent.dateTime.toString());
    formData.append('price', this.newEvent.price.toString());
    formData.append('instructor_id', this.newEvent.instructor_id.toString());
    if(this.selectedFile)
      formData.append('imageUrl', this.selectedFile);
    
    this.eventService.addEvent(formData).subscribe(() => {
            this.router.navigate(['/addEvent']);
          });
  }
}
