const resizedImageCache = {};

export function resizeImage(image, width, height) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext('2d');
	context.drawImage(image, 0, 0, canvas.width, canvas.height);

	return canvas;
}

export function getOrCreatePowerOfTwoImage(image) {
	if (!resizedImageCache[image.src]) {
		const w = closestPowerOfTwo(image.width);
		const h = closestPowerOfTwo(image.height);
		const img = resizeImage(image, w, h);
		resizedImageCache[image.src] = img;
	}

	return resizedImageCache[image.src];
}

export function closestPowerOfTwo(num) {
	return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
}

export function cropImageToCanvas(image, x, y, width, height) {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');

	canvas.width = width;
	canvas.height = height;

	context.drawImage(image, x, y, width, height, 0, 0, width, height);

	return canvas;
}
