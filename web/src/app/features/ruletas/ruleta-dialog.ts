import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { RuletaService } from '../../core/services/ruleta.service';
import { RuletaRead } from '../../models/api.models';

export interface RuletaDialogData {
  mode: 'create' | 'edit';
  row?: RuletaRead;
}

@Component({
  selector: 'app-ruleta-dialog',
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
  templateUrl: './ruleta-dialog.html',
})
export class RuletaDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(RuletaService);
  private readonly dialogRef = inject(MatDialogRef<RuletaDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<RuletaDialogData>(MAT_DIALOG_DATA);

  readonly colores = signal(['rojo', 'negro']);
  readonly paridades = signal(['par', 'impar']);
  readonly rangos = signal(['1-18', '19-36']);

  readonly form = this.fb.nonNullable.group({
    numero: [null as number | null],
    color: [''],
    paridad: [''],
    rango: [''],
    costo_entrada: [0, [Validators.required, Validators.min(0)]],
    recompensa: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;

      this.form.patchValue({
        numero: r.eleccion_usuario?.['numero'] ?? null,
        color: r.eleccion_usuario?.['color'] ?? '',
        paridad: r.eleccion_usuario?.['paridad'] ?? '',
        rango: r.eleccion_usuario?.['rango'] ?? '',
        costo_entrada: r.costo_entrada,
        recompensa: r.recompensa,
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

    const payload = {
      eleccion_usuario: {
        numero: v.numero || null,
        color: v.color || null,
        paridad: v.paridad || null,
        rango: v.rango || null,
      },
      costo_entrada: Number(v.costo_entrada),
      recompensa: Number(v.recompensa),
    };

    if (this.data.mode === 'create') {
      this.svc.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) =>
          this.snack.open(this.msg(err), 'Cerrar', {
            duration: 6000,
          }),
      });

      return;
    }

    this.svc.update(this.data.row!.id_ruleta, payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', {
          duration: 6000,
        }),
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;

    if (typeof d === 'string') return d;

    if (Array.isArray(d)) {
      return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    }

    return err.message;
  }
}