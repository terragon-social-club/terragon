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
import { PlyrModule } from 'ngx-plyr';
import { LoginService } from './login.service';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { CookieService } from 'ngx-cookie-service';
import { ModalComponent } from './modal/modal/modal.component';
import { ModalService } from './modal/modal.service';

import { WebcamModule } from 'ngx-webcam';

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
    FooterComponent,
    HomeComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PlyrModule,
    FormsModule,
    WebcamModule
  ],
  providers: [LoginService, CookieService, ModalService],
  bootstrap: [AppComponent]
})
export class AppModule { }
