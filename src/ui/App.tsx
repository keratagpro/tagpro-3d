import { useState } from 'react';
import * as React from 'react';

import { root } from './App.css';
import { OptionsDialog } from './OptionsDialog';

export function App() {
	const [showOptions, setShowOptions] = useState(false);

	function handleClick() {
		setShowOptions((show) => !show);
	}

	return (
		<div className={root}>
			<a href="#" onClick={handleClick}>
				<img width="24" height="24" src="https://keratagpro.github.io/tagpro-3d/assets/icon.png" />
			</a>
			<OptionsDialog visible={showOptions} />
		</div>
	);
}
