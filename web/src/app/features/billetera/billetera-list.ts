import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';

import { BilleteraService } from '../../core/services/billetera.service';
import { BilleteraRead } from '../../models/api.models';
import { shortId } from '../../shared/ids';
import { BilleteraDialogComponent, BilleteraDialogData } from './billetera-dialog';

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
    this.reload();
  }

  shortId = shortId;

  reload(): void {
    this.loading = true;
    this.svc.list().subscribe({
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

  nueva(): void {
    this.openDialog({ mode: 'create' });
  }

  recargar(row: BilleteraRead): void {
    this.openDialog({ mode: 'recargar', row });
  }

  private openDialog(data: BilleteraDialogData): void {
    this.dialog
      .open(BilleteraDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: BilleteraRead): void {
    if (!confirm(`¿Eliminar billetera ${shortId(row.id_billetera)}? Solo es posible si el saldo es $0.`)) return;
    this.svc.delete(row.id_billetera).subscribe({
      next: () => {
        this.snack.open('Billetera eliminada', 'OK', { duration: 3000 });
        this.reload();
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
