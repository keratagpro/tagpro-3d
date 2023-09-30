import * as React from 'react';

import { Dialog } from './Dialog';

export interface OptionsDialogProps {
	open?: boolean;
	onClose?: (ev: React.MouseEvent<HTMLButtonElement>) => void;
}

export function OptionsDialog({ open, onClose }: OptionsDialogProps) {
	return <Dialog open={open} title="TagPro 3D - Options" onClose={onClose}></Dialog>;
}
