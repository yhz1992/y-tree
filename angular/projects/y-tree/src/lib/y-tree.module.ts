import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YTreeComponent } from './y-tree.component';
import { IdToNodeInfoPipe } from './y-tree.pipe';

@NgModule({
  declarations: [YTreeComponent, IdToNodeInfoPipe],
  imports: [CommonModule],
  exports: [YTreeComponent],
})
export class YTreeModule {}
