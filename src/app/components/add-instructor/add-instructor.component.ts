import { Component, OnInit } from '@angular/core';
import { InstructorService } from 'src/app/services/instructor.service';  // Asegúrate de tener un servicio para manejar la lógica de negocio

@Component({
  selector: 'app-add-instructor',
  templateUrl: './add-instructor.component.html',
  styleUrls: ['./add-instructor.component.css']
})
export class AddInstructorComponent implements OnInit{
  instructors: any[] = [];
  newInstructor = {
    firstName: '',
    lastName: '',
    email: '',
    dni: '',
    salary: 0
  };
  editingInstructor: any = null;

  constructor(private instructorService: InstructorService) {}
  
  ngOnInit(): void {
    this.loadInstructors();
    console.log(this.instructors);
  }

  onSubmit() {
    if (this.validateForm()) {
      this.instructorService.addInstructor(this.newInstructor).subscribe((response: any) => {
        console.log(response);
      });
    } else {
      alert('Por favor, completa todos los campos.');
    }
  }

  loadInstructors() {
    this.instructorService.getInstructors().subscribe(data => {
      console.log("dataaa"+data[0].id);
      this.instructors = data;
    });
  }

  validateForm() {
    return this.newInstructor.firstName && this.newInstructor.lastName && this.newInstructor.email && this.newInstructor.dni && this.newInstructor.salary > 0;
  }

  deleteInstructor(id: number) {
    if (confirm('¿Está seguro de que desea eliminar a este instructor?')) {
      this.instructorService.deleteInstructor(id).subscribe(() => {
        this.loadInstructors();
      });
    }
  }

  editInstructor(instructor: any): void {
    this.editingInstructor = { ...instructor };
    console.log("Editando instructor"+this.editingInstructor.id);
  }

  sendEditedInstructor(): void {
    this.instructorService.updateInstructor(this.editingInstructor).subscribe(() => {
      this.loadInstructors();
      this.editingInstructor = null;
    });
  }

  cancelEdit(): void {
    this.editingInstructor = null;
  }
}
