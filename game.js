BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {
    preload: function () {
        this.load.image('sea', 'assets/sea.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.spritesheet('greenEnemy', 'assets/enemy.png', 32, 32);
        this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
        this.load.spritesheet('player', 'assets/player.png', 64, 64);
    },

    create: function () {
        this.sea = this.add.tileSprite(0, 0, 1024, 768, 'sea');

        this.setupPlayer();
        this.setupEnemies();
        this.setupBullets();
        this.setupExplosions();
        this.setupText();

        this.cursors = this.input.keyboard.createCursorKeys();
    },

    update: function () {
        this.sea.tilePosition.y += 0.2;
        this.processPlayerInput();
        this.spawnEnemies();
        this.checkCollisions();
        this.processDelayedEffects();
    },

    setupPlayer: function () {
        this.player = this.add.sprite(400, 650, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.player.animations.add('fly', [0, 1, 2], 20, true);
        this.player.play('fly');
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.speed = 300;
        this.player.body.collideWorldBounds = true;
        this.player.body.setSize(20, 20, 0, -5);
    },

    setupEnemies: function () {
        this.enemyPool = this.add.group();
        this.enemyPool.enableBody = true;
        this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyPool.createMultiple(50, 'greenEnemy');
        this.enemyPool.setAll('anchor.x', 0.5);
        this.enemyPool.setAll('anchor.y', 0.5);
        this.enemyPool.setAll('outOfBoundsKill', true);
        this.enemyPool.setAll('checkWorldBounds', true);
        this.enemyPool.forEach(function (enemy) {
            enemy.animations.add('fly', [0, 1, 2], 20, true);
            enemy.animations.add('hit', [3, 1, 3, 2], 20, false);
            enemy.events.onAnimationComplete.add(function(e) {
                e.play('fly')
            }, this);
        });

        this.nextEnemyAt = 0;
        this.enemyDelay = 1000;
    },

    setupBullets: function () {
        this.bulletPool = this.add.group();
        this.bulletPool.enableBody = true;
        this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletPool.createMultiple(100, 'bullet');
        this.bulletPool.setAll('anchor.x', 0.5);
        this.bulletPool.setAll('anchor.y', 0.5);
        this.bulletPool.setAll('outOfBoundsKill', true);
        this.bulletPool.setAll('checkWorldBounds', true);

        this.nextShotAt = 0;
        this.shotDelay = 500;
    },

    setupExplosions: function () {
        this.explosionPool = this.add.group();
        this.explosionPool.enableBody = true;
        this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.explosionPool.createMultiple(100, 'explosion');
        this.explosionPool.setAll('anchor.x', 0.5);
        this.explosionPool.setAll('anchor.y', 0.5);
        this.explosionPool.forEach(function (explosion) {
            explosion.animations.add('boom');
        })
    },

    setupText: function () {
        this.instructions = this.add.text(510, 600,
            "Use Arrow Keys to Move, Press Z to Fire\n" +
                "Tapping/clicking does both",
            {font: '20px monospace', fill: '#fff', align: 'center'}
        );
        this.instructions.anchor.setTo(0.5, 0.5);
        this.instExpire = this.time.now + 1000;
    },

    checkCollisions:function(){
        this.physics.arcade.overlap(
            this.bulletPool, this.enemyPool, this.enemyHit, null, this
        );

        this.physics.arcade.overlap(
            this.player, this.enemyPool, this.playerHit, null, this
        );
    },

    spawnEnemies:function(){
        if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
            this.nextEnemyAt = this.time.now + this.enemyDelay;
            var enemy = this.enemyPool.getFirstExists(false);
            enemy.reset(this.rnd.integerInRange(20, 1004), 0);
            enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
            enemy.play('fly');
            enemy.health = 2;
        }
    },

    processPlayerInput:function(){
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;

        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -this.player.speed;
        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = this.player.speed;
        }

        if (this.cursors.up.isDown) {
            this.player.body.velocity.y = -this.player.speed;
        }
        else if (this.cursors.down.isDown) {
            this.player.body.velocity.y = this.player.speed;
        }

        if (this.game.input.activePointer.isDown &&
            this.game.physics.arcade.distanceToPointer(this.player) > 15) {
            this.game.physics.arcade.moveToPointer(this.player, this.player.speed);
        }

        if (this.input.keyboard.isDown(Phaser.Keyboard.Z) ||
            this.input.activePointer.isDown) {
            this.fire();
        }
    },

    processDelayedEffects:function(){
        if (this.instructions.exists && this.time.now > this.instExpire) {
            this.instructions.destroy();
        }
    },

    render: function () {
        this.game.debug.body(this.player);
    },

    playerHit: function (player, enemy) {
        this.damageEnemy(enemy, 5);
        this.explode(player);
        player.kill();
    },

    fire: function () {
        if (!this.player.alive || this.nextShotAt > this.time.now) {
            return;
        }

        if (this.bulletPool.countDead() == 0) {
            return;
        }

        this.nextShotAt = this.time.now + this.shotDelay;
        var bullet1 = this.bulletPool.getFirstExists(false);
        bullet1.reset(this.player.x - 15, this.player.y - 20);
        bullet1.body.velocity.y = -500;

        var bullet2 = this.bulletPool.getFirstExists(false);
        bullet2.reset(this.player.x + 15, this.player.y - 20);
        bullet2.body.velocity.y = -500;
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    },

    enemyHit: function (bullet, enemy) {
        bullet.kill();
        this.damageEnemy(enemy, 1);
    },

    explode: function (sprite) {
        if (this.explosionPool.countDead() == 0) {
            return;
        }

        var explosion = this.explosionPool.getFirstExists(false);
        explosion.reset(sprite.x, sprite.y);
        explosion.play('boom', 15, false, true);
        explosion.body.velocity.x = sprite.body.velocity.x;
        explosion.body.velocity.y = sprite.body.velocity.y;
    },

    damageEnemy:function(enemy, damage){
        enemy.damage(damage);
        if (enemy.alive){
            enemy.play('hit');
        }
        else{
            this.explode(enemy);
        }
    }
};
