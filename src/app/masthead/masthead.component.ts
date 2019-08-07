import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { LoginService } from '../login.service';
import { CouchDBSession } from '@mkeen/rxcouch/dist/types';

@Component({
  selector: 'masthead',
  templateUrl: './masthead.component.html',
  styleUrls: ['./masthead.component.scss']
})
export class MastheadComponent implements OnInit {
  @Input() logoOpen: boolean = true;
  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  sessionInfo: BehaviorSubject<CouchDBSession | null> = new BehaviorSubject(null);

  constructor(private loginService: LoginService) { }

  ngOnInit() {
    this.loginService.couches._users.authenticated.subscribe((authState) => {
      if (authState) {
        this.loginService.sessionInfo
          .pipe(
            filter(sessionInfo => sessionInfo !== null),
            take(1)
          ).subscribe((session) => {
            this.loggedIn.next(true);
            this.sessionInfo.next(session);
          });

      } else {
        this.loggedIn.next(false);
      }

    });

  }

}
