import { Component, OnInit, OnChanges } from '@angular/core';
import { LoginService } from '../login.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit() {
    /*this.loginService.loggedInUser.subscribe((authed) => {
      if (!authed) {
        this.router.navigateByUrl('/');
        return;
      }

      console.log(authed, "authed");

      if (!authed.roles.includes('member') || authed.roles.includes('pending_member')) {
        this.router.navigateByUrl('/');
      }

    })*/
  }

  logout() {
    this.loginService.endSession()
      .pipe(take(1))
      .subscribe((_ok) => { })
  }

}
