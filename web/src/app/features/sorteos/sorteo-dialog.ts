import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { LoteriaService } from '../../core/services/loteria.service';
import { SorteoService } from '../../core/services/sorteos.service';
import { LoteriaRead, SorteoRead } from '../../models/api.models';

export interface SorteoDialogData {
  mode: 'create' | 'edit';
  row?: SorteoRead;
}

@Component({
  selector: 'app-sorteo-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './sorteo-dialog.html',
})
export class SorteoDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(SorteoService);
  private readonly loteriaSvc = inject(LoteriaService);
  private readonly dialogRef = inject(MatDialogRef<SorteoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<SorteoDialogData>(MAT_DIALOG_DATA);
  readonly loterias = signal<LoteriaRead[]>([]);

  readonly form = this.fb.nonNullable.group({
    fecha_sorteo: ['', Validators.required],
    id_loteria:   ['' as string | null],
  });

  ngOnInit(): void {
    this.loteriaSvc.list().subscribe({
      next: (rows) => this.loterias.set(rows),
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        fecha_sorteo: r.fecha_sorteo
          ? new Date(r.fecha_sorteo).toISOString().slice(0, 16)
          : '',
        id_loteria: r.id_loteria ?? null,
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
    const payload = {
      fecha_sorteo: new Date(v.fecha_sorteo),
      id_loteria:   v.id_loteria || null,
    };

    if (this.data.mode === 'create') {
      this.svc.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }

    this.svc.update(this.data.row!.id_sorteo, payload).subscribe({
      next: () => this.dialogRef.close(true),
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
