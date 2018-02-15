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
    this.playEndingComic = this.playEndingComic.bind(this);
    this.startGame = this.startGame.bind(this);
    
    this.throwBall = this.throwBall.bind(this);
    
    this.OUTER_BOUNDARY_BUFFER = 64;  //The distance beyond the visible canvas where non-player objects can still exist.
  }
  
  init() {
    const avo = this.avo;
    
    //Config
    //--------------------------------
    avo.config.skipStandardRun = true;
    avo.config.backgroundColour = "#9a8";
    avo.config.debugMode = false;
    //--------------------------------
    
    //Data stuff
    //--------------------------------
    avo.data = {
      playerDestination: null,
      ticks: 0,
      seconds: 0,
      score: 0,
      maxActors: 16,
      secondsToLevel1: 0,
      secondsToLevel2: 20,
      secondsToLevel3: 40,
      secondsToEnd: 60,
      vfxDuration: 1 * AVO.FRAMES_PER_SECOND,
    };
    avo.vfx = [];
    //--------------------------------
    
    //Images
    //--------------------------------
    avo.assets.images.actor = new ImageAsset("assets/cny2018/actor.png");
    avo.assets.images.dog = new ImageAsset("assets/cny2018/dog.png");
    avo.assets.images.ball = new ImageAsset("assets/cny2018/ball.png");
    avo.assets.images.comicIntro1 = new ImageAsset("assets/cny2018/comic-intro-1.png");
    avo.assets.images.comicEnding1 = new ImageAsset("assets/cny2018/comic-ending-1.png");
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
      dog: {
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
              { row: 0, duration: STEPS_PER_SECOND * 2 },
              { row: 1, duration: STEPS_PER_SECOND * 2 },
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
    //--------------------------------
  }
  
  run_start() {
    const avo = this.avo;
    
    //if (avo.pointer.state === AVO.INPUT_ACTIVE) {
    avo.changeState(AVO.STATE_COMIC, this.playIntroComic);
    //}
    //avo.changeState(AVO.STATE_ACTION, this.startGame);
  }
  
  playIntroComic() {
    const avo = this.avo;
    avo.comicStrip = new ComicStrip(
      "comic_intro",
      [ avo.assets.images.comicIntro1 ],
      this.finishIntroComic
    );
  }
  
  finishIntroComic() {
    this.avo.changeState(AVO.STATE_ACTION, this.startGame);
  }
  
  playEndingComic() {
    const avo = this.avo;
    avo.comicStrip = new ComicStrip(
      "comic_ending",
      [ avo.assets.images.comicEnding1 ],
      this.playIntroComic
    );
  }
  
  startGame() {
    const avo = this.avo;
    
    //Reset
    avo.actors = [];
    avo.vfx = [];
    avo.refs = {};
    avo.data.playerDestination = null;
    avo.data.ticks = 0;
    avo.data.seconds = 0;
    avo.data.score = 0;
      
    //Initialise Player ACtor
    //Don't use avo.playerActor to avoid standard Action Adventure controls.
    avo.refs.player = new Actor("PLAYER", avo.canvasWidth / 2, avo.canvasHeight / 2, 32, AVO.SHAPE_CIRCLE);
    avo.refs.player.spritesheet = avo.assets.images.dog;
    avo.refs.player.animationSet = avo.animationSets.dog;
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
      const r = Math.random();
      
      if (avo.data.seconds >= avo.data.secondsToEnd) {
        //FINISH
        avo.changeState(AVO.STATE_COMIC, this.playEndingComic);
      } else if (avo.data.seconds >= avo.data.secondsToLevel3) {
        //LEVEL 3: Chinese gods help you!
        if (avo.actors.length < MAX_ACTORS && r < 0.9) {
          this.throwBall("red", 12 + Math.random() * 8);
        }
      } else if (avo.data.seconds >= avo.data.secondsToLevel2) {
        //LEVEL 2: Challenge ramp
        if (avo.actors.length < MAX_ACTORS && r < 0.7) {
          this.throwBall("red", 10 + Math.random() * 4);
        }
      } else if (avo.data.seconds >= avo.data.secondsToLevel1) {
        //LEVEL 1: Easy intro
        if (avo.data.seconds === 1 || // always throw one ball at the start
          (avo.actors.length < MAX_ACTORS && r < 0.5)) {
          this.throwBall("red", 8);
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
      if (actor === avo.refs.player) return true;  //Ignore if a player collides with... herself.
      if (Physics.checkCollision(avo.refs.player, actor)) {        
        if (actor.name === "RED_BALL") {
          avo.data.score++;
          avo.vfx.push({
            x: actor.x, y: actor.y,
            colour: "255, 255, 255",
            content: '+1',
            duration: avo.data.vfxDuration,
          });
        }
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
  
  throwBall(colour = "red", speed = 8) {
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
      //UI overlay: score and time!
      avo.context2d.font = AVO.DEFAULT_FONT;
      avo.context2d.textBaseline = "bottom";
      avo.context2d.fillStyle = "#fff";
      avo.context2d.textAlign = "right";
      avo.context2d.fillText(avo.data.score + " balls", avo.canvasWidth - 32, avo.canvasHeight - 32);
      avo.context2d.textAlign = "left";
      avo.context2d.fillText("Time left: " + (avo.data.secondsToEnd - avo.data.seconds), 32, avo.canvasHeight - 32);
      
      //Paint the visual effects
      avo.vfx = avo.vfx.filter((vfx) => {
        avo.context2d.fillStyle = "rgba(" + vfx.colour +", " + (vfx.duration / avo.data.vfxDuration).toFixed(2) +")";
        avo.context2d.fillText(vfx.content, vfx.x, vfx.y);
        vfx.duration--;
        return vfx.duration > 0;
      })
      
    } else if (avo.state === AVO.STATE_COMIC && avo.comicStrip.name === "comic_ending" && avo.comicStrip.state === AVO.COMIC_STRIP_STATE_IDLE) {
      //UI addition: final score!
      avo.context2d.font = AVO.DEFAULT_FONT;
      avo.context2d.textAlign = "center";
      avo.context2d.textBaseline = "middle";
      avo.context2d.fillStyle = "#c33";
      avo.context2d.fillText("Happy Chinese New Year! " + avo.data.score, avo.canvasWidth / 2, avo.canvasHeight - 64);
    }
  }
}
