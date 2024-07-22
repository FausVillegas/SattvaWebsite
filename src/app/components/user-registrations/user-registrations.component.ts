import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-registrations',
  templateUrl: './user-registrations.component.html',
  styleUrls: ['./user-registrations.component.css']
})
export class UserRegistrationsComponent {
  events: any[] = [];
  classes: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // const userId = this.authService.getUserId();
    console.log('getUserRegistrations');
    this.authService.getUserRegistrations().subscribe((data) => {
      this.events = data.events;
      this.classes = data.classes;
    });
  }
}
