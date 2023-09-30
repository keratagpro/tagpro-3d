import * as React from 'react';

import { Dialog } from './Dialog';

export interface OptionsDialogProps {
	visible: boolean;
}

export function OptionsDialog({ visible }: OptionsDialogProps) {
	return (
		<Dialog visible={visible}>
			<h1>TagPro 3D - options</h1>
		</Dialog>
	);
}
