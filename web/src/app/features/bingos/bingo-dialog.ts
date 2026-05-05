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
  mode: 'create' | 'edit';
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

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        aciertos: r.aciertos,
        costo_entrada: r.costo_entrada,
        recompensa: r.recompensa,
      });
    }
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