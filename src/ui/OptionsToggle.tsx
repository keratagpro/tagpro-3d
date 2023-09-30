import './OptionsToggle.css';

import cn from 'classnames';
import * as React from 'react';

export interface OptionsToggleProps {
	active?: boolean;
	onClick?: (ev: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function OptionsToggle({ active, onClick }: OptionsToggleProps) {
	return (
		<a href="#" onClick={onClick} className={cn('options-toggle', { active })}>
			<img width="24" height="24" src="https://keratagpro.github.io/tagpro-3d/assets/icon.png" />
		</a>
	);
}
