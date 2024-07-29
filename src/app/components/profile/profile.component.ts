// import { Component, inject, OnInit } from '@angular/core';
// import { AuthService } from 'src/app/services/auth.service';
// import { jwtDecode } from 'jwt-decode';
// import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { User } from 'src/app/models/User';

// @Component({
//   selector: 'app-profile',
//   templateUrl: './profile.component.html',
//   styleUrls: ['./profile.component.css']
// })
// export class ProfileComponent implements OnInit{
//   authService = inject(AuthService);
//   name: string | undefined;
//   phone: string | undefined;
//   location: string | undefined;
//   address: string | undefined;
//   dni: string | undefined;
//   email!: string;
//   token = localStorage.getItem("token");
//   decodedToken: any;
//   isEditing = false;
//   profileForm!: FormGroup;

//   ngOnInit(): void {
//     if (this.token) {
//       this.decodedToken = jwtDecode(this.token);
//       this.name = this.decodedToken.name;
//       this.email = this.decodedToken.email;
//       this.phone = this.decodedToken.phone;
//       this.location = this.decodedToken.location;
//       this.address = this.decodedToken.address;
//       this.dni = this.decodedToken.dni;
//     } else {
//       this.name = "Usuario no registrado";
//     }

//     this.profileForm = new FormGroup({
//       name: new FormControl("", [Validators.required, Validators.minLength(5), this.fullNameValidator()]),
//       phone: new FormControl("", [Validators.required, Validators.minLength(6)]),
//       address: new FormControl("", [Validators.required, Validators.minLength(6)]),
//    });
//   }

//   constructor(private router: Router) {}

//   toggleEdit(): void {
//     this.isEditing = !this.isEditing;
// }

// updateProfile(): void {
//   const updatedUser = {
//     name: this.profileForm.value.name,
//     phone: this.profileForm.value.phone,
//     address: this.profileForm.value.address
//   };

//   this.authService.updateProfile(this.email, updatedUser).subscribe({
//     next: (msg) => {
//       console.log(msg);

//       if(updatedUser.name)
//         this.name = updatedUser.name;
//       if(updatedUser.phone)
//         this.phone = updatedUser.phone;
//       if(updatedUser.address)
//         this.address = updatedUser.address;

//       // sessionStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
//       this.token = localStorage.getItem("token");
//       if (this.token) {
//         this.decodedToken = jwtDecode(this.token);
//         this.decodedToken.name = this.name;
//         this.decodedToken.phone = this.phone;
//         this.decodedToken.address = this.address;

//         //Codificar el token actualizado y guardarlo en localStorage
//         this.token = this.authService.encodeToken(this.decodedToken);
//         localStorage.setItem("token", this.token);
//       }

//       this.isEditing = false;
//       this.router.navigate(['/profile']);
//     },
//     error: (error) => {
//       console.error('Error updating profile:', error);
//     }
//   });
// }

//   logout(): void{
//     this.authService.logout();
//   }
// }

import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  email!: string;
  token = localStorage.getItem("token");
  decodedToken: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: [null, Validators.required],
      phone: [null, Validators.required],
      location: [null, Validators.required],
      address: [null, Validators.required],
      dni: [null, Validators.required]
    });
  }

  fullNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';
      const valid = value.trim().split(' ').length > 1;
      return valid ? null : { fullName: true };
    };
  }

  ngOnInit(): void {
    if (this.token) {
      this.decodedToken = jwtDecode(this.token);
      this.email = this.decodedToken.email;
      this.profileForm.patchValue({
        name: this.decodedToken.name,
        phone: this.decodedToken.phone,
        location: this.decodedToken.location,
        address: this.decodedToken.address,
        dni: this.decodedToken.dni
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const updatedData = this.profileForm.value;
      this.authService.updateProfile(this.email, updatedData).subscribe({
      next: (msg) => {
        alert('Perfil actualizado!');
      }, 
      error: (error) => {
        alert('Error al actualizar perfil');
      }
      });
    } else {
      alert("Formulario no valido, completa todos los datos para actualizar tu perfil");
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
