import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApuestaCreate, ApuestaRead, ApuestaUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApuestaService {
  private readonly base = `${environment.apiUrl}/apuestas`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<ApuestaRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<ApuestaRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<ApuestaRead> {
    return this.http.get<ApuestaRead>(`${this.base}/${id}`);
  }

  create(body: ApuestaCreate): Observable<ApuestaRead> {
    return this.http.post<ApuestaRead>(`${this.base}/`, body);
  }

  update(id: string, body: ApuestaUpdate): Observable<ApuestaRead> {
    return this.http.put<ApuestaRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}