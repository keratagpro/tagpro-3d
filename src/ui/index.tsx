import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

import { App } from './App';

export function renderUI() {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const root = (ReactDOM as unknown as typeof ReactDOMClient).createRoot(container);
	root.render(<App />);

	return root;
}
