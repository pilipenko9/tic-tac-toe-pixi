import './global.scss';
import { assetsMap } from './assetsMap';
import type { BitmapFontLoadDescription, SpriteLoadDescription } from './descriptions';
import { Playfield } from './objects/Playfield';
import * as PIXI from 'pixi.js';
import { Application } from 'pixi.js';

export class Game {
  private readonly game: PIXI.Application;

  public playfield: Playfield;

  constructor() {
    this.game = new Application({
      width: window.screenX,
      height: window.screenY,
      backgroundColor: 0x00c1ac,
      antialias: true,
    });
    document.body.appendChild(this.game.view);
    this.loadAssets();
  }

  private loadAssets() {
    assetsMap.sprites?.forEach((sprite: SpriteLoadDescription) => {
      this.game.loader.add(sprite.name, sprite.url);
    });
    assetsMap.sequences?.forEach((seq: SpriteLoadDescription) => {
      this.game.loader.add(seq.name, seq.url);
    });
    assetsMap.bitMapFonts.forEach((font: BitmapFontLoadDescription) => {
      this.game.loader.add(font.name, font.url);
    });
    this.game.loader.load((loader, res) => this.startGame(loader, res));
    this.game.renderer.resize(window.innerWidth, window.innerHeight);
  }

  private startGame(loader, res) {
    this.game.stage.position.set(window.innerWidth / 2, window.innerHeight / 2);
    this.playfield = new Playfield(this.game, res);
    this.playfield.scale.set(0.6, 0.6);
    this.game.stage.addChild(this.playfield);
  }
}

// init
new Game();
