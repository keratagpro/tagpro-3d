export interface AmbientLightOptions {
	type: 'ambient';
	color: number;
}

export interface CameraLightOptions {
	type: 'camera';
	color: number;
	intensity?: number;
}

export interface DirectionalLightOptions {
	type: 'directional';
	color: number;
	intensity: number;
	position: [number, number, number];
}

export type LightOptions = { enabled: boolean } & (AmbientLightOptions | CameraLightOptions | DirectionalLightOptions);

export const lightOptions: LightOptions[] = [
	{ enabled: false, type: 'camera', color: 0xffffff, intensity: 0.8 },
	{ enabled: true, type: 'ambient', color: 0x666666 },
	{ enabled: true, type: 'directional', color: 0xffffff, intensity: 1.0, position: [-500, 500, -500] },
];
