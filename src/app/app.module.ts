import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MastheadComponent } from './masthead/masthead.component';
import { TickerComponent } from './masthead/ticker/ticker.component';
import { WatermarkComponent } from './watermark/watermark.component';
import { HeroComponent } from './hero/hero.component';
import { SignupComponent } from './signup/signup.component';

import { environment } from '../environments/environment';

import { CouchDB as OpenCouchDB } from '@mkeen/rxcouch';

import { PlyrModule } from 'ngx-plyr';
import { LoginService } from './login.service';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    MastheadComponent,
    TickerComponent,
    WatermarkComponent,
    HeroComponent,
    SignupComponent,
    LoginComponent,
    ProfileComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PlyrModule,
    FormsModule,
  ],
  providers: [LoginService],
  bootstrap: [AppComponent]
})
export class AppModule { }
