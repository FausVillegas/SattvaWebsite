import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{
  authService = inject(AuthService);
  name: string | undefined;
  phone: string | undefined;
  address: string | undefined;
  email!: string;
  token = localStorage.getItem("token");
  decodedToken: any;
  isEditing = false;
  profileForm!: FormGroup;

  ngOnInit(): void {
    if (this.token) {
      this.decodedToken = jwtDecode(this.token);
      this.name = this.decodedToken.name;
      this.email = this.decodedToken.email;
      this.phone = this.decodedToken.phone;
      this.address = this.decodedToken.address;
    // } else if(this.loggedInUser){
    //   this.name = JSON.parse(this.loggedInUser!).name;
    //   this.email = JSON.parse(this.loggedInUser!).email;
    //   this.phone = JSON.parse(this.loggedInUser!).phone;
    //   this.address = JSON.parse(this.loggedInUser!).address;
    } else {
      this.name = "Usuario no registrado";
    }

    this.profileForm = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.minLength(5), this.fullNameValidator()]),
      phone: new FormControl("", [Validators.required, Validators.minLength(6)]),
      address: new FormControl("", [Validators.required, Validators.minLength(6)]),
   });
  }

  constructor(private router: Router) {}

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
}


// updateProfile(): void {
//   const updatedUser = {
//       name: this.profileForm.value.name,
//       phone: this.profileForm.value.phone,
//       address: this.profileForm.value.address
//   };

//   this.authService.updateProfile(this.email, updatedUser).subscribe({
//       next: (msg) => {
//           console.log(msg);
//           this.name = updatedUser.name;
//           this.phone = updatedUser.phone;
//           this.address = updatedUser.address;

          
//           this.token = localStorage.getItem("token");
//           if (this.token) {
//             this.decodedToken = jwtDecode(this.token);
//             this.decodedToken.name = this.name;
//             this.decodedToken.phone = this.phone;
//             this.decodedToken.address = this.address;
//             this.token = jwtEncode(this.decodedToken);
//             localStorage.setItem("token", this.decodedToken);
//           } else if (this.loggedInUser) {
//             // JSON.parse(this.loggedInUser!).name = this.name;
//             // JSON.parse(this.loggedInUser!).phone = this.phone;
//             // JSON.parse(this.loggedInUser!).address = this.address;
//             sessionStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
//           }

//           this.token = jwt.sign(this.decodedToken,'secretfortoken')

//           this.isEditing = false;
//           this.router.navigate(['/profile']);
//       },
//       error: (error) => {
//           console.error('Error updating profile:', error);
//       }
//   });
// }

updateProfile(): void {
  const updatedUser = {
    name: this.profileForm.value.name,
    phone: this.profileForm.value.phone,
    address: this.profileForm.value.address
  };

  this.authService.updateProfile(this.email, updatedUser).subscribe({
    next: (msg) => {
      console.log(msg);

      if(updatedUser.name)
        this.name = updatedUser.name;
      if(updatedUser.phone)
        this.phone = updatedUser.phone;
      if(updatedUser.address)
        this.address = updatedUser.address;

      // sessionStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      this.token = localStorage.getItem("token");
      if (this.token) {
        this.decodedToken = jwtDecode(this.token);
        this.decodedToken.name = this.name;
        this.decodedToken.phone = this.phone;
        this.decodedToken.address = this.address;

        //Codificar el token actualizado y guardarlo en localStorage
        this.token = this.authService.encodeToken(this.decodedToken);
        localStorage.setItem("token", this.token);
      }
      // } else if (this.loggedInUser) {
      //   // JSON.parse(this.loggedInUser!).name = this.name;
      //   // JSON.parse(this.loggedInUser!).phone = this.phone;
      //   // JSON.parse(this.loggedInUser!).address = this.address;
      //   localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      // }

      this.isEditing = false;
      this.router.navigate(['/profile']);
    },
    error: (error) => {
      console.error('Error updating profile:', error);
    }
  });
}


  
  fullNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';
      const valid = value.trim().split(' ').length > 1;
      return valid ? null : { fullName: true };
    };
  }

  logout(): void{
    this.authService.logout();
  }
}
