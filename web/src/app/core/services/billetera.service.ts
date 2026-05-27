import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BilleteraCreate, BilleteraRead } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class BilleteraService {
  private readonly base = `${environment.apiUrl}/billeteras`;

  constructor(private readonly http: HttpClient) {}

  list(usuarioId?: string): Observable<BilleteraRead[]> {
    let params = new HttpParams().set('skip', 0).set('limit', 500);
    if (usuarioId) {
      params = params.set('usuario_id', usuarioId);
    }
    return this.http.get<BilleteraRead[]>(this.base, { params });
  }

  get(id: string): Observable<BilleteraRead> {
    return this.http.get<BilleteraRead>(`${this.base}/${id}`);
  }

  create(body: BilleteraCreate): Observable<BilleteraRead> {
    return this.http.post<BilleteraRead>(this.base, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}
