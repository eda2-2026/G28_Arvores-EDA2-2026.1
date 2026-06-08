class AvlNode<T> {
    key: string;
    values: T[];
    height: number;
    left: AvlNode<T> | null;
    right: AvlNode<T> | null;
  
    constructor(key: string, value: T) {
      this.key = key;
      this.values = [value];
      this.height = 1;
      this.left = null;
      this.right = null;
    }
  }
  
  export class AvlTree<T> {
    private root: AvlNode<T> | null = null;
  
    private height(node: AvlNode<T> | null): number {
      return node ? node.height : 0;
    }
  
    private getBalance(node: AvlNode<T> | null): number {
      return node ? this.height(node.left) - this.height(node.right) : 0;
    }
  
    private rotateRight(y: AvlNode<T>): AvlNode<T> {
      const x = y.left!;
      const temp = x.right;
  
      x.right = y;
      y.left = temp;
  
      y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
      x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
  
      return x;
    }
  
    private rotateLeft(x: AvlNode<T>): AvlNode<T> {
      const y = x.right!;
      const temp = y.left;
  
      y.left = x;
      x.right = temp;
  
      x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
      y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
  
      return y;
    }
  
    insert(key: string, value: T): void {
      this.root = this.insertNode(this.root, key.toLowerCase(), value);
    }
  
    private insertNode(
      node: AvlNode<T> | null,
      key: string,
      value: T,
    ): AvlNode<T> {
      if (!node) return new AvlNode(key, value);
  
      if (key < node.key) {
        node.left = this.insertNode(node.left, key, value);
      } else if (key > node.key) {
        node.right = this.insertNode(node.right, key, value);
      } else {
        node.values.push(value);
        return node;
      }
  
      node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;
  
      const balance = this.getBalance(node);
  
      if (balance > 1 && key < node.left!.key) return this.rotateRight(node);
      if (balance < -1 && key > node.right!.key) return this.rotateLeft(node);
  
      if (balance > 1 && key > node.left!.key) {
        node.left = this.rotateLeft(node.left!);
        return this.rotateRight(node);
      }
  
      if (balance < -1 && key < node.right!.key) {
        node.right = this.rotateRight(node.right!);
        return this.rotateLeft(node);
      }
  
      return node;
    }
  
    search(key: string): T[] {
      let current = this.root;
      const normalizedKey = key.toLowerCase();
  
      while (current) {
        if (normalizedKey === current.key) return current.values;
        if (normalizedKey < current.key) current = current.left;
        else current = current.right;
      }
  
      return [];
    }
  
    searchPrefix(prefix: string): T[] {
      const result: T[] = [];
      const normalizedPrefix = prefix.toLowerCase();
  
      this.inOrderPrefix(this.root, normalizedPrefix, result);
  
      return result;
    }
  
    private inOrderPrefix(
      node: AvlNode<T> | null,
      prefix: string,
      result: T[],
    ): void {
      if (!node) return;
  
      this.inOrderPrefix(node.left, prefix, result);
  
      if (node.key.startsWith(prefix)) {
        result.push(...node.values);
      }
  
      this.inOrderPrefix(node.right, prefix, result);
    }
  
    remove(key: string): void {
      const values = this.search(key);
  
      if (values.length === 0) return;
  
      this.root = this.removeNode(this.root, key.toLowerCase());
    }
  
    private removeNode(
      node: AvlNode<T> | null,
      key: string,
    ): AvlNode<T> | null {
      if (!node) return null;
  
      if (key < node.key) {
        node.left = this.removeNode(node.left, key);
      } else if (key > node.key) {
        node.right = this.removeNode(node.right, key);
      } else {
        if (!node.left || !node.right) {
          return node.left || node.right;
        }
  
        const successor = this.getMinValueNode(node.right);
        node.key = successor.key;
        node.values = successor.values;
        node.right = this.removeNode(node.right, successor.key);
      }
  
      node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;
  
      const balance = this.getBalance(node);
  
      if (balance > 1 && this.getBalance(node.left) >= 0) {
        return this.rotateRight(node);
      }
  
      if (balance > 1 && this.getBalance(node.left) < 0) {
        node.left = this.rotateLeft(node.left!);
        return this.rotateRight(node);
      }
  
      if (balance < -1 && this.getBalance(node.right) <= 0) {
        return this.rotateLeft(node);
      }
  
      if (balance < -1 && this.getBalance(node.right) > 0) {
        node.right = this.rotateRight(node.right!);
        return this.rotateLeft(node);
      }
  
      return node;
    }
  
    private getMinValueNode(node: AvlNode<T>): AvlNode<T> {
      let current = node;
  
      while (current.left) {
        current = current.left;
      }
  
      return current;
    }
  }