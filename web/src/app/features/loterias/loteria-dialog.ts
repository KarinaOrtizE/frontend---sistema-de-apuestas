import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { LoteriaService } from '../../core/services/loteria.service';
import { LoteriaRead } from '../../models/api.models';

export interface LoteriaDialogData {
  mode: 'create' | 'edit';
  row?: LoteriaRead;
}

@Component({
  selector: 'app-loteria-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './loteria-dialog.html',
})
export class LoteriaDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(LoteriaService);
  private readonly dialogRef = inject(MatDialogRef<LoteriaDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<LoteriaDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    numero_jugado: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    costo_entrada: [1000, [Validators.required, Validators.min(0.01)]],
    recompensa:    [100000, [Validators.required, Validators.min(0.01)]],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        numero_jugado: r.numero_jugado,
        costo_entrada: r.costo_entrada,
        recompensa:    r.recompensa,
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
    const v = {
      ...this.form.getRawValue(),
      costo_entrada: Number(this.form.value.costo_entrada),
      recompensa: Number(this.form.value.recompensa),
    };

    if (this.data.mode === 'create') {
      this.svc.create(v).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }

    this.svc.update(this.data.row!.id_loteria, v).subscribe({
      next: () => this.dialogRef.close(true),
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
