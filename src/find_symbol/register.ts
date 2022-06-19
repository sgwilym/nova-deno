import { CompositeDisposable, LanguageClient } from "../nova_utils.ts";
import {
  registerPaletteFindSymbol,
  registerSidebarFindSymbol,
} from "../commands/symbols.sidebar.ts";
import SymbolDataProvider from "./SymbolDataProvider.ts";

export default function registerSymbolsSidebar(client: LanguageClient) {
  const symbolsDisposable = new CompositeDisposable();

  const dataProvider = new SymbolDataProvider();
  symbolsDisposable.add(dataProvider.treeView);

  symbolsDisposable.add(registerSidebarFindSymbol(client, dataProvider));
  symbolsDisposable.add(registerPaletteFindSymbol());

  return symbolsDisposable;
}
