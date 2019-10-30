import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from './../api.service';
import { Subject, BehaviorSubject, zip } from 'rxjs';
import { tap, filter, takeUntil } from 'rxjs/operators';
import { LoginService } from '../login.service';
import { HttpResponseWithHeaders } from '@mkeen/rxhttp';
import { CouchDBUserContext } from '@mkeen/rxcouch/dist/types';

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
  personalInfoSubmitted: BehaviorSubject<boolean> = new BehaviorSubject(false);
  ccInformationSubmitting: BehaviorSubject<boolean> = new BehaviorSubject(false);

  unsubscribeFromUsernameField: Subject<boolean> = new Subject();

  formSubmissionErrors: BehaviorSubject<any> = new BehaviorSubject({
    person_name: { show: false, message: '' },
    name: { show: false, message: '' },
    email: { show: false, message: '' },
    password: { show: false, message: '' },
    password_confirm: { show: false, message: '' },
    phone: { show: false, message: '' }
  });

  formCardSubmissionErrors: BehaviorSubject<any> = new BehaviorSubject({
    name_on_card: { show: false, message: '' },
    card_number: { show: false, message: '' },
    billing_zipcode: { show: false, message: '' },
    security_code: { show: false, message: '' },
    expiration_month: { show: false, message: '' },
    expiration_year: { show: false, message: '' }
  });

  creditCardForm = {
    cc_name: "",
    cc_number: "",
    cc_exp_month: "",
    cc_exp_year: "",
    cc_zip: "",
    contribution: 20
  }

  personalInformationSubmitting: BehaviorSubject<boolean> = new BehaviorSubject(false);

  currentPasswordValue: string = '';
  currentConfirmPasswordValue: string = '';
  screen: BehaviorSubject<number> = new BehaviorSubject(1);

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
        takeUntil(this.unsubscribeFromUsernameField),
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
            .subscribe(
              (usernameStatus: any) => {
                this.lastUsernameFetch = Date.now();
                this.usernameAvailableFetching = false;
                this.usernameAvailable.next(!usernameStatus.exists);
              },

              (_error) => {
                this.lastUsernameFetch = Date.now();
                this.usernameAvailableFetching = false;
                this.usernameAvailable.next(false);
                this.invalidUsername.next(true);
              }

            );


        }, nextTaskDelay);

      });

    this.loginService.couches._users.authenticated
      .subscribe((authState: boolean) => {
        console.log('state changed', authState);
        if (authState) {
          this.screen.next(2);
          this.personalInformationSubmitting.next(false);
          if (!this.personalInfoSubmitted.value === false) {
            this.personalInfoSubmitted.next(true);
          }

        } else {
          this.screen.next(1);
        }

      });

  }

  submitCC() {
    console.log(this.loginService.loggedInUser.value);
    this.creditCardForm.contribution;
    this.apiService.postRequest(`user/org.couchdb.user:${this.loginService.loggedInUser.value.name}/payment`, JSON.stringify(
      this.creditCardForm
    )).fetch()
      .subscribe(
        (formSubmissionResult: any) => {
          this.ccInformationSubmitting.next(false);
          console.log(formSubmissionResult);
        }
      )

  }

  submitPersonal(form: NgForm) {
    if (!this.personalInfoSubmitted.value && !this.personalInformationSubmitting.value) {
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

              setTimeout(() => {
                this.personalInformationSubmitting.next(false);
              }, 500);

            } else {
              // Success
              this.loginService.couches._users.authenticated.next(true);
              this.loginService.sessionInfo.next(formSubmissionResult);
              this.unsubscribeFromUsernameField.next(true);
            }

          },

          (error) => {
            console.log("error", error);
          }

        );

    }

  }

  changeUsername(newValue: string) {
    const downcased = newValue.toLowerCase();
    this.rawUsername.next(downcased);
  }

  contributionUp() {
    if (this.creditCardForm.contribution < 50) {
      this.creditCardForm.contribution += 5;
    } else {
      if (this.creditCardForm.contribution < 250) {
        this.creditCardForm.contribution += 50;
      } else {
        this.creditCardForm.contribution += 250;
      }
    }
  }

  contributionDown() {
    if (this.creditCardForm.contribution < 101) {
      this.creditCardForm.contribution -= 1;
    } else {
      if (this.creditCardForm.contribution < 1001) {
        this.creditCardForm.contribution -= 10;
      } else {
        this.creditCardForm.contribution -= 100;
      }
    }
  }
}
