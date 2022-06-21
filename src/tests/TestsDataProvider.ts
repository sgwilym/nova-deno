import {
  Color,
  ColorComponents,
  ColorFormat, // It is, actually, read. I think this message is due to a @ts-expect-error.
  nova,
  Process,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  TreeView,
} from "../nova_utils.ts";
import { Element, Header } from "../sidebars.ts";

class Test implements Element {
  name: string;
  passed: boolean;
  children: [];
  constructor(name: string, passed: boolean) {
    this.name = name;
    this.passed = passed;
    this.children = [];
  }

  toTreeItem() {
    const item = new TreeItem(this.name);
    // TODO item.identifier =
    // @ts-expect-error: ColorFormat is a value —not a type. TypeScript is complaining otherwise.
    const format = ColorFormat.rgb;

    const failedColorComponents: ColorComponents = [
      0.88671875,
      0.23828125,
      0.23828125,
      1,
    ];
    const passedColorComponents: ColorComponents = [
      0.30859375,
      0.91796875,
      0.20312500,
      1,
    ];

    item.color = new Color(
      format,
      this.passed ? passedColorComponents : failedColorComponents,
    );
    item.descriptiveText = this.passed ? "Passed" : "Failed";

    return item;
  }
}
export class UnexpectedLogError extends Error {}
export class TestFile implements Element {
  path: string;
  children: Element[];
  shouldDisambiguate: boolean;

  constructor(path: string, children: Element[], shouldDisambiguate: boolean) {
    this.path = path;
    this.children = children;
    this.shouldDisambiguate = shouldDisambiguate;
  }

  get filename(): string {
    return nova.path.basename(this.path);
  }

  get extension(): string {
    return nova.path.extname(this.path);
  }

  toTreeItem() {
    const relativePath: string = nova.workspace.relativizePath(this.path);
    const item = new TreeItem(
      this.shouldDisambiguate ? relativePath : this.filename,
    );

    item.image = "__filetype" + this.extension;
    item.collapsibleState = this.children.length
      ? TreeItemCollapsibleState.Expanded
      : TreeItemCollapsibleState.None;
    item.contextValue = "file";
    item.identifier = this.path;
    return item;
  }
}

export default class TestsDataProvider implements TreeDataProvider<Element> {
  // See https://deno.land/manual/testing#running-tests.
  static FILE_REGEXP = /^.*[_.]?test\.(ts|tsx|mts|js|mjs|jsx|cjs|cts)$/;
  treeView: TreeView<Element>;
  files: TestFile[];

  constructor() {
    this.treeView = new TreeView("co.gwil.deno.sidebars.tests.sections.1", {
      dataProvider: this,
    });
    this.files = [];

    if (nova.workspace.path) {
      this.updateFiles(nova.workspace.path);
    }
  }

  static findTests(directoryPath: string): string[] {
    function isAccessibleDirectory(path: string) {
      try {
        nova.fs.listdir(path);
      } catch {
        return false;
      }
      return true;
    }

    const tests: string[] = [];
    for (const name of nova.fs.listdir(directoryPath)) {
      const path = nova.path.join(directoryPath, name);
      if (isAccessibleDirectory(path)) {
        let internalTests = null;
        try {
          internalTests = TestsDataProvider.findTests(path);
        } catch {
          continue;
        }
        tests.push(...internalTests);
      } else if (name.match(TestsDataProvider.FILE_REGEXP)) {
        tests.push(path);
      }
    }

    return tests;
  }

  updateFiles(directoryPath: string) {
    const newPaths = TestsDataProvider.findTests(directoryPath);
    const existingPaths = this.files.map((file) => file.path);

    const toRemove: number[] = [];
    for (let i = 0; i < existingPaths.length; i++) {
      const path = existingPaths[i];
      if (!newPaths.includes(path)) {
        toRemove.push(i);
      }
    }
    this.files = this.files.filter((_value, index) =>
      !toRemove.includes(index)
    );

    for (const path of newPaths) {
      if (!this.files.find((file) => file.path == path)) {
        this.files.push(
          new TestFile(
            path,
            [],
            false, // TODO
          ),
        );
      }
    }

    // The above process is carried out instead of replacing the `this.files` property. I prefer this because it does not remove test results from the sidebar.
  }

  runTests() {
    if (!nova.workspace.path) {
      throw new Error("This function requires a workspace path.");
    }

    const paths = this.files.map((file) => file.path);

    const options = {
      args: ["deno", "test", "-A", ...paths],
      cwd: nova.workspace.path,
    };
    const denoProcess = new Process("/usr/bin/env", options);

    // This must be very fragile!
    const INTRODUCTION_REGEXP = /running (\d+) tests? from ([^]+)/;
    const TEST_REGEXP = /([^]+) \.\.\. (FAILED|ok) \(\d+[A-Za-z]+\)$/;
    const CONTROL_REGEXP =
      // deno-lint-ignore no-control-regex
      /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g;

    const output: TestFile[] = [];

    let loggingError: UnexpectedLogError | null = null;
    denoProcess.onStdout((line) => {
      // remove newline
      line = line.slice(0, -1);
      console.log(line);
      // remove control (?) characters that make output colorful
      line = line.replace(
        CONTROL_REGEXP,
        "",
      );
      const introduction = line.match(INTRODUCTION_REGEXP);
      const test = line.match(TEST_REGEXP);

      if (introduction) {
        const [, count, relativePath] = introduction;
        output.push(
          new TestFile(
            nova.path.normalize(
              nova.path.join(nova.workspace.path!, relativePath),
            ),
            count == "0" ? [new Header("No tests")] : [],
            false, // TODO
          ),
        );
      } else if (test) {
        const [, name, message] = test;
        const passed = message == "ok";

        const currentFile = output.at(-1);
        if (!currentFile) {
          if (!loggingError) {
            loggingError = new UnexpectedLogError(
              "Unexpected logging. Oops.",
            );
          }
          return;
        }
        currentFile.children.push(new Test(name, passed));
      }
    });

    const onExit = new Promise((resolve, reject) => {
      denoProcess.onDidExit(() => {
        // TODO: explore the dangers regarding tests that take long to execute
        this.files = output;
        if (loggingError) {
          reject(loggingError);
        } else {
          resolve(output);
        }
      });
    });

    denoProcess.start();
    return onExit;
  }

  getChildren(element: Element | null): Element[] {
    if (element == null) {
      if (nova.workspace.path) {
        return this.files;
      } else {
        return [new Header("Open a Deno project to see test results.")];
      }
    }
    return element.children;
  }

  getTreeItem(element: Element): TreeItem {
    return element.toTreeItem();
  }
}
