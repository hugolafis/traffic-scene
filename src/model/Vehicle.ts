import * as THREE from 'three';

import { Lane } from './Lane';
import { NumberUtils } from '../utils/NumberUtils';
import { Road } from './Road';
import { RoadUtils } from '../utils/RoadUtils';
import { VehicleName } from '../utils/ModelLoader';

export class Vehicle {
  public id = NumberUtils.createId();
  public raycaster = new THREE.Raycaster();
  public raycastHelper = new THREE.ArrowHelper();
  public bounds: THREE.Mesh;
  public routeLine?: THREE.Line;
  public currentRoad?: Road;
  public maxSpeed = 2;
  public actualSpeed = 2;
  public acceleration = 0.01;
  private route: Road[] = [];
  private currentLane?: Lane;
  private routeWaypoints: THREE.Vector3[] = [];
  private nextWaypoint?: THREE.Vector3;
  private nextLookAt = new THREE.Quaternion();
  private halfLength = 0;

  constructor(public name: VehicleName, public model: THREE.Group) {
    // Setup bounds for raycaster
    const box = new THREE.Box3().setFromObject(model);
    const dimensions = new THREE.Vector3().subVectors(box.max, box.min);
    this.halfLength = dimensions.z * 0.5;
    const boxGeom = new THREE.BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z);
    const matrix = new THREE.Matrix4().setPosition(
      dimensions.addVectors(box.min, box.max).multiplyScalar(0.5)
    );
    boxGeom.applyMatrix4(matrix);

    this.bounds = new THREE.Mesh(
      boxGeom,
      new THREE.MeshBasicMaterial({ color: 'white', wireframe: true })
    );

    // Setup raycaster
    this.raycaster.near = 0;
    // Raycaster length needs to be enough to clear the car, plus standard length
    console.log('halfLength', this.halfLength);
    this.raycaster.far = this.halfLength + 0.7;
    this.raycastHelper.setLength(this.raycaster.far);
    this.raycastHelper.position.y = 0.3;

