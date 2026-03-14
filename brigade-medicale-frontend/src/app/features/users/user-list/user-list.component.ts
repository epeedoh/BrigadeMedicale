import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  searchTerm = '';
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;
  Math = Math; // Expose Math to template

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.searchUsers(this.searchTerm || undefined, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.users = response.data.items;
            this.totalItems = response.data.pagination.totalItems;
            this.totalPages = response.data.pagination.totalPages;
            this.hasNextPage = response.data.pagination.hasNextPage;
            this.hasPreviousPage = response.data.pagination.hasPreviousPage;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  createUser(): void {
    this.router.navigate(['/users/create']);
  }

  editUser(user: User): void {
    this.router.navigate(['/users/edit', user.id]);
  }

  deleteUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir désactiver l'utilisateur ${user.username}?`)) {
      this.userService.delete(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Erreur lors de la désactivation de l\'utilisateur');
        }
      });
    }
  }

  getRoleName(user: User): string {
    return user.roles.map(r => r.name).join(', ');
  }

  getStatusClass(user: User): string {
    return user.isActive ? 'text-green-600' : 'text-red-600';
  }

  getStatusText(user: User): string {
    return user.isActive ? 'Actif' : 'Inactif';
  }
}
