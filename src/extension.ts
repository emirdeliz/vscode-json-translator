// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import googleTranslate from 'google-translate-api';

function translate() { 
	const selectedText = getSelectedText();
	const json = parseTextIsJson(selectedText);
	if (!json) {
		showMessage('Invalid JSON');
	}

	console.debug(translateObject(json));

	return translateObject(json);
}

function applyTranslate(json: any, originalTerm: string, translatedTerm: string) { 
	const jsonAsText = JSON.stringify(json);
	const result = JSON.parse(jsonAsText.replace(new RegExp(`"${originalTerm}"`, 'g'), translatedTerm));
	return result;
}

function checkIsObjectValue(value: any) { 
  return typeof value === 'object';
}

async function translateObject(obj: any) { 
	const result = Object.keys(obj).reduce(async function (resultR: any, key: string) {
		const value = obj[key];
		if (checkIsObjectValue(value)) { 
			return {
				...resultR,
				...translateObject(value),
			}
		}
		resultR[key] = (await googleTranslate(value, {to: 'en'})).text;
		return resultR;
	}, {}) as any;
	return result;
}

function showMessage(message: string) { 
	vscode.window.showInformationMessage(message);
}

function parseTextIsJson(json: string) { 
	try {
		return JSON.parse(json)
	} catch (_e) { 
		return '';
	}
}

function getSelectedText() { 
	const editor = vscode.window.activeTextEditor;
	const selection = editor?.selection;
	if (selection && !selection.isEmpty) {
		const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
		const highlighted = editor.document.getText(selectionRange);
		return highlighted;
	}
	return '';
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-json-translator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vscode-json-translator.translate', translate);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
