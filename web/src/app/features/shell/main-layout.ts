import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuditContextService } from '../../core/audit-context.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioRead } from '../../models/api.models'; 

const SIDEBAR_KEY = 'betting_sidebar_collapsed';

@Component({
  selector: 'app-main-layout',
  standalone: true, 
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule,
    MatListModule, MatIconModule, MatButtonModule, MatFormFieldModule,
    MatSelectModule, MatSnackBarModule, MatTooltipModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent implements OnInit, AfterViewInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  readonly audit = inject(AuditContextService);

  @ViewChild('sidenavShell') private sidenavShell?: MatSidenavContainer;

  readonly usuarios = signal<UsuarioRead[]>([]);
  readonly sidebarCollapsed = signal(
    typeof localStorage !== 'undefined' && localStorage.getItem(SIDEBAR_KEY) === '1'
  );

  readonly nav = [
    { path: 'usuarios', label: 'Usuarios', icon: 'manage_accounts' },
    { path: 'billeteras', label: 'Billeteras', icon: 'account_balance_wallet' },
    { path: 'sorteos', label: 'Sorteos', icon: 'event' },
    { path: 'loterias', label: 'Loterías', icon: 'confirmation_number' },
    { path: 'metodos-pago', label: 'Métodos de Pago', icon: 'payments' },
    { path: 'apuestas', label: 'Apuestas', icon: 'casino' },
    { path: 'bingos', label: 'Bingos', icon: 'grid_on' },
    { path: 'transacciones', label: 'Transacciones', icon: 'receipt_long' },
    { path: 'ruletas', label: 'Ruletas', icon: 'blur_on' },
  ];

  ngOnInit(): void {
    this.usuarioService.list().subscribe({
      next: (rows) => this.usuarios.set(rows),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 5000 }),
    });
  }

  ngAfterViewInit(): void {
    this.syncContentMarginsWithDrawer();
  }

  private syncContentMarginsWithDrawer(): void {
    this.sidenavShell?.updateContentMargins();
  }

  toggleSidebar(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
    queueMicrotask(() => this.syncContentMarginsWithDrawer());
    window.setTimeout(() => this.syncContentMarginsWithDrawer(), 360);
  }

  onUsuarioAudit(id: string): void {
    this.audit.select(id);
  }

  logout(): void {
    this.audit.clear();
    void this.router.navigateByUrl('/login');
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}