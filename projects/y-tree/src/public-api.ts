/*
 * Public API Surface of y-tree
 */

export * from './lib/y-tree.component';
export * from './lib/y-tree.module';
class Node<T> {
	data: T; // 节点数据
	prev: Node<T> | null; // 指向前一个节点的指针
	next: Node<T> | null; // 指向下一个节点的指针

	constructor(data: T) {
		this.data = data;
		this.prev = null;
		this.next = null;
	}
}

class DoublyLinkedList<T> {
	private head: Node<T> | null; // 链表的头节点
	private tail: Node<T> | null; // 链表的尾节点
	private nodeMap: Map<T, Node<T>>; // 哈希表，用于快速查找节点
	private _length: number; // 链表的长度

	constructor(initialData?: T[]) {
		this.head = null;
		this.tail = null;
		this._length = 0; // 使用私有属性
		this.nodeMap = new Map();

		// 如果提供了初始数组，则将其添加到链表中
		if (initialData) {
			for (const data of initialData) {
				this.append(data); // 使用 append 方法添加元素
			}
		}
	}

	// 在链表末尾添加节点
	append(data: T): void {
		const newNode = new Node(data);
		if (!this.head) {
			this.head = newNode; // 如果链表为空，设置头节点
			this.tail = newNode; // 设置尾节点
		} else {
			this.tail!.next = newNode; // 将当前尾节点的下一个指针指向新节点
			newNode.prev = this.tail; // 新节点的前一个指针指向当前尾节点
			this.tail = newNode; // 更新尾节点
		}
		this.nodeMap.set(data, newNode); // 将节点添加到哈希表
		this._length++; // 更新长度
	}

	// 在链表开头添加节点
	prepend(data: T): void {
		const newNode = new Node(data);
		if (!this.head) {
			this.head = newNode; // 如果链表为空，设置头节点
			this.tail = newNode; // 设置尾节点
		} else {
			newNode.next = this.head; // 新节点的下一个指针指向当前头节点
			this.head.prev = newNode; // 当前头节点的前一个指针指向新节点
			this.head = newNode; // 更新头节点
		}
		this.nodeMap.set(data, newNode); // 将节点添加到哈希表
		this._length++; // 更新长度
	}

	// 删除指定节点
	private delete(node: Node<T> | null): void {
		if (!node) return;

		if (node === this.head) {
			this.head = node.next; // 更新头节点
			if (this.head) {
				this.head.prev = null; // 更新新头节点的前一个指针
			}
		} else if (node === this.tail) {
			this.tail = node.prev; // 更新尾节点
			if (this.tail) {
				this.tail.next = null; // 更新新尾节点的下一个指针
			}
		} else {
			node.prev!.next = node.next; // 更新前一个节点的下一个指针
			node.next!.prev = node.prev; // 更新下一个节点的前一个指针
		}

		this.nodeMap.delete(node.data); // 从哈希表中删除节点
		this._length--; // 更新长度
	}

	// 查找指定元素，返回节点或 null
	find(data: T): Node<T> | null {
		return this.nodeMap.get(data) || null; // 从哈希表中查找节点
	}

	// 删除单个元素
	remove(data: T): void {
		const node = this.find(data); // 查找节点
		this.delete(node); // 删除节点
	}

	// 获取前一个元素
	getPrevious(data: T): T | null {
		const node = this.find(data);
		return node && node.prev ? node.prev.data : null; // 返回前一个节点的数据
	}

	// 获取后一个元素
	getNext(data: T): T | null {
		const node = this.find(data);
		return node && node.next ? node.next.data : null; // 返回后一个节点的数据
	}

	// forEach 遍历函数
	forEach(callback: (data: T) => void): void {
		let current = this.head;
		while (current) {
			callback(current.data); // 调用回调函数
			current = current.next; // 移动到下一个节点
		}
	}

	// 清空链表
	clear(): void {
		this.head = null; // 设置头节点为 null
		this.tail = null; // 设置尾节点为 null
		this._length = 0; // 设置长度为 0
		this.nodeMap.clear(); // 清空哈希表
	}

	// 获取链表长度（只读）
	get length(): number {
		return this._length; // 返回长度
	}

	// 打印链表
	print(): void {
		this.forEach(data => console.log(data)); // 使用 forEach 打印链表
	}
}

const grid = new DoublyLinkedList<number>([1, 2, 3, 4, 5]);
grid.append(6);
grid.prepend(0);
grid.remove(3);
grid.print();
