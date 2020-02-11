import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { LoginService } from '../login.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginAttemptMade = false;
  loginFailed: Subject<boolean> = new Subject();
  loginInformationSubmitting: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private loginService: LoginService,
    private router: Router) { }

  ngOnInit() {
    this.loginService.couchSession.authenticated.subscribe((authState) => {
      console.log(authState, "authenticated question")
      if (authState) {
        this.loginFailed.next(false);
        this.router.navigate(['/']);
      } else {
        this.loginFailed.next(true);
        this.loginInformationSubmitting.next(false);
      }

    });

  }

  attemptLogin(form: NgForm) {
    if (form.controls.name.value && form.controls.name.value) {
      if (form.controls.name.value.length > 1 && form.controls.password.value.length) {
        this.loginAttemptMade = true;
        this.loginInformationSubmitting.next(true);
        this.loginService.usernamePassword.next({
          username: form.controls.name.value,
          password: form.controls.password.value
        });

      }

    }

  }

}
