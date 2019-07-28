import { Injectable } from '@angular/core';
import { HttpRequest } from '@mkeen/rxhttp';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private prefix = 'http';
  private host = 'localhost';
  private port = 3000

  constructor() {
    if (environment.couchSsl) {
      this.prefix = 'https';
    }

    if (environment.couchHost !== 'localhost') {
      this.host = 'api.terragon.us';
    }

    if (this.prefix === 'https') {
      this.port === 443;
    }

  }

  postRequest<T>(url: string, body: any): HttpRequest<T> {
    return new HttpRequest<T>(`${this.prefix}://${this.host}:${this.port}/${url}`, { method: 'POST', body });
  }

  getRequest<T>(url: string): HttpRequest<T> {
    return new HttpRequest<T>(`${this.prefix}://${this.host}:${this.port}/${url}`, { method: 'GET' });
  }

}
