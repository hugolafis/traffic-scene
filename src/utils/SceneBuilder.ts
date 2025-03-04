import * as THREE from 'three';

import { HouseName, ModelLoader, RoadName, VehicleName } from './ModelLoader';
import { Prop } from '../model/Prop';
import { Road } from '../model/Road';
import { RoadFactory } from './RoadFactory';
import { RoadUtils } from './RoadUtils';
import { Vehicle } from '../model/Vehicle';
import { VehicleFactory } from './VehicleFactory';
import { BufferAttribute } from 'three';
import { posix } from 'path';
import { group } from 'console';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

enum GroundType {
  GRASS = 'grass',
  CONCRETE = 'concrete',
}

export class SceneBuilder {
  private roads: Road[] = [];
  private vehicles: Vehicle[] = [];
  private grassMaterial = new THREE.MeshLambertMaterial({ color: '#34edae' });
  private concreteMaterial = new THREE.MeshLambertMaterial({ color: '#eaeaf0' });

  constructor(private modelLoader: ModelLoader) {}

  public buildRoads(): Road[] {
    this.roads = [];

    const quarterRot = Math.PI / 2;
    const halfRot = Math.PI;

    // Center crossroads at origin
    const c1 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3());

    const s1 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(0, 0, -2));
    const s2 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(0, 0, -4));

    const c2 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(0, 0, -6));

    const s3 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-2, 0, -6), quarterRot);
    const s4 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, -6), quarterRot);

    const c3 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(-6, 0, -6));

    const s5 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, -4));
    const s6 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, -2));

    const c4 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(-6, 0, 0));

    const s7 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, 0), quarterRot);
    const s8 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-2, 0, 0), quarterRot);

    const s9 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(2, 0, 0), quarterRot);
    const b1 = this.addRoad(RoadName.BEND, new THREE.Vector3(4, 0, 0), halfRot);
    const s10 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(4, 0, -2));

    const j1 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(4, 0, -4));

    const b2 = this.addRoad(RoadName.BEND, new THREE.Vector3(4, 0, -6), -quarterRot);
    const s11 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(2, 0, -6), quarterRot);

    const r1 = this.addRoad(RoadName.ROUNDABOUT, new THREE.Vector3(8, 0, -4));

    const s12 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(8, 0, -8));

    const j2 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(8, 0, -10), -quarterRot);

    const s13 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(6, 0, -10), quarterRot);
    const s14 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(4, 0, -10), quarterRot);
    const s15 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(2, 0, -10), quarterRot);

    const j3 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(0, 0, -10));

    const s16 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(0, 0, -8));

    const b3 = this.addRoad(RoadName.BEND, new THREE.Vector3(0, 0, -12), -quarterRot);
    const s17 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-2, 0, -12), quarterRot);
    const s18 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, -12), quarterRot);
    const b4 = this.addRoad(RoadName.BEND, new THREE.Vector3(-6, 0, -12));
    const s19 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, -10));
    const s20 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, -8));

    const s21 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-8, 0, -6), quarterRot);
    const b5 = this.addRoad(RoadName.BEND, new THREE.Vector3(-10, 0, -6));
    const b6 = this.addRoad(RoadName.BEND, new THREE.Vector3(-10, 0, -4), halfRot);
    const b7 = this.addRoad(RoadName.BEND, new THREE.Vector3(-12, 0, -4));
    const b8 = this.addRoad(RoadName.BEND, new THREE.Vector3(-12, 0, -2), quarterRot);
    const b9 = this.addRoad(RoadName.BEND, new THREE.Vector3(-10, 0, -2), -quarterRot);
    const b10 = this.addRoad(RoadName.BEND, new THREE.Vector3(-10, 0, 0), quarterRot);
    const s22 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-8, 0, 0), quarterRot);

    const s23 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, 2));
    const b11 = this.addRoad(RoadName.BEND, new THREE.Vector3(-6, 0, 4), quarterRot);
    const s24 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, 4), quarterRot);
    const s25 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-2, 0, 4), quarterRot);

    const j4 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(0, 0, 4), quarterRot);

    const s26 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(0, 0, 2));

    const s27 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(2, 0, 4), quarterRot);
    const s28 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(4, 0, 4), quarterRot);
    const s29 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(6, 0, 4), quarterRot);
    const b12 = this.addRoad(RoadName.BEND, new THREE.Vector3(8, 0, 4), halfRot);

    const j5 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(8, 0, 2));

    const s30 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(8, 0, 0));

    const s31 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(10, 0, 2), quarterRot);

    const j6 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(12, 0, 2), quarterRot);

    const s32 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(12, 0, 0));
    const s33 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(12, 0, -2));

    const c5 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(12, 0, -4));

    const s34 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(14, 0, 2), quarterRot);

    const j7 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(16, 0, 2), quarterRot);

    const s35 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(16, 0, 0));
    const s36 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(16, 0, -2));

    const c6 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(16, 0, -4));

    const s37 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(18, 0, 2), quarterRot);
    const b13 = this.addRoad(RoadName.BEND, new THREE.Vector3(20, 0, 2), halfRot);
    const s38 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(20, 0, 0));
    const s39 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(20, 0, -2));

    const j8 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(20, 0, -4), -halfRot);

    const s40 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(18, 0, -4), quarterRot);

    const s41 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(20, 0, -6));
    const s42 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(20, 0, -8));
    const b14 = this.addRoad(RoadName.BEND, new THREE.Vector3(20, 0, -10), -quarterRot);
    const s43 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(18, 0, -10), quarterRot);

    const c7 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(16, 0, -10));

    const s44 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(16, 0, -8));
    const s45 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(16, 0, -6));

    const s46 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(14, 0, -10), quarterRot);
    const b15 = this.addRoad(RoadName.BEND, new THREE.Vector3(12, 0, -10));

    const s47 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(12, 0, -8));
    const s48 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(12, 0, -6));

    const s49 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(16, 0, -12));
    const b16 = this.addRoad(RoadName.BEND, new THREE.Vector3(16, 0, -14), -quarterRot);
    const s50 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(14, 0, -14), quarterRot);
    const s51 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(12, 0, -14), quarterRot);
    const b17 = this.addRoad(RoadName.BEND, new THREE.Vector3(10, 0, -14));
    const s52 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(10, 0, -12));
    const b18 = this.addRoad(RoadName.BEND, new THREE.Vector3(10, 0, -10), halfRot);

    const s53 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(14, 0, -4), quarterRot);

    // Connect
    c1.connectRoads([s1, s8, s9, s26]);

    s1.connectRoads([c1, s2]);
    s2.connectRoads([s1, c2]);

    c2.connectRoads([s2, s3, s11, s16]);

    s3.connectRoads([c2, s4]);
    s4.connectRoads([s3, c3]);

    c3.connectRoads([s4, s5, s20, s21]);

    s5.connectRoads([c3, s6]);
    s6.connectRoads([s5, c4]);

    c4.connectRoads([s6, s7, s22, s23]);

    s7.connectRoads([c4, s8]);
    s8.connectRoads([s7, c1]);

    s9.connectRoads([c1, b1]);
    b1.connectRoads([s9, s10]);
    s10.connectRoads([b1, j1]);

    j1.connectRoads([s10, b2, r1]);

    b2.connectRoads([j1, s11]);
    s11.connectRoads([b2, c2]);

    r1.connectRoads([j1, s12, s30, c5]);

    s12.connectRoads([r1, j2]);

    j2.connectRoads([s12, s13, b18]);

    s13.connectRoads([j2, s14]);
    s14.connectRoads([s13, s15]);
    s15.connectRoads([s14, j3]);

    j3.connectRoads([s15, s16, b3]);

    s16.connectRoads([j3, c2]);

    b3.connectRoads([j3, s17]);
    s17.connectRoads([b3, s18]);
    s18.connectRoads([s17, b4]);
    b4.connectRoads([s18, s19]);
    s19.connectRoads([b4, s20]);
    s20.connectRoads([s19, c3]);

    s21.connectRoads([c3, b5]);
    b5.connectRoads([s21, b6]);
    b6.connectRoads([b5, b7]);
    b7.connectRoads([b6, b8]);
    b8.connectRoads([b7, b9]);
    b9.connectRoads([b8, b10]);
    b10.connectRoads([b9, s22]);
    s22.connectRoads([b10, c4]);

    s23.connectRoads([c4, b11]);
    b11.connectRoads([s23, s24]);
    s24.connectRoads([b11, s25]);
    s25.connectRoads([s24, j4]);

    j4.connectRoads([s25, s26, s27]);

    s26.connectRoads([j4, c1]);

    s27.connectRoads([j4, s28]);
    s28.connectRoads([s27, s29]);
    s29.connectRoads([s28, b12]);
    b12.connectRoads([s29, j5]);

    j5.connectRoads([b12, s30, s31]);

    s30.connectRoads([j5, r1]);

    s31.connectRoads([j5, j6]);

    j6.connectRoads([s31, s32, s34]);

    s32.connectRoads([j6, s33]);
    s33.connectRoads([s32, c5]);

    c5.connectRoads([r1, s33, s48, s53]);

    s34.connectRoads([j6, j7]);

    j7.connectRoads([s34, s35, s37]);

    s35.connectRoads([j7, s36]);
    s36.connectRoads([s35, c6]);

    c6.connectRoads([s36, s40, s45, s53]);

    s37.connectRoads([j7, b13]);
    b13.connectRoads([s37, s38]);
    s38.connectRoads([b13, s39]);
    s39.connectRoads([s38, j8]);

    j8.connectRoads([s39, s40, s41]);

    s40.connectRoads([j8, c6]);

    s41.connectRoads([j8, s42]);
    s42.connectRoads([s41, b14]);
    b14.connectRoads([s42, s43]);
    s43.connectRoads([b14, c7]);

    c7.connectRoads([s43, s44, s46, s49]);

    s44.connectRoads([c7, s45]);
    s45.connectRoads([s44, c6]);

    s46.connectRoads([c7, b15]);
    b15.connectRoads([s46, s47]);
    s47.connectRoads([b15, s48]);
    s48.connectRoads([s47, c5]);

    s49.connectRoads([c7, b16]);
    b16.connectRoads([s49, s50]);
    s50.connectRoads([b16, s51]);
    s51.connectRoads([s50, b17]);
    b17.connectRoads([s51, s52]);
    s52.connectRoads([b17, b18]);
    b18.connectRoads([s52, j2]);

    s53.connectRoads([c5, c6]);

    this.roads = [
      c1,
      s1,
      s2,
      c2,
      s3,
      s4,
      c3,
      s5,
      s6,
      c4,
      s7,
      s8,
      s9,
      b1,
      s10,
      j1,
      b2,
      s11,
      r1,
      s12,
      j2,
      s13,
      s14,
      s15,
      j3,
      s16,
      b3,
      s17,
      s18,
      b4,
      s19,
      s20,
      s21,
      b5,
      b6,
      b7,
      b8,
      b9,
      b10,
      s22,
      s23,
      b11,
      s24,
      s25,
      j4,
      s26,
      s27,
      s28,
      s29,
      b12,
      j5,
      s30,
      s31,
      j6,
      s32,
      s33,
      c5,
      s34,
      j7,
      s35,
      s36,
      c6,
      s37,
      b13,
      s38,
      s39,
      j8,
      s40,
      s41,
      s42,
      b14,
      s43,
      c7,
      s44,
      s45,
      s46,
      b15,
      s47,
      s48,
      s49,
      b16,
      s50,
      s51,
      b17,
      s52,
      b18,
      s53,
    ];

    return this.roads;
  }

  public buildVehicles(): Vehicle[] {
    this.vehicles = [];

    const vehicleNames = Object.values(VehicleName);

    vehicleNames.forEach((name) => {
      this.addCar(name);
      this.addCar(name);
      this.addCar(name);
    });

    return this.vehicles;
  }

  public buildHouses(): Prop[] {
    // First block inside the c1-c4 crossroads
    const h1 = this.addHouse(HouseName.TYPE_03, new THREE.Vector3(-2.25, 0, -1.75));
    const h2 = this.addHouse(HouseName.TYPE_15, new THREE.Vector3(-4.3, 0, -1.75));
    const h3 = this.addHouse(HouseName.TYPE_16, new THREE.Vector3(-1.7, 0, -4.1), Math.PI);
    const h4 = this.addHouse(HouseName.TYPE_10, new THREE.Vector3(-3.7, 0, -3.95), Math.PI);
    const g1 = this.addGround(
      GroundType.GRASS,
      new THREE.Vector2(4, 4),
      new THREE.Vector3(-3, 0, -3)
    );
    const block1 = [h1, h2, h3, h4, g1];

    // Second block above first
    const h5 = this.addHouse(HouseName.TYPE_19, new THREE.Vector3(-2, 0, -7.75));
    const h6 = this.addHouse(HouseName.TYPE_01, new THREE.Vector3(-4, 0, -7.75));
    const h7 = this.addHouse(HouseName.TYPE_03, new THREE.Vector3(-2.25, 0, -10.3), Math.PI);
    const h8 = this.addHouse(HouseName.TYPE_21, new THREE.Vector3(-4.3, 0, -10.3), Math.PI);
    const g2 = this.addGround(
      GroundType.GRASS,
      new THREE.Vector2(4, 4),
      new THREE.Vector3(-3, 0, -9)
    );
    const block2 = [h5, h6, h7, h8, g2];

    // Third block left of first
    const h9 = this.addHouse(HouseName.TYPE_08, new THREE.Vector3(-8, 0, -3), Math.PI / 2);
    const g3 = this.addGround(
      GroundType.GRASS,
      new THREE.Vector2(4, 4),
      new THREE.Vector3(-9, 0, -3)
    );
    const block3 = [h9, g3];

    // Fourth block to right of first
    const h10 = this.addHouse(HouseName.TYPE_21, new THREE.Vector3(2, 0, -2), -Math.PI / 2);
    const h11 = this.addHouse(HouseName.TYPE_20, new THREE.Vector3(2, 0, -3.85), -Math.PI / 2);
    const g4 = this.addGround(
      GroundType.CONCRETE,
      new THREE.Vector2(2, 4),
      new THREE.Vector3(2, 0, -3)
    );
    const block4 = [h10, h11, g4];

    // Fifth block below first
    const h12 = this.addHouse(HouseName.TYPE_18, new THREE.Vector3(-2, 0, 2));
    const h13 = this.addHouse(HouseName.TYPE_20, new THREE.Vector3(-4, 0, 2));
    const g5 = this.addGround(
      GroundType.CONCRETE,
      new THREE.Vector2(4, 2),
      new THREE.Vector3(-3, 0, 2)
    );
    const block5 = [h12, h13, g5];

    // Sixth block top left of roundabout
    const h14 = this.addHouse(HouseName.TYPE_04, new THREE.Vector3(2.25, 0, -8), Math.PI);
    const h15 = this.addHouse(HouseName.TYPE_16, new THREE.Vector3(4, 0, -8), Math.PI);
    const h16 = this.addHouse(HouseName.TYPE_05, new THREE.Vector3(5.75, 0, -7.85), Math.PI);
    const g6 = this.addGround(
      GroundType.GRASS,
      new THREE.Vector2(6, 4),
      new THREE.Vector3(4, 0, -7)
    );
    const block6 = [h14, h15, h16, g6];

    // Seventh block is bot left of roundabout
    const h17 = this.addHouse(HouseName.TYPE_09, new THREE.Vector3(2, 0, 2));
    const h18 = this.addHouse(HouseName.TYPE_11, new THREE.Vector3(4, 0, 2));
    const h19 = this.addHouse(HouseName.TYPE_12, new THREE.Vector3(6, 0, 2));
    const h20 = this.addHouse(HouseName.TYPE_01, new THREE.Vector3(6.25, 0, 0), Math.PI / 2);
    const g7 = this.addGround(
      GroundType.GRASS,
      new THREE.Vector2(6, 2),
      new THREE.Vector3(4, 0, 2)
    );
    const g8 = this.addGround(
      GroundType.GRASS,
      new THREE.Vector2(4, 4),
      new THREE.Vector3(5, 0, -1)
    );
    const block7 = [h17, h18, h19, h20, g7, g8];

    // Eighth block is top right of roundabout
    const h21 = this.addHouse(HouseName.TYPE_13, new THREE.Vector3(10, 0, -8), -Math.PI / 2);
    const h22 = this.addHouse(HouseName.TYPE_14, new THREE.Vector3(12, 0, -12), Math.PI);
    const h23 = this.addHouse(HouseName.TYPE_17, new THREE.Vector3(14, 0, -12), Math.PI);
    const g9 = this.addGround(
      GroundType.GRASS,
      new THREE.Vector2(3, 6.5),
      new THREE.Vector3(10, 0, -7)
    );
    const g10 = this.addGround(
      GroundType.GRASS,
      new THREE.Vector2(4.5, 3.5),
      new THREE.Vector3(13, 0, -12)
    );
    const block8 = [g9, g10, h21, h22, h23];

    // Ninth block is bot right of roundabout
    const h24 = this.addHouse(HouseName.TYPE_07, new THREE.Vector3(10, 0, 0.3));
    const h25 = this.addHouse(HouseName.TYPE_19, new THREE.Vector3(10.3, 0, -1.3), Math.PI / 2);
    const g11 = this.addGround(
      GroundType.CONCRETE,
      new THREE.Vector2(2, 4),
      new THREE.Vector3(10, 0, -1)
    );
    const block9 = [g11, h24, h25];

    // Tenth block is top left of quad to right of roundabout
    const h26 = this.addHouse(HouseName.TYPE_21, new THREE.Vector3(14, 0, -8), -Math.PI / 2);
    const h27 = this.addHouse(HouseName.TYPE_15, new THREE.Vector3(14, 0, -6));
    const g12 = this.addGround(
      GroundType.CONCRETE,
      new THREE.Vector2(2, 4),
      new THREE.Vector3(14, 0, -7)
    );
    const block10 = [g12, h26, h27];

    // Eleventh block is right of tenth
    const h28 = this.addHouse(HouseName.TYPE_11, new THREE.Vector3(18, 0, -8), -Math.PI / 2);
    const h29 = this.addHouse(HouseName.TYPE_09, new THREE.Vector3(18, 0, -6));
    const g13 = this.addGround(
      GroundType.CONCRETE,
      new THREE.Vector2(2, 4),
      new THREE.Vector3(18, 0, -7)
    );
    const block11 = [g13, h28, h29];

    // Twelfth block is below tenth
    const h30 = this.addHouse(HouseName.TYPE_20, new THREE.Vector3(14, 0, 0));
    const h31 = this.addHouse(HouseName.TYPE_05, new THREE.Vector3(14, 0, -2), Math.PI);
    const g14 = this.addGround(
      GroundType.GRASS,
      new THREE.Vector2(2, 4),
      new THREE.Vector3(14, 0, -1)
    );
    const block12 = [g14, h30, h31];

    // Thirteenth block is right of tenth
    const h32 = this.addHouse(HouseName.TYPE_12, new THREE.Vector3(18, 0, 0), -Math.PI / 2);
    const h33 = this.addHouse(HouseName.TYPE_14, new THREE.Vector3(18, 0, -2));
    const g15 = this.addGround(
      GroundType.CONCRETE,
      new THREE.Vector2(2, 4),
      new THREE.Vector3(18, 0, -1)
    );
    const block13 = [g15, h32, h33];

    // Ground inside roundabout
    const g16 = this.addGround(
      GroundType.GRASS,
      new THREE.Vector2(1, 1),
      new THREE.Vector3(8, 0, -4)
    );

    return [
      ...block1,
      ...block2,
      ...block3,
      ...block4,
      ...block5,
      ...block6,
      ...block7,
      ...block8,
      ...block9,
      ...block10,
      ...block11,
      ...block12,
      ...block13,
      g16,
    ];
  }

  private addRoad(name: RoadName, pos: THREE.Vector3, rot = 0) {
    const road = RoadFactory.createRoad(name, this.modelLoader.getModel(name));

    road.position.x = pos.x;
    road.position.y = pos.y;
    road.position.z = pos.z;

    road.rotation.y = rot;

    road.postTransform();

    return road;
  }

  private addCar(name: VehicleName, color?: THREE.Color) {
    // Create the car
    const car = VehicleFactory.createVehicle(name, this.modelLoader.getModel(name), color);
    this.vehicles.push(car);

    // Pick a random road to start on
    let road = RoadUtils.getRandomStartingRoad(this.roads);

    // While a vehicle is on that starting road, pick another
    let vehicleOnRoad = this.vehicles.some((v) => v.currentRoad?.id === road.id);
    while (vehicleOnRoad) {
      road = RoadUtils.getRandomStartingRoad(this.roads);
      vehicleOnRoad = this.vehicles.some((v) => v.currentRoad?.id === road.id);
    }

    // Assign to car to start roaming
    car.setRoam(road);
  }

  private addHouse(name: HouseName, pos: THREE.Vector3, rot = 0) {
    const houseModel = this.modelLoader.getModel(name);
    const house = new Prop(houseModel);

    house.position.x = pos.x;
    house.position.y = pos.y;
    house.position.z = pos.z;

    house.rotation.y = rot;

    return house;
  }

  private addGround(type: GroundType, size: THREE.Vector2, pos: THREE.Vector3) {
    const geom = new THREE.PlaneGeometry(size.x, size.y);

    const mat = type === GroundType.GRASS ? this.grassMaterial : this.concreteMaterial;

    const mesh = new THREE.Mesh(geom, mat);
    mesh.receiveShadow = true;

    mesh.position.x = pos.x;
    mesh.position.y = -0.01;
    mesh.position.z = pos.z;

    mesh.rotation.x = -Math.PI / 2;

    const group = new THREE.Group();
    group.add(mesh);

    if (type === GroundType.GRASS) {
      const grass = this.addGrass(size, pos, 1000);
      const bushes = this.addBushes(size, pos, 2);
      group.add(grass);
      group.add(bushes);
    }
    
    const prop = new Prop(group);

    return prop;
  }

  private addGrass(size: THREE.Vector2, pos: THREE.Vector3, density: number): THREE.Group {
    const totalCount = size.x * size.y * density;

    const alpha = new THREE.TextureLoader().load('assets/textures/grass2_alpha.png'); // should move this out of here
    const diffuse = new THREE.TextureLoader().load('assets/textures/grass2_diffuse.png'); // should move this out of here
    const grassMat = new THREE.MeshStandardMaterial({vertexColors: true, alphaMap: alpha, map: diffuse, transparent: true, alphaTest: 0.9, roughness: 0.66});
    const grassGroup = new THREE.Group();
    grassGroup.name = 'Grass';

    let vertColors = new Float32Array([
      18, 138, 97,
      18, 138, 97,
      64, 255, 169,
      64, 255, 169,
      64, 255, 169,
      18, 138, 97,
    ]);

    // laziness so I can use 0-255
    vertColors = vertColors.map(x => {
      return x / 255;
    })

     // Grass Plane
    const square = [
      -1, -1,  0,
      1, -1,  0,
      1,  1,  0,
   
      1,  1,  0,
     -1,  1,  0,
     -1, -1,  0
    ];

    const normals = [
      0, 0.8, 0.2,
      0, 0.8, 0.2,
      0, 0.8, 0.2,
      0, 0.8, 0.2,
      0, 0.8, 0.2,
      0, 0.8, 0.2,
    ];

    const uv = [
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
    ]

    const grassGeo = new THREE.BufferGeometry();
    grassGeo.setAttribute( 'position', new THREE.Float32BufferAttribute( square, 3 ) );
    grassGeo.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
    grassGeo.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );
    grassGeo.setAttribute('color', new BufferAttribute(vertColors, 3)); 
    //const grass = new THREE.Mesh( grassGeo, grassMat );

    const mesh = new THREE.InstancedMesh(grassGeo, grassMat, totalCount);

    mesh.receiveShadow = true;
    const matrix = new THREE.Matrix4();

    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const euler = new THREE.Euler(0, 0, 0);

    for (let i = 0; i < totalCount * 2; i+=2) {
      const randomX = (Math.random() * size.x) - (size.x / 2); 
      const randomY = (Math.random() * size.y) - (size.y / 2); 
      const randomScale = (Math.random() * 0.1) + 0.05;
      scale.set(
        randomScale,
        randomScale,
        randomScale,
      );

      position.set(
        pos.x + randomX,
        0 + scale.y - 0.01,
        pos.z + randomY
      );
      
      const randomRot = Math.random() * Math.PI * 2;
      euler.y = randomRot;
      rotation.setFromEuler(euler, true);
      matrix.compose( position, rotation, scale );
      mesh.setMatrixAt(i, matrix);

      // We need to add the second plane for the backface
      // Can't use double-sided as it will break normals
      euler.y = euler.y + Math.PI;
      rotation.setFromEuler(euler, true);
      matrix.compose( position, rotation, scale);
      mesh.setMatrixAt(i+1, matrix);
    }

    grassGroup.add(mesh);
    return grassGroup;
  }

  private addBushes(size: THREE.Vector2, pos: THREE.Vector3, density: number): THREE.Group {
    const totalCount = size.x * size.y * density;
    const planesPerBush = 6;
    const alpha = new THREE.TextureLoader().load('assets/textures/bushUpper_alpha.png'); // should move this out of here
    const diffuse = new THREE.TextureLoader().load('assets/textures/bushUpper_diffuse.png'); // should move this out of here
    const bushMat = new THREE.MeshStandardMaterial({vertexColors: true, alphaMap: alpha, map: diffuse, transparent: true, alphaTest: 0.9, roughness: 0.66});
    const bushGroup = new THREE.Group();
    bushGroup.name = 'Bushes';

    // Grass Plane
    const square = [
      -1, -1,  0,
      1, -1,  0,
      1,  1,  0,
    
      1,  1,  0,
      -1,  1,  0,
      -1, -1,  0
    ];

    const uv = [
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
    ];

    // TODO - figure out how to make these spherical from origin
    const normals = [
      0, 0.75, 0.25,
      0, 0.75, 0.25,
      0, 0.75, 0.25,
      0, 0.75, 0.25,
      0, 0.75, 0.25,
      0, 0.75, 0.25,
    ];

    let vertColors = new Float32Array([
      128, 128, 128,
      128, 128, 128,
      255, 255, 255,
      255, 255, 255,
      255, 255, 255,
      128, 128, 128,
    ]);

    // laziness so I can use 0-255
    vertColors = vertColors.map(x => {
      return x / 255;
    })

    const bushGeo = new THREE.BufferGeometry();
    bushGeo.setAttribute( 'position', new THREE.Float32BufferAttribute( square, 3 ) );
    bushGeo.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
    bushGeo.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );
    bushGeo.setAttribute('color', new BufferAttribute(vertColors, 3)); 

    const mesh = new THREE.InstancedMesh(bushGeo, bushMat, totalCount);

    mesh.receiveShadow = true;
    mesh.castShadow = true;
    const matrix = new THREE.Matrix4();

    const origin = new THREE.Vector3();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const euler = new THREE.Euler(0, 0, 0);

    // This process is a little different than grass
    // We need x planes per bush and need to offset them relative to each other
    for (let i = 0; i < totalCount * planesPerBush; i+= (planesPerBush * 2)) {
      //debugger;
      let randomRot = 0;
      const randomX = (Math.random() * size.x) - (size.x / 2); 
      const randomY = (Math.random() * size.y) - (size.y / 2); 
      origin.set(
        pos.x + randomX,
        0 - 0.01,
        pos.z + randomY,
      )

      for (let p = 0; p < planesPerBush * 2; p+=2) {
        //const randomRot = Math.random() * Math.PI * 2;
        randomRot += (Math.PI * 2) / (planesPerBush * 2) + Math.random() * 0.025;
        const randomScale = Math.random() *  0.25 + 0.25;
        const offset = Math.random() * 0.1;
        scale.set(
          randomScale,
          randomScale,
          randomScale
        );

        position.set(
          origin.x + offset,
          origin.y + offset + randomScale / 2,
          origin.z + offset,
        );

        euler.y = randomRot;

        rotation.setFromEuler(euler, true);
        matrix.compose( position, rotation, scale );
        mesh.setMatrixAt(i + p, matrix);

        euler.y = randomRot + Math.PI;

        rotation.setFromEuler(euler, true);
        matrix.compose( position, rotation, scale);
        mesh.setMatrixAt(i + p + 1, matrix);
      }
    }

    bushGroup.add(mesh);
    return bushGroup;

    // for (let i = 0; i < totalCount * 2; i+=2) {


    //   const randomScale = Math.random() *  Math.random();
    //   scale.set(
    //     randomScale,
    //     randomScale,
    //     randomScale,
    //   );

      
    // }
  }
}
