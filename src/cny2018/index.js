/*
CNY2018
=======

Happy Chinese New Year!

(Shaun A. Noordin || shaunanoordin.com || 20180211)
********************************************************************************
 */

import * as AVO from  "../avo/constants.js";
import { Story } from "../avo/story.js";
import { ComicStrip } from "../avo/comic-strip.js";
import { Actor, Zone } from "../avo/entities.js";
import { Utility, ImageAsset } from "../avo/utility.js";
import { Physics } from "../avo/physics.js";

export class CNY2018 extends Story {
  constructor() {
    super();
    this.init = this.init.bind(this);
    this.run_start = this.run_start.bind(this);
    this.run_action = this.run_action.bind(this);
    this.prePaint = this.prePaint.bind(this);
    this.postPaint = this.postPaint.bind(this);
    
    this.playIntroComic = this.playIntroComic.bind(this);
    this.finishIntroComic = this.finishIntroComic.bind(this);
    this.startGame = this.startGame.bind(this);
    
    this.throwBall = this.throwBall.bind(this);
    
    this.OUTER_BOUNDARY_BUFFER = 64;  //The distance beyond the visible canvas where non-player objects can still exist.
  }
  
  init() {
    const avo = this.avo;
    
    //Config
    //--------------------------------
    avo.config.skipStandardRun = true;
    avo.config.debugMode = true;
    //--------------------------------
    
    //Data stuff
    //--------------------------------
    avo.data = {
      playerDestination: null,
      ticks: 0,
      seconds: 0,
      score: 0,
    };
    //--------------------------------
    
    //Images
    //--------------------------------
    avo.assets.images.actor = new ImageAsset("assets/cny2018/actor.png");
    avo.assets.images.ball = new ImageAsset("assets/cny2018/ball.png");
    avo.assets.images.comicIntro1 = new ImageAsset("assets/cny2018/comic-intro-1.png")
    //--------------------------------
    
    //Animations
    //--------------------------------
    const STEPS_PER_SECOND = AVO.FRAMES_PER_SECOND / 10;
    avo.animationSets = {
      actor: {
        rule: AVO.ANIMATION_RULE_DIRECTIONAL,
        tileWidth: 64,
        tileHeight: 64,
        tileOffsetX: 0,
        tileOffsetY: -24,  //-16,
        actions: {
          idle: {
            loop: true,
            steps: [
              { row: 0, duration: 1 }
            ],
          },
          moving: {
            loop: true,
            steps: [
              { row: 1, duration: STEPS_PER_SECOND },
              { row: 2, duration: STEPS_PER_SECOND * 2 },
              { row: 1, duration: STEPS_PER_SECOND },
              { row: 3, duration: STEPS_PER_SECOND * 2 },
            ],
          },
        },
      },
      ball: {
        rule: AVO.ANIMATION_RULE_BASIC,
        tileWidth: 32,
        tileHeight: 32,
        tileOffsetX: 0,
        tileOffsetY: 0,
        actions: {
          idle: {
            loop: true,
            steps: [
              { col: 0, row: 0, duration: 1 }
            ],
          },
        },
      },
    };
    
    //Process Animations; expand steps to many frames per steps.
    for (let animationTitle in avo.animationSets) {
      let animationSet = avo.animationSets[animationTitle];
      for (let animationName in animationSet.actions) {
        let animationAction = animationSet.actions[animationName];
        let newSteps = [];
        for (let step of animationAction.steps) {
          for (let i = 0; i < step.duration; i++) { newSteps.push(step); }
        }
        animationAction.steps = newSteps;
      }
    }
    
    console.log(avo.animationSets);
    //--------------------------------
    
    //Rooms
    //--------------------------------
    
    //--------------------------------
  }
  
