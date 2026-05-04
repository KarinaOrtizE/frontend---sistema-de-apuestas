import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuditContextService } from '../../core/audit-context.service';
import { BilleteraService } from '../../core/services/billetera.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { BilleteraRead, UsuarioRead } from '../../models/api.models';

export interface BilleteraDialogData {
  mode: 'create' | 'recargar';
  row?: BilleteraRead;
}

@Component({
  selector: 'app-billetera-dialog',
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
  templateUrl: './billetera-dialog.html',
})
export class BilleteraDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(BilleteraService);
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly audit = inject(AuditContextService);
  private readonly dialogRef = inject(MatDialogRef<BilleteraDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<BilleteraDialogData>(MAT_DIALOG_DATA);
  readonly usuarios = signal<UsuarioRead[]>([]);

  readonly form = this.fb.nonNullable.group({
    id_usuario: [''],
    monto: [0],
  });

  ngOnInit(): void {
    if (this.data.mode === 'create') {
      this.form.controls.id_usuario.setValidators([Validators.required]);
      this.form.controls.id_usuario.updateValueAndValidity();
      this.usuarioSvc.list().subscribe({
        next: (rows) => this.usuarios.set(rows),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    } else {
      this.form.controls.monto.setValidators([Validators.required, Validators.min(0.01)]);
      this.form.controls.monto.updateValueAndValidity();
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
          id_usuario: v.id_usuario,
          saldo: 0,
          id_usuario_creacion: uid,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      return;
    }

    this.svc
      .recargar(this.data.row!.id_billetera, {
        monto: v.monto,
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
    if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}
