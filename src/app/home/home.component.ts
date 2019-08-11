import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginService.sessionInfo.subscribe((authed) => {
      if (authed) {
        if (authed.roles.includes('pending_member')) {
          this.router.navigateByUrl('/signup/founding');
        }

      }

    })
  }

}
