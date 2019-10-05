import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  public open: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public openDelay: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {
    this.open
      .pipe(filter(value => !!value))
      .subscribe(_value => setTimeout(() => {
        this.openDelay.next(true);
      }, 200))
  }
}
