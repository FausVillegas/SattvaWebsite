import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Instructor } from "src/app/models/Instructor";
import { ClassService } from "src/app/services/class.service";
import { InstructorService } from "src/app/services/instructor.service";

@Component({
  selector: 'app-edit-class',
  templateUrl: './edit-class.component.html',
  styleUrls: ['./edit-class.component.css']
})
export class EditClassComponent implements OnInit {
  classData: any = {};
  apiUrl = 'http://localhost:3000/';
  selectedFile: File | undefined;
  instructors: Instructor[] = [];
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(
    private route: ActivatedRoute,
    private classService: ClassService,
    private router: Router,
    private instructorService: InstructorService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.classService.getClassById(Number(id)).subscribe(data => {
      this.classData = data.classData;
      this.classData.schedules = data.classSchedules;
    });
    this.instructorService.getInstructors().subscribe(data => {
      this.instructors = data;
    });
  }

  onSave() {
    if (this.classData.monthly_fee < 0) {
      alert("La cuota mensual no puede ser negativa.");
      return;
    }
    const formData = new FormData();
    formData.append('title', this.classData.title);
    formData.append('description', this.classData.description);
    formData.append('monthly_fee', this.classData.monthly_fee.toString());
    formData.append('instructor_id', this.classData.instructor_id.toString());
    formData.append('schedules', JSON.stringify(this.classData.schedules));
    
    if (this.selectedFile) {
      formData.append('imageUrl', this.selectedFile);
    }
  
    this.classService.updateClass(this.classData.id, formData).subscribe(() => {
      this.router.navigate(['/']);
    });
  }  

  cancel() {
    this.router.navigate(['/']); 
  }

  addSchedule() {
    this.classData.schedules.push({ day_of_week: '', time: '' });
  }

  removeSchedule(index: number) {
    this.classData.schedules.splice(index, 1);
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }
  
}

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

// import { Component, OnInit } from '@angular/core';
// import { ClassService } from 'src/app/services/class.service';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { ActivatedRoute, Router } from '@angular/router';
// import { InstructorService } from 'src/app/services/instructor.service';
// import { Instructor } from 'src/app/models/Instructor';
// import { AuthService } from 'src/app/services/auth.service';

// @Component({
//     selector: 'app-edit-class',
//     templateUrl: './edit-class.component.html',
//     styleUrls: ['./edit-class.component.css']
//   })
// export class EditClassComponent implements OnInit {
//   classData = { id: 0, title: '', description: '', monthlyFee: 0, instructor_id: 0, days: [], time: '', schedules: [{ day_of_week: '', time: '' }]  };
//   selectedFile: File | undefined;
//   instructors: Instructor[] = [];
//   days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//   isAdmin = false;

//   constructor(private route: ActivatedRoute, private classService: ClassService, private http: HttpClient, private router: Router, private instructorService: InstructorService, private authService: AuthService) {}

//   navigateToAddInstructor() {
//     if (this.isAdmin) {
//       this.router.navigate(['/instructors']);
//     }
//   }

//   onFileChange(event: any) {
//     this.selectedFile = event.target.files[0];
//   }

//   ngOnInit() {
//     this.instructorService.getInstructors().subscribe(data => {
//       this.instructors = data;
//     });
//     this.isAdmin = this.authService.isAdmin();
//     this.classData.id = Number(this.route.snapshot.paramMap.get('id'));
//     this.classService.getClassById(this.classData.id).subscribe(data => {
//       this.classData = data;
//     });
//   }

//   addSchedule() {
//     this.classData.schedules.push({ day_of_week: '', time: '' });
//   }

//   removeSchedule(index: number) {
//     this.classData.schedules.splice(index, 1);
//   }

//   addClass() {
//     const formData = new FormData();
//     formData.append('title', this.classData.title);
//     formData.append('description', this.classData.description);
//     formData.append('monthlyFee', this.classData.monthlyFee.toString());
//     formData.append('instructor_id', this.classData.instructor_id.toString());
//     formData.append('schedules', JSON.stringify(this.classData.schedules));
//     if (this.selectedFile)
//         formData.append('imageUrl', this.selectedFile);

//     this.classService.updateClass(this.classData.id,formData).subscribe(() => {
//         this.router.navigate(['/addClass']);
//     });
// }

// }
