import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WindowFocusService {
  public windowFocus: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor() {
    window.onblur = () => {
      if (this.windowFocus.value) {
        this.windowFocus.next(false);
      }

    };

    window.onfocus = () => {
      if (!this.windowFocus.value) {
        this.windowFocus.next(true);
      }

    };

  }

}