  run_start() {
    const avo = this.avo;
    
    if (avo.pointer.state === AVO.INPUT_ACTIVE || 
        avo.keys[AVO.KEY_CODES.UP].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.DOWN].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.LEFT].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.RIGHT].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.SPACE].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.ENTER].state === AVO.INPUT_ACTIVE) {
      //avo.changeState(AVO.STATE_COMIC, this.playIntroComic);
      avo.changeState(AVO.STATE_ACTION, this.startGame);
    }
  }
  
  playIntroComic() {
    const avo = this.avo;
    avo.comicStrip = new ComicStrip(
      "comic_1",
      [ avo.assets.images.comicIntro1,
        //avo.assets.images.comicIntro2,
      ],
      this.finishIntroComic
    );
  }
  
  finishIntroComic() {
    this.avo.changeState(AVO.STATE_ACTION, this.startGame);
  }
  
  startGame() {
    const avo = this.avo;
    
    //Initialise Player ACtor
    //Don't use avo.playerActor to avoid standard Action Adventure controls.
    avo.refs.player = new Actor("PLAYER", avo.canvasWidth / 2, avo.canvasHeight / 2, 32, AVO.SHAPE_CIRCLE);
    avo.refs.player.spritesheet = avo.assets.images.actor;
    avo.refs.player.animationSet = avo.animationSets.actor;
    avo.refs.player.playAnimation(AVO.ACTION.MOVING);
    
    //avo.refs.player.attributes.speed = 0;
    avo.refs.player.attributes.acceleration = 2;
    avo.refs.player.attributes.velocityX = 0;
    avo.refs.player.attributes.velocityY = 0;
    avo.refs.player.rotation = AVO.ROTATION_SOUTH;
    avo.actors.push(avo.refs.player);
    
    //avo.camera.targetActor = avo.refs.playerActor;
  }
  
  run_action() {
    const avo = this.avo;
    const player = avo.refs.player;
    
    //Tick tock!
    //--------------------------------
    const MAX_ACTORS = 10;
    avo.data.ticks++;
    if (avo.data.ticks >= AVO.FRAMES_PER_SECOND) {
      avo.data.ticks -= AVO.FRAMES_PER_SECOND;
      avo.data.seconds++;
      
      if (avo.actors.length < MAX_ACTORS) {
        const r = Math.random();
        
        if (r < 0.9) {
          this.throwBall("red");
        }
      }
    }
    //--------------------------------
    
    //Where is the player going?
    //--------------------------------
    if (avo.pointer.state === AVO.INPUT_ACTIVE) {
      avo.data.playerDestination = {
        x: avo.pointer.now.x,
        y: avo.pointer.now.y,
      };
    }
    //--------------------------------
    
    //If the player has a destination, accelerate towards it
    //--------------------------------
    const MIN_DIST = 8;
    const DECELERATION = 0.95;
    if (avo.data.playerDestination) {
      const distY = avo.data.playerDestination.y - player.y;
      const distX = avo.data.playerDestination.x - player.x;
      const rotation = Math.atan2(distY, distX);
      
      //Make player move (accelerate) in a certain direction.
      player.rotation = rotation;
      let newVelocityX = player.attributes.velocityX + Math.cos(rotation) * player.attributes.acceleration;
      let newVelocityY = player.attributes.velocityY + Math.sin(rotation) * player.attributes.acceleration;
      const newSpeed = newVelocityX * newVelocityX + newVelocityY * newVelocityY;
      player.attributes.velocityX = newVelocityX;
      player.attributes.velocityY = newVelocityY;
    }
    //--------------------------------
    
    //Apply physics.
    //--------------------------------    
    avo.actors.map((actor) => {
      actor.x += actor.attributes.velocityX;
      actor.y += actor.attributes.velocityY;  
    });
    
    //OK, slow down now, player.
    player.attributes.velocityX *= DECELERATION;
    player.attributes.velocityY *= DECELERATION;
    //--------------------------------
    
    //Scoring
    //--------------------------------
    avo.actors = avo.actors.filter((actor) => {
      if (actor === avo.refs.player) return true;
      
      if (Physics.checkCollision(avo.refs.player, actor)) {        
        if (actor.name === "RED_BALL") { avo.data.score++; }
        
        return false;  //Remove the ball from existence.
      }
      
      return true;
    });
    //--------------------------------
    
    //Cleanup
    //--------------------------------
    //Remove all non-player objects that go beyond the canvas.
    avo.actors = avo.actors.filter((actor) => {
      if (actor === avo.refs.player) return true;
      const outerLimit = this.OUTER_BOUNDARY_BUFFER * 2;
      
      //console.log(actor.x, avo.canvasWidth, outerLimit);
      return (
        actor.x >= (0 - outerLimit) &&
        actor.x <= (avo.canvasWidth + outerLimit) &&
        actor.y >= (0 - outerLimit) &&
        actor.y <= (avo.canvasHeight + outerLimit)
      );
    });
    //--------------------------------
  }
  
  throwBall(colour = "red") {
    const avo = this.avo;
    
    let ball = null;
    if (colour === "red") {
      ball = new Actor("RED_BALL", avo.canvasWidth / 2, avo.canvasHeight / 2, 32, AVO.SHAPE_CIRCLE);
      ball.spritesheet = avo.assets.images.ball;
      ball.animationSet = avo.animationSets.ball;
      ball.playAnimation("idle");
      ball.attributes = {
        velocityX: 0,
        velocityY: 0,
      };
    } else { return; }
    
    const dir = Math.floor(Math.random() * 4);
    
    switch (dir) {
      case 0:  //From East
        ball.x = avo.canvasWidth + this.OUTER_BOUNDARY_BUFFER;
        ball.y = Math.random() * avo.canvasHeight;
        break;
      case 1:  //From South
        ball.x = Math.random() * avo.canvasWidth;
        ball.y = avo.canvasHeight + this.OUTER_BOUNDARY_BUFFER;
        break;
      case 2:  //From West
        ball.x = 0 - this.OUTER_BOUNDARY_BUFFER;
        ball.y = Math.random() * avo.canvasHeight;
        break;
      case 3:  //From North
        ball.x = Math.random() * avo.canvasWidth;
        ball.y = 0 - this.OUTER_BOUNDARY_BUFFER;
        break;
      default:
        return;
    }
    
    let destX = avo.canvasWidth * (0.25 + Math.random() * 0.5);  //Aim the ball for somewhere near the middle of the canvas.
    let destY = avo.canvasHeight * (0.25 + Math.random() * 0.5);
    const speed = Math.random() * 8 + 4;  //ARBITRARY
    const rotation = Math.atan2(destY - ball.y, destX - ball.x);
    
    ball.rotation = rotation;
    ball.attributes.velocityX = Math.cos(rotation) * speed;
    ball.attributes.velocityY = Math.sin(rotation) * speed;
    
    avo.actors.push(ball);
  }
  
  prePaint() {}
  
  postPaint() {
    const avo = this.avo;
        
    if (avo.state === AVO.STATE_ACTION) {
      avo.context2d.font = AVO.DEFAULT_FONT;
      avo.context2d.textAlign = "center";
      avo.context2d.textBaseline = "middle";
      avo.context2d.fillStyle = "#fff";
      avo.context2d.fillText("Score: " + avo.data.score, avo.canvasWidth / 2, avo.canvasHeight - 64);
    }
  }
}
