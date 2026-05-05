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
import {
  RuletaDialogComponent,
  RuletaDialogData,
} from './ruleta-dialog';
 
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
 
  // ── Estado de la ruleta ────────────────────────────────
  isSpinning  = false;
  lastResult: WheelResult | null = null;
 
  private currentAngle    = 0;
  private animationFrame  = 0;
 
  @ViewChild('wheelCanvas')
  private canvasRef!: ElementRef<HTMLCanvasElement>;
 
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
 
  // ── Lifecycle ──────────────────────────────────────────
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    // Pequeño delay para que el canvas esté en el DOM
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
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
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
    if (this.isSpinning) return;
 
    this.isSpinning = true;
    this.lastResult = null;
 
    const slotCount    = WHEEL_SEQUENCE.length;          // 37
    const slotAngle    = (2 * Math.PI) / slotCount;
    const extraSpins   = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI;
    const targetSlot   = Math.floor(Math.random() * slotCount);
    const targetAngle  = this.currentAngle + extraSpins + targetSlot * slotAngle;
 
    const duration  = 4000 + Math.random() * 2000;   // 4–6 s
    const startTime = performance.now();
    const startAngle = this.currentAngle;
 
    const animate = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cúbico
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
    // El slot apuntado por el puntero (parte superior → ángulo 0 en coords canvas)
    const slotCount  = WHEEL_SEQUENCE.length;
    const slotAngle  = (2 * Math.PI) / slotCount;
    // Normalizamos: puntero está en -90° (arriba)
    const normalized = ((-this.currentAngle + Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const slotIndex  = Math.floor(normalized / slotAngle) % slotCount;
    const numero     = WHEEL_SEQUENCE[slotIndex];
    const color      = NUMBER_COLOR[numero];
    const paridad    = numero === 0 ? 'cero' : numero % 2 === 0 ? 'par' : 'impar';
 
    this.lastResult = { numero, color, paridad };
  }
 
  // ── Ruleta: dibujo canvas ──────────────────────────────
  private drawWheel(angle: number): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
 
    const ctx    = canvas.getContext('2d');
    if (!ctx) return;
 
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R  = W / 2 - 4;
    const slotCount = WHEEL_SEQUENCE.length;
    const slotAngle = (2 * Math.PI) / slotCount;
 
    ctx.clearRect(0, 0, W, H);
 
    // Fondo exterior
    ctx.beginPath();
    ctx.arc(cx, cy, R + 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a1a0f';
    ctx.fill();
 
    // Segmentos
    for (let i = 0; i < slotCount; i++) {
      const startA = angle + i * slotAngle - Math.PI / 2;
      const endA   = startA + slotAngle;
      const num    = WHEEL_SEQUENCE[i];
      const col    = NUMBER_COLOR[num];
 
      // Relleno del sector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R - 2, startA, endA);
      ctx.closePath();
 
      if (col === 'rojo')  ctx.fillStyle = '#b03025';
      else if (col === 'verde') ctx.fillStyle = '#1a6b35';
      else ctx.fillStyle = '#1a1a1a';
 
      ctx.fill();
 
      // Borde del sector
      ctx.strokeStyle = '#d4a843';
      ctx.lineWidth   = 0.8;
      ctx.stroke();
 
      // Número
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startA + slotAngle / 2);
      ctx.textAlign    = 'right';
      ctx.fillStyle    = num === 0 ? '#a8e6b0' : '#f0e8d0';
      ctx.font         = `bold ${num < 10 ? 11 : 10}px "DM Sans", sans-serif`;
      ctx.fillText(String(num), R - 10, 4);
      ctx.restore();
    }
 
    // Aro dorado exterior
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = '#d4a843';
    ctx.lineWidth   = 3;
    ctx.stroke();
 
    // Círculo central
    const innerR = 28;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    grad.addColorStop(0, '#2a1a05');
    grad.addColorStop(1, '#0d0d0d');
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#d4a843';
    ctx.lineWidth   = 2;
    ctx.stroke();
 
    // Separadores radiales (diamantes decorativos)
    for (let i = 0; i < slotCount; i++) {
      const a = angle + i * slotAngle - Math.PI / 2;
      const x1 = cx + Math.cos(a) * (R - 2);
      const y1 = cy + Math.sin(a) * (R - 2);
      const x2 = cx + Math.cos(a) * (innerR + 2);
      const y2 = cy + Math.sin(a) * (innerR + 2);
 
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(212, 168, 67, 0.5)';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }
  }
 
  // ── Helpers de UI ──────────────────────────────────────
  getBallColor(num: number | null | undefined): string {
    if (num === null || num === undefined) return '#444';
    const c = NUMBER_COLOR[num];
    if (c === 'rojo')  return '#c0392b';
    if (c === 'verde') return '#1a6b35';
    return '#1a1a1a';
  }
 
  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}