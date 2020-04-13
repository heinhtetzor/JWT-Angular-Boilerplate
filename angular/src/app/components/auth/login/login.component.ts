import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email : string;
  password : string;
  constructor(private authService:AuthService, private router:Router) { }

  ngOnInit(): void {
  }

  onClickLogin() : any {
    this.authService.login(this.email, this.password).subscribe((res:any) => {
      if(res.status == 200) {
        this.router.navigate(['/']);
      }
    })
  }
}
