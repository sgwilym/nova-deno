import { CompositeDisposable, nova } from "../nova_utils.ts";
import {
  registerLearnMore,
  registerOpen,
  registerRefresh,
  registerRun,
  registerRunAll,
} from "../commands/tests.sidebar.ts";
import TestsDataProvider from "./TestsDataProvider.ts";

export function registerTestsSidebar() {
  const testsDisposable = new CompositeDisposable();

  const dataProvider = new TestsDataProvider();
  testsDisposable.add(dataProvider.treeView);

  // It seems that Nova won't accept a more narrow glob, like the one in the Deno documentation.
  // https://deno.land/manual/testing#running-tests
  const GLOB = "*test.*";
  testsDisposable.add(
    nova.fs.watch(GLOB, () => {
      dataProvider.updateFiles(nova.workspace.path!);
      dataProvider.treeView.reload();
    }),
  );

  testsDisposable.add(registerLearnMore());
  testsDisposable.add(registerRefresh(dataProvider));
  testsDisposable.add(registerRun(dataProvider));
  testsDisposable.add(registerRunAll(dataProvider));
  testsDisposable.add(registerOpen(dataProvider));

  return testsDisposable;
}
