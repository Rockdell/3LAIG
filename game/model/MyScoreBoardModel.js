/**
 * MyScoreBoardModel
 */
class MyScoreBoardModel {

    constructor(x, y, z, time) {
        this.x = x;
        this.y = y;
        this.z = z;

        //Time in seconds
        this.setTime(time || 0);

        this.orangeGamesWon = 0;
        this.brownGamesWon = 0;
    }

    setTime(time) {
        if (time >= 100 * 60)
            console.log("Invalid timer: Less than 100 minutes!");
        else
            this.time = time;
    }

    update(elapsedTime) {

        if (this.time == 0)
            return;
        this.time -= elapsedTime;

        if (this.time < 0)
            this.time = 0;
    }

    gameWonBy(player) {
        if (player == 'o')
            this.orangeGamesWon++;
        else
            this.brownGamesWon++;
    }

    getTimeArray() {
        return this.getMinutes().concat([":"]).concat(this.getSeconds());
    }

    getMinutes() {
        let minutes = Math.floor(this.time / 60);
        return this.parseIntToArray(minutes);
    }

    getSeconds() {
        let seconds = this.time % 60;
        return this.parseIntToArray(seconds);
    }

    parseIntToArray(int) {
        let result = [];

        if (int > 10) {
            result.push(Math.floor(int / 10));
            result.push(Math.floor(int % 10));
        }
        else {
            result.push(0);
            result.push(Math.floor(int));
        }

        return result;
    }

}