import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

  videoSources: any = [
    {
      src: '/terragon.mp4'
    },
  ];

}
