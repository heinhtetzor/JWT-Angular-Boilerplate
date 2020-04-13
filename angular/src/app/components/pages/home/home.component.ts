import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { Router } from '@angular/router';
import { HomeService } from 'src/app/_services/home.service';
import { SessionModel } from 'src/app/models/SessionModel.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  sessions : SessionModel[];
  currentSession : string;
  constructor(private authService:AuthService, private router:Router, private homeService:HomeService) { }

  ngOnInit(): void {
    this.getSessions(); 
    this.getCurrentSession();
  }

  onClickLogout() : void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  getSessions() {
    this.homeService.getSessions().subscribe((res:any) => {
      this.sessions = res[0].sessions;
      console.log(res[0].sessions)
    })
  }
  getCurrentSession() {
    this.currentSession = this.authService.getCurrentSession();
  }
}
