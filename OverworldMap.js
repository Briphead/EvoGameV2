class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }

}



window.OverworldMaps = {
  Museum: {
    lowerSrc: "./images/maps/DemoLower.png",
    upperSrc: "./images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(10),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "./images/characters/people/erio.png",
        behaviorLoop: [
          { type: "stand",  direction: "left", time: 800 },
          { type: "stand",  direction: "up", time: 800 },
          { type: "stand",  direction: "right", time: 1200 },
          { type: "stand",  direction: "up", time: 300 },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hello, here we teach evolution!", faceHero: "npcA" },
              { type: "textMessage", text: "You don't know what evolution is?"},
              { type: "textMessage", text: "Well let me tell about it!"},
              { type: "textMessage", text: "Everything shares a common ancestor."},
              { type: "textMessage", text: "But over time different groups of animals evolve to suit to their enviorment and become different species."},
              { type: "textMessage", text: "Ever heard of survival of the fittest?"},
              { type: "textMessage", text: "Well thats what it means!"},
              { type: "textMessage", text: "The animals that have traits that make them more likely to survive pass those traits to the next generation."},
              { type: "textMessage", text: "Learn something new? I hope so!"},
            ]
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "./images/characters/people/npc2.png",
      }),
    },
    walls: {
      //Center Island
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,
      //Side Walls RIGHT
      [utils.asGridCoord(11,2)] : true,
      [utils.asGridCoord(11,3)] : true,
      [utils.asGridCoord(11,4)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,9)] : true,
       //SIDE WALL LEFT (IN PROGRESS)
       [utils.asGridCoord(0,1)] : true,
       [utils.asGridCoord(0,2)] : true,
       [utils.asGridCoord(0,3)] : true,
       [utils.asGridCoord(0,4)] : true,
       [utils.asGridCoord(0,5)] : true,
       [utils.asGridCoord(0,6)] : true,
       [utils.asGridCoord(0,7)] : true,
       [utils.asGridCoord(0,8)] : true,
       [utils.asGridCoord(0,9)] : true,

       //Front wall x,3
       [utils.asGridCoord(1,3)] : true,
       [utils.asGridCoord(2,3)] : true,
       [utils.asGridCoord(3,3)] : true,
       [utils.asGridCoord(4,3)] : true,
       [utils.asGridCoord(5,3)] : true,
       [utils.asGridCoord(6,3)] : true,
       [utils.asGridCoord(7,3)] : true,
       [utils.asGridCoord(9,3)] : true,
       [utils.asGridCoord(10,3)] : true,
       [utils.asGridCoord(8,4)] : true,
       [utils.asGridCoord(6,4)] : true,

       // spawn wall
       [utils.asGridCoord(10,10)] : true,
       [utils.asGridCoord(9,10)] : true,
       [utils.asGridCoord(8,10)] : true,
       [utils.asGridCoord(7,10)] : true,
       [utils.asGridCoord(6,10)] : true,
       
       [utils.asGridCoord(5,11)] : true,

       [utils.asGridCoord(4,10)] : true,
       [utils.asGridCoord(3,10)] : true,
       [utils.asGridCoord(2,10)] : true,
       [utils.asGridCoord(1,10)] : true,
       

    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { type: "textMessage", text:"That exhibit isnt done yet!"},            
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap", map: "Street" }
          ]
        }
      ]
    }
    
  },
  Lab: {
    lowerSrc: "./images/maps/KitchenLower.png",
    upperSrc: "./images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(9),
      }),
      npcA: new Person({
        x: utils.withGrid(2),
        y: utils.withGrid(6),
        src: "./images/characters/people/npc3.png",
        behaviorLoop: [
          { type: "stand",  direction: "left" },
        ],
        talking: [
          { //Law of super position and fossils
            events: [
              { type: "textMessage", text: "Hey! do you wanna talk about fossils?" , faceHero:"npcA"},
              { type: "textMessage", text: "A fossil is a really old rock or bone that used to be a part of a living thing a long, long time ago." , faceHero:"npcA"},
              { type: "textMessage", text: "We can reasemble fossils to see what animals looked like and compare them to today." },
              { type: "textMessage", text: "Scientists can view how many layers a fossil is under to figure out how old it is." },
              { type: "textMessage", text: "Imagine that each layer of rock is a toy block "},
              { type: "textMessage", text: "The top blocks are the youngest and the bottom blocks are the oldest"},
              { type: "textMessage", text: "This is known as the Law Of Superposition!"},
              { type: "textMessage", text: "Fossils can be formed by rock and minerals replacing the animals bones over time"},

              
            ]
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(8),
        src: "./images/characters/people/npc5.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "You made it! This is he lab where we study fossils!", faceHero:"npcB" },
              { type: "textMessage", text: "Fossils are remains of ancient animal bones." },
              { type: "textMessage", text: "Go visit that guy over there and he will tell you more." },             
            ]
          }
        ]
      })
    },
    walls: {
      [utils.asGridCoord(2,4)] : true,
      [utils.asGridCoord(3,4)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,4)] : true,
      [utils.asGridCoord(6,4)] : true,
      [utils.asGridCoord(7,4)] : true,
      [utils.asGridCoord(8,4)] : true,
      [utils.asGridCoord(9,4)] : true,
      [utils.asGridCoord(10,4)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(12,5)] : true,
      [utils.asGridCoord(13,6)] : true,
      [utils.asGridCoord(13,7)] : true,
      [utils.asGridCoord(13,8)] : true,
      [utils.asGridCoord(13,9)] : true,
      [utils.asGridCoord(12,10)] : true,
      [utils.asGridCoord(11,10)] : true,
      [utils.asGridCoord(10,9)] : true,
      [utils.asGridCoord(9,9)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(5,11)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(2,9)] : true,
      [utils.asGridCoord(1,9)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(1,7)] : true,
      [utils.asGridCoord(1,6)] : true,
      [utils.asGridCoord(1,5)] : true,
      [utils.asGridCoord(6,7)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(9,7)] : true,
      [utils.asGridCoord(10,7)] : true,
      
      
    },
    cutsceneSpaces: {        
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            { type: "changeMap", map: "Street" }
          ]
        }
      ]
    }
  },
  Street: {
    lowerSrc: "./images/maps/StreetLower.png",
    upperSrc: "./images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(10),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(10),
        src: "./images/characters/people/npc7.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Welcome! This is Evolution Avenue!.", faceHero:"npcA" },
              { type: "textMessage", text: "Here you can learn about evolution and fossils." },
              { type: "textMessage", text: "Go visit the different buildings to learn more." }, 
              { type: "textMessage", text: "Have fun!" }          
            ]
          }
        ]
      }),     
    },
    walls: {
      [utils.asGridCoord(4,9)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(3,11)] : true,
      [utils.asGridCoord(3,12)] : true,
      [utils.asGridCoord(3,13)] : true,
      [utils.asGridCoord(4,14)] : true,
      [utils.asGridCoord(5,13)] : true,
      [utils.asGridCoord(6,13)] : true,
      [utils.asGridCoord(7,13)] : true,
      [utils.asGridCoord(8,13)] : true,
      [utils.asGridCoord(9,14)] : true,
      [utils.asGridCoord(10,14)] : true,
      [utils.asGridCoord(11,14)] : true,
      [utils.asGridCoord(12,14)] : true,
      [utils.asGridCoord(13,14)] : true,
      [utils.asGridCoord(15,14)] : true,
      [utils.asGridCoord(16,14)] : true,
      [utils.asGridCoord(17,14)] : true,
      [utils.asGridCoord(18,14)] : true,
      [utils.asGridCoord(19,14)] : true,
      [utils.asGridCoord(20,14)] : true,
      [utils.asGridCoord(21,14)] : true,
      [utils.asGridCoord(22,14)] : true,
      [utils.asGridCoord(23,14)] : true,
      [utils.asGridCoord(24,14)] : true,
      [utils.asGridCoord(25,14)] : true,
      [utils.asGridCoord(26,14)] : true,
      [utils.asGridCoord(27,14)] : true,
      [utils.asGridCoord(28,14)] : true,
      [utils.asGridCoord(29,14)] : true,
      [utils.asGridCoord(30,14)] : true,
      [utils.asGridCoord(31,14)] : true,
      [utils.asGridCoord(32,14)] : true,
      [utils.asGridCoord(33,14)] : true,
      [utils.asGridCoord(34,14)] : true,
      [utils.asGridCoord(34,13)] : true,
      [utils.asGridCoord(34,12)] : true,
      [utils.asGridCoord(34,11)] : true,
      [utils.asGridCoord(34,10)] : true,
      [utils.asGridCoord(14,14)] : true,
      [utils.asGridCoord(33,9)] : true,
      [utils.asGridCoord(32,9)] : true,
      [utils.asGridCoord(31,9)] : true,
      [utils.asGridCoord(30,9)] : true,
      [utils.asGridCoord(29,8)] : true,
      [utils.asGridCoord(28,9)] : true,
      [utils.asGridCoord(28,8)] : true,
      [utils.asGridCoord(27,7)] : true,
      [utils.asGridCoord(26,7)] : true,
      [utils.asGridCoord(26,6)] : true,
      [utils.asGridCoord(26,5)] : true,
      [utils.asGridCoord(25,4)] : true,
      [utils.asGridCoord(24,5)] : true,
      [utils.asGridCoord(24,6)] : true,
      [utils.asGridCoord(24,7)] : true,
      [utils.asGridCoord(23,7)] : true,
      [utils.asGridCoord(22,7)] : true,
      [utils.asGridCoord(21,7)] : true,
      [utils.asGridCoord(20,7)] : true,
      [utils.asGridCoord(19,7)] : true,
      [utils.asGridCoord(18,7)] : true,
      [utils.asGridCoord(17,7)] : true,
      [utils.asGridCoord(16,7)] : true,
      [utils.asGridCoord(15,7)] : true,
      [utils.asGridCoord(14,8)] : true,
      [utils.asGridCoord(13,8)] : true,
      [utils.asGridCoord(12,9)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(10,9)] : true,
      [utils.asGridCoord(9,9)] : true,
      [utils.asGridCoord(8,9)] : true,
      [utils.asGridCoord(7,9)] : true,
      [utils.asGridCoord(6,9)] : true,

      //Island 1
      [utils.asGridCoord(16,9)] : true,
      [utils.asGridCoord(17,9)] : true,
      [utils.asGridCoord(16,10)] : true,
      [utils.asGridCoord(17,10)] : true,
      [utils.asGridCoord(16,11)] : true,
      [utils.asGridCoord(17,11)] : true,

      //Island 2
      [utils.asGridCoord(25,9)] : true,
      [utils.asGridCoord(26,9)] : true,
      [utils.asGridCoord(25,10)] : true,
      [utils.asGridCoord(26,10)] : true,
      [utils.asGridCoord(25,11)] : true,
      [utils.asGridCoord(26,11)] : true,

    },
    cutsceneSpaces: {        
      [utils.asGridCoord(5, 9)]: [
        {
          events: [
            { type: "changeMap", map: "Museum" }
          ]
        }
      ],
      [utils.asGridCoord(25, 5)]: [
        {
          events: [
            { type: "changeMap", map: "StreetNorth" }
          ]
        }
      ],
      [utils.asGridCoord(29, 9)]: [
        {
          events: [
            { type: "changeMap", map: "Lab" }
          ]
        }
      ]
    }
  },
  StreetNorth: {
    lowerSrc: "./images/maps/StreetNorthLower.png",
    upperSrc: "./images/maps/StreetNorthUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(7),
        y: utils.withGrid(16),
      }),
      npcA: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(6),
        src: "./images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Welcome! ", faceHero:"npcA" },    
            ]
          }
        ]
      }),     
    },
    // grids with 14 is plant barrier for road, rest is for the main lobby map
    walls: {

      //Spawn
      [utils.asGridCoord(6,16)]: true,
      [utils.asGridCoord(7,17)]: true,
      [utils.asGridCoord(8,16)]: true,
      
      //Bottom right bush garden
      [utils.asGridCoord(8,15)]: true,
      [utils.asGridCoord(9,15)]: true,
      [utils.asGridCoord(10,15)]: true,
      [utils.asGridCoord(11,15)]: true,
      [utils.asGridCoord(12,15)]: true,
      [utils.asGridCoord(13,15)]: true,
      //Right flower garden
      [utils.asGridCoord(14,14)]: true,
      [utils.asGridCoord(14,13)]: true,
      [utils.asGridCoord(14,12)]: true,
      [utils.asGridCoord(14,11)]: true,
      [utils.asGridCoord(14,10)]: true,
      [utils.asGridCoord(14,9)]: true,
      [utils.asGridCoord(14,8)]: true,
      [utils.asGridCoord(14,7)]: true,
      //Space poster
      [utils.asGridCoord(13,6)]: true,
      [utils.asGridCoord(12,6)]: true,
      [utils.asGridCoord(11,6)]: true,
      //Back store wall
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(9,5)]: true,
      [utils.asGridCoord(8,5)]: true,
            //Store entrance [utils.asGridCoord(7,5)]: true,
      [utils.asGridCoord(6,5)]: true,
      [utils.asGridCoord(5,5)]: true,
      [utils.asGridCoord(4,5)]: true,
      //Pizza advertisment
      [utils.asGridCoord(3,6)]: true,
      [utils.asGridCoord(3,7)]: true,
      [utils.asGridCoord(2,7)]: true,
      //Left flower Garden
      [utils.asGridCoord(1,8)]: true,
      [utils.asGridCoord(1,9)]: true,
      [utils.asGridCoord(1,10)]: true,
      [utils.asGridCoord(1,11)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(1,13)]: true,
      [utils.asGridCoord(1,14)]: true,
      //Bottom left bush garden
      [utils.asGridCoord(2,15)]: true,
      [utils.asGridCoord(3,15)]: true,
      [utils.asGridCoord(4,15)]: true,
      [utils.asGridCoord(5,15)]: true,
      [utils.asGridCoord(6,15)]: true,
      //Center flower garden
      [utils.asGridCoord(7,8)]: true,
      [utils.asGridCoord(8,8)]: true,
      [utils.asGridCoord(7,9)]: true,
      [utils.asGridCoord(8,9)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,     





    },
    cutsceneSpaces: {        
      [utils.asGridCoord(7, 16)]: [
        {
          events: [
            { type: "changeMap", map: "Street" }
          ]
        }
      ],
      [utils.asGridCoord(7, 5)]: [
        {
          events: [
            { type: "changeMap", map: "GreenRoom" }
          ]
        }
      ]
    }
  },
  GreenRoom: {
    lowerSrc: "./images/maps/DiningRoomLower.png",
    upperSrc: "./images/maps/DiningRoomUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(12),
      }),
      npcA: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(4),
        src: "./images/characters/people/npc2.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hey! Welcome to the anatomy lab!", faceHero:"npcA" },    
              { type: "textMessage", text: "Here we try to find out similarities and differences between animal's anatomy!"},
              { type: "textMessage", text: "You don't know what anatomy is?"},
              { type: "textMessage", text: "Anatomy is basically the study of the structure of humans and animals."},
              { type: "textMessage", text: "As animals evolve their anotomy changes to adapt to their enviorment."},
              { type: "textMessage", text: "Over time humans have parts of their body that become outdated and no longer needed."},
              { type: "textMessage", text: "An example of this is the human appendix, it might have once been used to help digest food, but is no longer needed."},
              { type: "textMessage", text: "I hope you learned something new!"},
              

            ]
          
          }
        ]
      }),     
    },

    walls: {

      //Spawn bottom wall
      [utils.asGridCoord(1, 12)]:true,
      [utils.asGridCoord(2, 12)]:true,
      [utils.asGridCoord(3, 12)]:true,
      [utils.asGridCoord(4, 12)]:true,
      [utils.asGridCoord(5, 12)]:true,
      [utils.asGridCoord(6, 13)]:true,
      [utils.asGridCoord(7, 12)]:true,
      [utils.asGridCoord(8, 12)]:true,
      [utils.asGridCoord(9, 12)]:true,
      [utils.asGridCoord(10, 12)]:true,
      [utils.asGridCoord(11, 12)]:true,
      [utils.asGridCoord(12, 12)]:true,
      //Right wall
      [utils.asGridCoord(13, 11)]:true,
      [utils.asGridCoord(13, 10)]:true,
      [utils.asGridCoord(13, 9)]:true,
      [utils.asGridCoord(13, 8)]:true,
      [utils.asGridCoord(13, 7)]:true,
      [utils.asGridCoord(13, 6)]:true,
      //Back wall
      [utils.asGridCoord(12, 5)]:true,
      [utils.asGridCoord(11, 5)]:true,
      [utils.asGridCoord(10, 5)]:true,
      [utils.asGridCoord(9, 4)]:true,
      [utils.asGridCoord(8, 3)]:true,
      [utils.asGridCoord(5, 3)]:true,
      [utils.asGridCoord(4, 3)]:true,
      [utils.asGridCoord(3, 3)]:true,
      [utils.asGridCoord(2, 3)]:true,
      [utils.asGridCoord(1, 3)]:true,
      //Left wall
      [utils.asGridCoord(0, 4)]:true,
      [utils.asGridCoord(0, 6)]:true,
      [utils.asGridCoord(0, 7)]:true,
      [utils.asGridCoord(0, 8)]:true,
      [utils.asGridCoord(0, 9)]:true,
      [utils.asGridCoord(0, 10)]:true,
      [utils.asGridCoord(0, 11)]:true,
      //Counters, chairs, and tables
      [utils.asGridCoord(1, 5)]:true,
      [utils.asGridCoord(2, 5)]:true,
      [utils.asGridCoord(3, 5)]:true,
      [utils.asGridCoord(4, 5)]:true,

      [utils.asGridCoord(6, 5)]:true,
      [utils.asGridCoord(6, 4)]:true,

      [utils.asGridCoord(2, 10)]:true,
      [utils.asGridCoord(3, 10)]:true,
      [utils.asGridCoord(4, 10)]:true,

      [utils.asGridCoord(7, 10)]:true,
      [utils.asGridCoord(8, 10)]:true,
      [utils.asGridCoord(9, 10)]:true,

      [utils.asGridCoord(2, 7)]:true,
      [utils.asGridCoord(3, 7)]:true,
      [utils.asGridCoord(4, 7)]:true,

      [utils.asGridCoord(7, 7)]:true,
      [utils.asGridCoord(8, 7)]:true,
      [utils.asGridCoord(9, 7)]:true,
      





    },
    cutsceneSpaces: {        
      [utils.asGridCoord(6, 12)]: [
        {
          events: [
            { type: "changeMap", map: "StreetNorth" }
          ]
        }
      ],
      [utils.asGridCoord(7, 3)]: [
        {
          events: [
            { who: "npcA", type: "walk",  direction: "left" },
            { who: "npcA", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"Sorry, the lab is closed right now!"},         
            { who: "npcA", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "npcA", type: "stand",  direction: "down", time: 500 },
          ]
        }
      ]
    }
  },
}