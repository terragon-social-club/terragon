import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'masthead',
  templateUrl: './masthead.component.html',
  styleUrls: ['./masthead.component.scss']
})
export class MastheadComponent implements OnInit {
  @Input() logoOpen: boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
