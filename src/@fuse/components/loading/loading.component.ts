import { Component, Input, OnInit } from '@angular/core';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  @Input() body: string = 'Por favor, espere...';

  isLoading: boolean = false;

  constructor(private loadingModalService: LoadingService) {}

  ngOnInit(): void {
    this.loadingModalService.loadingStatus.subscribe(status => {
      this.isLoading = status;
    });
  }

}
