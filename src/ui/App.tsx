import './App.css';

import { useState } from 'react';
import * as React from 'react';

import { OptionsDialog } from './OptionsDialog';
import { OptionsToggle } from './OptionsToggle';

export function App() {
	const [showOptions, setShowOptions] = useState(false);

	function handleOptionsClick() {
		setShowOptions((show) => !show);
	}

	function handleOptionsClose() {
		setShowOptions(false);
	}

	return (
		<div className="tagpro-3d">
			<OptionsDialog open={showOptions} onClose={handleOptionsClose} />
			<OptionsToggle active={showOptions} onClick={handleOptionsClick} />
		</div>
	);
}
