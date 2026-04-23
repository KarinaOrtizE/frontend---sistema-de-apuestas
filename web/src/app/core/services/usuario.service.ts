import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UsuarioCreate, UsuarioRead, UsuarioUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly base = `${environment.apiUrl}/usuarios`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<UsuarioRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<UsuarioRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<UsuarioRead> {
    return this.http.get<UsuarioRead>(`${this.base}/${id}`);
  }

  create(body: UsuarioCreate): Observable<UsuarioRead> {
    return this.http.post<UsuarioRead>(`${this.base}/`, body);
  }

  update(id: string, body: UsuarioUpdate): Observable<UsuarioRead> {
    return this.http.put<UsuarioRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}