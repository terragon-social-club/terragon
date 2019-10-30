import { Injectable } from '@angular/core';
import { CouchDBCredentials, CouchDB, AuthorizationBehavior } from '@mkeen/rxcouch';
import { Observer, Observable, BehaviorSubject, combineLatest, zip } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { environment } from './../environments/environment';
import { CouchDBUserContext, CouchDBBasicResponse, CouchDBDocument } from '@mkeen/rxcouch/dist/types';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public usernamePassword: BehaviorSubject<CouchDBCredentials | null> = new BehaviorSubject(null);
  public loggedInUser: BehaviorSubject<CouchDBDocument | null> = new BehaviorSubject(null);
  public checkedWithServer: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public sessionInfo: BehaviorSubject<CouchDBUserContext | null> = new BehaviorSubject(null);

  private baseCouchConfig = {
    host: environment.couchHost,
    port: environment.couchPort,
    ssl: environment.couchSsl
  }

  private couchAuth: Observable<CouchDBCredentials>;

  public couches = {
    _users: new CouchDB(Object.assign(this.baseCouchConfig, { dbName: '_users', trackChanges: false }), AuthorizationBehavior.cookie, this.couchAuth),
    user_profiles: new CouchDB(Object.assign(this.baseCouchConfig, { dbName: 'user_profiles', trackChanges: true }), AuthorizationBehavior.cookie, this.couchAuth)
  }

  constructor(
    private cookieService: CookieService,
  ) {
    this.couchAuth = Observable
      .create((observer: Observer<CouchDBCredentials>): void => {
        this.usernamePassword
          .pipe(take(1), filter(currentAuthState => currentAuthState !== null))
          .subscribe((couchDBAuth: CouchDBCredentials) => {
            console.log("got", couchDBAuth);
            observer.next(couchDBAuth);
          });

      });

    this.couches._users.loginAttemptMade.pipe(
      filter(attemptMade => !!attemptMade),
      take(1)
    ).subscribe((_attemptMade) => {
      console.log("attempt made")
      this.checkedWithServer.next(true);
    });

    this.sessionInfo
      .subscribe((sessionInfo) => {
        if (sessionInfo === null) {
          this.loggedInUser.next(null);
        } else {
          if (sessionInfo.name !== null) {
            if (this.loggedInUser.value === null) {
              this.couches.user_profiles.doc(sessionInfo.name).subscribe((profile) => {
                console.log("got profiles", profile);
                this.couches.user_profiles.documents.add(profile);
                this.loggedInUser.next(profile);
              });

            }

            if (!this.couches.user_profiles.authenticated.value) {
              // Need an entry here for each non-user database
              this.couches.user_profiles.authenticated.next(true);
            }

          }

        }

      });

    this.couches._users.getSession()
      .pipe(take(1))
      .subscribe((session) => {
        this.sessionInfo.next(session.userCtx);
      });

  }

  receivedAuthCookie() {
    Object.keys(this.couches).map((couchIdx) => {
      if (!this.couches[couchIdx].authenticated.value) {
        this.couches[couchIdx].authenticated.next(true);
      }
    })
  }

  endSession() {
    return Observable
      .create((observer: Observer<CouchDBBasicResponse>): void => {
        this.couches._users.destroySession()
          .pipe(take(1))
          .subscribe((response: CouchDBBasicResponse) => {
            this.sessionInfo.next(null);
            observer.next(response);
          });

      });

  }

}
