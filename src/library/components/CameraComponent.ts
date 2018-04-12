import { Camera, PerspectiveCamera, OrthographicCamera, Scene } from 'three';
import { World } from 'cannon';

import GameObject from '../GameObject';
import Component from './Component';
import TransformComponent from './TransformComponent';

export default class CameraComponent extends Component {

  public threeCamera: Camera;

  constructor(config: {[key: string]: any}, gameObject: GameObject) {
    super(config, gameObject);

    switch(config.type || 'perspective') {
      case 'perspective':
        this.threeCamera = new PerspectiveCamera(
          config.fov || 75,
          config.aspect || window.innerWidth / window.innerHeight,
          config.near || 0.1,
          config.far || 1000
        );
      break;
      case 'orthographic':
        this.threeCamera = new OrthographicCamera(
          config.left || window.innerWidth / -2,
          config.right || window.innerWidth / 2,
          config.top || window.innerHeight / -2,
          config.bottom || window.innerHeight / 2,
          config.near || 0.1,
          config.far || 1000
        );
      break;
    }
  }

  public initialize(scene: Scene, world: World): void {
    this.threeCamera.rotation.y += Math.PI;
    this.transform.threeGroup.add(this.threeCamera);
  }

}
