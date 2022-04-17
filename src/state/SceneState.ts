import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CanvasListener } from '../utils/CanvasListener';
import { ModelLoader, ModelNames, RoadName, VehicleName } from '../utils/ModelLoader';
import { Pathfinder } from '../utils/Pathfinder';
import { Road, RoadWaypoint } from '../model/Road';
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

  private arrow: THREE.ArrowHelper;

  constructor(private canvasListener: CanvasListener) {}

  // This kicks off the model loading required for this scene
  public initScene(onReady: () => void) {
    this.onReady = onReady;

    // Work out which models we need to load for this scene
    // This is where proc gen comes in - hardcoded for now
    const modelNames = new ModelNames();
    modelNames.roads = [RoadName.END, RoadName.STRAIGHT, RoadName.BEND];
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

    // Axes helper - The X axis is red. The Y axis is green. The Z axis is blue.
    // const axesHelper = new THREE.AxesHelper(50);
    // this.scene.add(axesHelper);

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    this.roadTestScene();

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

  private roadTestScene() {
    const straight = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));

    const sForward = new THREE.Vector3();
    straight.model.getWorldDirection(sForward);
    this.arrow = new THREE.ArrowHelper(sForward, straight.position, 1.5, 0xff0000);

    const axesHelper = new THREE.AxesHelper(5);

    this.scene.add(axesHelper);
    this.scene.add(straight.model);
    this.scene.add(this.arrow);
  }

  private basicTestScene() {
    // Roads
    const start = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));
    const mid = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const mid2 = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const end = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));

    // Road pieces are 2x2 on x/z, space apart evenly
    start.position.x = -2;
    // mid already at 0
    mid2.position.x = 2;
    end.position.x = 4;

    // Rotate start piece
    start.model.rotation.y = Math.PI;

    // Connect roads
    start.neighbours.push(mid);
    mid.neighbours.push(start);
    mid.neighbours.push(mid2);
    mid2.neighbours.push(mid);
    mid2.neighbours.push(end);
    end.neighbours.push(mid2);

    // Add to scene
    [start, mid, mid2, end].forEach((r) => {
      this.roads.push(r);
      this.scene.add(r.model);
    });

    // Vehicle
    const vehicle = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));

    // Place at first node
    vehicle.model.position.set(start.position.x, start.position.y, start.position.z);

    // Find route test
    const route = Pathfinder.findRoute(start, end);

    // Create the waypoints for this route
    const waypoints: RoadWaypoint[] = [];
    route.forEach((r) => {
      r.waypoints.forEach((rwp) => waypoints.push(rwp));
    });
    vehicle.setRouteWaypoints(waypoints);

    this.vehicles.push(vehicle);
    this.scene.add(vehicle.model);
    this.scene.add(vehicle.routeLine);
  }

  private bendTestScene() {
    // Roads
    const start = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));
    const mid = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const mid2 = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const bend = new Road(RoadName.BEND, this.modelLoader.getModel(RoadName.BEND));
    const leg = new Road(RoadName.STRAIGHT, this.modelLoader.getModel(RoadName.STRAIGHT));
    const end = new Road(RoadName.END, this.modelLoader.getModel(RoadName.END));

    // Create an L shape
    start.position.x = 0;
    mid.position.x = 2;
    mid2.position.x = 4;
    bend.position.x = 6;
    bend.rotation.y = Math.PI;
    leg.position.x = 6;
    leg.position.z = 2;
    leg.rotation.y = Math.PI / 2;
    end.position.x = 6;
    end.position.z = 4;
    end.rotation.y = -Math.PI / 2;

    // Rotate start piece
    start.model.rotation.y = Math.PI;

    // Connect roads
    start.neighbours.push(mid);
    mid.neighbours.push(start);
    mid.neighbours.push(mid2);
    mid2.neighbours.push(mid);
    mid2.neighbours.push(bend);
    bend.neighbours.push(mid2);
    bend.neighbours.push(leg);
    leg.neighbours.push(bend);
    leg.neighbours.push(end);
    end.neighbours.push(leg);

    // Add to scene
    [start, mid, mid2, end, bend, leg].forEach((r) => {
      r.updateWaypoints(); // do this after moving them
      this.roads.push(r);
      this.scene.add(r.model);
    });

    // Vehicle
    const vehicle = new Vehicle(VehicleName.SEDAN, this.modelLoader.getModel(VehicleName.SEDAN));

    // Place at first node
    vehicle.model.position.set(start.position.x, start.position.y, start.position.z);

    // Find route test
    const route = Pathfinder.findRoute(start, end);

    // Create the waypoints for this route
    const waypoints: RoadWaypoint[] = [];
    route.forEach((r) => {
      r.waypoints.forEach((rwp) => waypoints.push(rwp));
    });
    vehicle.setRouteWaypoints(waypoints);

    this.vehicles.push(vehicle);
    this.scene.add(vehicle.model);
    this.scene.add(vehicle.routeLine);

    // TEMP - focus on bend
    this.controls.target = bend.position;
    this.scene.add(vehicle.dirArrow);
  }
}
