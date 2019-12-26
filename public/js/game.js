let game, scores;

class Highscore extends Phaser.Scene {

    constructor() {
        super({
            key: 'Highscore',
            active: true
        });

        this.scores =[];
    }

    preload() {
        // this.preload.bitmapFont('arcade', 'assets/arcade.png', 'assets/arcade.xml');
    }

    create() {
        this.add.bitmapText(100, 110, 'arcade', 'RANK SCORE NAME').setTint(0xffffff);

        for (let i = 0; i < 5; i++) {
            const index = i + 1;
            const playerInfo = scores[i];
            if (scores[i]) {
                this.add.bitmapText(100, 160 + 50 * index, 'arcade', `${index}      ${playerInfo.highScore}    ${playerInfo.name}`).setTint(0xffffff);
            } else {
                this.add.bitmapText(100, 160 + 50 * index, 'arcade', `${index}      0    ---`).setTint(0xffffff);
            }
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    pixelArt: true,
    scene: [Highscore]
};

$.ajax({
    type: 'GET',
    url: '/scores',
    success: (data) => {
        game = new Phaser.Game(config);
        scores = data;
    },
    error: (xhr) => {
        console.log(xhr);
    }
});