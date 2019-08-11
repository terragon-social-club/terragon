import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { LoginService } from '../login.service';
import { CouchDBUserContext, CouchDBDocument } from '@mkeen/rxcouch/dist/types';

@Component({
  selector: 'masthead',
  templateUrl: './masthead.component.html',
  styleUrls: ['./masthead.component.scss']
})
export class MastheadComponent implements OnInit {
  @Input() logoOpen: boolean = true;
  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loggedInUser: BehaviorSubject<CouchDBDocument | null> = new BehaviorSubject(null);

  constructor(private loginService: LoginService) { }

  public badgedRoles = this.loggedInUser
    .pipe(
      filter(info => info !== null),
      map(info => info.roles
        .filter(role => role !== 'member')
        .map(role => role.replace(/_/g, ' ')))
    );

  ngOnInit() {
    this.loginService.couches._users.authenticated.subscribe((authState) => {
      if (authState) {
        this.loginService.loggedInUser
          .pipe(
            filter(user => user !== null)
          ).subscribe((user) => {
            this.loggedIn.next(true);
            this.loggedInUser.next(user);
          });

      } else {
        this.loggedIn.next(false);
      }

    });

  }

}