    // Create the route line
    const mat = new THREE.LineBasicMaterial({ color: 'blue' });
    const geom = new THREE.BufferGeometry();
    this.routeLine = new THREE.Line(geom, mat);
  }

  public get position() {
    return this.model.position;
  }

  public setSpeed(speed: number) {
    this.maxSpeed = speed;
    this.actualSpeed = speed;
  }

  public setColor(color: THREE.Color) {
    const body = this.model.getObjectByName('Mesh_body_1');
    if (body && body instanceof THREE.Mesh) {
      body.material = new THREE.MeshBasicMaterial({ color });
    }
  }

  // Gives this vehicle a starting road to roam from
  public setRoam(road: Road) {
    // Set the road
    this.currentRoad = road;

    // Pick a random lane on this road
    const rnd = Math.floor(Math.random() * road.lanes.length);
    this.currentLane = road.lanes[rnd];

    // Get the waypoints for this lane
    this.routeWaypoints = [...this.currentLane.waypoints];

    // Position vehicle at first waypoint
    this.position.x = this.routeWaypoints[0].x;
    this.position.z = this.routeWaypoints[0].z;

    // Face the second waypoint immediately
    this.model.lookAt(this.routeWaypoints[1]);

    // Since we're at the first waypoint, can target the next
    this.targetNextWaypoint();
  }

  // Give the vehicle a route to follow
  public setRoute(route: Road[]) {
    this.route = route;

    const first = route[0];
    const second = route[1];

    // Get the lane that goes from start to next
    const lane = first.getConnectingLane(first, second);

    // Assign road and lane
    this.currentRoad = first;
    this.currentLane = lane;

    // Get waypoints for this lane
    this.routeWaypoints = [...this.currentLane.waypoints];

    // Snap to position of first route point, face second
    this.position.x = this.routeWaypoints[0].x;
    this.position.z = this.routeWaypoints[0].z;
    this.model.lookAt(this.routeWaypoints[1]);

    // Target the next
    this.targetNextWaypoint();
  }

  public checkVehicleCollisions(allVehicles: Vehicle[]) {
    // By default, speed up towards maxSpeed
    this.actualSpeed += this.acceleration;
    if (this.actualSpeed > this.maxSpeed) {
      this.actualSpeed = this.maxSpeed;
    }

    // Only bother checking if close to another vehicle - ignore self
    const otherVehicles = allVehicles.filter((v) => v.id !== this.id);
    const closeVehicles = RoadUtils.getCloseVehicles(
      this.position,
      this.raycaster.far,
      otherVehicles
    );
    if (!closeVehicles.length) {
      return;
    }

    // Find intersections with close vehicles
    let distance = Number.MAX_VALUE;
    for (const vehicle of closeVehicles) {
      const intersections = this.raycaster.intersectObject(vehicle.bounds);
      // If there was no intersection, check next vehicle
      if (!intersections.length) {
        continue;
      }

      // If this vehicle intersected is on this road but a different lane, ignore
      if (
        vehicle.currentRoad.id === this.currentRoad.id &&
        vehicle.currentLane.id !== this.currentLane.id
      ) {
        continue;
      }

      // If reached this point, we have intersected with a vehicle that is either:
      // On this road and this lane (ahead of the car)
      // On the next road ahead in any lane
      distance = intersections[0].distance;

      // Can now stop testing against other vehicles
      break;
    }

    // Did we find intersections?
    if (distance === Number.MAX_VALUE) {
      return;
    }

    // Raycast begins within this car at its center
    // Subtract half this car's length to get distance to intersection from front of car
    const outsideDistance = distance - this.halfLength;

    // Get the distance as a percentage of total raycast length
    // This tells us how close it is relative to max raycast distance
    const relativeDistance = outsideDistance / this.raycaster.far;

    // Adjust speed by relative distance
    this.actualSpeed *= relativeDistance;

    // Slow down based on the distance
    // const firstHit = intersections[0];
    // let speedMod = firstHit.distance * 2 - 0.4;
    // this.actualSpeed *= speedMod;
  }

  public update(deltaTime: number) {
    // Drive along the route
    this.drive(deltaTime);

    // Update route line
    this.updateRouteLine();

    // Update raycaster
    this.updateRaycaster();
    RoadUtils.copyTransforms(this.model, this.bounds);
  }

  // Creates a new route line from route waypoints
  private setRouteLine() {
    const points = this.routeWaypoints.map((wp) => wp.clone());
    points.forEach((p) => (p.y += 0.3));
    const pos = this.position.clone();
    pos.y += 0.3;
    points.unshift(pos);

    this.routeLine.geometry.setFromPoints(points);
  }

  // Updates start of route line to follow current position
  private updateRouteLine() {
    const positions = this.routeLine.geometry.getAttribute('position');
    positions.setXYZ(0, this.position.x, this.position.y + 0.3, this.position.z);
    positions.needsUpdate = true;
  }

  // Upon reaching a waypoint, calls this to move to next
  private targetNextWaypoint() {
    // Have we reached the end now?
    if (this.routeWaypoints.length === 1) {
      this.onWaypointsEnd();
      //this.onRouteComplete?.(this);
      return;
    }

    // Remove the first waypoint (just reached it)
    this.routeWaypoints.shift();

    // Target the next
    this.nextWaypoint = this.routeWaypoints[0];

    // Save current facing direction
    const facing = this.model.rotation.clone();

    // Turn to look at next waypoint
    this.model.lookAt(this.nextWaypoint);

    // Save next waypoint facing direction
    this.nextLookAt = new THREE.Quaternion().copy(this.model.quaternion);

    // Rotate back to original facing direction
    this.model.rotation.x = facing.x;
    this.model.rotation.y = facing.y;
    this.model.rotation.z = facing.z;

    // Update route line to remove point just reached
    this.setRouteLine();
  }

  // When there are no more waypoints to follow
  private onWaypointsEnd() {
    // The route is finished
    this.routeWaypoints = [];

    // If the vehicle is following a set route, use the next road in the route
    if (this.route.length) {
      this.nextRouteRoad();
    } else {
      // Otherwise continue roaming - find the next road the current lane goes to
      this.nextRoamRoad();
    }
  }

  private nextRouteRoad() {
    // Current road is the fromRoad
    const fromRoad = this.currentRoad;

    // Road after next is toRoad
    const nextIdx = this.route.findIndex((r) => r.id === this.currentRoad.id) + 1;
    const toRoad = this.route[nextIdx + 1] ?? this.route[nextIdx];
    const nextRoad = this.route[nextIdx];

    // Get the lane on next road that connects fromRoad and toRoad
    const lane = nextRoad.getConnectingLane(fromRoad, toRoad);

    // Assign, get waypoints
    this.currentRoad = nextRoad;
    this.currentLane = lane;
    this.routeWaypoints = [...this.currentLane.waypoints];

    // Lose the road we've just travelled
    this.route.shift();

    // If there is only one road left, can clear route as we have lane to it
    if (this.route.length === 1) {
      this.route = [];
    }

    // Target the next
    this.targetNextWaypoint();
  }

  private nextRoamRoad() {
    const toRoadIdx = this.currentLane?.toRoadIdx;
    const nextRoad = this.currentRoad?.neighbours[toRoadIdx];

    // Then find lanes that go from current road to the next
    const lanes = nextRoad.lanes.filter(
      (lane) => nextRoad.neighbours[lane.fromRoadIdx].id === this.currentRoad.id
    );

    // Pick a random lane
    const rnd = NumberUtils.getRandomArrayIndex(lanes.length);
    const nextLane = lanes[rnd];

    // Assign the next road and lane as current
    this.currentRoad = nextRoad;
    this.currentLane = nextLane;

    // Get the next lane's waypoints
    this.routeWaypoints = [...this.currentLane.waypoints];

    // Target the next (the first will be the last of current lane)
    this.targetNextWaypoint();
  }

  private drive(deltaTime: number) {
    // Has the route ended?
    if (!this.routeWaypoints.length || !this.nextWaypoint) {
      return;
    }

    // Have we reached the next waypoint?
    if (NumberUtils.vectorsEqual(this.position, this.nextWaypoint)) {
      // Target the next waypoint
      this.targetNextWaypoint();
    }

    // Otherwise, keep moving towards next target
    const direction = this.nextWaypoint.clone().sub(this.position).normalize();
    const speed = deltaTime * this.actualSpeed;
    this.position.x += direction.x * speed;
    this.position.z += direction.z * speed;

    // Rotate towards next target
    const rotateSpeed = speed * 1.5;
    this.model.quaternion.rotateTowards(this.nextLookAt, rotateSpeed);
  }

  private updateRaycaster() {
    // Get new forward facing direction
    const forward = new THREE.Vector3();
    this.model.getWorldDirection(forward);

    // Set ray to new forward and position
    this.raycaster.set(this.position, forward);

    // Update helper to match
    this.raycastHelper.setDirection(forward);
    this.raycastHelper.position.x = this.position.x;
    this.raycastHelper.position.z = this.position.z;
  }
}
