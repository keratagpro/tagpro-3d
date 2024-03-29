const resizedImageCache: Record<string, HTMLCanvasElement> = {};

export function resizeImage(image: HTMLImageElement, width: number, height: number) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext('2d');
	context?.drawImage(image, 0, 0, canvas.width, canvas.height);

	return canvas;
}

export function getOrCreatePowerOfTwoImage(image: HTMLImageElement) {
	if (!resizedImageCache[image.src]) {
		const w = closestPowerOfTwo(image.width);
		const h = closestPowerOfTwo(image.height);
		const img = resizeImage(image, w, h);
		resizedImageCache[image.src] = img;
	}

	return resizedImageCache[image.src];
}

export function closestPowerOfTwo(num: number) {
	return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
}

export function cropImageToCanvas(image: HTMLImageElement, x: number, y: number, width: number, height: number) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext('2d');
	context?.drawImage(image, x, y, width, height, 0, 0, width, height);

	return canvas;
}
