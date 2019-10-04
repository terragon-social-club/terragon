import { Injectable } from '@angular/core';
import { CouchDBCredentials, CouchDB, AuthorizationBehavior } from '@mkeen/rxcouch';
import { Observer, Observable, BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { environment } from './../environments/environment';
import { CouchDBSession, CouchDBUserContext, CouchDBBasicResponse, CouchDBDocument } from '@mkeen/rxcouch/dist/types';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public usernamePassword: BehaviorSubject<CouchDBCredentials | null> = new BehaviorSubject(null);
  private sessionInfo: BehaviorSubject<CouchDBUserContext | null> = new BehaviorSubject(null);
  public loggedInUser: BehaviorSubject<CouchDBDocument | null> = new BehaviorSubject(null);
  public checkedWithServer: BehaviorSubject<boolean> = new BehaviorSubject(false);

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

        })).subscribe((couchDBAuth: CouchDBCredentials) => {
          console.log("going to emit", couchDBAuth);
          observer.next(couchDBAuth);
        });

    });

  public couches = {
    _users: new CouchDB(Object.assign(this.baseCouchConfig, { dbName: '_users', trackChanges: false }), AuthorizationBehavior.cookie, this.couchAuth),
    user_profiles: new CouchDB(Object.assign(this.baseCouchConfig, { dbName: 'user_profiles', trackChanges: true }), AuthorizationBehavior.cookie, this.couchAuth)
  }

  constructor(
    private cookieService: CookieService,
  ) {
    this.couches._users.authenticated
      .subscribe((authStatus: boolean) => {
        if (authStatus) {
          console.log("auth status", authStatus);
        }

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
              })
                .subscribe((profiles) => {
                  this.couches.user_profiles.documents.add(profiles[0]);
                  this.loggedInUser.next(profiles[0]);
                })

            }

          }

        }

      });

  }

  refreshSession(userContext?: CouchDBUserContext): void {
    if (!userContext) {
      this.couches.user_profiles.getSession()
        .pipe(take(1))
        .subscribe((session: CouchDBSession) => {
          this.checkedWithServer.next(true);
          this.sessionInfo.next(session.userCtx);
        });

    } else {
      this.sessionInfo.next(userContext);
    }

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
