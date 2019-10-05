import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { LoginService } from '../login.service';
import { CouchDBDocument } from '@mkeen/rxcouch';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'masthead',
  templateUrl: './masthead.component.html',
  styleUrls: ['./masthead.component.scss']
})
export class MastheadComponent implements OnInit {
  @Input() logoOpen: boolean = true;
  loggedInUserProfile: BehaviorSubject<CouchDBDocument> | null = null;

  constructor(
    private loginService: LoginService,
    private modalService: ModalService,
  ) { }

  ngOnInit() {
    this.loginService.loggedInUser
      .pipe(filter(val => !!val))
      .subscribe((loggedInUser) => { console.log(loggedInUser); this.loggedInUserProfile = this.loginService.couches.user_profiles.doc(loggedInUser._id) })
  }

  activateProfile() {
    this.modalService.open.next(true);
  }

}
