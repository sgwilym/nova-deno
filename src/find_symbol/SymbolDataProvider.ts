import {
  Disposable,
  lspRangeToRange,
  nova,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  TreeView,
} from "../nova_utils.ts";
import { lsp } from "../../deps.ts";
import { Element, Header } from "../sidebars.ts";

function getFilename(uri: string) {
  return decodeURIComponent(uri).split("/").pop()!;
}
class File implements Element {
  uri: string;
  extension: string;
  children: Symbol[];
  shouldDisambiguate: boolean;

  constructor(uri: string, children: Symbol[], shouldDisambiguate: boolean) {
    this.uri = uri;
    this.extension = uri.split(".").pop()!;
    this.children = children;
    this.shouldDisambiguate = shouldDisambiguate;
  }

  get filename(): string {
    return getFilename(this.uri);
  }

  toTreeItem() {
    const path = decodeURIComponent(this.uri.slice(this.uri.indexOf(":") + 1));
    const relativePath: string = nova.workspace.relativizePath(path);
    const item = new TreeItem(
      this.shouldDisambiguate ? relativePath : this.filename,
    );

    item.image = "__filetype." + this.extension;
    item.collapsibleState = TreeItemCollapsibleState.Expanded;
    return item;
  }
}
class Symbol implements Element {
  name: string;
  type: string;
  children: [];
  private getLocation: () => lsp.Location;
  constructor(
    lspSymbol: lsp.SymbolInformation,
    getLocation: () => lsp.Location,
  ) {
    this.name = lspSymbol.name;
    this.type = this.getType(lspSymbol);
    this.getLocation = getLocation;
    this.children = [];
  }

  // This can maybe be moved to nova_utils.
  private getType(lspSymbol: lsp.SymbolInformation) {
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
    const uri = this.getLocation().uri;
    const lspRange = this.getLocation().range;

    const editor = await nova.workspace.openFile(uri);
    if (!editor) {
      // I think this only happens if the file isn't a text file.
      return;
    }
    const range = lspRangeToRange(editor.document, lspRange);
    editor.selectedRange = range;
    editor.scrollToPosition(range.start);
  }
}
export default class SymbolDataProvider implements TreeDataProvider<Element> {
  treeView: TreeView<Element>;

  // The locations need to be stored separately to enable the sidebar to reload infrequently.
  private locations: Map<number, lsp.Location>;
  private files: File[];

  private previousNames: string[] | undefined;

  private currentQuery: string | null;
  private headerMessage: string | null;

  constructor() {
    this.treeView = new TreeView("co.gwil.deno.sidebars.symbols.sections.1", {
      dataProvider: this,
    });
    this.treeView.onDidChangeSelection(this.onDidChangeSelection);

    this.locations = new Map();
    this.files = [];

    this.headerMessage = null;
    this.currentQuery = null;
  }

  private onDidChangeSelection(selectedElements: (Element)[]) {
    if (selectedElements.length == 1) {
      const [element] = selectedElements;
      if (!(element instanceof Symbol)) {
        return;
      }
      element.show();
    }
  }

  /**
   * Reload the TreeView. This is an alias. Its purpose is to make code prettier.
   */
  private reload() {
    return this.treeView.reload();
  }

  private setSymbols(
    lspSymbols: lsp.SymbolInformation[],
    didQueryChange: boolean,
  ) {
    this.locations.clear();

    const symbolMap = new Map<string, Symbol[]>();
    const names: string[] = [];
    const oldNames = this.previousNames ?? [];

    let index = 0;
    for (const lspSymbol of lspSymbols) {
      const { uri } = lspSymbol.location;
      if (uri.startsWith("file://")) {
        this.locations.set(index, lspSymbol.location);

        // We need to make a copy because `index` otherwise evaluates (usually, if not always) to the value to which it is bound at the end of the loop, rather than to the value to which it is bound at the time at which this code runs. I was very amazed by this behavior. Let me know if you, the reader, expected it.
        const index1 = index;
        const symbol = new Symbol(lspSymbol, () => this.locations.get(index1)!);
        symbolMap.set(uri, [
          ...(symbolMap.get(uri) ?? []),
          symbol,
        ]);
        names.push(symbol.name);

        index++;
      }
    }

    const seenFilenames: string[] = [];
    const ambiguousFilenames: string[] = [];
    for (const [uri] of symbolMap) {
      const filename = getFilename(uri);
      if (seenFilenames.includes(filename)) {
        ambiguousFilenames.push(filename);
      }
      seenFilenames.push(filename);
    }

    const files: File[] = [];
    for (const [uri, symbols] of symbolMap) {
      const filename = getFilename(uri);
      files.push(
        new File(uri, symbols, ambiguousFilenames.includes(filename)),
      );
    }

    this.files = files;
    if (this.files.length) {
      this.headerMessage = `Results for '${this.currentQuery}':`;
    } else {
      this.headerMessage = `No results found for '${this.currentQuery}'.`;
    }

    function zip<Type>(...arrays: (Type[])[]): (Type[])[] {
      const lengths = arrays.map((array) => array.length);
      const largestArray = arrays[lengths.indexOf(Math.max(...lengths))];
      return largestArray.map((_item, index) =>
        arrays.map((item) => item[index])
      );
    }

    // We need to reload if the query changes in order to keep the `headerMessage` accurate.
    let shouldReload = didQueryChange;
    for (const [newName, oldName] of zip(names, oldNames)) {
      if (shouldReload) {
        break;
      }
      if (newName != oldName) {
        shouldReload = true;
      }
    }

    if (shouldReload) {
      this.reload();
    }
    this.previousNames = names;
  }

  displaySymbols(
    query: string,
    getSymbols: (query: string) => Promise<lsp.SymbolInformation[] | null>,
  ) {
    let didQueryChange = true;
    this.currentQuery = query;

    /**
     * Create an event listener and remove it after the search query changes.
     */
    const updateSymbolsAndManageDisposable = (
      createEventListener: (callback: () => void) => Disposable,
    ) => {
      let disposable: Disposable | null = null;
      const updateSymbols = async () => {
        if (this.currentQuery != query) {
          if (disposable) {
            // unregister the listener
            disposable.dispose();
          }
          return;
        }

        const symbols = await getSymbols(query) ?? [];
        this.setSymbols(symbols, didQueryChange);
        didQueryChange = false;
      };
      updateSymbols();

      disposable = createEventListener(updateSymbols);
    };

    nova.workspace.onDidAddTextEditor((textEditor) =>
      updateSymbolsAndManageDisposable(
        textEditor.onDidStopChanging.bind(textEditor),
      )
    );
  }

  getChildren(element: Element | null) {
    if (element == null) {
      // top-level

      // A copy needs to be made. Otherwise, we would edit the actual `this.files`.
      const elements: Element[] = [...this.files];

      if (this.headerMessage) {
        elements.unshift(new Header(this.headerMessage));
      }
      return elements;
    }
    return element.children;
  }

  getTreeItem(element: Element) {
    return element.toTreeItem();
  }
}
