/*-----------------------------------------------------\
    Enemy class
    Desc: enemies our player must avoid
    Methods: update(), render()
\-----------------------------------------------------*/
    var Enemy = function(row) {
        // Variables applied to each of our instances go here
        this.y = row
        this.x = 1 - Math.floor(Math.random() * 350);

        this.xRng = [-150,500];
        this.moverate = 75 + Math.floor(Math.random() * 340);
        this.sprite = 'images/enemy-bug.png'; // The image/sprite for our enemies
    };

    // Draw the enemy on the screen
    Enemy.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    // Update the enemy's position
    // Parameter: dt, a time delta between ticks
    Enemy.prototype.update = function(dt) {
        // You should multiply any moverate by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x += Math.floor(this.moverate * dt);

        // Reset x coord if out of range
        if ( this.x > this.xRng[1] ) {
            this.moverate = 75 + Math.floor(Math.random() * 340);
            this.x = this.xRng[0];
        } 

        // Player killed if occupying same square as a bug adds shake animation
        if( player.x - 60 <= this.x && 
            player.x + 41 > this.x && 
            player.y == this.y ) gameboard.death();
    };

/*-----------------------------------------------------\
    Gem class
    Desc: treasure player tries to get
    Methods: randomize(), update(), render() 
\-----------------------------------------------------*/
    var Gem = function() {
        this.gemColors = ['blue', 'green', 'orange']; // available gem images
        this.randomize(); // Randomize location
    };

    // Generate New Gem and location
    // Parameter: dt, a time delta between ticks
    Gem.prototype.randomize = function(dt)
    {
        // Randomize location if timer is under 0
        // Resets location every 3 seconds
        this.timer -= dt
        if( this.timer < 0 || !dt ) 
        {
            var gemIdx = Math.floor(Math.random() * this.gemColors.length );
            this.sprite = 'images/gem-' + this.gemColors[gemIdx] + '.png';
            this.x = 101 * Math.floor(Math.random() * 5 );
            this.y =  ( 83 * ( Math.floor(Math.random() * 2 ) + 1 ) ) - 23;
            this.visible = Math.floor(Math.random() * 10 ) < 3 ? false : true;
            this.timer = 3;  
        }
    };  

    // Draw the Gem on the screen
    Gem.prototype.render = function() {
        if ( this.visible ) {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
    };

    // Updates Gem 
    // Parameter: dt, a time delta between ticks
    Gem.prototype.update = function(dt) {
        this.randomize(dt);
    };
 
/*-----------------------------------------------------\
    Raft class
    Desc: Raft for player to land on to score
    Methods: randomize(), update(), render() 
\-----------------------------------------------------*/
    var Raft = function() {
        // Variables applied to each of our instances go here
        this.sprite = 'images/raft.png'; // The image/sprite for our raft
        this.randomize()            
    };

    // Generate new raft location
    Raft.prototype.randomize = function(dt)
    {
        // Randomize location if timer is under 0
        // Resets location every 3 seconds
        this.timer -= dt
        if( this.timer < 0 || !dt ) {
            this.x = Math.floor(Math.random() * 5 ) * 101;
            this.y = 0
            this.timer = 3;
        }
    };

    // Draw the Gem on the screen
    Raft.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        // ctx.drawImage(Resources.get(this.sprite), 0, -39, 101, 171, this.x, this.y - 39, 101, 171);
    };

    // Updates Gem 
    // Parameter: dt, a time delta between ticks
    Raft.prototype.update = function(dt) {
        this.randomize(dt);
    };

/*-----------------------------------------------------\
    Player class
    Desc: the star of the game 
    Methods: reset(), update(), render(), handleInput()
\-----------------------------------------------------*/
    var Player = function()
    {
        this.xRng = [0,404];
        this.yRng = [-23,392];
        this.sprite = 'images/char-horn-girl.png';
        this.reset(); // Default start position
    };

    // Reset player back to start
    Player.prototype.reset = function() {
        this.x = 202;
        this.y = 392;
    }

    // Draw the player on the screen
    Player.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    // Checks if within boundaries or if reached end
    // Parameter: dt, a time delta between ticks
    Player.prototype.update = function(dt) 
    {
        if ( this.x < this.xRng[0] ) this.x = this.xRng[0];
        if ( this.x > this.xRng[1] ) this.x = this.xRng[1];
        if ( this.y < this.yRng[0] ) this.y = this.yRng[0];
        if ( this.y > this.yRng[1] ) this.y = this.yRng[1];
        
        // Collect Gem if occupying the same square as player
        if( this.x == gem.x && this.y == gem.y && gem.visible ) gameboard.gem();

        // Player boarded the raft
        if( this.x == raft.x && this.y == this.yRng[0] ) gameboard.goal();

        // Player drowns in river
        if( this.x !== raft.x && this.y == this.yRng[0] ) gameboard.death();               
    }

    // Interperts keyboard commands as movement on screen
    // Parameter: dir, keyboard code expected 'up', 'down', 'left', 'right'
    Player.prototype.handleInput = function(dir)
    {
        if( !gameboard.pause )
        {
            if ( dir === "left" ) this.x -= 101;
            if ( dir === "right" ) this.x += 101;
            if ( dir === "up" ) this.y -= 83;
            if ( dir === "down" ) this.y += 83;            
        }
    }

