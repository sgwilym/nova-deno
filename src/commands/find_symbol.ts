import {
  Disposable,
  LanguageClient,
  lspRangeToRange,
  nova,
  TextEditor,
  TreeDataProvider,
  TreeItem,
  TreeView,
  wrapCommand,
} from "../nova_utils.ts";
import { lsp } from "../../deps.ts";
let symbolDataProvider: SymbolDataProvider | null = null;

class Header {
  content: string;
  constructor(content: string) {
    this.content = content;
  }

  toTreeItem() {
    const item = new TreeItem(this.content);
    return item;
  }
}
class Symbol {
  name: string;
  type: string;
  location: lsp.Location;

  constructor(lspSymbol: lsp.SymbolInformation) {
    this.name = lspSymbol.name;
    this.type = this.#getType(lspSymbol);
    this.location = lspSymbol.location;
  }

  // This can maybe be moved to nova_utils.
  #getType(lspSymbol: lsp.SymbolInformation) {
    switch (lspSymbol.kind) {
      case 1: {
        return "file";
      }
      case 2: {
        // module
        return "package";
      }
      case 3: {
        // namespace
        // I don't know what this is.
        return "variable";
      }
      case 4: {
        return "package";
      }
      case 5: {
        return "class";
      }
      case 6: {
        return "method";
      }
      case 7: {
        return "property";
      }
      case 8: {
        // field
        // I also don't know what this is 🙁
        return "variable";
      }
      case 9: {
        return "constructor";
      }
      case 10: {
        return "enum";
      }
      case 11: {
        return "interface";
      }
      case 12: {
        return "function";
      }
      case 13: {
        return "variable";
      }
      case 14: {
        return "constant";
      }
      case 15: {
        // string
        // There doesn't seem to be an image that alludes to 15, 16, 17, 18, 19, 20 or 21 in particular.
        return "variable";
      }
      case 16: {
        // number
        return "variable";
      }
      case 17: {
        // boolean
        return "variable";
      }
      case 18: {
        // array
        return "variable";
      }
      case 19: {
        // object
        return "variable";
      }
      case 20: {
        // key
        return "variable";
      }
      case 21: {
        // null
        return "variable";
      }
      case 22: {
        // I don't know what this is, but it's mentioned in the Nova documentation.
        return "enum-member";
      }
      case 23: {
        return "struct";
      }
      case 24: {
        // event
        // I don't know what this is.
        return "variable";
      }
      case 25: {
        // operator
        return "expression";
      }
      case 26: {
        // type parameter
        return "type";
      }
      default: {
        return "variable";
      }
    }
  }

  toTreeItem() {
    const item = new TreeItem(this.name);
    item.image = "__symbol." + this.type;
    return item;
  }

  async show() {
    const uri = this.location.uri;
    const lspRange = this.location.range;

    const editor = await nova.workspace.openFile(uri);
    if (!editor) {
      // I think this only happens if the file isn't a text file.
      return;
    }
    const range = lspRangeToRange(editor.document, lspRange);
    editor.addSelectionForRange(range);
    editor.scrollToPosition(range.start);
  }
}
class SymbolDataProvider implements TreeDataProvider<Symbol | Header> {
  #treeView: TreeView<Symbol | Header>;
  #symbols: Symbol[];
  #currentQuery: string | null;
  #headerMessage: string | null;

  constructor() {
    this.#treeView = new TreeView("co.gwil.deno.sidebars.symbols.sections.1", {
      dataProvider: this,
    });
    this.#treeView.onDidChangeSelection(this.#onDidChangeSelection);

    this.#symbols = [];
    this.#headerMessage = null;
    this.#currentQuery = null;
  }

  #onDidChangeSelection(selectedElements: (Symbol | Header)[]) {
    if (selectedElements.length == 1) {
      const [element] = selectedElements;
      if (element instanceof Header) {
        return;
      }
      element.show();
    }
  }

  /**
   * Reload the TreeView. This is an alias. Its purpose is to make code prettier.
   */
  #reload() {
    return this.#treeView.reload();
  }

  #setSymbols(lspSymbols: lsp.SymbolInformation[]) {
    this.#symbols = lspSymbols.filter((lspSymbol) =>
      // is a file
      lspSymbol.location.uri.startsWith("file://")
    ).map(
      // turn into `Symbol`s
      (lspSymbol) => new Symbol(lspSymbol),
    );
    return this.#symbols;
  }

  displaySymbols(
    query: string,
    getSymbols: (query: string) => Promise<lsp.SymbolInformation[] | null>,
    textEditor: TextEditor,
  ) {
    this.#currentQuery = query;

    let disposable: Disposable | null = null;
    const updateSymbols = async () => {
      if (this.#currentQuery != query) {
        if (disposable) {
          // unregister the listener
          disposable.dispose();
        }
        return;
      }

      const symbols = await getSymbols(query) ?? [];
      const displayedSymbols = this.#setSymbols(symbols);

      if (displayedSymbols.length) {
        this.#headerMessage = `Results for '${query}':`;
      } else {
        this.#headerMessage = `No results found for '${query}':`;
      }
      this.#reload();
    };
    updateSymbols();

    disposable = textEditor.onDidStopChanging(updateSymbols);
  }

  getChildren(element: Symbol | null) {
    if (element == null) {
      // top-level
      const elements: (Symbol | Header)[] = [...this.#symbols]; // A copy needs to be made. Otherwise, we would edit the actual `this.#symbols`.
      if (this.#headerMessage) {
        elements.unshift(new Header(this.#headerMessage));
      }
      return elements;
    }
    return [];
  }

  getTreeItem(element: Symbol | Header) {
    return element.toTreeItem();
  }
}

export default function registerFindSymbol(client: LanguageClient) {
  return nova.commands.register(
    "co.gwil.deno.commands.find",
    wrapCommand(findSymbol),
  );

  async function findSymbol() {
    if (!symbolDataProvider) {
      symbolDataProvider = new SymbolDataProvider();
    }

    const query = await new Promise((resolve) =>
      nova.workspace.showInputPalette(
        "Type the name of a variable, class or function.",
        {},
        resolve,
      )
    ) as string | null | undefined;

    // This happens if the user exits the palette, for example, by pressing Escape.
    if (!query) return;

    const textEditor = nova.workspace.activeTextEditor;
    symbolDataProvider.displaySymbols(query, getSymbols, textEditor);

    async function getSymbols(query: string) {
      const params = { query };
      const response = await client.sendRequest(
        "workspace/symbol",
        params,
      ) as lsp.SymbolInformation[] | null;
      return response;
    }
  }
}
