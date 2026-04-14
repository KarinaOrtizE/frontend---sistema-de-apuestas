import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'pos_audit_usuario_id';

@Injectable({ providedIn: 'root' })
export class AuditContextService {
  private readonly id = signal<string | null>(this.readStorage());

  readonly usuarioId = this.id.asReadonly();

  readonly hasUsuario = computed(() => this.id() !== null);

  select(id: string): void {
    this.id.set(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  clear(): void {
    this.id.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private readStorage(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }
}