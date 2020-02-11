import { Injectable } from '@angular/core';
import { CouchSession, CouchDBCredentials, CouchDB, AuthorizationBehavior } from '@mkeen/rxcouch';
import { Observer, Observable, BehaviorSubject, Subject } from 'rxjs';
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
  private couchAuth: Subject<CouchDBCredentials> = new Subject();
  private baseCouchConfig = {
    host: environment.couchHost,
    port: environment.couchPort,
    ssl: environment.couchSsl
  };

  public couchSession: CouchSession = new CouchSession(
    AuthorizationBehavior.cookie,
    `${this.baseCouchConfig.ssl ? 'https://' : 'http://'}${this.baseCouchConfig.host}:${this.baseCouchConfig.port}/_session`,
    this.couchAuth
  )

  public couches = {
    _users: new CouchDB(
      Object.assign(this.baseCouchConfig, {
        dbName: '_users',
        trackChanges: false
      }

    ), this.couchSession),

    user_profiles: new CouchDB(
      Object.assign(this.baseCouchConfig, {
        dbName: 'user_profiles',
        trackChanges: true
      }

    ), this.couchSession),

    feeds: new CouchDB(
      Object.assign(this.baseCouchConfig, {
        dbName: 'feeds',
        trackChanges: true
      }

    ), this.couchSession),

    comments: new CouchDB(
      Object.assign(this.baseCouchConfig, {
        dbName: 'comments',
        trackChanges: true
      }

    ), this.couchSession),

    commentsIngress: new CouchDB(
      Object.assign(this.baseCouchConfig, {
        dbName: 'ingress_comments',
        trackChanges: false
      }

    ), this.couchSession),

    commentsReactionsIngress: new CouchDB(
      Object.assign(this.baseCouchConfig, {
        dbName: 'ingress_reactions',
        trackChanges: false
      }

    ), this.couchSession),

    hotClicksFeed: new CouchDB(
      Object.assign(this.baseCouchConfig, {
        dbName: 'feed_hotclicks',
        trackChanges: false
      }

    ), this.couchSession)
  };

  constructor(
    private cookieService: CookieService,
  ) {
    this.usernamePassword.pipe(
      filter(currentAuthState => !!currentAuthState)
    ).subscribe((usernamePassword: CouchDBCredentials) => {
      this.couchAuth.next(usernamePassword);
    });

    this.couchSession.loginAttemptMade.pipe(
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
              console.log(sessionInfo, "seshInfo");
              this.couches.user_profiles.doc(sessionInfo.name).subscribe((profile) => {
                console.log("got profiles", profile);
                //this.couches.user_profiles.documents.add(profile);
                this.loggedInUser.next(profile);
              });

            }

          }

        }

      });

    this.couchSession.context
      .subscribe((context) => {
        this.sessionInfo.next(context);
      });

    this.couchSession.get()
      .subscribe(_c => _c);

  }

  endSession() {
    return Observable
      .create((observer: Observer<CouchDBBasicResponse>): void => {
        this.couchSession.destroy()
          .pipe(take(1))
          .subscribe((response: CouchDBBasicResponse) => {
            this.sessionInfo.next(null);
            observer.next(response);
          });

      });

  }

}
