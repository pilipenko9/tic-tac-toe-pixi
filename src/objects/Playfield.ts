import * as PIXI from 'pixi.js';
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import type { MatrixType } from '../descriptions';
import { Field } from './Field';
import { GameEventEmitter } from './EventEmmiter';
import { PlayfieldPositionDescription } from './PlayfieldPositionDescription';

export class Move {
  index : number
  score : number
}
export class Playfield extends Container {
  private readonly playfield: Sprite;
  private fields: Array<Array<Field>>;

  // init
  private matrix: MatrixType = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  private readonly resources;
  private readonly game;
  private readonly restartButtonContainer: Container;
  private bitmapFontLight: PIXI.BitmapText;

  private board:Array<number | string> = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  private huPlayer = "P";
  private aiPlayer = "C";

  constructor(game, resources) {
    super();
    this.game = game;
    this.resources = resources;
    this.fields = [[], [], []];
    this.restartButtonContainer = new Container();
    this.playfield = new Sprite(Texture.from('playfield'));
    this.playfield.anchor.set(0.5, 0.5);

    this.fieldsCreator();
    this.createRestartButton();
    this.createBitMapFont();

    this.addChild(this.restartButtonContainer);
    this.addChild(this.playfield);

    // events
    GameEventEmitter.on('FIELD_CLICK_HANDLER', (args) => this.clickFieldHandler(args));
  }

  private createBitMapFont() {
    this.bitmapFontLight = new PIXI.BitmapText('TIC TAC TOE', {
      fontName: 'lightFont',
      align: 'center',
      fontSize: 90,
    });
    this.bitmapFontLight.anchor.set(0.5, 0.5);
    this.bitmapFontLight.position.set(0, -520);
    this.addChild(this.bitmapFontLight);
  }

  private createRestartButton() {
    const btn = new Graphics();
    btn.beginFill(0x00a492);
    btn.drawRoundedRect(window.screenX / 2 - 150, window.screenY / 2 + 450, 300, 120, 20);
    this.restartButtonContainer.interactive = true;
    this.restartButtonContainer.buttonMode = true;
    const btnText: PIXI.Text = new PIXI.Text('RESTART', {
      fontSize: 40,
      fill: 'white',
      fontWeight: '600',
      fontFamily: 'Roboto, sans-serif',
    });
    btnText.position.set(window.screenX / 2 - 90, window.screenY / 2 + 485);
    this.restartButtonContainer.on('pointerdown', () => this.restartHandler());
    this.restartButtonContainer.addChild(btn);
    this.restartButtonContainer.addChild(btnText);
  }

