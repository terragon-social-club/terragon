import { Injectable } from '@angular/core';
import { CouchDBCredentials, CouchDB, AuthorizationBehavior } from '@mkeen/rxcouch';
import { Observer, Observable, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public usernamePassword: BehaviorSubject<CouchDBCredentials | null> = new BehaviorSubject(null)

  private baseCouchConfig = {
    host: environment.couchHost,
    port: environment.couchPort,
    ssl: environment.couchSsl
  }

  private couchAuth = Observable
    .create((observer: Observer<CouchDBCredentials>): void => {
      this.usernamePassword
        .pipe(filter((currentAuthState) => {
          if (currentAuthState === null) {
            return false;
          } else {
            return currentAuthState.username && currentAuthState.password && currentAuthState.username !== '' && currentAuthState.password !== '';
          }

        }))
        .subscribe((couchDBAuth: CouchDBCredentials) => {
          console.log("going to emit");
          observer.next(couchDBAuth);
        });

    });

  public couches = {
    _users: new CouchDB(Object.assign(this.baseCouchConfig, { dbName: '_users' }), AuthorizationBehavior.cookie, this.couchAuth),
    public_profiles: new CouchDB(Object.assign(this.baseCouchConfig, { dbName: 'public_profiles' }), AuthorizationBehavior.cookie, this.couchAuth)
  }

  constructor() {
    this.couches._users.getSession().subscribe((session: any) => {
      console.log(session);
    })

  }

}
