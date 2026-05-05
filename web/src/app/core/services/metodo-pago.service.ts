import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MetodoPagoCreate, MetodoPagoRead, MetodoPagoUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class MetodoPagoService {
  private readonly base = `${environment.apiUrl}/metodos-pago`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<MetodoPagoRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<MetodoPagoRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<MetodoPagoRead> {
    return this.http.get<MetodoPagoRead>(`${this.base}/${id}`);
  }

  create(body: MetodoPagoCreate): Observable<MetodoPagoRead> {
    return this.http.post<MetodoPagoRead>(`${this.base}/`, body);
  }

  update(id: string, body: MetodoPagoUpdate): Observable<MetodoPagoRead> {
    return this.http.put<MetodoPagoRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}