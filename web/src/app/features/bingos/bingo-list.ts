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
import { CommonModule } from '@angular/common';


import { BingoService } from '../../core/services/bingo.service';
import { BingoRead } from '../../models/api.models';
import { BingoDialogComponent, BingoDialogData } from './bingo-dialog';

@Component({
  selector: 'app-bingo-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule,
  ],
  templateUrl: './bingo-list.html',
  styleUrl: './bingo-list.scss',
})
export class BingoListComponent implements AfterViewInit {
  private readonly bingoService = inject(BingoService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = [
    'carton',
    'aciertos',
    'costo_entrada',
    'recompensa',
    'acciones',
  ];

  verCarton(row: BingoRead): void {
  this.dialog.open(BingoDialogComponent, {
    width: '500px',
    data: { mode: 'carton', row }
  });
}

  readonly dataSource = new MatTableDataSource<BingoRead>([]);

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
    this.bingoService.list().subscribe({
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

  editar(row: BingoRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: BingoDialogData): void {
    this.dialog
      .open(BingoDialogComponent, { width: '500px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: BingoRead): void {
    if (!confirm(`¿Eliminar bingo con recompensa ${row.recompensa}?`)) return;

    this.bingoService.delete(row.id_bingo).subscribe({
      next: () => {
        this.snack.open('Bingo eliminado', 'OK', { duration: 3000 });
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