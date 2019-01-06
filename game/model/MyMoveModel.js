/**
 * MyMoveModel
 */
class MyMoveModel {

    constructor(xz) {

        let moveInfo = xz.match(/(\d+)/g);

        this.x = parseInt(moveInfo[0]) + 1;
        this.yDefault = 0.3;
        this.z = parseInt(moveInfo[1]) + 1;
    }
}
