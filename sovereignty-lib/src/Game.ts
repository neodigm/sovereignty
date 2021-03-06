import { WebGLRenderer, Clock } from 'three';
import check from 'simple-typechecker';

import { exists } from 'utils';
import Scene from 'Scene';
import Input from './Input';

import components from 'components';

function handleCanvasClick(e) {
  (<HTMLElement>e.target).requestPointerLock();
}

export default class Game {

  public static get properties() {
    return {
      title: [ "string", null ],
      initialScene: [ "string", "number" ],
      captureCursor: [ "boolean", null ]
    }
  }

  public get activeScene() {
    return this.scenes[this.activeSceneIndex];
  }

  private activeSceneIndex: number = 0;
  private scenes: Array<Scene> = [];
  private editorMode: boolean;
  public static prefabs: Array<any> = [];
  public static materials: Array<any> = [];
  public static componentTypes: Array<any> = components;

  private clock: Clock = new Clock();
  private renderer: WebGLRenderer = new WebGLRenderer();

  public get captureCursor(): boolean {
    return this._captureCursor;
  }
  public set captureCursor(val: boolean) {
    this._captureCursor = val;
    if(val === true) {
      this.renderer.domElement.addEventListener('click', handleCanvasClick);
    } else {
      this.renderer.domElement.removeEventListener('click', handleCanvasClick);
      document.exitPointerLock();
    }
  }
  private _captureCursor: boolean = false;

  constructor(config: {[key: string]: any}) {
    console.log(config);
    console.log(this);

    check(config.game, Game.properties);

    document.title = config.game.title || '';

    // initialize from config
    Game.componentTypes = Game.componentTypes.concat(Object.values(config.components));
    Object.entries(config.materials).forEach(entry =>
      Game.materials.push({
        ...entry[1],
        ...{name: entry[0]}
      }));
    Object.entries(config.prefabs).forEach(entry => {
      let prefab: any = {
        ...entry[1],
        ...{name: entry[0]}
      };

      if(exists(prefab.extends)) {
        if(exists(config.prefabs[prefab.extends])) {
          Object.assign(prefab, config.prefabs[prefab.extends])
        } else {
          console.warn(`Prefab "${prefab.name}" tried to extend prefab "${prefab.extends}", which doesn't exist`)
        }
      }

      Game.prefabs.push(prefab);
    });
    Object.entries(config.scenes).forEach(entry => this.createScene({
      ...entry[1],
      ...{name: entry[0]}
    }));

    if(exists(config.game.initialScene)) {
      if(typeof config.game.initialScene === 'number') {
        this.activeSceneIndex = config.game.initialScene;
      } else if(typeof config.game.initialScene === 'string') {
        this.activeSceneIndex = this.scenes.findIndex(scene => scene.name === config.game.initialScene)
        this.activeSceneIndex = Math.max(this.activeSceneIndex, 0);
      }
    }

    // set up renderer
    this.renderer.shadowMap.enabled = true;


    this.captureCursor = config.game.captureCursor;
  }

  public createScene(config: {[key: string]: any}): Scene {
    check(config, Scene.properties);
    var newScene = new Scene(config);
    this.scenes.push(newScene);
    return newScene;
  }

  public goToScene(name: string) {
    let sceneIndex = this.scenes.findIndex(scene => scene.name === name);
    if(sceneIndex !== -1) {
      this.activeSceneIndex = sceneIndex;
    }
  }

  public start(containerElement: HTMLElement | undefined, editorMode: boolean): void {
    if(containerElement) {
      containerElement.appendChild(this.renderer.domElement);
      this.renderer.setSize( containerElement.scrollWidth, containerElement.scrollHeight );
    } else {
      document.body.appendChild(this.renderer.domElement);
      this.renderer.setSize( document.body.scrollWidth, document.body.scrollHeight );
    }

    this.editorMode = editorMode;

    var updateLoop = () => {
    	requestAnimationFrame(updateLoop);
      this.update();
      this.render();
    }
    updateLoop();
  }

  private update(): void {
    this.activeScene.update(this.clock.getDelta() * 1000, this.editorMode);
    Input.update();
  }

  private render(): void {
    this.activeScene.render(this.renderer);
  }
}
