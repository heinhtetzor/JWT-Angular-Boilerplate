import { Injectable } from '@angular/core';
import { WebrequestService } from './webrequest.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private webRequest:WebrequestService) { }

  getSessions() {
    return this.webRequest.get('getSessions');
  }
}
