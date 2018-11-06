const config = {
    type: Phaser.AUTO,
    width: 288,
    height: 512,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

const assets = {
    bird: {
        red: 'bird-red',
        yellow: 'bird-yellow',
        blue: 'bird-blue'
    },
    obstacle: {
        pipe: {
            green: {
                top: 'pipe-green-top',
                bottom: 'pipe-green-bottom'
            },
            red: {
                top: 'pipe-red-top',
                bottom: 'pipe-red-bo'
            }
        },
        gap: 'gap'
    },
    scene: {
        background: {
            day: 'background-day',
            night: 'background-night'
        },
        ground: 'ground',
        gameOver: 'game-over',
        restart: 'restart-button'
    },
    scoreboard: {
        base: 'number',
        number0: 'number0',
        number1: 'number1',
        number2: 'number2',
        number3: 'number3',
        number4: 'number4',
        number5: 'number5',
        number6: 'number6',
        number7: 'number7',
        number8: 'number8',
        number9: 'number9'
    },
    animation: {
        bird: {
            red: {
                clapWings: 'red-clap-wings',
                stop: 'red-stop'
            },
            blue: {
                clapWings: 'blue-clap-wings',
                stop: 'blue-stop'
            },
            yellow: {
                clapWings: 'yellow-clap-wings',
                stop: 'yellow-stop'
            }
        },
        ground: {
            moving: 'moving-ground',
            stop: 'stop-ground'
        }
    }
}

// Game
const game = new Phaser.Game(config)
let gameOver
let upButton
const widthMiddle = 144
let restartButton
let gameOverBanner
// Bird
let player
let birdName
let framesMoveUp
// Background
let backgroundDay
let backgroundNight
let ground
// pipes
let pipesGroup
let gapsGroup
let nextPipes
let currentPipe
// score variables
let scoreboardGroup
let score
const numberWidth = 25

function preload() {
    // Backgrounds and ground
    this.load.image(assets.scene.background.day, 'assets/background-day.png')
    this.load.image(assets.scene.background.night, 'assets/background-night.png')
    this.load.spritesheet(assets.scene.ground, 'assets/ground-sprite.png', {
        frameWidth: 336,
        frameHeight: 112
    })

    // Pipes
    this.load.image(assets.obstacle.pipe.green.top, 'assets/pipe-green-top.png')
    this.load.image(assets.obstacle.pipe.green.bottom, 'assets/pipe-green-bottom.png')
    this.load.image(assets.obstacle.pipe.red.top, 'assets/pipe-red-top.png')
    this.load.image(assets.obstacle.pipe.red.bottom, 'assets/pipe-red-bottom.png')
    this.load.image(assets.obstacle.gap, 'assets/gap.png')

    // End game
    this.load.image(assets.scene.gameOver, 'assets/gameover.png')
    this.load.image(assets.scene.restart, 'assets/restart-button.png')

    // Birds
    this.load.spritesheet(assets.bird.red, 'assets/redbird-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })
    this.load.spritesheet(assets.bird.blue, 'assets/bluebird-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })
    this.load.spritesheet(assets.bird.yellow, 'assets/yellowbird-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })

    // Numbers
    this.load.image(assets.scoreboard.number0, 'assets/0.png')
    this.load.image(assets.scoreboard.number1, 'assets/1.png')
    this.load.image(assets.scoreboard.number2, 'assets/2.png')
    this.load.image(assets.scoreboard.number3, 'assets/3.png')
    this.load.image(assets.scoreboard.number4, 'assets/4.png')
    this.load.image(assets.scoreboard.number5, 'assets/5.png')
    this.load.image(assets.scoreboard.number6, 'assets/6.png')
    this.load.image(assets.scoreboard.number7, 'assets/7.png')
    this.load.image(assets.scoreboard.number8, 'assets/8.png')
    this.load.image(assets.scoreboard.number9, 'assets/9.png')
}

function create() {
    backgroundDay = this.add.image(widthMiddle, 256, assets.scene.background.day).setInteractive();
    backgroundDay.on('pointerdown', moveBird)
    backgroundNight = this.add.image(widthMiddle, 256, assets.scene.background.night).setInteractive();
    backgroundNight.visible = false
    backgroundNight.on('pointerdown', moveBird)

    gapsGroup = this.physics.add.group()
    pipesGroup = this.physics.add.group()
    scoreboardGroup = this.physics.add.staticGroup()

    ground = this.physics.add.sprite(widthMiddle, 458, assets.scene.ground)
    ground.setCollideWorldBounds(true)
    ground.setDepth(10)


    upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)

    // Ground animations
    this.anims.create({
        key: assets.animation.ground.moving,
        frames: this.anims.generateFrameNumbers(assets.scene.ground, {
            start: 0,
            end: 2
        }),
        frameRate: 15,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.ground.stop,
        frames: [{
            key: assets.scene.ground,
            frame: 0
        }],
        frameRate: 20
    })

    // Red Bird Animations
    this.anims.create({
        key: assets.animation.bird.red.clapWings,
        frames: this.anims.generateFrameNumbers(assets.bird.red, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.bird.red.stop,
        frames: [{
            key: assets.bird.red,
            frame: 1
        }],
        frameRate: 20
    })

    // Blue Bird animations
    this.anims.create({
        key: assets.animation.bird.blue.clapWings,
        frames: this.anims.generateFrameNumbers(assets.bird.blue, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.bird.blue.stop,
        frames: [{
            key: assets.bird.blue,
            frame: 1
        }],
        frameRate: 20
    })

    // Yellow Bird animations
    this.anims.create({
        key: assets.animation.bird.yellow.clapWings,
        frames: this.anims.generateFrameNumbers(assets.bird.yellow, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.bird.yellow.stop,
        frames: [{
            key: assets.bird.yellow,
            frame: 1
        }],
        frameRate: 20
    })

    startGame(this)

    gameOverBanner = this.add.image(widthMiddle, 206, assets.scene.gameOver)
    gameOverBanner.setDepth(20)
    gameOverBanner.visible = false

    restartButton = this.add.image(widthMiddle, 300, assets.scene.restart).setInteractive()
    restartButton.on('pointerdown', restartGame)
    restartButton.setDepth(20)
    restartButton.visible = false
}

function update() {
    if (gameOver)
        return

    if (framesMoveUp > 0)
        framesMoveUp--
    else if (Phaser.Input.Keyboard.JustDown(upButton))
        moveBird()
    else {
        player.setVelocityY(120)

        if (player.angle < 90)
            player.angle += 1
    }

    pipesGroup.children.iterate(function (child) {
        if (child == undefined)
            return

        if (child.x < -50)
            child.destroy()
        else
            child.setVelocityX(-100)
    });

    gapsGroup.children.iterate(function (child) {
        child.setVelocityX(-100)
    });

    nextPipes++;
    if (nextPipes === 130) {
        makePipes()
        nextPipes = 0
    }
}

function hitBird(player) {
    this.physics.pause()

    gameOver = true

    player.anims.play(getAnimationBird(birdName).stop)
    ground.anims.play(assets.animation.ground.stop)

    gameOverBanner.visible = true
    restartButton.visible = true
}

function updateScore(_, gap) {
    score++
    gap.destroy()

    if (score % 10 == 0) {
        backgroundDay.visible = !backgroundDay.visible
        backgroundNight.visible = !backgroundNight.visible

        if (currentPipe === assets.obstacle.pipe.green)
            currentPipe = assets.obstacle.pipe.red
        else
            currentPipe = assets.obstacle.pipe.green
    }

    updateScoreboard()
}

function makePipes() {
    const pipeTopY = Phaser.Math.Between(-120, 120)

    const gap = gapsGroup.create(288, pipeTopY + 210, assets.obstacle.gap, null, false)
    gap.body.allowGravity = false

    const pipeTop = pipesGroup.create(288, pipeTopY, currentPipe.top)
    pipeTop.body.allowGravity = false

    const pipeBottom = pipesGroup.create(288, pipeTopY + 420, currentPipe.bottom)
    pipeBottom.body.allowGravity = false
}

function moveBird() {
    if (gameOver)
        return

    player.setVelocityY(-400)
    player.angle = -15
    framesMoveUp = 5
}

function getRandomBird() {
    switch (Phaser.Math.Between(0, 2)) {
        case 0:
            return assets.bird.red
        case 1:
            return assets.bird.blue
        case 2:
        default:
            return assets.bird.yellow
    }
}

function getAnimationBird(bird) {
    switch (bird) {
        case assets.bird.red:
            return assets.animation.bird.red
        case assets.bird.blue:
            return assets.animation.bird.blue
        case assets.bird.yellow:
        default:
            return assets.animation.bird.yellow
    }
}

function updateScoreboard() {
    scoreboardGroup.clear(true, true)

    const scoreAsString = score.toString()
    if (scoreAsString.length == 1)
        scoreboardGroup.create(widthMiddle, 30, assets.scoreboard.base + score).setDepth(10)
    else {
        let initialPosition = widthMiddle - ((score.toString().length * numberWidth) / 2)

        for (let i = 0; i < scoreAsString.length; i++) {
            scoreboardGroup.create(initialPosition, 30, assets.scoreboard.base + scoreAsString[i]).setDepth(10)
            initialPosition += numberWidth
        }
    }
}

function restartGame() {
    pipesGroup.clear(true, true)
    pipesGroup.clear(true, true)
    gapsGroup.clear(true, true)
    scoreboardGroup.clear(true, true)
    player.destroy()
    gameOverBanner.visible = false
    restartButton.visible = false

    var gameScene = game.scene.scenes[0]
    startGame(gameScene)

    gameScene.physics.resume()
}

function startGame(scene) {
    framesMoveUp = 0
    nextPipes = 0
    currentPipe = assets.obstacle.pipe.green
    score = 0
    gameOver = false
    backgroundDay.visible = true
    backgroundNight.visible = false

    birdName = getRandomBird()
    player = scene.physics.add.sprite(80, 185, birdName)
    player.setCollideWorldBounds(true)
    player.anims.play(getAnimationBird(birdName).clapWings, true)

    scene.physics.add.collider(player, ground, hitBird, null, scene)
    scene.physics.add.collider(player, pipesGroup, hitBird, null, scene)

    scene.physics.add.overlap(player, gapsGroup, updateScore, null, scene)

    makePipes()

    scoreboardGroup.create(widthMiddle, 30, assets.scoreboard.number0)

    ground.anims.play(assets.animation.ground.moving, true)
}