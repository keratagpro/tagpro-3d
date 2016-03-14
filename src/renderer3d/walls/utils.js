

export function removeInnerFaces(geometry) {
	var len = geometry.faces.length;

	for (var i = 0; i < len; i += 2) {
		var f1 = geometry.faces[i];
		var f2 = geometry.faces[i+1];

		if (f1.materialIndex === 0) continue;

		var indices1 = [f1.a, f1.b, f1.c, f2.a, f2.b, f2.c].filter(unique).sort();

		for (var j = 0; j < i; j += 2) {
			var f3 = geometry.faces[j];
			var f4 = geometry.faces[j+1];

			if (!f3 || !f4) continue;
			if (f3.materialIndex === 0) continue;

			var indices2 = [f3.a, f3.b, f3.c, f4.a, f4.b, f4.c].filter(unique).sort();

			if (areEqual(indices1, indices2)) {
				delete geometry.faces[i];
				delete geometry.faces[i+1];
				delete geometry.faces[j];
				delete geometry.faces[j+1];

				delete geometry.faceVertexUvs[0][i];
				delete geometry.faceVertexUvs[0][i+1];
				delete geometry.faceVertexUvs[0][j];
				delete geometry.faceVertexUvs[0][j+1];
			}
		}
	}

	geometry.faces = geometry.faces.filter(f => f);
	geometry.faceVertexUvs[0] = geometry.faceVertexUvs[0].filter(f => f);
}

function areEqual(arr1, arr2) {
	var len = arr1.length;
	for (var i = 0; i < len; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
}

function unique(val, index, self) {
	return self.indexOf(val) === index;
}