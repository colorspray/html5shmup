BasicGame.MainMenu = function (game) {

    this.music = null;
    this.playButton = null;

};

BasicGame.MainMenu.prototype = {

    preload:function(){
        this.load.image('titlepage', 'assets/titlepage.png');
    },

    create: function () {

    },

    update: function () {

        if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || this.input.activePointer.isDown) {
            this.startGame();
        }
        //  Do some nice funky main menu effect here

    },

    startGame: function (pointer) {

        //  Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        // this.music.stop();

        //  And start the actual game
        this.state.start('Game');

    }

};
