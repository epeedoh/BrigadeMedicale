import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { UserInfoDto } from '../../../core/auth/models/user.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
  currentUser: UserInfoDto | null = null;
  sidebarOpen = true;

  menuItems = [
    { label: 'Tableau de bord', icon: '📊', route: '/dashboard', roles: ['ADMIN', 'ACCUEIL', 'MEDECIN', 'LABORANTIN', 'PHARMACIEN', 'SUPERVISEUR'] },
    { label: 'Patients', icon: '🏥', route: '/patients', roles: ['ADMIN', 'ACCUEIL', 'MEDECIN', 'SUPERVISEUR'] },
    { label: 'Consultations', icon: '📋', route: '/consultations', roles: ['ADMIN', 'MEDECIN', 'SUPERVISEUR'] },
    { label: 'Pharmacie', icon: '💊', route: '/pharmacy', roles: ['ADMIN', 'PHARMACIEN', 'SUPERVISEUR'] },
    { label: 'Laboratoire', icon: '🔬', route: '/lab-tests', roles: ['ADMIN', 'LABORANTIN', 'SUPERVISEUR'] },
    { label: 'Triage Patient', icon: '🩺', route: '/triage', roles: ['ADMIN', 'INFIRMIER'] },
    { label: 'Formation', icon: '📚', route: '/training', roles: ['ADMIN', 'ACCUEIL', 'MEDECIN', 'LABORANTIN', 'PHARMACIEN', 'SUPERVISEUR'] },
    { label: 'Utilisateurs', icon: '👥', route: '/users', roles: ['ADMIN'] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  hasAccess(roles: string[]): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.roles.some(role => roles.includes(role));
  }

  get visibleMenuItems() {
    return this.menuItems.filter(item => this.hasAccess(item.roles));
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {},
      error: (error) => {
        console.error('Logout error:', error);
        this.authService['tokenService'].clearTokens();
        this.router.navigate(['/login']);
      }
    });
  }

  get userInitials(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`;
  }

  get userRoles(): string {
    return this.currentUser?.roles.join(', ') || '';
  }
}
