import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MastheadComponent } from './masthead/masthead.component';
import { TickerComponent } from './masthead/ticker/ticker.component';
import { WatermarkComponent } from './watermark/watermark.component';
import { HeroComponent } from './hero/hero.component';
import { SignupComponent } from './signup/signup.component';

import { PlyrModule } from 'ngx-plyr';

@NgModule({
  declarations: [
    AppComponent,
    MastheadComponent,
    TickerComponent,
    WatermarkComponent,
    HeroComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PlyrModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
