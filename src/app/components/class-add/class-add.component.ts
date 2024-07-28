// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { ClassService } from '../../services/class.service';
// import { Class } from 'src/app/models/Class';

// @Component({
//   selector: 'app-class-add',
//   templateUrl: './class-add.component.html',
//   styleUrls: ['./class-add.component.css']
// })
// export class ClassAddComponent {
//   newClass: Class = {id: 0, title: '', description: '', imageUrl: '', instructor_id: 0};

//   constructor(private classService: ClassService, private router: Router) { }

//   addClass(): void {
//     // this.classService.addClass(this.newClass);
//     this.classService.addClass(this.newClass).subscribe(() => {
//       this.router.navigate(['/addClass']);
//     });
//   }
// }

import { Component, OnInit } from '@angular/core';
import { ClassService } from 'src/app/services/class.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { InstructorService } from 'src/app/services/instructor.service';
import { Instructor } from 'src/app/models/Instructor';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-class-add',
  templateUrl: './class-add.component.html',
  styleUrls: ['./class-add.component.css']
})
export class ClassAddComponent implements OnInit{
  newClass = { title: '', description: '', monthlyFee: 0, instructor_id: 0, days: [], time: '', schedules: [{ day_of_week: '', time: '' }]  };
  selectedFile: File | undefined;
  instructors: Instructor[] = [];
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  isAdmin = false;

  constructor(private classService: ClassService, private http: HttpClient, private router: Router, private instructorService: InstructorService, private authService: AuthService) {}

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

  addSchedule() {
    this.newClass.schedules.push({ day_of_week: '', time: '' });
  }

  removeSchedule(index: number) {
    this.newClass.schedules.splice(index, 1);
  }

  addClass() {
    if (this.newClass.monthlyFee < 0) {
      alert("La cuota mensual no puede ser negativa.");
      return;
    }
    const formData = new FormData();
    formData.append('title', this.newClass.title);
    formData.append('description', this.newClass.description);
    formData.append('monthlyFee', this.newClass.monthlyFee.toString());
    formData.append('instructor_id', this.newClass.instructor_id.toString());
    formData.append('schedules', JSON.stringify(this.newClass.schedules));
    if (this.selectedFile)
        formData.append('imageUrl', this.selectedFile);

    this.classService.addClass(formData).subscribe(() => {
        this.router.navigate(['/addClass']);
    });
}

}
