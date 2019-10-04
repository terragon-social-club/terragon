import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ModalService } from '../modal.service';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements AfterViewInit {

  @ViewChild('dialogContent', { static: true }) dialogContent: ElementRef;

  constructor(public modalService: ModalService) { }

  ngAfterViewInit() {

  }

}
