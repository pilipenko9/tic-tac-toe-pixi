import { Container, Sprite, Texture } from 'pixi.js';
import { PlayfieldPositionDescription } from './PlayfieldPositionDescription';
import { GameEventEmitter } from './EventEmmiter';
import { Playfield } from './Playfield';

export class Field extends Container {
  public id: number;
  private resources: any;

  constructor(game: any, resources: any, texture: number, id: number) {
    super();
    this.resources = resources;
    this.id = id;
    this.changeTexture(0);
  }

  public changeTexture(texture: 0 | 1 | 2 | 4) {
    if (texture === 0) {
      this.addChild(this.textureCreator('win_highlight', true, false));
    } else if (texture === 1) {
      this.children[0].destroy();
      this.addChild(this.textureCreator('cross-draw_19', false, true));
    } else if (texture === 2) {
      this.children[0].destroy();
      this.addChild(this.textureCreator('circle-win_01', false, true));
    } else if (texture === 4) {
      this.children[0].destroy();
      this.addChild(this.textureCreator('win_highlight', false, true));
    }
  }

  public winAnimationCreator(texture: string) {
    const animation = (this.parent as Playfield).createAnimation(this.resources.sequence.textures, texture);
    this.addChild(animation);
    animation.position.set(this.children[0].x, this.children[0].y);
    animation.loop = true;
    animation.anchor.set(0.5, 0.5);
    animation.animationSpeed = 0.6;
    animation.play();
  }

  private textureCreator(textureName: string, interactive: boolean, visible: boolean) {
    const resultTexture = new Sprite(Texture.from(textureName));
    resultTexture.anchor.set(0.5, 0.5);
    resultTexture.alpha = visible ? 1 : 0;
    resultTexture.interactive = interactive;
    resultTexture.buttonMode = interactive;
    resultTexture.position.set(PlayfieldPositionDescription[this.id].x, PlayfieldPositionDescription[this.id].y);
    resultTexture.once('pointerdown', () => {
      GameEventEmitter.emit('FIELD_CLICK_HANDLER', this.id);
    });
    return resultTexture;
  }

  public activateInteractive() {
    this.children[0].interactive = true;
    this.children[0].buttonMode = true;
  }

  public disableInteractive() {
    this.children[0].interactive = false;
    this.children[0].buttonMode = false;
  }
}
