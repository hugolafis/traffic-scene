import * as THREE from 'three';

import { ModelLoader, ModelNames, RoadName, VehicleName } from '../utils/ModelLoader';
import { Road } from '../model/Road';
import { Vehicle } from '../model/Vehicle';

/**
 * Contains all the objects in the scene
 */
export class SceneState {
  public scene = new THREE.Scene();
  public roads: Road[] = [];
  public vehicles: Vehicle[] = [];
  private modelLoader = new ModelLoader();
  private onReady?: () => void;

  // This kicks off the model loading required for this scene
  public initScene(onReady: () => void) {
    this.onReady = onReady;

    // Work out which models we need to load for this scene
    // This is where proc gen comes in - hardcoded for now
    const modelNames = new ModelNames();
    modelNames.roads = [RoadName.END, RoadName.STRAIGHT];
    modelNames.vehicles = [VehicleName.SEDAN];

    this.modelLoader.loadModels(modelNames, () => this.buildScene());
  }

  // Once models are loaded, can then piece them together as per scene
  private buildScene() {
    // Axes helper - The X axis is red. The Y axis is green. The Z axis is blue.
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Roads
    const start = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));
    const mid = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const end = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));

    // Road pieces are 2x2 on x/z, space apart evenly
    start.setPositionX(-2);
    end.setPositionX(2);

    // Rotate start piece
    start.model.rotation.y = Math.PI;

    [start, mid, end].forEach((r) => {
      this.roads.push(r);
      this.scene.add(r.model);
      this.scene.add(r.node);
    });

    // Vehicle
    const vehicle = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));

    // Place at first node
    vehicle.model.position.set(start.position.x, start.position.y, start.position.z);

    this.vehicles.push(vehicle);
    this.scene.add(vehicle.model);

    // Now ready to start
    this.onReady?.();
  }
}
