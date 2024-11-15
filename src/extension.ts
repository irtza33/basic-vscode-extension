import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface Config {
  welcomeMessage: string;
  surveyMessage: string;
  surveyLink: string;
}

function getConfig(): Config {
  const configPath = path.resolve(__dirname, '..', 'config.json');;
  const configContent = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(configContent);
}

export function activate(context: vscode.ExtensionContext) {
  const config = getConfig();

  // Display welcome message
  vscode.window.showInformationMessage(config.welcomeMessage);

  // Display survey message if conditions are met
  displaySurveyMessage(context, config);

  let dispose = vscode.commands.registerCommand('ai-helper.reset', () => {
	context.globalState.update('lastDismissed', undefined);
	vscode.window.showInformationMessage("Global State Reset Done");
  });

  context.subscriptions.push(dispose);
}

function displaySurveyMessage(context: vscode.ExtensionContext, config: Config) {
  const lastDismissed = context.globalState.get<number>('lastDismissed', 0);
  const now = new Date();
  const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
  const currentYear = now.getFullYear();
  const firstWeekOfQuarter = now.getDate() <= 21;
  const thisQuarter = currentYear * 10 + currentQuarter;

  if (firstWeekOfQuarter && (lastDismissed < thisQuarter)) {
    const message = config.surveyMessage;
    const options = ['Dismiss', 'Fill Survey'];

    vscode.window.showInformationMessage(message, ...options).then(selection => {
      if (selection === 'Fill Survey') {
        vscode.env.openExternal(vscode.Uri.parse(config.surveyLink));
      }
	  context.globalState.update('lastDismissed', thisQuarter);
    });
  }
}

export function deactivate() {}