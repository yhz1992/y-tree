import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'idToNodeInfo' })
export class IdToNodeInfoPipe implements PipeTransform {
	/**
	 * 根据节点id获取节点信息
	 * @param id 节点id
	 * @param nodes 节点集合
	 */
	transform(id: string | number, nodes: Map<string | number, any>) {
		return nodes.get(id);
	}
}
