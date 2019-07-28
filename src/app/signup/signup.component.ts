import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from './../api.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  usernameAvailable: Subject<boolean> = new Subject();
  rawUsername: Subject<string> = new Subject();
  invalidUsername: BehaviorSubject<boolean> = new BehaviorSubject(true);
  usernameAvailableFetchTask = null;
  usernameAvailableFetching: boolean = false;
  lastUsernameFetch: number = 0;

  formSubmissionErrors: BehaviorSubject<any> = new BehaviorSubject({
    person_name: { show: false, message: '' },
    name: { show: false, message: '' },
    email: { show: false, message: '' },
    password: { show: false, message: '' },
    password_confirm: { show: false, message: '' },
    phone: { show: false, message: '' }
  });

  personalInformationSubmitting: BehaviorSubject<boolean> = new BehaviorSubject(false);

  currentPasswordValue: string = '';
  currentConfirmPasswordValue: string = '';
  signupForm: NgForm;
  screen: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(private apiService: ApiService, private loginService: LoginService) { }

  validateUsername(username: any) {
    if (!(typeof username === 'string')) {
      return false;
    }

    const normalizedUsername = username.toLowerCase();

    if (normalizedUsername.includes('admin') || normalizedUsername.includes('terragon')) {
      return false;
    }

    if (username.length < 3) {
      return false;
    }

    const pattern = /^[\w0-9]+$/;
    if (!username.match(pattern)) {
      return false;
    }

    return true;
  }

  ngOnInit() {
    this.rawUsername
      .pipe(
        filter((_username) => {
          return !this.usernameAvailableFetching;
        }),

        tap((_username) => {
          if (Date.now() - this.lastUsernameFetch > 1000) {
            this.usernameAvailableFetchTask = null;
          }

        }),

        filter((username) => {
          const pass = this.validateUsername(username);

          if (!pass) {
            if (this.usernameAvailableFetchTask) {
              clearTimeout(this.usernameAvailableFetchTask);
            }

            this.usernameAvailable.next(false);
            this.invalidUsername.next(true);
          } else {
            this.invalidUsername.next(false);
          }

          return pass;
        })
      )
      .subscribe((username: string) => {
        let nextTaskDelay = 1;
        if (this.usernameAvailableFetchTask) {
          clearTimeout(this.usernameAvailableFetchTask);
          nextTaskDelay = 1000;
        }

        this.usernameAvailableFetchTask = setTimeout(() => {
          let currentErrors = Object.assign({}, this.formSubmissionErrors.value);
          currentErrors.name.show = false;
          this.formSubmissionErrors.next(currentErrors);
          this.usernameAvailableFetching = true;
          this.apiService.getRequest(`user/exists/${username}`)
            .fetch()
            .subscribe((usernameStatus: any) => {
              this.lastUsernameFetch = Date.now();
              this.usernameAvailableFetching = false;
              this.usernameAvailable.next(!usernameStatus.exists);
            });

        }, nextTaskDelay);

      });

    this.loginService.couches.public_profiles.authenticated.subscribe((authState) => {
      if (authState) {
        console.log(authState);
        this.screen.next(1);
        this.personalInformationSubmitting.next(false);
      }

    });

  }

  submitPersonal(form: NgForm) {
    let currentMap = Object.assign({}, this.formSubmissionErrors.value);
    Object.keys(currentMap).map((fieldNameIndex) => {
      console.log(fieldNameIndex);
      currentMap[fieldNameIndex].show = false;
    });

    this.formSubmissionErrors.next(currentMap);

    this.personalInformationSubmitting.next(true);
    this.apiService.postRequest('user', JSON.stringify({
      name: form.controls.name.value,
      email: form.controls.email.value,
      person_name: form.controls.person_name.value,
      phone: form.controls.phone.value,
      password: form.controls.password.value,
      password_confirm: form.controls.password_confirm.value
    })).fetch()
      .subscribe(
        (formSubmissionResult: any) => {
          if ('errors' in formSubmissionResult) {
            let currentMap = Object.assign({}, this.formSubmissionErrors.value);
            formSubmissionResult.errors.map((formError: any) => {
              if (formError.detail.field !== 'name') {
                currentMap[formError.detail.field] = { message: formError.detail.message, show: true };
              } else {
                if (formError.detail.message === 'exists') {
                  this.usernameAvailable.next(false);
                } else {
                  currentMap[formError.detail.field] = { message: formError.detail.message, show: true };
                }

              }

            });

            this.formSubmissionErrors.next(currentMap);
            this.personalInformationSubmitting.next(false);
          } else {
            // continue on
            this.loginService.usernamePassword.next({ username: form.controls.name.value, password: form.controls.password.value });
            this.loginService.couches.public_profiles.authenticate()
              .subscribe((a) => {
                console.log(a);
                this.loginService.couches.public_profiles.getSession()
                  .subscribe((b) => {
                    console.log(b);
                  })
              })
          }

        },

        (error) => {
          console.log("error", error);
        }

      );

  }

  changeUsername(newValue: string) {
    this.rawUsername.next(newValue);
  }

}
