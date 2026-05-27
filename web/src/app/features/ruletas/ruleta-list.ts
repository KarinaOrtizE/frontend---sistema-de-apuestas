import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { filter } from 'rxjs/operators';

import { RuletaService } from '../../core/services/ruleta.service';
import { RuletaRead } from '../../models/api.models';
import { RuletaDialogComponent, RuletaDialogData } from './ruleta-dialog';

// ── Constantes de la ruleta europea ──────────────────────
const WHEEL_SEQUENCE = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
  10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const NUMBER_COLOR: Record<number, 'rojo' | 'negro' | 'verde'> = {
  0: 'verde',
  1: 'rojo', 2: 'negro', 3: 'rojo', 4: 'negro', 5: 'rojo', 6: 'negro',
  7: 'rojo', 8: 'negro', 9: 'rojo', 10: 'negro', 11: 'negro', 12: 'rojo',
  13: 'negro', 14: 'rojo', 15: 'negro', 16: 'rojo', 17: 'negro', 18: 'rojo',
  19: 'rojo', 20: 'negro', 21: 'rojo', 22: 'negro', 23: 'rojo', 24: 'negro',
  25: 'rojo', 26: 'negro', 27: 'rojo', 28: 'negro', 29: 'negro', 30: 'rojo',
  31: 'negro', 32: 'rojo', 33: 'negro', 34: 'rojo', 35: 'negro', 36: 'rojo',
};

interface WheelResult {
  numero: number;
  color: 'rojo' | 'negro' | 'verde';
  paridad: 'par' | 'impar' | 'cero';
  rango: 'alto' | 'bajo' | null;
}

export interface GameOutcome {
  gano: boolean;
  recompensa: number;
  costo: number;
  ruleta: RuletaRead;
}

@Component({
  selector: 'app-ruleta-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    TitleCasePipe,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
  ],
  templateUrl: './ruleta-list.html',
  styleUrl: './ruleta-list.scss',
})
export class RuletaListComponent implements AfterViewInit, OnDestroy {
  private readonly ruletaService = inject(RuletaService);
  private readonly dialog        = inject(MatDialog);
  private readonly snack         = inject(MatSnackBar);

  readonly dataSource = new MatTableDataSource<RuletaRead>([]);
  loading = true;

  // ── Estado del juego ───────────────────────────────────
  selectedRuleta: RuletaRead | null = null;
  isSpinning  = false;
  lastResult: WheelResult | null = null;
  gameOutcome: GameOutcome | null = null;

  private currentAngle   = 0;
  private animationFrame = 0;

  @ViewChild('wheelCanvas')
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private _paginator!: MatPaginator;

