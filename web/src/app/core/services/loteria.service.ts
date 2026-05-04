import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoteriaCreate, LoteriaRead, LoteriaUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class LoteriaService {
  private readonly base = `${environment.apiUrl}/loterias`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<LoteriaRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<LoteriaRead[]>(this.base, { params });
  }

  get(id: string): Observable<LoteriaRead> {
    return this.http.get<LoteriaRead>(`${this.base}/${id}`);
  }

  create(body: LoteriaCreate): Observable<LoteriaRead> {
    return this.http.post<LoteriaRead>(this.base, body);
  }

  update(id: string, body: LoteriaUpdate): Observable<LoteriaRead> {
    return this.http.put<LoteriaRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}
