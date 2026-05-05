import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuditContextService } from '../../core/audit-context.service';
import { UsuarioService } from '../../core/services/usuario.service'; 
import { UsuarioRead } from '../../models/api.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly audit = inject(AuditContextService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly usuarios = signal<UsuarioRead[]>([]);

  readonly loginForm = this.fb.nonNullable.group({
    nombre_usuario: ['', Validators.required],
    clave: ['', Validators.required],
  });

  readonly firstUserForm = this.fb.nonNullable.group({
    nombre_completo: ['', Validators.required],
    nombre_usuario: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(4)]],
    rol: ['admin', Validators.required],
    telefono: [''],
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.usuarioService.list().subscribe({
      next: (rows) => {
        this.usuarios.set(rows);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  ingresar(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { nombre_usuario } = this.loginForm.getRawValue();
    const key = nombre_usuario.trim().toLowerCase();
    const u = this.usuarios().find(
      (x) => x.nombre_usuario.trim().toLowerCase() === key,
    );
    if (!u) {
      this.snack.open('Usuario no encontrado.', 'Cerrar', { duration: 5000 });
      return;
    }
    this.audit.select(u.id_usuario);
    void this.router.navigateByUrl('/app');
  }

  crearPrimero(): void {
    if (this.firstUserForm.invalid) {
      this.firstUserForm.markAllAsTouched();
      return;
    }
    const v = this.firstUserForm.getRawValue();
    this.usuarioService
      .create({
        nombre_completo: v.nombre_completo,
        nombre_usuario: v.nombre_usuario,
        email: v.email,
        clave: v.clave,
        rol: v.rol,
        telefono: v.telefono || undefined,
        activo: true,
      })
      .subscribe({
        next: (created) => {
          this.usuarios.set([...this.usuarios(), created]);
          this.audit.select(created.id_usuario);
          void this.router.navigateByUrl('/app');
        },
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}