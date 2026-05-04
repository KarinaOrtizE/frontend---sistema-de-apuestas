import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SorteoCreate, SorteoRead, SorteoUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class SorteoService {
  private readonly base = `${environment.apiUrl}/sorteos`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<SorteoRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<SorteoRead[]>(this.base, { params });
  }

  get(id: string): Observable<SorteoRead> {
    return this.http.get<SorteoRead>(`${this.base}/${id}`);
  }

  create(body: SorteoCreate): Observable<SorteoRead> {
    return this.http.post<SorteoRead>(this.base, body);
  }

  update(id: string, body: SorteoUpdate): Observable<SorteoRead> {
    return this.http.put<SorteoRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}
