import { TreeItem } from "./nova_utils.ts";

export interface Element {
  toTreeItem: () => TreeItem;
  children: Element[];
  path?: string;
  uri?: string;
  shouldDisambiguate?: boolean;
}

export class Header implements Element {
  content: string;
  children: [];
  constructor(content: string) {
    this.content = content;
    this.children = [];
  }

  toTreeItem() {
    return new TreeItem(this.content);
  }
}
