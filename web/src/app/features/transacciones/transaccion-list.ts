import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';

import { TransaccionService } from '../../core/services/transaccion.service';
import { TransaccionRead } from '../../models/api.models';
import { TransaccionDialogComponent, TransaccionDialogData } from './transaccion-dialog';

@Component({
  selector: 'app-transaccion-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './transaccion-list.html',
  styleUrl: './transaccion-list.scss',
})
export class TransaccionListComponent implements AfterViewInit {
  private readonly service = inject(TransaccionService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = [
    'tipo',
    'monto',
    'id_billetera',
    'id_metodo_pago',
    'acciones',
  ];

  readonly dataSource = new MatTableDataSource<TransaccionRead>([]);

  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.service.list().subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.paginator.firstPage();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  nuevo(): void {
    this.openDialog({ mode: 'create' });
  }

  editar(row: TransaccionRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: TransaccionDialogData): void {
    this.dialog
      .open(TransaccionDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: TransaccionRead): void {
    if (!confirm(`¿Eliminar transacción ${row.id_transaccion.slice(0, 8)}...?`)) return;

    this.service.delete(row.id_transaccion).subscribe({
      next: () => {
        this.snack.open('Transacción eliminada', 'OK', { duration: 3000 });
        this.reload();
      },
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
}