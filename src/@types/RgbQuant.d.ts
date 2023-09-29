declare module 'rgbquant' {
	type ColorTuple = [r: number, g: number, b: number];

	class RgbQuant {
		constructor(opts: any);

		sample(img: HTMLCanvasElement | HTMLImageElement, width?: number): void;

		palette(tuples: true, noSort: boolean): ColorTuple[];
		palette(tuples: false, noSort: boolean): Uint8Array;
	}

	export default RgbQuant;
}
