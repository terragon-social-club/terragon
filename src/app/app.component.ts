import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { take, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ModalService } from './modal/modal.service';
import { ModalComponent } from './modal/modal/modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private loginService: LoginService,
    public modalService: ModalService) { }

  ngOnInit() {
    this.loginService.loggedInUser.subscribe((user) => { console.log("we know about user ", user) })
    this.loginService.refreshSession();
  }
}
