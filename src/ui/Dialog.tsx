import './Dialog.css';

import * as React from 'react';

export interface DialogProps {
	children?: React.ReactNode;
	open?: boolean;
	title?: React.ReactNode;
	onClose?: (ev: React.MouseEvent<HTMLButtonElement>) => void;
}

export function Dialog({ children, title, open, onClose }: DialogProps) {
	function handleClose(ev: React.MouseEvent<HTMLButtonElement>) {
		onClose?.(ev);
	}

	return (
		<dialog className="modal-content" open={open}>
			<form method="dialog">
				<div className="modal-header">
					<button type="button" className="btn btn-default close" aria-label="Close" onClick={handleClose}>
						<span aria-hidden="true">×</span>
					</button>
					{title && <h4 className="modal-title">{title}</h4>}
				</div>
				<div className="modal-body">{children}</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-default" onClick={handleClose}>
						Close
					</button>
					<button type="submit" className="btn btn-primary">
						Save Changes
					</button>
				</div>
			</form>
		</dialog>
	);
}
