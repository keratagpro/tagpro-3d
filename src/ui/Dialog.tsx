import * as React from 'react';
import { useEffect, useRef } from 'react';

export interface DialogProps {
	children?: React.ReactNode;
	visible: boolean;
}

export function Dialog({ children, visible = false }: DialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (!dialogRef.current) {
			return;
		}

		if (visible) {
			dialogRef.current.showModal();
		} else {
			dialogRef.current.close();
		}
	}, [visible]);

	return (
		<dialog ref={dialogRef}>
			<form method="dialog">
				{children}
				<div className="modal-footer">
					<button type="reset">Cancel</button>
					<button type="submit">Confirm</button>
				</div>
			</form>
		</dialog>
	);
}
