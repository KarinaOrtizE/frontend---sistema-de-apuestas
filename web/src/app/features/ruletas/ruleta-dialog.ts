import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RuletaService } from '../../core/services/ruleta.service';
import { RuletaRead } from '../../models/api.models';

export interface RuletaDialogData {
  mode: 'create' | 'edit';
  row?: RuletaRead;
}

@Component({
  selector: 'app-ruleta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    TitleCasePipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './ruleta-dialog.html',
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

    :host {
      --gold:       #d4a843;
      --gold-light: #f0cb6e;
      --gold-dim:   #8a6d24;
      --surface:    #111a14;
      --surface-2:  #192218;
      --felt:       #0d3b27;
      --text-main:  #f5ead8;
      --text-muted: #8b9e8e;
      --red:        #c0392b;
    }

    ::ng-deep .mat-mdc-dialog-container {
      background: var(--surface) !important;
    }

    .dialog-wrapper {
      background: var(--surface);
      color: var(--text-main);
      font-family: 'DM Sans', sans-serif;
      border-radius: 16px;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 28px 28px 20px;
      border-bottom: 1px solid rgba(212, 168, 67, 0.2);
      background: linear-gradient(135deg, #0d3b27 0%, #111a14 100%);
    }

    .dialog-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(212, 168, 67, 0.15);
      border: 1px solid rgba(212, 168, 67, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        color: var(--gold);
        font-size: 26px;
        height: 26px;
        width: 26px;
      }
    }

    .dialog-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--gold);
      margin: 0 0 2px;
    }

    .dialog-sub {
      font-size: 13px;
      color: var(--text-muted);
      margin: 0;
    }

    .dialog-body {
      padding: 24px 28px !important;
      max-height: 60vh;
      overflow-y: auto;
    }

    .form-section-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--gold-dim);
      margin: 8px 0 16px;

      &:not(:first-child) { margin-top: 24px; }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 0;
    }

    .grid-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .at-least-one-error {
      font-size: 12px;
      color: #e74c3c;
      padding: 8px 12px;
      background: rgba(231, 76, 60, 0.1);
      border: 1px solid rgba(231, 76, 60, 0.25);
      border-radius: 6px;
      margin-bottom: 8px;
    }

    ::ng-deep {
      .mat-mdc-form-field-flex {
        background: var(--surface-2) !important;
      }

      .mdc-outlined-text-field--outlined .mdc-notched-outline__leading,
      .mdc-outlined-text-field--outlined .mdc-notched-outline__notch,
      .mdc-outlined-text-field--outlined .mdc-notched-outline__trailing {
        border-color: rgba(212, 168, 67, 0.25) !important;
      }

      .mdc-outlined-text-field--focused .mdc-notched-outline__leading,
      .mdc-outlined-text-field--focused .mdc-notched-outline__notch,
      .mdc-outlined-text-field--focused .mdc-notched-outline__trailing {
        border-color: var(--gold) !important;
        border-width: 2px !important;
      }

      .mat-mdc-form-field-label, .mdc-floating-label {
        color: var(--text-muted) !important;
      }

      .mat-mdc-input-element, .mat-mdc-select-value-text {
        color: var(--text-main) !important;
      }

      .mat-mdc-select-arrow { color: var(--gold-dim) !important; }

      .mat-mdc-option:hover {
        background: rgba(212, 168, 67, 0.08) !important;
      }

      .mat-mdc-option.mat-mdc-option-active {
        color: var(--gold) !important;
      }
    }

    .prefix-icon {
      color: var(--gold-dim);
      font-weight: 600;
    }

    .option-color {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;

      &[data-col='rojo']  { background: #c0392b; }
      &[data-col='negro'] { background: #1a1a1a; border: 1px solid #555; }
      &[data-col='verde'] { background: #1a6b35; }
    }

    .multiplier-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(212, 168, 67, 0.1);
      border: 1px solid rgba(212, 168, 67, 0.25);
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 14px;
      color: var(--text-muted);
      margin-top: 8px;

      mat-icon { color: var(--gold); font-size: 18px; height: 18px; width: 18px; }
      strong    { color: var(--gold); font-weight: 600; }
    }

    .dialog-footer {
      padding: 16px 28px !important;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      gap: 12px;
    }

    .btn-cancel {
      border-color: rgba(255,255,255,0.15) !important;
      color: var(--text-muted) !important;
      border-radius: 8px !important;

      &:hover {
        border-color: rgba(255,255,255,0.3) !important;
        color: var(--text-main) !important;
      }
    }

    .btn-save {
      background: var(--gold) !important;
      color: #0d0d0d !important;
      font-weight: 600 !important;
      border-radius: 8px !important;
      gap: 6px;
      min-width: 150px;

      mat-icon { font-size: 18px; height: 18px; width: 18px; }

      &:hover { background: var(--gold-light) !important; }
      &:disabled { opacity: 0.5 !important; }
    }
  `],
})
export class RuletaDialogComponent implements OnInit {
  private readonly fb        = inject(FormBuilder);
  private readonly svc       = inject(RuletaService);
  private readonly dialogRef = inject(MatDialogRef<RuletaDialogComponent, boolean>);
  private readonly snack     = inject(MatSnackBar);

  readonly data = inject<RuletaDialogData>(MAT_DIALOG_DATA);

  // BUG FIX #1: rango values must match backend: 'alto' | 'bajo'
  readonly colores   = signal(['rojo', 'negro', 'verde']);
  readonly paridades = signal(['par', 'impar']);
  readonly rangos    = signal([
    { label: '1–18 (Bajo)', value: 'bajo' },
    { label: '19–36 (Alto)', value: 'alto' },
  ]);

  saving = false;
  showAtLeastOneError = false;

  readonly form = this.fb.nonNullable.group({
    numero:        [null as number | null],
    color:         [''],
    paridad:       [''],
    rango:         [''],
    costo_entrada: [0, [Validators.required, Validators.min(0.01)]],
    recompensa:    [0, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        numero:        r.eleccion_usuario?.['numero']  ?? null,
        color:         r.eleccion_usuario?.['color']   ?? '',
        paridad:       r.eleccion_usuario?.['paridad'] ?? '',
        rango:         r.eleccion_usuario?.['rango']   ?? '',
        costo_entrada: r.costo_entrada,
        recompensa:    r.recompensa,
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  // BUG FIX #2: validate that at least one eleccion field is set before sending
  private buildEleccion() {
    const v = this.form.getRawValue();
    return {
      numero: (v.numero !== null && v.numero !== undefined)
        ? Number(v.numero)
        : null,
      color:   v.color   || null,
      paridad: v.paridad || null,
      rango:   v.rango   || null,
    };
  }

  get hasAtLeastOneEleccion(): boolean {
  const e = this.buildEleccion();
  console.log('eleccion:', e);
  return Object.values(e).some(val => val !== null && val !== undefined);
  }

  save(): void {
    this.showAtLeastOneError = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // BUG FIX #2: guard against sending all-null eleccion
    if (!this.hasAtLeastOneEleccion) {
      this.showAtLeastOneError = true;
      return;
    }

    this.saving = true;
    const v = this.form.getRawValue();

    const payload = {
      eleccion_usuario: this.buildEleccion(),
      costo_entrada: Number(v.costo_entrada),
      recompensa:    Number(v.recompensa),
    };

    const request$ = this.data.mode === 'create'
      ? this.svc.create(payload)
      : this.svc.update(this.data.row!.id_ruleta, payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
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
