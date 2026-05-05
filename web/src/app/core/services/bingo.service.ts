import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BingoCreate, BingoRead, BingoUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class BingoService {
  private readonly base = `${environment.apiUrl}/bingos`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<BingoRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<BingoRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<BingoRead> {
    return this.http.get<BingoRead>(`${this.base}/${id}`);
  }

  create(body: BingoCreate): Observable<BingoRead> {
    return this.http.post<BingoRead>(`${this.base}/`, body);
  }

  update(id: string, body: BingoUpdate): Observable<BingoRead> {
    return this.http.put<BingoRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}