/*
CNY2018
=======

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
  }
  
  init() {
    const avo = this.avo;
    
    //Config
    //--------------------------------
    avo.config.debugMode = true;
    //--------------------------------
    
    //Images
    //--------------------------------
    //--------------------------------
    
    //Animations
    //--------------------------------
    //--------------------------------
    
    //Rooms
    //--------------------------------
    //--------------------------------
  }
}
