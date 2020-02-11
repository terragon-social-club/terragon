import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, Observable, Observer } from 'rxjs';
import { take, takeUntil, finalize } from 'rxjs/operators';
import { ChangesService } from './../data/changes.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  cleanupRx: Subject<boolean> = new Subject();

  hotFeed: Observable<any> = this.loginService.couches.feeds.doc('hot').pipe(takeUntil(this.cleanupRx));
  clicks: any[] = [];

  constructor(
    private loginService: LoginService,
    private changesService: ChangesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginService.couches.feeds.reconfigure({trackChanges: true});

    let clicksChangeSub;

    const hotClicks = Observable.create((observer: Observer<any>) => {
      clicksChangeSub = this.changesService.changesWithAutoReconnect(this.loginService.couches.hotClicksFeed, observer);
    }).pipe(takeUntil(this.cleanupRx), finalize(() => {
      console.log("this is the end of my stream")
      clicksChangeSub.unsubscribe();
    }));

    hotClicks.subscribe((doc) => {
      if (!this.clicks[doc.clickIndex]) {
        this.clicks[doc.clickIndex] = [];
      }

      const clickEntry = {x: (Math.floor(Math.random() * 100) + 1) + '%', y: (Math.floor(Math.random() * 100) + 1) + '%'};

      this.clicks[doc.clickIndex].push(clickEntry);
      setTimeout(() => {
        const index = this.clicks[doc.clickIndex].indexOf(clickEntry);
        if (index > -1) {
          this.clicks[doc.clickIndex].splice(index, 1);
        }

      }, 250);

    })

  }

  ngOnDestroy() {
    this.cleanupRx.next(true);
    this.loginService.couches.feeds.reconfigure({trackChanges: false});
  }

  registerClick(index) {
    this.loginService.couches.hotClicksFeed.doc({
      clickIndex: index
    }).pipe(take(1)).subscribe((result) => {
      console.log(result);
    });

  }

  trackByFn(index, item) {
    return index; // or item.id
  }

}
