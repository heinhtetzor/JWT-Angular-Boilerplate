import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent, HomeComponent } from './components';
import { AuthGuard } from './_helpers/auth.guard';
import { AuthService } from './_services/auth.service';

const routes: Routes = [
  {
    path : 'login',
    component : LoginComponent
  },
  {
     path : '',
     component : HomeComponent,
    canActivate : [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
