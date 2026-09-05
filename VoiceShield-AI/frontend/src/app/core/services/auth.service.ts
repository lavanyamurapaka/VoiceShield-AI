import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CurrentUser {
  id: string;
  username: string;
  role: 'ROLE_ADMIN' | 'ROLE_ANALYST' | 'ROLE_USER';
  department: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private predefinedUsers: CurrentUser[] = [
    { id: '11111111-1111-1111-1111-111111111111', username: 'admin', role: 'ROLE_ADMIN', department: 'CyberSecurity Core' },
    { id: '22222222-2222-2222-2222-222222222222', username: 'analyst', role: 'ROLE_ANALYST', department: 'SecOps Incident Response' },
    { id: '33333333-3333-3333-3333-333333333333', username: 'operator', role: 'ROLE_USER', department: 'Customer Contact Center' }
  ];

  private currentUserSubject = new BehaviorSubject<CurrentUser>(this.predefinedUsers[1]); // Default to Analyst
  public currentUser$: Observable<CurrentUser> = this.currentUserSubject.asObservable();

  get currentUser(): CurrentUser {
    return this.currentUserSubject.value;
  }

  switchPersona(role: 'ROLE_ADMIN' | 'ROLE_ANALYST' | 'ROLE_USER'): void {
    const matched = this.predefinedUsers.find((u) => u.role === role) || this.predefinedUsers[0];
    this.currentUserSubject.next(matched);
  }

  hasRole(role: string): boolean {
    return this.currentUser.role === role;
  }
}