  private restartHandler() {
    this.matrix = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        this.fields[i][j].destroy();
      }
    }

    this.fields = [[], [], []];
    this.bitmapFontLight.text = 'TIC TAC TOE';
    this.fieldsCreator();
    this.board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  }

  private fieldsCreator() {
    let counterIterable = 0;
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        const field = new Field(this.game, this.resources, this.matrix[i][j], counterIterable);
        this.fields[i].push(field);
        this.addChild(field);
        counterIterable++;
      }
    }
  }

  private clickFieldHandler(id: number) {
    this.buttonsDisabling();
    const animCross = this.createAnimation(this.resources.sequence.textures, 'cross-draw');
    animCross.loop = false;
    animCross.anchor.set(0.5, 0.5);
    this.addChild(animCross);
    animCross.animationSpeed = 0.8;
    ////
    this.board[id] = this.huPlayer;
    ////
    let counterIterable = 0;
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        if (counterIterable === id) {
          this.matrix[i][j] = 1;
          animCross.position.set(PlayfieldPositionDescription[id].x, PlayfieldPositionDescription[id].y);
          animCross.play();
          animCross.onComplete = () => {
            this.fields[i][j].changeTexture(1);
            animCross.destroy();
            this.checkPlayerWin();
          };
          return;
        } else {
          counterIterable++;
        }
      }
    }
  }

  public createAnimation(textures: Array<any>, includeString: string) {
    let resultArrSeq = [];
    for (let i = 0; i < Object.keys(textures).length; i++) {
      const currentTexture = Object.keys(textures)[i];
      if (currentTexture.includes(includeString)) {
        resultArrSeq.push(Texture.from(Object.keys(textures)[i]));
      }
    }
    return new PIXI.AnimatedSprite(resultArrSeq);
  }

  private checkPlayerWin() {
    let counterLastChance = 0;
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        if (this.matrix[i][j] === 0) {
          counterLastChance++;
        }
      }
    }

    if (this.checkWinLines(1) === true) {
      this.endGame(1);
    } else {
      if (counterLastChance < 1) {
        // draw
        this.endGame(0);
      } else {
        this.opponentMove();
      }
    }
  }

  private checkOpponentWin() {
    let counterLastChance = 0;
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        if (this.matrix[i][j] === 0) {
          counterLastChance++;
        }
      }
    }

    if (counterLastChance < 1) {
      // draw
      this.endGame(0);
    } else {
      if (this.checkWinLines(2) === true) {
        // opponent win
        this.endGame(2);
      } else {
        this.buttonsActivate();
      }
    }
  }

  private checkWinLines(checking: 1 | 2) {
    //1 = player, 2 = pc
    // check horizontal lines
    for (let i = 0; i < 3; i++) {
      if (this.matrix[i][0] === checking && this.matrix[i][1] === checking && this.matrix[i][2] === checking) {
        return true;
      }
    }

    // check vertical lines
    for (let i = 0; i < 3; i++) {
      if (this.matrix[0][i] === checking && this.matrix[1][i] === checking && this.matrix[2][i] === checking) {
        return true;
      }
    }

    // check diagonal
    for (let i = 0; i < 3; i++) {
      if (this.matrix[0][0] === checking && this.matrix[1][1] === checking && this.matrix[2][2] === checking) {
        return true;
      } else if (this.matrix[0][2] === checking && this.matrix[1][1] === checking && this.matrix[2][0] === checking) {
        return true;
      }
    }

    // no win
    return false;
  }

  private minimax(player) {
    //iter++;
    let array = this.avail();
    if (this.winning(this.board, this.huPlayer)) {
      return {
        score: -10
      };
    } else if (this.winning(this.board, this.aiPlayer)) {
      return {
        score: 10
      };
    } else if (array.length === 0) {
      return {
        score: 0
      };
    }

    let moves = [];
    for (let i = 0; i < array.length; i++) {
      let move:Move = new Move();
      move.index = this.board[array[i]];
      this.board[array[i]] = player;

      if (player == this.aiPlayer) {
        let g = this.minimax(this.huPlayer);
        move.score = g.score;
      } else {
        let g = this.minimax(this.aiPlayer);
        move.score = g.score;
      }
      this.board[array[i]] = move.index;
      moves.push(move);
    }

    let bestMove;
    if (player === this.aiPlayer) {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove];
  }

  //available spots
  private avail() {
    return this.board.filter(s => s != "P" && s != "C");
  }

