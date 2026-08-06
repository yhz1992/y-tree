import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { YTreeModule } from 'y-tree';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, YTreeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
