import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CanvasListener } from '../utils/CanvasListener';
import { ModelLoader, ModelNames, RoadName, VehicleName } from '../utils/ModelLoader';
import { Pathfinder } from '../utils/Pathfinder';
import { Road } from '../model/Road';
import { RoadFactory } from '../utils/RoadFactory';
import { Vehicle } from '../model/Vehicle';

/**
 * Contains all the objects in the scene
 */
export class SceneState {
  public scene = new THREE.Scene();
  public camera: THREE.PerspectiveCamera;
  public roads: Road[] = [];
  public vehicles: Vehicle[] = [];

  private controls: OrbitControls;
  private modelLoader = new ModelLoader();
  private onReady?: () => void;

  constructor(private canvasListener: CanvasListener) {}

  // This kicks off the model loading required for this scene
  public initScene(onReady: () => void) {
    this.onReady = onReady;

    // Work out which models we need to load for this scene
    // This is where proc gen comes in - hardcoded for now
    const modelNames = new ModelNames();
    modelNames.roads = [RoadName.END, RoadName.STRAIGHT, RoadName.BEND, RoadName.JUNCTION];
    modelNames.vehicles = [VehicleName.SEDAN];

    this.modelLoader.loadModels(modelNames, () => this.buildScene());
  }

  public updateScene(deltaTime: number) {
    //this.controls.target = this.vehicles[0].position;
    this.controls.update();

    // Move vehicles along their route
    this.vehicles.forEach((v) => v.update(deltaTime));
  }

  // Once models are loaded, can then piece them together as per scene
  private buildScene() {
    this.setupCamera();

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    this.laneTestScene();

    // Now ready to start
    this.onReady?.();
  }

  private setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      this.canvasListener.width / this.canvasListener.height,
      0.1,
      1000
    );
    camera.position.x = 2;
    camera.position.y = 2;
    camera.position.z = 2;

    this.camera = camera;
    this.controls = new OrbitControls(this.camera, this.canvasListener.canvas);
    this.controls.enableDamping = true;
  }

  private laneTestScene() {
    const s1 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    const s2 = RoadFactory.createRoad(
      RoadName.STRAIGHT,
      this.modelLoader.getModel(RoadName.STRAIGHT)
    );
    const b1 = RoadFactory.createRoad(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));
    const j1 = RoadFactory.createRoad(
      RoadName.JUNCTION,
      this.modelLoader.getModel(RoadName.JUNCTION)
    );
    const b2 = RoadFactory.createRoad(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));
    const roads = [b2, b1, j1, s1, s2];

    // Position
    b2.position.x = 2;
    b2.rotation.y = -Math.PI / 2;
    b1.rotation.y = Math.PI / 2;
    j1.position.z = -2;
    //j1.rotation.y = Math.PI / 2;

    s1.position.z = -4;
    s2.position.z = -2;
    s2.rotation.y = Math.PI / 2;
    s2.position.x = 2;

    const arrow = new THREE.ArrowHelper(b1.forward, b1.position, 1.5);
    this.scene.add(arrow);

    // Update
    roads.forEach((r) => r.postTransform());

    // Connect
    b2.connectRoads([b1]);
    b1.connectRoads([b2, j1]);
    j1.connectRoads([b1, s1, s2]);
    s1.connectRoads([j1]);
    s2.connectRoads([j1]);

    // Route
    const route = Pathfinder.findRoute(b2, s2);
    const waypoints = Pathfinder.getRouteWaypoints(route);

    const car = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car.setRouteWaypoints(waypoints);
    car.model.position.x = waypoints[0].x;
    car.model.position.z = waypoints[0].z;
    car.updateRouteLine();
    this.vehicles.push(car);

    // Route
    const route2 = Pathfinder.findRoute(s2, s1);
    const waypoints2 = Pathfinder.getRouteWaypoints(route2);

    const car2 = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));
    car2.setRouteWaypoints(waypoints2);
    car2.model.position.x = waypoints2[0].x;
    car2.model.position.z = waypoints2[0].z;
    car2.updateRouteLine();
    this.vehicles.push(car2);

    // Add to scene
    this.scene.add(car.model);
    this.scene.add(car.routeLine);
    this.scene.add(car2.model);
    this.scene.add(car2.routeLine);
    roads.forEach((r) => {
      this.scene.add(r.model);
      r.lanes.forEach((l) => this.scene.add(l.line));
    });
  }
}
