import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuditContextService } from '../../core/audit-context.service';
import { MetodoPagoService } from '../../core/services/metodo-pago.service';
import { MetodoPagoRead } from '../../models/api.models';

export interface MetodoPagoDialogData {
  mode: 'create' | 'edit';
  row?: MetodoPagoRead;
}

@Component({
  selector: 'app-metodo-pago-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './metodo-pago-dialog.html',
})
export class MetodoPagoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(MetodoPagoService);
  private readonly audit = inject(AuditContextService);
  private readonly dialogRef = inject(MatDialogRef<MetodoPagoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<MetodoPagoDialogData>(MAT_DIALOG_DATA);
  readonly tiposMetodo = [
    { value: 'pse', label: 'PSE' },
    { value: 'tarjeta de credito', label: 'Tarjeta de credito' },
    { value: 'tarjeta de debito', label: 'Tarjeta de debito' },
  ];

  readonly form = this.fb.nonNullable.group({
    tipo_metodo: ['', Validators.required],
    nombre_titular: ['', Validators.required],
  });

    constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        tipo_metodo: r.tipo_metodo,
        nombre_titular: r.nombre_titular,
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
    const uid = this.audit.usuarioId();
    if (!uid) {
      this.snack.open('Seleccione usuario de auditoría en la barra superior.', 'OK');
      return;
    }
    const v = this.form.getRawValue();

    if (this.data.mode === 'create') {
      this.svc
        .create({
          tipo_metodo: v.tipo_metodo,
          nombre_titular: v.nombre_titular,
          id_usuario_dueno: uid,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      return;
    }
    this.svc
      .update(this.data.row!.id_metodo_pago, {
        tipo_metodo: v.tipo_metodo || null,
        nombre_titular: v.nombre_titular || null,
        id_usuario_edita: uid,
      })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}
