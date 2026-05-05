import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TransaccionCreate, TransaccionRead, TransaccionUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
  private readonly base = `${environment.apiUrl}/transacciones`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<TransaccionRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<TransaccionRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<TransaccionRead> {
    return this.http.get<TransaccionRead>(`${this.base}/${id}`);
  }

  create(body: TransaccionCreate): Observable<TransaccionRead> {
    return this.http.post<TransaccionRead>(`${this.base}/`, body);
  }

  update(id: string, body: TransaccionUpdate): Observable<TransaccionRead> {
    return this.http.put<TransaccionRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}