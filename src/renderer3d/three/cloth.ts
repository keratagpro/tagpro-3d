import * as THREE from 'three';

let _tempVec3 = new THREE.Vector3();

export class Cloth {
	_widthSegments: number;
	_heightSegments: number;
	_windForce: THREE.Vector3;
	useWind: boolean;
	gravity: THREE.Vector3;
	speed: number;

	constructor({
		widthSegments = 10,
		heightSegments = 6,
		restDistance = 4,
		useWind = true,
		gravity = new THREE.Vector3(0, 0, 9.81),
		drag = 0.97,
		mass = 0.1,
		speed = 0.001,
	} = {}) {
		console.log(arguments[0]);
		this._widthSegments = widthSegments;
		this._heightSegments = heightSegments;
		this._windForce = new THREE.Vector3(0.1, 0.05, 0);

		this.useWind = useWind;
		this.gravity = gravity.multiplyScalar(mass);
		this.speed = speed;

		const clothFunction = createClothFunction(widthSegments * restDistance, heightSegments * restDistance);

		this.particles = createParticles(widthSegments, heightSegments, clothFunction, mass, drag);
		this.constraints = createConstraints(widthSegments, heightSegments, this.particles, restDistance);

		this.geometry = new THREE.ParametricGeometry(clothFunction, widthSegments, heightSegments);
		this.geometry.dynamic = true;

		console.table(this.geometry.vertices);

		window.cloth = this;

		this._initPins();
		this.pinEdge();
	}

	_initPins() {
		const left = [];
		for (let i = 0; i <= this._heightSegments; i++) {
			left.push(i * (this._widthSegments + 1));
		}

		this._pinsEdge = left;
		this._pinsCorner = [0, this._widthSegments + 1];
	}

	pinEdge() {
		this.pins = this._pinsEdge;
	}

	pinCorner() {
		this.pins = this._pinsCorner;
	}

	setWind(x, y, z) {
		this._windForce.set(x, y, z);
	}

	update(delta) {
		if (this.useWind) {
			applyWind(this.geometry, this.particles, this._windForce);
		}

		applyGravity(this.geometry, this.particles, this.gravity, delta * this.speed);

		handleConstraints(this.constraints);

		handlePins(this.particles, this.pins);
	}

	updateGeometry() {
		const len = this.particles.length;

		for (let i = 0; i < len; i++) {
			this.geometry.vertices[i].copy(this.particles[i].position);
		}

		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();

		this.geometry.normalsNeedUpdate = true;
		this.geometry.verticesNeedUpdate = true;
	}
}

class Particle {
	constructor(func, x, y, z, mass, drag) {
		this.position = func(x, y);
		this.previous = func(x, y);
		this.original = func(x, y);

		this.accel = new THREE.Vector3(0, 0, 0);
		this.mass = mass;
		this.massInv = 1 / mass;
		this.drag = drag;
	}

	// Force -> Acceleration
	addForce(force) {
		this.accel.add(_tempVec3.copy(force).multiplyScalar(this.massInv));
	}

	// Performs verlet integration
	integrate(timesq) {
		const pos = _tempVec3.subVectors(this.position, this.previous);
		pos.multiplyScalar(this.drag).add(this.position);
		pos.add(this.accel.multiplyScalar(timesq));

		_tempVec3 = this.previous;
		this.previous = this.position;
		this.position = pos;

		this.accel.set(0, 0, 0);
	}
}

function createClothFunction(width, height) {
	return function (u, v) {
		const x = u * width;
		const y = 0;
		const z = v * height;
		return new THREE.Vector3(x, y, z);
	};
}

function createParticles(width: number, height: number, func, mass, drag) {
	const particles = [];
	let u, v;

	// Create particles
	for (v = 0; v <= height; v++) {
		for (u = 0; u <= width; u++) {
			particles.push(new Particle(func, u / width, v / height, 0, mass, drag));
		}
	}

	return particles;
}

function createConstraints(width, height, particles, restDistance) {
	const index = (u, v) => u + v * (width + 1);
	const constraints = [];
	let u, v;

	// Structural
	for (v = 0; v < height; v++) {
		for (u = 0; u < width; u++) {
			constraints.push([particles[index(u, v)], particles[index(u, v + 1)], restDistance]);

			constraints.push([particles[index(u, v)], particles[index(u + 1, v)], restDistance]);
		}
	}

	for (u = width, v = 0; v < height; v++) {
		constraints.push([particles[index(u, v)], particles[index(u, v + 1)], restDistance]);
	}

	for (v = height, u = 0; u < width; u++) {
		constraints.push([particles[index(u, v)], particles[index(u + 1, v)], restDistance]);
	}

	// While many system uses shear and bend springs,
	// the relax constraints model seem to be just fine
	// using structural springs.
	// Shear
	// var diagonalDist = Math.sqrt(restDistance * restDistance * 2);

	// for (v=0;v<h;v++) {
	// 	for (u=0;u<w;u++) {
	// 		constraints.push([
	// 			particles[index(u, v)],
	// 			particles[index(u+1, v+1)],
	// 			diagonalDist
	// 		]);
	//
	// 		constraints.push([
	// 			particles[index(u+1, v)],
	// 			particles[index(u, v+1)],
	// 			diagonalDist
	// 		]);
	// 	}
	// }

	return constraints;
}

// Aerodynamics forces
function applyWind(geometry, particles, force) {
	const faces = geometry.faces;
	const len = faces.length;

	for (let i = 0; i < len; i++) {
		const face = faces[i];
		const normal = face.normal;

		_tempVec3.copy(normal).normalize().multiplyScalar(normal.dot(force));
		particles[face.a].addForce(_tempVec3);
		particles[face.b].addForce(_tempVec3);
		particles[face.c].addForce(_tempVec3);
	}
}

function applyGravity(geometry, particles, gravity, timesq) {
	const len = particles.length;
	for (let i = 0; i < len; i++) {
		const particle = particles[i];
		particle.addForce(gravity);
		particle.integrate(timesq);
	}
}

function satisfyConstraints(p1, p2, distance) {
	_tempVec3.subVectors(p2.position, p1.position);
	const currentDist = _tempVec3.length();
	if (currentDist == 0) return; // prevents division by 0
	const correction = _tempVec3.multiplyScalar(1 - distance / currentDist);
	const correctionHalf = correction.multiplyScalar(0.5);
	p1.position.add(correctionHalf);
	p2.position.sub(correctionHalf);
}

function handleConstraints(constraints) {
	const len = constraints.length;

	// Start Constraints
	for (let i = 0; i < len; i++) {
		const constraint = constraints[i];
		satisfyConstraints(constraint[0], constraint[1], constraint[2]);
	}

	// Floor Constaints
	// particles = cloth.particles;
	// il = particles.length;
	// for (i = 0; i < il; i++) {
	// 	particle = particles[i];
	// 	let pos = particle.position;
	// 	if (pos.y < - 250) {
	// 		pos.y = - 250;
	// 	}
	// }
}

function handlePins(particles, pins) {
	const len = pins.length;

	// Pin Constraints
	for (let i = 0; i < len; i++) {
		const xy = pins[i];
		const p = particles[xy];
		p.position.copy(p.original);
		p.previous.copy(p.original);
	}
}
