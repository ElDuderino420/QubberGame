ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.debug.debug',
	'impact.font',

	'game.levels.qubmap',
	'game.levels.qubmapbig',
	'game.levels.mainMenu',

	'game.entities.qubber',
	'game.entities.house',
	'game.entities.qubapp',

	'game.controllers.sceneController',
	'game.controllers.playerController'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.fontblack.png' ),
	bigfont: new ig.Font( 'media/04b03.fontblackx3.png'),
	biggerfont: new ig.Font( 'media/04b03.fontblackx5.png'),
	name: "Quber",

    clearColor: '#333333',

    player: null,
    phone: null,

	STATE: {
		MAINMENU: 0,
		PLAYMODE: 1,
		APPMODE: 2,
		MINIGAME: 3
	},
	
	init: function() {
		// Initialize Game
        
		// Movement keys
		// Arrow keys
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		// WASD 
		ig.input.bind(ig.KEY.A, 'left');
		ig.input.bind(ig.KEY.D, 'right');
		ig.input.bind(ig.KEY.W, 'up');
		ig.input.bind(ig.KEY.S, 'down');
		//Open App
		ig.input.bind(ig.KEY.J, 'pause');
		ig.input.bind(ig.KEY.Q, 'app');
		ig.input.bind(ig.KEY.ENTER, 'enter');
        
        ig.input.bind(ig.KEY.MOUSE1, 'leftMouse');
		ig.input.bind(ig.KEY.MOUSE2, 'rightMouse');


		//resize game canvas
		window.onresize = this.onresize;

		this.currentState = this.STATE.MAINMENU;
		this.drawCoordinates = {
			main: {x: ig.system.width/2, y: ig.system.height/2 - 50},
			score: {x: 5, y: 5},
			profile: {x: 5, y: window.innerHeight/2-30}
		}
        
        this.sceneController = new ig.sceneController(this, [LevelMainMenu, LevelQubmapbig])
        this.playerController = new ig.playerController();
		//this.loadLevel(ig.global['LevelQubmap']);
	},

	onresize: function(event) {
		var width = Math.floor(window.innerWidth/ig.system.scale);
		var height = Math.floor(window.innerHeight/ig.system.scale);
		ig.system.resize(width, height);

		ig.game.drawCoordinates = {
			main: {x: ig.system.width/2, y: ig.system.height/2 - 50},
			score: {x: 5, y: 5},
			profile: {x: 5, y: window.innerHeight/2-30}
		}
	},

	changeState: function(newState){
		this.currentState = newState;

		// Advanced state management done here.
		switch(this.currentState){
            case this.STATE.PLAYMODE:
                // load map level
                this.sceneController.loadLevel(1);
                // find player and 'remember' last position
                this.player = ig.game.getEntitiesByType(EntityQubber)[0];
                this.playerController.addPlayer(this.player);
                this.phone = ig.game.spawnEntity(EntityQubapp, ig.system.width, 0);
				break;
            case this.STATE.MAINMENU:
                // load main menu map
				this.sceneController.loadLevel(0);
				break;
		}
	},

	loadLevel: function(data) {
        //this.currentLevel = data;
        this.parent(data);

		//this.player = ig.game.getEntitiesByType(EntityQubber)[0];
		
		//var house1 = {id: 1}
		//var house2 = {id: 2}
		//this.houses = ig.game.getEntitiesByType(EntityHouse);
		//this.houses[0].id = 1;
		//this.houses.push(ig.game.spawnEntity( EntityHouse, 300, 300, house1));
		//this.houses.push(ig.game.spawnEntity( EntityHouse, 20, 20, house2));
		
		
		
    },
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		switch(this.currentState){
            case this.STATE.PLAYMODE:
                //continuesly update player position
                this.playerController.updatePosition(this.player.pos.x, this.player.pos.y);
				//center screen on player
				var currentmap = ig.game.backgroundMaps[0];
				this.screen.x = (this.player.pos.x - ig.system.width/2).limit(0, currentmap.width * currentmap.tilesize - ig.system.width);
                this.screen.y = (this.player.pos.y - ig.system.height/2).limit(0, currentmap.height * currentmap.tilesize - ig.system.height);
                
                this.phone.pos.x = this.screen.x + ig.system.width - this.phone.size.x;
                this.phone.pos.y = this.screen.y;
				if(ig.input.state('pause')){
                    //open main menu
					this.changeState(this.STATE.MAINMENU);
                }
                if(ig.input.state('app')){
                    //open app
                }
				break;
            case this.STATE.MAINMENU:
                //reset screen position
				this.screen.x = -ig.system.width/2 + (32*5);
				this.screen.y = -ig.system.height/2 + (32*5);
				if(ig.input.state('enter')){
                    //start game
                    // TODO add buttons and have enter as the select
					this.changeState(this.STATE.PLAYMODE);
				}
				break;
			default:
				break;
				break;
				
		}
		// Add your own, additional update code here
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		
		switch(this.currentState){
            case this.STATE.PLAYMODE:
                //draw player
                this.player.draw();
                this.phone.draw();
                //draw player stats 'profile'
                this.font.draw( 'Q: '+ this.player.money , this.drawCoordinates.score.x, this.drawCoordinates.score.y, ig.Font.ALIGN.LEFT );
				this.font.draw( 'Press J to pause', this.drawCoordinates.profile.x, this.drawCoordinates.profile.y, ig.Font.ALIGN.LEFT);
				ig.log()
				break;
            case this.STATE.MAINMENU:
                //Game Title
                this.biggerfont.draw( this.name, this.drawCoordinates.main.x, this.drawCoordinates.main.y, ig.Font.ALIGN.CENTER );
                //Subtext
                this.bigfont.draw( 'Press Enter to start', this.drawCoordinates.main.x, this.drawCoordinates.main.y + 50, ig.Font.ALIGN.CENTER);
                // TODO add buttons
                break;
			default:
				break;
				break;
				
		}
		//var x = this.player.x,
		//	y = this.player.y;
		
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
	var scale = 2;
    var width = Math.floor(window.innerWidth/scale);
    var height = Math.floor(window.innerHeight/scale);
    ig.main('#canvas', MyGame, 60, width, height, scale);

});
