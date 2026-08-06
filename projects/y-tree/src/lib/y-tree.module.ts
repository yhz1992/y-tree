import { NgModule } from '@angular/core';
import { YTreeComponent } from './y-tree.component';
import { IdToNodeInfoPipe } from './y-tree.pipe';

@NgModule({
	declarations: [YTreeComponent, IdToNodeInfoPipe],
	imports: [],
	exports: [YTreeComponent]
})
export class YTreeModule {}
