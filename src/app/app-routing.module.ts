import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HeroComponent } from './hero/hero.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  { path: '', component: HeroComponent },
  { path: 'signup/founding', component: SignupComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
