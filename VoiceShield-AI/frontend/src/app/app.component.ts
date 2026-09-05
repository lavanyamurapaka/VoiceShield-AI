import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, CurrentUser } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  currentUser!: CurrentUser;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((u) => (this.currentUser = u));
  }

  switchRole(role: 'ROLE_ADMIN' | 'ROLE_ANALYST' | 'ROLE_USER'): void {
    this.authService.switchPersona(role);
  }
}
