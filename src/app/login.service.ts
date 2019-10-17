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

  private sessionInfo: BehaviorSubject<CouchDBUserContext | null> = new BehaviorSubject(null);

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
    combineLatest(
      this.couches._users.loginAttemptMade,
      this.couches.user_profiles.loginAttemptMade
    ).pipe(
      filter((attempts) => {
        console.log(attempts);
        return attempts[0] && attempts[0]
      }),
      take(1)
    ).subscribe((_attempts) => {
      console.log("hiiiii");
      this.checkedWithServer.next(true);
    });

    this.couchAuth = Observable
      .create((observer: Observer<CouchDBCredentials>): void => {
        this.usernamePassword
          .pipe(take(1), filter(currentAuthState => currentAuthState !== null))
          .subscribe((couchDBAuth: CouchDBCredentials) => {
            console.log("got", couchDBAuth);
            observer.next(couchDBAuth);
          });

      });

    this.sessionInfo
      .subscribe((sessionInfo) => {
        if (sessionInfo === null) {
          this.loggedInUser.next(null);
        } else {
          if (sessionInfo.name !== null) {
            if (this.loggedInUser.value === null) {
              this.couches.user_profiles.find({
                selector: {
                  name: sessionInfo.name
                }

              }).subscribe((profiles) => {
                this.couches.user_profiles.documents.add(profiles[0]);
                this.loggedInUser.next(profiles[0]);
              });

            }

          }

        }

      });

    this.couches._users.authenticated.subscribe(
      (_authenticated) => {
        this.couches._users.getSession()
          .pipe(take(1))
          .subscribe((session) => {
            if (session) {
              console.log(session, "from server");
              this.sessionInfo.next(session.userCtx);
            }

            if (!this.checkedWithServer.value) {
              this.checkedWithServer.next(true);
            }

          });

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
