import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RuletaCreate, RuletaRead, RuletaUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class RuletaService {
  private readonly base = `${environment.apiUrl}/ruletas`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<RuletaRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<RuletaRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<RuletaRead> {
    return this.http.get<RuletaRead>(`${this.base}/${id}`);
  }

  create(body: RuletaCreate): Observable<RuletaRead> {
    return this.http.post<RuletaRead>(`${this.base}/`, body);
  }

  update(id: string, body: RuletaUpdate): Observable<RuletaRead> {
    return this.http.put<RuletaRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}