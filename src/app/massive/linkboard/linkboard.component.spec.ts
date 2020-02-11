import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkboardComponent } from './linkboard.component';

describe('LinkboardComponent', () => {
  let component: LinkboardComponent;
  let fixture: ComponentFixture<LinkboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
