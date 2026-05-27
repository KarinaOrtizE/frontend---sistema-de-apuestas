import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TransaccionCreate, TransaccionRead } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
  private readonly base = `${environment.apiUrl}/transacciones`;

  constructor(private readonly http: HttpClient) {}

  list(usuarioId?: string): Observable<TransaccionRead[]> {
    let params = new HttpParams().set('skip', 0).set('limit', 500);
    if (usuarioId) {
      params = params.set('usuario_id', usuarioId);
    }
    return this.http.get<TransaccionRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<TransaccionRead> {
    return this.http.get<TransaccionRead>(`${this.base}/${id}`);
  }

  create(body: TransaccionCreate): Observable<TransaccionRead> {
    return this.http.post<TransaccionRead>(`${this.base}/`, body);
  }
}
