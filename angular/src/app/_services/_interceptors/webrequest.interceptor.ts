import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable()
export class WebrequestInterceptor implements HttpInterceptor {

  constructor(private authService:AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let accessToken = localStorage.getItem('x-access-token');
    if(accessToken) {
      request = request.clone({
        setHeaders : {
          'x-access-token' : accessToken
        }
      })
    }
    return next.handle(request).pipe(
      catchError((error : HttpErrorResponse ) => {
        if(error.status === 401) {
          
          if(error.error.message === 'jwt expired') {
             //authService call to refreshtoken route
            this.authService.refreshAccessToken().subscribe((res:any) => {

                let token = res.accessToken;
                localStorage.setItem('x-access-token', token);
                request = request.clone({
                  setHeaders : {
                    'x-access-token' : accessToken
                  }

                });
                return next.handle(request);
              
            })
          }
          else {
            console.log('expired error');
            
          }
        } 
        else {
          console.log('error from 401 ');
          
        }
        return throwError(error);
      })
    )
  }
}
