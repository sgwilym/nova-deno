import {
  Configuration,
  Disposable,
  LanguageClient,
  lspRangeToRange,
  NotificationRequest,
  nova,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  TreeView,
  wrapCommand,
} from "../nova_utils.ts";
import { lsp } from "../../deps.ts";
let symbolDataProvider: SymbolDataProvider | null = null;

interface ElementConversionOptions {
  shouldDisambiguate?: boolean;
}
interface Element {
  toTreeItem: (options: ElementConversionOptions) => TreeItem;
  children: Element[];
}
class File implements Element {
  uri: string;
  extension: string;
  children: Symbol[];
  constructor(uri: string, children: Symbol[]) {
    this.uri = uri;
    this.extension = uri.split(".").pop()!;
    this.children = children;
  }

  get filename(): string {
    return decodeURIComponent(this.uri).split("/").pop()!;
  }

  toTreeItem(
    { shouldDisambiguate }: ElementConversionOptions = {},
  ) {
    const path = decodeURIComponent(this.uri.slice(this.uri.indexOf(":") + 1));
    const relativePath: string = nova.workspace.relativizePath(path);
    const item = new TreeItem(
      shouldDisambiguate ? relativePath : this.filename,
    );

    item.image = "__filetype." + this.extension;
    item.collapsibleState = TreeItemCollapsibleState.Expanded;
    return item;
  }
}
class Header implements Element {
  content: string;
  children: [];
  constructor(content: string) {
    this.content = content;
    this.children = [];
  }

  toTreeItem() {
    const item = new TreeItem(this.content);
    return item;
  }
}
class Symbol implements Element {
  name: string;
  type: string;
  location: lsp.Location;
  children: [];
  constructor(lspSymbol: lsp.SymbolInformation) {
    this.name = lspSymbol.name;
    this.type = this.getType(lspSymbol);
    this.location = lspSymbol.location;
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
    const uri = this.location.uri;
    const lspRange = this.location.range;

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
class SymbolDataProvider implements TreeDataProvider<Element> {
  private treeView: TreeView<Element>;

  /**
   * This property maps file URIs to `Symbol` objects whose location they contain.
   */
  private symbols: Map<string, Symbol[]>;
  private names: string[] | undefined;
  private files: File[];
  private currentQuery: string | null;
  private headerMessage: string | null;
  private ambiguousFilenames: string[];

  constructor() {
    this.treeView = new TreeView("co.gwil.deno.sidebars.symbols.sections.1", {
      dataProvider: this,
    });
    this.treeView.onDidChangeSelection(this.onDidChangeSelection);

    this.symbols = new Map();
    this.files = [];
    this.ambiguousFilenames = [];

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
    /**
     * This function takes several arrays. It maps each element of the first array to all elements among the arrays whose index is the same.
     *
     * For example,
     * ```js
     * zip([1, 2, 3], [2, 4, 6])
     * ```
     * produces
     * ```js
     * [[1, 2], [2, 4], [3, 6]]
     * ```
     * .
     */
    function zip<Type>(...arrays: (Type[])[]): (Type[])[] {
      const lengths = arrays.map((array) => array.length);
      const largestArray = arrays[lengths.indexOf(Math.max(...lengths))];
      return largestArray.map((_item, index) =>
        arrays.map((item) => item[index])
      );
    }
    const names = [];
    const oldNames = [...(this.names ?? [])];

    this.symbols.clear();

    const seenFilenames: string[] = [];
    const duplicateFilenames = [];

    const files = [];

    for (const lspSymbol of lspSymbols) {
      // add members to `this.symbols`
      if (lspSymbol.location.uri.startsWith("file://")) {
        const symbol = new Symbol(lspSymbol);

        // store each name
        names.push(symbol.name);

        const { uri } = symbol.location;
        this.symbols.set(
          uri,
          [...(this.symbols.get(uri) ?? []), symbol],
        );
      }
    }

    this.names = names;
    // The value of `this.symbols` is already set by the time this code runs.

    for (const uri of this.symbols.keys()) {
      // create `File` objects for each URI
      const file = new File(uri, this.symbols.get(uri)!);
      files.push(file);

      // find duplicates…
      if (seenFilenames.includes(file.filename)) {
        duplicateFilenames.push(file.filename);
      }
      // …by keeping track of all the filenames
      seenFilenames.push(file.filename);
    }

    this.files = files;
    this.ambiguousFilenames = duplicateFilenames;

    if (this.symbols.size) {
      this.headerMessage = `Results for '${this.currentQuery}':`;
    } else {
      this.headerMessage = `No results found for '${this.currentQuery}'.`;
    }

    // We need to reload if the query changes in order to keep the `headerMessage` accurate.
    let shouldReload = didQueryChange;
    for (const [newName, oldName] of zip(names, oldNames)) {
      if (shouldReload) {
        break;
      }

      // If the symbols aren't in the same order, there's a need for reloading.
      if (newName != oldName) {
        shouldReload = true;
      }
    }

    if (shouldReload) {
      this.reload();
    }
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
    const options: ElementConversionOptions = {
      shouldDisambiguate: element instanceof File &&
        this.ambiguousFilenames.includes(element.filename),
    };
    return element.toTreeItem(options);
  }
}

export default function registerFindSymbol(client: LanguageClient) {
  return nova.commands.register(
    "co.gwil.deno.sidebars.symbols.commands.find",
    wrapCommand(findSymbol),
  );

  async function findSymbol() {
    if (!symbolDataProvider) {
      symbolDataProvider = new SymbolDataProvider();
    }

    if (
      // @ts-expect-error: The Nova types are outdated.
      !(nova.workspace.context as Configuration).get("shouldDisplayFeatures")
    ) {
      const failureNotificationReq = new NotificationRequest(
        "co.gwil.deno.notifications.findSymbolUnavailable",
      );
      failureNotificationReq.title = "Find Symbol is unavailable.";
      failureNotificationReq.body =
        "Open a TypeScript, JavaScript, JSX or TSX file.";
      nova.notifications.add(failureNotificationReq);
      return;
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

    symbolDataProvider.displaySymbols(query, getSymbols);

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
