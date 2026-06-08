type Payload = { id: number; nome: string; departamento?: string };

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  items: Payload[] = [];
  end = false;
}

export class Trie {
  private root = new TrieNode();

  insert(key: string, payload: Payload) {
    const s = key.toLowerCase();
    let node = this.root;
    for (const ch of s) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
      node.items.push(payload);
    }
    node.end = true;
  }

  // busca por prefixo com uma árvore de prefixos
  searchPrefix(prefix: string, limit = 50): Payload[] {
    const s = prefix.toLowerCase();
    let node = this.root;
    for (const ch of s) {
      const next = node.children.get(ch);
      if (!next) return [];
      node = next;
    }
    // rastrea IDs já processados e evitar duplicatas na resposta
    const seen = new Set<number>();
    const out: Payload[] = [];
    for (const p of node.items) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        out.push(p);
        if (out.length >= limit) break;
      }
    }
    return out;
  }
}

export default Trie;
