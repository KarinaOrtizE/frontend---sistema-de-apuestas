import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, effect, inject, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';

import { AuditContextService } from '../../core/audit-context.service';
import { BilleteraService } from '../../core/services/billetera.service';
import { BilleteraRead, TipoTransaccion } from '../../models/api.models';
import { shortId } from '../../shared/ids';
import { TransaccionDialogComponent } from '../transacciones/transaccion-dialog';

@Component({
  selector: 'app-billetera-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './billetera-list.html',
  styleUrl: './billetera-list.scss',
})
export class BilleteraListComponent implements AfterViewInit {
  private readonly svc = inject(BilleteraService);
  private readonly audit = inject(AuditContextService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['id_billetera', 'id_usuario', 'saldo', 'fecha_creacion', 'acciones'];
  readonly dataSource = new MatTableDataSource<BilleteraRead>([]);
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  constructor() {
    effect(() => {
      this.reload(this.audit.usuarioId() ?? undefined);
    });
  }

  shortId = shortId;

  reload(usuarioId?: string): void {
    this.loading = true;
    this.svc.list(usuarioId).subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  saldoDisponibleTotal(): number {
    return this.dataSource.data.reduce((total, billetera) => total + Number(billetera.saldo ?? 0), 0);
  }

  agregarSaldo(): void {
    this.dialog
      .open(TransaccionDialogComponent, {
        width: '520px',
        data: {
          mode: 'create',
          defaults: {
            tipo: TipoTransaccion.DEPOSITO,
          },
        },
      })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload(this.audit.usuarioId() ?? undefined));
  }

  eliminar(row: BilleteraRead): void {
    if (!confirm(`¿Eliminar billetera ${shortId(row.id_billetera)}? Solo es posible si el saldo es $0.`)) return;
    this.svc.delete(row.id_billetera).subscribe({
      next: () => {
        this.snack.open('Billetera eliminada', 'OK', { duration: 3000 });
        this.reload(this.audit.usuarioId() ?? undefined);
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
