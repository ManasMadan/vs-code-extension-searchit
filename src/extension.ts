import * as vscode from "vscode";
import { ExtensionModel, ISortTypes } from "./extension-model";
import { posix } from "path";
import { AppPageHtml } from "./app-page";
import OpenAI from "openai";
import { Converter } from "showdown";

const openai = new OpenAI({
  apiKey: "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", // defaults to process.env["OPENAI_API_KEY"]
});

export function activate(context: vscode.ExtensionContext) {
  // StackOverFlow
  let searchStackoverflow = vscode.commands.registerCommand(
    "extension.searchStackoverflow",
    () => {
      // Search options
      const searchOptions: vscode.InputBoxOptions = {
        placeHolder: "Search Stackoverflow",
        prompt: "*Required",
      };

      // Show Input
      vscode.window
        .showInputBox(searchOptions)
        .then((searchQuery: string | undefined) => {
          if (searchQuery) {
            openStackOverFlowWeb(context, searchQuery);
          }
        });
    }
  );
  let searchStackoverflowSelection = vscode.commands.registerCommand(
    "extension.searchStackoverflowSelection",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("Editor Not Found");
        return;
      }

      const selection = editor.document.getText(editor.selection);
      if (!selection.trim().length) {
        vscode.window.showErrorMessage("Not Text Selected");
        return;
      }
      openStackOverFlowWeb(context, selection);
    }
  );
  let searchStackoverflowErrors = vscode.commands.registerCommand(
    "extension.searchStackoverflowErrors",
    () => {
      let allDiagnostics = vscode.languages.getDiagnostics();
      let allErrorMessages: string[] = [];

      // append every error to allErrorMessages
      allDiagnostics.forEach((value) => {
        value[1].forEach((value) => {
          let error: string = value.message;
          if (value.source !== undefined) {
            error += " " + value.source;
          }

          allErrorMessages.push(error);
        });
      });
      // Check if there are any errors
      if (allErrorMessages.length === 0) {
        return vscode.window.showInformationMessage(
          "There are currently no errors!"
        );
      }

      vscode.window.showQuickPick(allErrorMessages).then((selection) => {
        if (selection !== undefined) {
          if (!selection.trim().length) {
            return vscode.window.showInformationMessage(selection);
          }
          openStackOverFlowWeb(context, selection);
        }
      });
    }
  );

  // Chat GPT
  let searchGPT = vscode.commands.registerCommand("extension.searchGPT", () => {
    // Search options
    const searchOptions: vscode.InputBoxOptions = {
      placeHolder: "Ask ChatGPT",
      prompt: "*Required",
    };

    // Show Input
    vscode.window
      .showInputBox(searchOptions)
      .then((searchQuery: string | undefined) => {
        if (searchQuery) {
          openChatGPTWeb(context, searchQuery);
        }
      });
  });
  let searchGPTWithSelectionContext = vscode.commands.registerCommand(
    "extension.searchGPTWithSelectionContext",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("Editor Not Found");
        return;
      }

      const selection = editor.document.getText(editor.selection);
      if (!selection.trim().length) {
        vscode.window.showErrorMessage("Not Text Selected");
        return;
      }
      openChatGPTWeb(context, selection);
    }
  );

  context.subscriptions.push(searchStackoverflow);
  context.subscriptions.push(searchStackoverflowSelection);
  context.subscriptions.push(searchStackoverflowErrors);
  context.subscriptions.push(searchGPT);
  context.subscriptions.push(searchGPTWithSelectionContext);
}
function openChatGPTWeb(context: vscode.ExtensionContext, query: string) {
  // Create webview panel
  // Create webview panel
  var converter = new Converter();

  const stackoverflowPanel = createWebViewPanel(
    `Chat GPT: ${query}`,
    context.extensionPath
  );

  const chatCompletion = openai.chat.completions.create({
    messages: [{ role: "user", content: query }],
    model: "gpt-3.5-turbo",
  });
  let queryHTML = converter.makeHtml("#" + query);

  stackoverflowPanel.webview.html = `
    <body>
    ${queryHTML} 
    <hr>
    <p style="font-size:24px">Loading Response...</p> 
    </body>`;
  chatCompletion.then((chat) => {
    let responseHTML = converter.makeHtml(
      chat.choices[0].message.content || "No Response"
    );
    stackoverflowPanel.webview.html = `<html lang="en">
    <head>
    <title>Document</title>
    </head>
    <body>
    ${queryHTML} 
    <hr>
    <p style="font-size:30px">
    ${responseHTML}
    </p>
    </body>
    </html>`;
  });
}

function openStackOverFlowWeb(
  context: vscode.ExtensionContext,
  selection: string
) {
  const currentLanguageSelection = vscode.workspace
    .getConfiguration()
    .get("stackoverflow.view.language");
  // Get sort type - set isSelected property
  const currentSortSelection = vscode.workspace
    .getConfiguration()
    .get("stackoverflow.view.sort");
  ExtensionModel.sortTypes.find((element: ISortTypes) => {
    const labelIsEqualToSelectedSortType =
      element.label === currentSortSelection;
    element.isSelected = labelIsEqualToSelectedSortType;
    return labelIsEqualToSelectedSortType;
  });

  // Create webview panel
  const stackoverflowPanel = createWebViewPanel(
    `Stack Over Flow: ${selection}`,
    context.extensionPath
  );
  // Set webview - svelte - built to ./app/public/*
  stackoverflowPanel.webview.html = AppPageHtml(context.extensionPath);
  // Post search term, read in App.svelte as window.addEventListener("message"
  stackoverflowPanel.webview.postMessage({
    action: "search",
    query: selection,
    language: currentLanguageSelection,
    sortTypes: ExtensionModel.sortTypes,
  });

  // Show progress loader
  showWindowProgress(
    stackoverflowPanel,
    `Loading Stackoverflow Search Results`
  );

  // Listen for changes to window title
  changeWindowTitle(stackoverflowPanel);
}

function createWebViewPanel(
  panelTitle: string,
  path: string
): vscode.WebviewPanel {
  return vscode.window.createWebviewPanel(
    "webview",
    panelTitle,
    vscode.ViewColumn.Beside,
    {
      localResourceRoots: [vscode.Uri.file(posix.join(path, "app", "public"))],
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );
}

function showWindowProgress(panel: vscode.WebviewPanel, title: string) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: title,
    },
    (progress, token) => {
      // Resolve once GET is complete
      // message has command: "progress", action: "stop" | "start"
      const progressPromise = new Promise<void>((resolve) => {
        panel.webview.onDidReceiveMessage((message) => {
          if (message.command === "progress") {
            switch (message.action) {
              case "start":
                progress.report({ message: "Loading Stackoverflow Article" });
                break;
              case "stop":
                resolve();
                break;
            }
          }

          if (message.error) {
            vscode.window.showErrorMessage(message.errorMessage);
          }
        });
      });

      return progressPromise;
    }
  );
}

function changeWindowTitle(panel: vscode.WebviewPanel) {
  panel.webview.onDidReceiveMessage((message) => {
    if (message.command === "titleChange") {
      panel.title = message.title;
    }
  });
}

export function deactivate() {}