  @ViewChild(MatPaginator)
  set paginator(p: MatPaginator) {
    if (p) {
      this._paginator = p;
      this.dataSource.paginator = p;
    }
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.drawWheel(this.currentAngle));
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrame);
  }

  constructor() {
    this.reload();
  }

  // ── Data ───────────────────────────────────────────────
  reload(): void {
    this.loading = true;
    this.ruletaService.list().subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.loading = false;
        // Si la ruleta seleccionada fue eliminada, deseleccionar
        if (this.selectedRuleta) {
          const stillExists = rows.find(r => r.id_ruleta === this.selectedRuleta!.id_ruleta);
          if (!stillExists) this.selectedRuleta = null;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  // ── Selección de ruleta para jugar ─────────────────────
  selectRuleta(row: RuletaRead): void {
    if (this.isSpinning) return;
    // Toggle: si ya está seleccionada, deseleccionar
    this.selectedRuleta = this.selectedRuleta?.id_ruleta === row.id_ruleta ? null : row;
    this.gameOutcome = null;
  }

  isSelected(row: RuletaRead): boolean {
    return this.selectedRuleta?.id_ruleta === row.id_ruleta;
  }

  // ── CRUD ───────────────────────────────────────────────
  nuevo(): void {
    this.openDialog({ mode: 'create' });
  }

  editar(row: RuletaRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  eliminar(row: RuletaRead): void {
    if (!confirm(`¿Eliminar ruleta ${row.id_ruleta}?`)) return;
    this.ruletaService.delete(row.id_ruleta).subscribe({
      next: () => {
        this.snack.open('Ruleta eliminada', 'OK', { duration: 3000 });
        if (this.selectedRuleta?.id_ruleta === row.id_ruleta) {
          this.selectedRuleta = null;
          this.gameOutcome = null;
        }
        this.reload();
      },
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  private openDialog(data: RuletaDialogData): void {
    this.dialog
      .open(RuletaDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  // ── Ruleta: girar ──────────────────────────────────────
  spinWheel(): void {
    if (this.isSpinning || !this.selectedRuleta) return;

    this.isSpinning  = true;
    this.lastResult  = null;
    this.gameOutcome = null;

    const slotCount   = WHEEL_SEQUENCE.length;
    const slotAngle   = (2 * Math.PI) / slotCount;
    const extraSpins  = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI;
    const targetSlot  = Math.floor(Math.random() * slotCount);
    const targetAngle = this.currentAngle + extraSpins + targetSlot * slotAngle;

    const duration   = 4000 + Math.random() * 2000;
    const startTime  = performance.now();
    const startAngle = this.currentAngle;

    const animate = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const angle    = startAngle + (targetAngle - startAngle) * eased;

      this.currentAngle = angle % (2 * Math.PI);
      this.drawWheel(this.currentAngle);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.currentAngle = angle % (2 * Math.PI);
        this.isSpinning   = false;
        this.resolveResult();
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  private resolveResult(): void {
    const slotCount  = WHEEL_SEQUENCE.length;
    const slotAngle  = (2 * Math.PI) / slotCount;
    const normalized = ((-this.currentAngle + Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const slotIndex  = Math.floor(normalized / slotAngle) % slotCount;
    const numero     = WHEEL_SEQUENCE[slotIndex];
    const color      = NUMBER_COLOR[numero];
    const paridad    = numero === 0 ? 'cero' : numero % 2 === 0 ? 'par' : 'impar';
    const rango: 'alto' | 'bajo' | null =
      numero === 0 ? null : numero <= 18 ? 'bajo' : 'alto';

    this.lastResult = { numero, color, paridad, rango };

    // ── Evaluar resultado contra la ruleta seleccionada ──
    if (this.selectedRuleta) {
      this.gameOutcome = this.evaluateOutcome(this.lastResult, this.selectedRuleta);
      // Deseleccionar después de jugar para que el usuario elija de nuevo
      setTimeout(() => { this.selectedRuleta = null; }, 3000);
    }
  }

  private evaluateOutcome(result: WheelResult, ruleta: RuletaRead): GameOutcome {
    const e = ruleta.eleccion_usuario as Record<string, any>;
    const checks: boolean[] = [];

    if (e['numero'] !== null && e['numero'] !== undefined)
      checks.push(result.numero === Number(e['numero']));

    if (e['color'])
      checks.push(result.color === e['color']);

    if (e['paridad'])
      checks.push(result.paridad === e['paridad']);

    if (e['rango'])
      checks.push(result.rango === e['rango']);

    // Gana si TODOS los campos definidos coinciden
    const gano = checks.length > 0 && checks.every(Boolean);

    return {
      gano,
      recompensa: ruleta.recompensa,
      costo: ruleta.costo_entrada,
      ruleta,
    };
  }

  // ── Ruleta: dibujo canvas ──────────────────────────────
  private drawWheel(angle: number): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R  = W / 2 - 6;
    const slotCount = WHEEL_SEQUENCE.length;
    const slotAngle = (2 * Math.PI) / slotCount;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < slotCount; i++) {
      const startA = angle + i * slotAngle - Math.PI / 2;
      const endA   = startA + slotAngle;
      const num    = WHEEL_SEQUENCE[i];
      const col    = NUMBER_COLOR[num];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startA, endA);
      ctx.closePath();

      if (col === 'rojo')       ctx.fillStyle = '#9b2c2c';
      else if (col === 'verde') ctx.fillStyle = '#276749';
      else                      ctx.fillStyle = '#1a1a1a';

      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth   = 0.6;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startA + slotAngle / 2);
      ctx.textAlign  = 'right';
      ctx.fillStyle  = 'rgba(255,255,255,0.85)';
      ctx.font       = `500 ${num < 10 ? 10 : 9}px sans-serif`;
      ctx.fillText(String(num), R - 8, 3.5);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth   = 2;
    ctx.stroke();

    const innerR = 22;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f0f0f';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }

  // ── Helpers de UI ──────────────────────────────────────
  getBallColor(num: number | null | undefined): string {
    if (num === null || num === undefined) return '#2a2a2a';
    const c = NUMBER_COLOR[num];
    if (c === 'rojo')  return '#9b2c2c';
    if (c === 'verde') return '#276749';
    return '#1a1a1a';
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}