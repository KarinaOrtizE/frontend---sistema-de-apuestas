import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuditContextService } from '../../core/audit-context.service';
import { BilleteraService } from '../../core/services/billetera.service';
import { MetodoPagoService } from '../../core/services/metodo-pago.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { BilleteraRead, MetodoPagoRead, TipoTransaccion, UsuarioRead } from '../../models/api.models';
import { shortId } from '../../shared/ids';

export interface TransaccionDialogData {
  mode: 'create';
  defaults?: Partial<{
    tipo: TipoTransaccion;
    id_billetera: string;
  }>;
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
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './transaccion-dialog.html',
})
export class TransaccionDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TransaccionService);
  private readonly billeteraService = inject(BilleteraService);
  private readonly metodoPagoService = inject(MetodoPagoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly audit = inject(AuditContextService);
  private readonly dialogRef = inject(MatDialogRef<TransaccionDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);
  private readonly data = inject<TransaccionDialogData>(MAT_DIALOG_DATA, { optional: true });

  readonly tipos = Object.values(TipoTransaccion);
  readonly billeteras = signal<BilleteraRead[]>([]);
  readonly metodosPago = signal<MetodoPagoRead[]>([]);
  readonly usuarios = signal<UsuarioRead[]>([]);
  readonly shortId = shortId;

  readonly form = this.fb.nonNullable.group({
    tipo: [this.data?.defaults?.tipo ?? TipoTransaccion.DEPOSITO, Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    id_billetera: [this.data?.defaults?.id_billetera ?? '', Validators.required],
    id_metodo_pago: ['', Validators.required],
  });

  ngOnInit(): void {
    const usuarioId = this.audit.usuarioId() ?? undefined;

    this.usuarioService.list().subscribe({
      next: (rows) => this.usuarios.set(rows),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    this.billeteraService.list(usuarioId).subscribe({
      next: (rows) => {
        this.billeteras.set(rows);
        if (rows.length === 1 && !this.data?.defaults?.id_billetera) {
          this.form.controls.id_billetera.setValue(rows[0].id_billetera);
        }
      },
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    this.metodoPagoService.list(usuarioId).subscribe({
      next: (rows) => this.metodosPago.set(rows),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
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

    this.service
      .create({
        tipo: v.tipo,
        monto: v.monto,
        id_billetera: v.id_billetera,
        id_metodo_pago: v.id_metodo_pago,
      })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) =>
          this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }

  metodoPagoLabel(metodo: MetodoPagoRead): string {
    return `${this.formatoMedioPago(metodo.tipo_metodo)} - ${metodo.nombre_titular}`;
  }

  billeteraUsuarioLabel(billetera: BilleteraRead): string {
    const usuario = this.usuarios().find((u) => u.id_usuario === billetera.id_usuario);
    const nombre = usuario?.nombre_usuario || usuario?.nombre_completo || this.shortId(billetera.id_usuario);

    return `${nombre} - ${this.shortId(billetera.id_billetera)}`;
  }

  private formatoMedioPago(tipo: string): string {
    const value = tipo.trim().toLowerCase();
    const labels: Record<string, string> = {
      pse: 'PSE',
      credito: 'Tarjeta de credito',
      'tarjeta credito': 'Tarjeta de credito',
      'tarjeta de credito': 'Tarjeta de credito',
      debito: 'Tarjeta de debito',
      'tarjeta debito': 'Tarjeta de debito',
      'tarjeta de debito': 'Tarjeta de debito',
    };

    return labels[value] ?? tipo;
  }
}
