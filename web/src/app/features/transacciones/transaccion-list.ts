import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, effect, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { AuditContextService } from '../../core/audit-context.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { TransaccionRead } from '../../models/api.models';

@Component({
  selector: 'app-transaccion-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './transaccion-list.html',
  styleUrl: './transaccion-list.scss',
})
export class TransaccionListComponent implements AfterViewInit {
  private readonly service = inject(TransaccionService);
  private readonly audit = inject(AuditContextService);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['tipo', 'monto', 'id_billetera', 'id_metodo_pago'];
  readonly dataSource = new MatTableDataSource<TransaccionRead>([]);

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

  reload(usuarioId?: string): void {
    this.loading = true;
    this.service.list(usuarioId).subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.paginator?.firstPage();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}
