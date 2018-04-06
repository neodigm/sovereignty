import { Scene } from 'three';

import { deepMerge } from './utils';

import Game from './Game';
import { Component, TransformComponent } from './components';

export default class GameObject {

  public name: string;
  private components: Array<Component> = [];

  constructor(config: {[key: string]: any}) {
    if(config.extendsPrefab) {
      var prefab = Game.prefabs.find(prefab => prefab.name === config.extendsPrefab);
      config = deepMerge(prefab, config);
    }

    console.log(config)

    this.name = config.name || 'Object';
    Object.entries(config.components).forEach(entry => {
      var componentConstructor = Game.componentTypes.find(type => type.name === entry[0] || type.name === entry[0] + 'Component')

      if(componentConstructor) {
        this.components.push(new componentConstructor(entry[1], this));
      } else {
        console.warn(`Unknown component type "${entry[0]}"`)
      }
    })

    if(!this.components.some(component => component instanceof TransformComponent)) {
      this.components.push(new TransformComponent({}, this));
    }
  }

  public start(scene: Scene): void {
    this.components.forEach(component => component.start(scene));
  }

  public update(timeDelta: number): void {
    this.components.forEach(component => component.update(timeDelta));
  }

  public getComponent(type: (typeof Component) | string): Component | undefined {
    if(typeof type === 'string') {
      return this.components.find(component => component.constructor.name === type);
    } else {
      return this.components.find(component => component instanceof type);
    }
  }
}
