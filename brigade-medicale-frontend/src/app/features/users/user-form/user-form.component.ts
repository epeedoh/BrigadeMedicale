import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { Role } from '../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  loading = false;
  isEditMode = false;
  userId?: string;
  roles: Role[] = [];
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.userId;

    this.initializeForm();
    this.loadRoles();

    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
    }
  }

  initializeForm(): void {
    if (this.isEditMode) {
      this.userForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phoneNumber: [''],
        isActive: [true],
        roleIds: [[], Validators.required]
      });
    } else {
      this.userForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phoneNumber: [''],
        roleIds: [[], Validators.required]
      }, {
        validators: this.passwordMatchValidator
      });
    }
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.roles = response.data;
          console.log('Roles loaded successfully:', this.roles);
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.errorMessage = 'Erreur lors du chargement des rôles. Veuillez rafraîchir la page.';
      }
    });
  }

  loadUser(id: string): void {
    this.loading = true;
    this.userService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const user = response.data;
          this.userForm.patchValue({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            isActive: user.isActive,
            roleIds: user.roles.map(r => r.id)
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.loading = false;
        this.router.navigate(['/users']);
      }
    });
  }

  onRoleChange(roleId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const roleIds = this.userForm.get('roleIds')?.value as number[];

    if (checkbox.checked) {
      if (!roleIds.includes(roleId)) {
        this.userForm.patchValue({ roleIds: [...roleIds, roleId] });
      }
    } else {
      this.userForm.patchValue({ roleIds: roleIds.filter(id => id !== roleId) });
    }
  }

  isRoleSelected(roleId: number): boolean {
    const roleIds = this.userForm.get('roleIds')?.value as number[];
    return roleIds.includes(roleId);
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.userId) {
      const { email, firstName, lastName, phoneNumber, isActive, roleIds } = this.userForm.value;
      this.userService.update(this.userId, { email, firstName, lastName, phoneNumber, isActive, roleIds })
        .subscribe({
          next: () => {
            this.router.navigate(['/users']);
          },
          error: (error) => {
            this.loading = false;
            const errorMessage =
              error.error?.message ||
              error.error?.error?.message ||
              error.message ||
              'Erreur lors de la mise à jour de l\'utilisateur';
            this.errorMessage = errorMessage;
            console.error('Update user error:', error);
          }
        });
    } else {
      const { username, email, password, firstName, lastName, phoneNumber, roleIds } = this.userForm.value;
      const createRequest = { username, email, password, firstName, lastName, phoneNumber, roleIds };
      console.log('Creating user with data:', createRequest);
      this.userService.create(createRequest)
        .subscribe({
          next: () => {
            this.router.navigate(['/users']);
          },
          error: (error) => {
            this.loading = false;
            // Extract error message from different error response formats
            const errorMessage =
              error.error?.message ||
              error.error?.error?.message ||
              error.message ||
              'Erreur lors de la création de l\'utilisateur';
            this.errorMessage = errorMessage;
            console.error('Create user error:', error);
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  get username() {
    return this.userForm.get('username');
  }

  get email() {
    return this.userForm.get('email');
  }

  get password() {
    return this.userForm.get('password');
  }

  get confirmPassword() {
    return this.userForm.get('confirmPassword');
  }

  get firstName() {
    return this.userForm.get('firstName');
  }

  get lastName() {
    return this.userForm.get('lastName');
  }
}