// winning combinations
  private winning(board, player) {
    return (board[0] == player && board[1] == player && board[2] == player) ||
        (board[3] == player && board[4] == player && board[5] == player) ||
        (board[6] == player && board[7] == player && board[8] == player) ||
        (board[0] == player && board[3] == player && board[6] == player) ||
        (board[1] == player && board[4] == player && board[7] == player) ||
        (board[2] == player && board[5] == player && board[8] == player) ||
        (board[0] == player && board[4] == player && board[8] == player) ||
        (board[2] == player && board[4] == player && board[6] == player);
  }

  private opponentMove() {
    let counterIterable = 0;
    let possiblePositionsForCircleDraw = [];

    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        if (this.matrix[i][j] === 0) {
          possiblePositionsForCircleDraw.push(PlayfieldPositionDescription[counterIterable].id - 1);
          counterIterable++;
        } else {
          counterIterable++;
        }
      }
    }
    const resultChoice = this.minimax(this.aiPlayer).index;
    this.board[resultChoice] = this.aiPlayer;
    counterIterable = 0;

    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        if (counterIterable === resultChoice) {
          this.matrix[i][j] = 2;
          this.drawCircle(i, j, resultChoice);
          return;
        } else {
          counterIterable++;
        }
      }
    }
  }

  private drawCircle(posX: number, posY: number, position: number) {
    const animCircle = this.createAnimation(this.resources.sequence.textures, 'circle-draw');
    animCircle.loop = false;
    animCircle.anchor.set(0.5, 0.5);
    this.addChild(animCircle);
    animCircle.animationSpeed = 0.8;
    animCircle.position.set(PlayfieldPositionDescription[position].x, PlayfieldPositionDescription[position].y);
    animCircle.play();
    animCircle.onComplete = () => {
      this.fields[posX][posY].changeTexture(2);
      this.checkOpponentWin();
      animCircle.destroy();
      return;
    };
  }

  private buttonsActivate() {
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        if (this.matrix[i][j] === 0) {
          this.fields[i][j].activateInteractive();
        }
      }
    }
  }

  private buttonsDisabling() {
    for (let i = 0; i < this.fields.length; i++) {
      for (let j = 0; j < this.fields[i].length; j++) {
        this.fields[i][j].disableInteractive();
      }
    }
  }

  private endGame(whoIsWin: 0 | 1 | 2) {
    this.buttonsDisabling();

    if (whoIsWin === 0) {
      this.bitmapFontLight.text = 'DRAW';
    }
    if (whoIsWin === 1) {
      this.bitmapFontLight.text = 'THE PLAYER WON!';
      this.activateHighlightsAndAnimation(1);
    }
    if (whoIsWin === 2) {
      this.bitmapFontLight.text = 'THE OPPONENT HAS WON!';
      this.activateHighlightsAndAnimation(2);
    }
  }

  private activateHighlightsAndAnimation(whoIsWin: 0 | 1 | 2): void {
    //1 = player, 2 = pc, 0 = dra
    let animationSelector;
    if (whoIsWin === 1) {
      animationSelector = 'cross-win';
    } else if (whoIsWin === 2) {
      animationSelector = 'circle-win';
    } else {
      animationSelector = null;
    }
    // check horizontal lines
    let counterIterable = 0;
    for (let i = 0; i < 3; i++) {
      if (this.matrix[i][0] === whoIsWin && this.matrix[i][1] === whoIsWin && this.matrix[i][2] === whoIsWin) {
        this.fields[i][0].changeTexture(4);
        this.fields[i][0].winAnimationCreator(animationSelector);
        this.fields[i][1].changeTexture(4);
        this.fields[i][1].winAnimationCreator(animationSelector);
        this.fields[i][2].changeTexture(4);
        this.fields[i][2].winAnimationCreator(animationSelector);
      } else {
        counterIterable++;
      }
    }

    // check vertical lines
    counterIterable = 0;
    for (let i = 0; i < 3; i++) {
      counterIterable++;
      if (this.matrix[0][i] === whoIsWin && this.matrix[1][i] === whoIsWin && this.matrix[2][i] === whoIsWin) {
        this.fields[0][i].changeTexture(4);
        this.fields[0][i].winAnimationCreator(animationSelector);
        this.fields[1][i].changeTexture(4);
        this.fields[1][i].winAnimationCreator(animationSelector);
        this.fields[2][i].changeTexture(4);
        this.fields[2][i].winAnimationCreator(animationSelector);
      }
    }

    // check diagonal
    counterIterable = 0;
    for (let i = 0; i < 3; i++) {
      counterIterable++;
      if (this.matrix[0][0] === whoIsWin && this.matrix[1][1] === whoIsWin && this.matrix[2][2] === whoIsWin) {
        this.fields[0][0].changeTexture(4);
        this.fields[0][0].winAnimationCreator(animationSelector);
        this.fields[1][1].changeTexture(4);
        this.fields[1][1].winAnimationCreator(animationSelector);
        this.fields[2][2].changeTexture(4);
        this.fields[2][2].winAnimationCreator(animationSelector);
      } else if (this.matrix[0][2] === whoIsWin && this.matrix[1][1] === whoIsWin && this.matrix[2][0] === whoIsWin) {
        this.fields[0][2].changeTexture(4);
        this.fields[0][2].winAnimationCreator(animationSelector);
        this.fields[1][1].changeTexture(4);
        this.fields[1][1].winAnimationCreator(animationSelector);
        this.fields[2][0].changeTexture(4);
        this.fields[2][0].winAnimationCreator(animationSelector);
      }
    }
  }
}
