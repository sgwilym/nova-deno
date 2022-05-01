import {
  LanguageClient,
  lspRangeToRange,
  NotificationRequest,
  nova,
  TreeDataProvider,
  TreeItem,
  TreeView,
  wrapCommand,
} from "../nova_utils.ts";
import { lsp } from "../../deps.ts";
let symbolDataProvider: SymbolDataProvider | null = null;

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
class SymbolDataProvider implements TreeDataProvider<Symbol> {
  treeView: TreeView<Symbol>;
  symbols: Symbol[];
  constructor() {
    this.treeView = new TreeView("co.gwil.deno.sidebars.symbols.sections.1", {
      dataProvider: this,
    });
    this.treeView.onDidChangeSelection((selectedElements) => {
      if (selectedElements.length == 1) {
        const [element] = selectedElements;
        element.show();
      }
    });

    this.symbols = [];
  }

  getChildren(element: Symbol | null) {
    if (element == null) {
      // top-level
      return this.symbols;
    }
    return [];
  }

  getTreeItem(element: Symbol) {
    return element.toTreeItem();
  }
}

function provideDetailsInSidebar(symbols: lsp.SymbolInformation[]) {
  if (!symbolDataProvider) {
    symbolDataProvider = new SymbolDataProvider();
  }

  const sidebarSymbols = symbols.filter((lspSymbol) =>
    // is a file
    lspSymbol.location.uri.startsWith("file://")
  ).map(
    // turn into `Symbol`s
    (lspSymbol) => new Symbol(lspSymbol),
  );

  symbolDataProvider.symbols = sidebarSymbols;
  symbolDataProvider.treeView.reload();
}

export default function registerFindSymbol(client: LanguageClient) {
  return nova.commands.register(
    "co.gwil.deno.commands.find",
    wrapCommand(findSymbol),
  );

  async function findSymbol() {
    const query = await new Promise((resolve) =>
      nova.workspace.showInputPalette(
        "Type the name of a variable, class or function.",
        {},
        resolve,
      )
    );

    // This happens if the user exits the palette, for example, by pressing Escape.
    if (!query) return;

    const params = { query };
    const response = await client.sendRequest(
      "workspace/symbol",
      params,
    ) as lsp.SymbolInformation[] | null;

    if (response?.length) {
      provideDetailsInSidebar(response);
    } else {
      const failureNotificationReq = new NotificationRequest(
        "co.gwil.deno.notifications.failedToFindSymbol",
      );
      failureNotificationReq.title = "The symbol could not be found.";
      nova.notifications.add(failureNotificationReq);
    }
  }
}
