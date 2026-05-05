import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

import { TransaccionService } from '../../core/services/transaccion.service';
import { TransaccionRead, TransaccionUpdate } from '../../models/api.models';

export interface TransaccionDialogData {
  mode: 'create' | 'edit';
  row?: TransaccionRead;
}

@Component({
  selector: 'app-transaccion-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './transaccion-dialog.html',
})
export class TransaccionDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TransaccionService);
  private readonly dialogRef = inject(MatDialogRef<TransaccionDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<TransaccionDialogData>(MAT_DIALOG_DATA);

  readonly tipos = ['DEPOSITO', 'RETIRO', 'APUESTA', 'PREMIO'];

  readonly form = this.fb.nonNullable.group({
    tipo: ['', Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    id_billetera: ['', Validators.required],
    id_metodo_pago: ['', Validators.required],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        tipo: r.tipo,
        monto: r.monto,
        id_billetera: r.id_billetera,
        id_metodo_pago: r.id_metodo_pago,
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
      this.service.create({
        tipo: v.tipo as any,
        monto: v.monto,
        id_billetera: v.id_billetera,
        id_metodo_pago: v.id_metodo_pago,
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) =>
          this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    } else {
      const id = this.data.row!.id_transaccion;

      const body: TransaccionUpdate = {};

      if (v.tipo !== this.data.row?.tipo) body.tipo = v.tipo as any;
      if (v.monto !== this.data.row?.monto) body.monto = v.monto;
      if (v.id_billetera !== this.data.row?.id_billetera) body.id_billetera = v.id_billetera;
      if (v.id_metodo_pago !== this.data.row?.id_metodo_pago) body.id_metodo_pago = v.id_metodo_pago;

      this.service.update(id, body).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) =>
          this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    }
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}