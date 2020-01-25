import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  hotFeed: BehaviorSubject<any> = this.loginService.couches.feeds.doc('hot');

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginService.loggedInUser.subscribe((authed) => {
      if (authed) {
        if (authed.roles.includes('pending_member')) {
          this.router.navigateByUrl('/signup/founding');
        }

      }

    });
    
  }

}
