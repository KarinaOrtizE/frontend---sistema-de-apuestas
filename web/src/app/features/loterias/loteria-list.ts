import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';

import { LoteriaService } from '../../core/services/loteria.service';
import { LoteriaRead } from '../../models/api.models';
import { shortId } from '../../shared/ids';
import { LoteriaDialogComponent, LoteriaDialogData } from './loteria-dialog';

interface GameResult {
  userNumber: string;
  winningNumber: string;
  won: boolean;
  recompensa: number;
}

@Component({
  selector: 'app-loteria-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './loteria-list.html',
  styleUrls: ['./loteria-list.scss'],
})
export class LoteriaListComponent implements AfterViewInit {
  private readonly svc = inject(LoteriaService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  // ── tabla ──────────────────────────────────────────────
  readonly displayedColumns = ['numero_jugado', 'costo_entrada', 'recompensa', 'acciones'];
  readonly dataSource = new MatTableDataSource<LoteriaRead>([]);
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  constructor() {
    this.reload();
  }

  shortId = shortId;

  // ── juego ──────────────────────────────────────────────
  readonly gameForm = this.fb.nonNullable.group({
    d1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
  });

  readonly gameResult = signal<GameResult | null>(null);
  readonly playing = signal(false);

  onDigitInput(event: Event, next: HTMLInputElement | null): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 1 && next) next.focus();
  }

  jugar(): void {
    if (this.gameForm.invalid) {
      this.gameForm.markAllAsTouched();
      return;
    }
    const v = this.gameForm.getRawValue();
    const userNumber = `${v.d1}${v.d2}${v.d3}${v.d4}`;
    const winningNumber = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 10)
    ).join('');
    const recompensa = 100000;

    this.playing.set(true);
    this.svc.create({ numero_jugado: winningNumber, costo_entrada: 1000, recompensa }).subscribe({
      next: () => {
        this.gameResult.set({ userNumber, winningNumber, won: userNumber === winningNumber, recompensa });
        this.playing.set(false);
        this.gameForm.reset();
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.playing.set(false);
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  // ── CRUD ───────────────────────────────────────────────
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

  editar(row: LoteriaRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: LoteriaDialogData): void {
    this.dialog
      .open(LoteriaDialogComponent, { width: '480px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: LoteriaRead): void {
    if (!confirm(`¿Eliminar lotería "${row.numero_jugado}"?`)) return;
    this.svc.delete(row.id_loteria).subscribe({
      next: () => {
        this.snack.open('Lotería eliminada', 'OK', { duration: 3000 });
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
