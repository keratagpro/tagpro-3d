import * as tagpro from 'tagpro';

export function isInGame() {
	return tagpro.state > 0;
}
