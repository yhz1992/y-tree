import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { YTreeModule } from 'y-tree';

import { DemoCardComponent } from './demo/demo-card.component';
import { SidebarComponent } from './demo/sidebar.component';
import { BasicGroupComponent } from './demo/groups/basic-group.component';
import { StateGroupComponent } from './demo/groups/state-group.component';
import { InteractionGroupComponent } from './demo/groups/interaction-group.component';
import { AsyncGroupComponent } from './demo/groups/async-group.component';
import { CheckGroupComponent } from './demo/groups/check-group.component';
import { EditGroupComponent } from './demo/groups/edit-group.component';
import { DragGroupComponent } from './demo/groups/drag-group.component';
import { PerfGroupComponent } from './demo/groups/perf-group.component';

@NgModule({
  declarations: [
    AppComponent,
    DemoCardComponent,
    SidebarComponent,
    BasicGroupComponent,
    StateGroupComponent,
    InteractionGroupComponent,
    AsyncGroupComponent,
    CheckGroupComponent,
    EditGroupComponent,
    DragGroupComponent,
    PerfGroupComponent,
  ],
  imports: [BrowserModule, CommonModule, FormsModule, YTreeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
