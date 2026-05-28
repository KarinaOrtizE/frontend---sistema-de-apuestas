import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { BingoService } from '../../core/services/bingo.service';
import { BingoRead, BingoUpdate } from '../../models/api.models';

export interface BingoDialogData {
  mode: 'create' | 'edit' | 'carton';
  row?: BingoRead;
}

@Component({
  selector: 'app-bingo-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './bingo-dialog.html',
  styleUrl: './bingo-list.scss',
})
export class BingoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly bingoService = inject(BingoService);
  private readonly dialogRef = inject(MatDialogRef<BingoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<BingoDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    aciertos: [0, [Validators.required, Validators.min(0)]],
    costo_entrada: [5000, [Validators.required, Validators.min(0)]],
    recompensa: [250000, [Validators.required, Validators.min(0)]],
  });

  readonly letters = ['B', 'I', 'N', 'G', 'O'];

  // Estado del cartón
  marked: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));
  gameState: 'playing' | 'won' | null = null;

  // Sorteo
  drawnNumbers: Set<number> = new Set();
  lastDrawn: number | null = null;
  allNumbers: number[] = [];
  drawPool: number[] = [];

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        aciertos: r.aciertos,
        costo_entrada: r.costo_entrada,
        recompensa: r.recompensa,
      });
    }
    if (this.data.mode === 'carton') {
      this.marked[2][2] = true;
      this.gameState = 'playing';
      this.initDrawPool();
    }
  }

  // Construye el pool con todos los números del cartón (sin FREE)
  // y rellena hasta 75 con números que no estén en el cartón
  private initDrawPool(): void {
    const carton = this.data.row!.carton_json as number[][];

    // Recoge todos los números del cartón
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (this.isFree(col, row)) continue;
        this.allNumbers.push(carton[row][col]);
      }
    }

    // Pool: números del 1 al 75 mezclados
    const pool = Array.from({ length: 75 }, (_, i) => i + 1);
    this.drawPool = this.shuffle(pool);
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  drawNumber(): void {
    if (this.gameState === 'won' || this.drawPool.length === 0) return;
    const num = this.drawPool.pop()!;
    this.drawnNumbers.add(num);
    this.lastDrawn = num;
  }

  isDrawn(col: number, row: number): boolean {
    if (this.isFree(col, row)) return true;
    return this.drawnNumbers.has(this.getCell(col, row));
  }

  toggleCell(col: number, row: number): void {
    if (this.isFree(col, row)) return;
    if (this.gameState === 'won') return;
    if (!this.isDrawn(col, row)) {
      this.snack.open('Ese número aún no ha salido', '', { duration: 1500 });
      return;
    }
    this.marked[col][row] = !this.marked[col][row];
    this.checkWin();
  }

  getCell(col: number, row: number): number {
    return this.data.row!.carton_json[row][col];
  }

  isFree(col: number, row: number): boolean {
    return col === 2 && row === 2;
  }

  checkWin(): void {
    // Filas
    for (let row = 0; row < 5; row++) {
      if ([0,1,2,3,4].every(col => this.marked[col][row])) {
        this.gameState = 'won'; return;
      }
    }
    // Columnas
    for (let col = 0; col < 5; col++) {
      if ([0,1,2,3,4].every(row => this.marked[col][row])) {
        this.gameState = 'won'; return;
      }
    }
    // Diagonal principal
    if ([0,1,2,3,4].every(i => this.marked[i][i])) {
      this.gameState = 'won'; return;
    }
    // Diagonal inversa
    if ([0,1,2,3,4].every(i => this.marked[i][4 - i])) {
      this.gameState = 'won'; return;
    }
  }

  resetMarks(): void {
    this.marked = Array.from({ length: 5 }, () => Array(5).fill(false));
    this.marked[2][2] = true;
    this.gameState = 'playing';
    this.drawnNumbers = new Set();
    this.lastDrawn = null;
    this.allNumbers = [];
    this.drawPool = [];
    this.initDrawPool();
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
    if (this.data.mode === 'create') {
      this.bingoService.create({
        aciertos: v.aciertos,
        costo_entrada: v.costo_entrada,
        recompensa: v.recompensa,
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) =>
          this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    } else {
      const id = this.data.row!.id_bingo;
      const body: BingoUpdate = {
        aciertos: v.aciertos,
        costo_entrada: v.costo_entrada,
        recompensa: v.recompensa,
      };
      this.bingoService.update(id, body).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) =>
          this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    }
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}