import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'ticker',
  templateUrl: './ticker.component.html',
  styleUrls: ['./ticker.component.scss']
})
export class TickerComponent implements OnInit {
  public currentHeadline: Subject<string> = new Subject();
  public displayText: string = 'Tracy is the sexiest girl';
  public cancelOut: boolean = false;
  public repainting: boolean = false;

  constructor() {
    this.currentHeadline.subscribe((text: string) => {
      this.cancelOut = true;
      setTimeout(() => {
        this.displayText = text;
        setTimeout(() => {
          this.cancelOut = false;
          this.repainting = true;
          setTimeout(() => {
            this.repainting = false;
          }, 500);

        }, 250);

      }, 500);

    });

  }

  ngOnInit() {
    setTimeout(() => {
      this.currentHeadline.next("this is some different text");
    }, 2000);

  }

}
