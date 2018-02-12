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
    
    this.playIntroComic = this.playIntroComic.bind(this);
    this.finishIntroComic = this.finishIntroComic.bind(this);
    this.startGame = this.startGame.bind(this);
  }
  
  init() {
    const avo = this.avo;
    
    //Config
    //--------------------------------
    avo.config.debugMode = true;
    //--------------------------------
    
    //Images
    //--------------------------------
    avo.assets.images.actor = new ImageAsset("assets/cny2018/actor.png");
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
    //avo.refs.player.attributes.speed = 0;
    avo.refs.player.attributes.acceleration = 2;
    avo.refs.player.attributes.velocityX = 0;
    avo.refs.player.attributes.velocityY = 0;
    avo.refs.player.rotation = AVO.ROTATION_SOUTH;
    avo.refs.player.playAnimation(AVO.ACTION.MOVING);
    avo.actors.push(avo.refs.player);
    
    avo.data = {
      playerDestination: null,
    };
    
    //avo.camera.targetActor = avo.refs.playerActor;
  }
  
  run_action() {
    const avo = this.avo;
    const player = avo.refs.player;
    
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
    } else {
      //player.attributes.velocityX *= DECELERATION;
      //player.attributes.velocityY *= DECELERATION;
    }
    //--------------------------------
    
    //Apply physics.
    //--------------------------------    
    avo.actors.map((actor) => {
      actor.x += actor.attributes.velocityX;
      actor.y += actor.attributes.velocityY;
      player.attributes.velocityX *= DECELERATION;
      player.attributes.velocityY *= DECELERATION;
    });
    //--------------------------------
    
  }
}
