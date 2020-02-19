import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { ModalService } from './modal/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    public loginService: LoginService,
    public modalService: ModalService) { }

  ngOnInit() { }
}
