BasicGame.MainMenu = function (game) {


};

BasicGame.MainMenu.prototype = {

    create: function () {
        this.titlePage = this.add.sprite(0, 0, 'titlepage');
    },

    update: function () {

        if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || this.input.activePointer.isDown) {
            this.startGame();
        }
        //  Do some nice funky main menu effect here

    },

    startGame: function () {

        //  Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        // this.music.stop();

        //  And start the actual game
        this.state.start('Game');

    }

};