/*-----------------------------------------------------\
    GameBoard class
    Desc: Keeps track of game progress and score
    Methods: render(), update(), gem(), goal(), 
            death(), animateCss(), gameOver(), 
            resetSprites()  
\-----------------------------------------------------*/
    var GameBoard = function()
    {
        // scoring values
        this.valGem = 3;
        this.valSafeCross = 1;

        // scoring totals
        this.totGem = 0;
        this.totSafeCross = 0;
        this.totLifes = 5;

        // Gameboard Score 
        this.score = 0;

        this.isGameOver = false;
        this.pause = false;
        this.timer = 0; 
    };

    // Renders score to screen
    GameBoard.prototype.render = function() {
        ctx.font = "24px Arial";
        ctx.fillStyle = "white"
        ctx.textAlign = "center"; 

        ctx.fillText( "SCORE", 50, 575);
        ctx.fillText( this.score , 45, 600);

        ctx.fillText( "LIFES", 50 + 101 * 2, 575);
        ctx.fillText( this.totLifes, 45 + 101 * 2, 600); 

        ctx.fillText( "GEMS", 50 + 101 * 3, 575);
        ctx.fillText( this.totGem, 45 + 101 * 3, 600);

        ctx.fillText( "RAFTS", 50 + 101 * 4, 575);
        ctx.fillText( this.totSafeCross, 45 + 101 * 4, 600);                 
    }

    // Calculates current score
    // Parameter: dt, a time delta between ticks
    GameBoard.prototype.update = function(dt) 
    {
        // Out of lives GameOver
        if( this.totLifes == 0) this.gameOver();

        //Reset Gameboard after timer expires and paused flag = true
        if ( this.timer < 0 && this.pause ) {
            this.pause = false;
            this.timer = 0;         
            this.resetSprites();
            ctx.canvas.className = "";                
        }

        // Subtract dt from timer if timer is set
        if ( this.timer > 0 ) this.timer -= dt;   
    }

    // Player collected a gem;
    GameBoard.prototype.gem = function() {
        this.totGem += 1
        this.score += this.valGem;
        gem.randomize();
    }

    // Player crossed goal
    GameBoard.prototype.goal = function() {
        this.totSafeCross += 1
        this.score += this.valSafeCross;
        this.animateCss( "tada", 1 );

        if ( this.score % 3 == 0 ) {
            allEnemies.push( new Enemy( ( Math.floor(Math.random() * 4) * 83 ) + 60 ) )
        }        
    }

    // Player killed 
    GameBoard.prototype.death = function() {
        this.totLifes -= 1;       
        this.animateCss( "shake", .5 );
    }

    // Adds animation css to gameboard
    // Parameter: css, name off css to add
    // Parameter: timer, animation length
    GameBoard.prototype.animateCss = function(css,timer)
    {
        this.timer = timer;
        this.pause = true;            
        ctx.canvas.classList.add( css );
    }    

    // Reset Sprites to default
    GameBoard.prototype.resetSprites = function() {
        player.reset();
        raft.randomize();
        gem.randomize();          
    }

    // What happens when the game is over
    GameBoard.prototype.gameOver = function() {
        document.getElementById('game-over').style.display = 'block';
        document.getElementById('game-over-overlay').style.display = 'block';
        this.isGameOver = true;
    }

/*-----------------------------------------------------\ 
    Instantiating objects
\-----------------------------------------------------*/
    var player, gem, raft, gameboard;

    function initGameBoard()
    {
        var enemyRow = [60, 143, 226, 309];

        player = new Player();
        gem = new Gem();
        raft = new Raft();
        gameboard = new GameBoard();
        allEnemies = [];

        // Loop through enemy start rows and push new obj to allEnemies 
        for (tot = 0; tot < enemyRow.length; tot++){
            allEnemies.push( new Enemy( enemyRow[tot] ) );
        }    
    }

    initGameBoard();
/*-----------------------------------------------------\ 
    This listens for key presses and sends the 
    keys to your Player.handleInput() method. 
    You don't need to modify this.
\-----------------------------------------------------*/

    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        player.handleInput(allowedKeys[e.keyCode]);
    });

/*-----------------------------------------------------\ 
    Play New Game Button
    Event Listener
\-----------------------------------------------------*/
    document.getElementById('play-again').addEventListener('click', function() {
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('game-over-overlay').style.display = 'none';
        ctx.canvas.className = "";
    });        
