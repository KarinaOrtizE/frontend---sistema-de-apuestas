import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';

import { SorteoService } from '../../core/services/sorteos.service';
import { SorteoRead } from '../../models/api.models';
import { shortId } from '../../shared/ids';
import { SorteoDialogComponent, SorteoDialogData } from './sorteo-dialog';

@Component({
  selector: 'app-sorteo-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './sorteo-list.html',
  styleUrl: './sorteo-list.scss',
})
export class SorteoListComponent implements AfterViewInit {
  private readonly svc = inject(SorteoService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['id_sorteo', 'fecha_sorteo', 'id_loteria', 'acciones'];
  readonly dataSource = new MatTableDataSource<SorteoRead>([]);
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

  nuevo(): void {
    this.openDialog({ mode: 'create' });
  }

  editar(row: SorteoRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: SorteoDialogData): void {
    this.dialog
      .open(SorteoDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: SorteoRead): void {
    if (!confirm(`¿Eliminar sorteo ${shortId(row.id_sorteo)}?`)) return;
    this.svc.delete(row.id_sorteo).subscribe({
      next: () => {
        this.snack.open('Sorteo eliminado', 'OK', { duration: 3000 });
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
