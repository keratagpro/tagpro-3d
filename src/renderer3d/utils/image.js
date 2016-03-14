import { TILE_SIZE } from 'tagpro';

var resizedImageCache = {};

export function resizeImage(image, width, height) {
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	var context = canvas.getContext('2d');
	context.drawImage(image, 0, 0, canvas.width, canvas.height);

	return canvas;
}

export function getOrCreatePowerOfTwoImage(image) {
	if (!resizedImageCache[image.src]) {
		var w = closestPowerOfTwo(image.width);
		var h = closestPowerOfTwo(image.height);
		var img = resizeImage(image, w, h);
		resizedImageCache[image.src] = img;
	}

	return resizedImageCache[image.src];
}

export function closestPowerOfTwo(num) {
	return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
}

export function cropImageToCanvas(image, x, y, width, height) {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');

	canvas.width = width;
	canvas.height = height;

	context.drawImage(image,
		x, y, width, height,
		0, 0, width, height);

	return canvas;
}