import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebrequestService } from './webrequest.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
    constructor(private router:Router, private webRequest:WebrequestService) {}

    login(email:string, password:string) {
      
      return this.webRequest.login(email, password).pipe(
        tap((res:any) => {
          this.setSession(res.body._id, res.headers.get('x-access-token'), res.headers.get('x-refresh-token'));
          console.log('LOGGED IN');
        })
      );
    }
   logout () {
     let token = localStorage.getItem('x-refresh-token');
     let userId = localStorage.getItem('user-id');
    //  console.log(userId);
     this.removeSession();
     
      this.webRequest.post('removesession', { token , userId}).subscribe((res:any) =>  {
        if(res.status == 200) {
          this.router.navigate(['/login']);
        }
      })
    }
    isLoggedIn() : boolean {
      let userId = localStorage.getItem('user-id');
      // console.log(userId);
      
      if(userId == null) {
        return false;
      }
      else {
        return true;
      }
    }
    getCurrentSession() {
      return localStorage.getItem('x-refresh-token');
    }
    refreshAccessToken() {
      return this.webRequest.refreshAccessToken();
    }
    private setSession(userId:string, accessToken:string, refreshToken:string) {
      localStorage.setItem('user-id', userId);
      localStorage.setItem('x-access-token', accessToken);   
      localStorage.setItem('x-refresh-token', refreshToken);
    }
    private removeSession() {
      localStorage.removeItem('user-id');
      localStorage.removeItem('x-access-token');
      localStorage.removeItem('x-refresh-token');
    }

}
