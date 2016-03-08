import * as ClipperLib from 'clipper';

// Simplifying API of jsclipper.

export const Clipper = ClipperLib.Clipper;
export const Lighten = ClipperLib.JS.Lighten;
export const Offset = ClipperLib.ClipperOffset;
export const PolyTree = ClipperLib.PolyTree;
export const PolyTreeToExPolygons = ClipperLib.JS.PolyTreeToExPolygons;
export const SimplifyPolygons = ClipperLib.Clipper.SimplifyPolygons;

export const ClipType = {
	Intersection: ClipperLib.ClipType.ctIntersection
};

export const EndType = {
	ClosedPolygon: ClipperLib.EndType.etClosedPolygon
};

export const JoinType = {
	Miter: ClipperLib.JoinType.jtMiter
};

export const PolyType = {
	Subject: ClipperLib.PolyType.ptSubject,
	Clip: ClipperLib.PolyType.ptClip
};

export const PolyFillType = {
	NonZero: ClipperLib.PolyFillType.pftNonZero
};

export function SimplifyAndLighten(paths, lightenTolerance = 10) {
	paths = SimplifyPolygons(paths, PolyFillType.NonZero);
	paths = Lighten(paths, lightenTolerance);

	return paths;
}