import Phaser from "phaser";

/* The game is a tweaked version of the lecture demo. 
Changes: 
less platforms, 
faster pace,
at the start always spawn on top of at least 1 platform, 
some platforms move,
wall climb (you can jump from the sides of platforms),



*/
let game;

const gameOptions = {
  dudeGravity: 800,
  dudeSpeed: 300
};

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#000c1f",

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 1000
    },

    pixelArt: true,

    physics: {
      default: "arcade",
      arcade: {
        gravity: {
          y: 0
        }
      }
    },
    scene: PlayGame
  };

  game = new Phaser.Game(gameConfig);
  window.focus();
};

class PlayGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
    this.score = 0;
  }

  preload() {
    this.load.image("ground", "src/assets/platform.png");
    this.load.image("platform2", "src/assets/platform2.png");
    this.load.image("star", "src/assets/star.png");
    this.load.image("star2", "src/assets/star2.png");
    this.load.spritesheet("dude", "src/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48
    });
  }

  create() {
    this.groundGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });
    this.groundGroup.create(
      game.config.width / 2,
      game.config.height * (2 / 3),
      "ground"
    );
    for (let i = 0; i < 15; i++) {
      let xCoordinate = Phaser.Math.Between(0, game.config.width);
      let ground = this.groundGroup.create(
        Phaser.Math.Between(0, xCoordinate),
        Phaser.Math.Between(0, game.config.height),
        "ground"
      );
      if (Phaser.Math.Between(0, 1) === 1) {
        if (xCoordinate > game.config.width / 2) {
          ground.setVelocityX(gameOptions.dudeSpeed / -10);
        } else {
          ground.setVelocityX(gameOptions.dudeSpeed / 10);
        }
      }
    }

    this.dude = this.physics.add.sprite(
      game.config.width / 2,
      game.config.height / 2,
      "dude"
    );
    this.dude.body.gravity.y = gameOptions.dudeGravity;
    this.physics.add.collider(this.dude, this.groundGroup);

    this.starsGroup = this.physics.add.group({});
    this.physics.add.collider(this.starsGroup, this.groundGroup);

    this.physics.add.overlap(
      this.dude,
      this.starsGroup,
      this.collectStar,
      null,
      this
    );

    this.add.image(16, 16, "star");
    this.scoreText = this.add.text(32, 3, "0", {
      fontSize: "30px",
      fill: "#ffffff"
    });

    this.add.image(80, 16, "star2");
    this.scoreText = this.add.text(96, 3, "0", {
      fontSize: "30px",
      fill: "#ffffff"
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 10
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.triggerTimer = this.time.addEvent({
      callback: this.addGround,
      callbackScope: this,
      delay: 1500,
      loop: true
    });
  }

  addGround() {
    console.log("Adding new stuff!");
    let xCoordinate = Phaser.Math.Between(0, game.config.width);
    let ground = this.groundGroup.create(xCoordinate, 0, "ground");
    this.groundGroup.setVelocityY(gameOptions.dudeSpeed / 4);

    if (Phaser.Math.Between(0, 2) === 2) {
      if (xCoordinate > 400) {
        ground.setVelocityX(gameOptions.dudeSpeed / -10);
      } else {
        ground.setVelocityX(gameOptions.dudeSpeed / 10);
      }

      if (Phaser.Math.Between(0, 1)) {
        this.starsGroup.create(
          Phaser.Math.Between(0, game.config.width),
          0,
          "star"
        );
        this.starsGroup.setVelocityY(gameOptions.dudeSpeed);
      }
      if (Phaser.Math.Between(0, 10) === 10) {
        this.starsGroup.create(
          Phaser.Math.Between(0, game.config.width),
          0,
          "star2"
        );
        this.starsGroup.setVelocityY(gameOptions.dudeSpeed);
      }
    }
  }
  collectStar(dude, start) {
    start.disableBody(true, true);
    this.score += 1;
    this.scoreText.setText(this.score);
  }

  update() {
    if (this.cursors.left.isDown) {
      this.dude.body.velocity.x = -gameOptions.dudeSpeed;
      this.dude.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.dude.body.velocity.x = gameOptions.dudeSpeed;
      this.dude.anims.play("right", true);
    } else {
      this.dude.body.velocity.x = 0;
      this.dude.anims.play("turn", true);
    }

    if (
      this.cursors.up.isDown &&
      (this.dude.body.touching.down ||
        this.dude.body.touching.left ||
        this.dude.body.touching.right)
    ) {
      this.dude.body.velocity.y = -gameOptions.dudeGravity / 1.6;
    }

    if (this.dude.y > game.config.height || this.dude.y < 0) {
      this.scene.start("PlayGame");
    }
  }
}
