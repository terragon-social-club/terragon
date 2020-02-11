import { CouchDB } from '@mkeen/rxcouch';
import { Observer, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChangesService {

  constructor() { }

  public changesWithAutoReconnect(database: CouchDB, observer: Observer<any>, first_seq?: string) {
    const reconnect = new Subject();
    return database.changes() // need to be able to pass `first_seq` here to start changes from our last known
      .pipe(takeUntil(reconnect), finalize(() => {
        reconnect.next(false);
      }))
      .subscribe((change) => {
        observer.next(change);
      }, err => err, () => {
        reconnect.next(true);
        this.changesWithAutoReconnect(database, observer, first_seq);
      });

  }

}
