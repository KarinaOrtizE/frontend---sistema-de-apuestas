import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { filter } from 'rxjs/operators';

import { RuletaService } from '../../core/services/ruleta.service';

import { RuletaRead } from '../../models/api.models';

import {
  RuletaDialogComponent,
  RuletaDialogData,
} from './ruleta-dialog';

@Component({
  selector: 'app-ruleta-list',
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
  templateUrl: './ruleta-list.html',
  styleUrl: './ruleta-list.scss',
})
export class RuletaListComponent implements AfterViewInit {
  private readonly ruletaService = inject(RuletaService);

  private readonly dialog = inject(MatDialog);

  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = [
    'numero',
    'color',
    'paridad',
    'rango',
    'costo_entrada',
    'recompensa',
    'acciones',
  ];

  readonly dataSource = new MatTableDataSource<RuletaRead>([]);

  loading = true;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading = true;

    this.ruletaService.list().subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.loading = false;
      },

      error: (err: HttpErrorResponse) => {
        this.loading = false;

        this.snack.open(this.msg(err), 'Cerrar', {
          duration: 6000,
        });
      },
    });
  }

  nuevo(): void {
    this.openDialog({
      mode: 'create',
    });
  }

  editar(row: RuletaRead): void {
    this.openDialog({
      mode: 'edit',
      row,
    });
  }

  private openDialog(data: RuletaDialogData): void {
    this.dialog
      .open(RuletaDialogComponent, {
        width: '520px',
        data,
      })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: RuletaRead): void {
    if (!confirm(`¿Eliminar ruleta ${row.id_ruleta}?`)) {
      return;
    }

    this.ruletaService.delete(row.id_ruleta).subscribe({
      next: () => {
        this.snack.open('Ruleta eliminada', 'OK', {
          duration: 3000,
        });

        this.reload();
      },

      error: (err: HttpErrorResponse) => {
        this.snack.open(this.msg(err), 'Cerrar', {
          duration: 6000,
        });
      },
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;

    if (typeof d === 'string') {
      return d;
    }

    if (Array.isArray(d)) {
      return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    }

    return err.message;
  }
}