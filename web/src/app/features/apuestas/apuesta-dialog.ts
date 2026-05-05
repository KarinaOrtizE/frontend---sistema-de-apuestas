import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ApuestaService } from '../../core/services/apuesta.service';
import { ApuestaRead, EstadoApuesta } from '../../models/api.models';

export interface ApuestaDialogData {
  mode: 'create' | 'edit';
  row?: ApuestaRead;
}

@Component({
  selector: 'app-apuesta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './apuesta-dialog.html',
})
export class ApuestaDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(ApuestaService);
  private readonly dialogRef = inject(MatDialogRef<ApuestaDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<ApuestaDialogData>(MAT_DIALOG_DATA);

  // Exponemos el enum de estados para el template
  readonly estados = signal(Object.values(EstadoApuesta));

  readonly form = this.fb.nonNullable.group({
    id_usuario: ['', [Validators.required]],
    id_sorteo: ['', [Validators.required]],
    monto_apostado: [0, [Validators.required, Validators.min(0.01)]],
    estado: [EstadoApuesta.PENDIENTE as EstadoApuesta, [Validators.required]],
    // Campos de auditoría requeridos por la API
    id_usuario_creador_o_editor: ['', [Validators.required]], 
  });

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        id_usuario: r.id_usuario,
        id_sorteo: r.id_sorteo,
        monto_apostado: r.monto_apostado,
        estado: r.estado,
        id_usuario_creador_o_editor: r.id_usuario_edita ?? '',
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    if (this.data.mode === 'create') {
      const payloadCreate = {
        id_usuario: v.id_usuario,
        id_sorteo: v.id_sorteo,
        monto_apostado: Number(v.monto_apostado),
        estado: v.estado,
        id_usuario_creacion: v.id_usuario_creador_o_editor,
      };

      this.svc.create(payloadCreate).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.showError(err),
      });

      return;
    }

    const payloadUpdate = {
      id_usuario: v.id_usuario,
      id_sorteo: v.id_sorteo,
      monto_apostado: Number(v.monto_apostado),
      estado: v.estado,
      id_usuario_edita: v.id_usuario_creador_o_editor,
    };

    this.svc.update(this.data.row!.id_apuesta, payloadUpdate).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: HttpErrorResponse) => this.showError(err),
    });
  }

  private showError(err: HttpErrorResponse): void {
    const d = err.error?.detail;
    let msg = err.message;
    
    if (typeof d === 'string') msg = d;
    else if (Array.isArray(d)) {
      msg = d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    }

    this.snack.open(msg, 'Cerrar', { duration: 6000 });
  }
}