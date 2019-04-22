"use strict";

const Command = require('./Command.js');

const CommandConstants = require('./CommandConstants.js');

const {int2HexStr,getChecksum,generateTime2Dev} = require('./CommandUtils');

class AddCardCommand extends Command {

    constructor(deviceId, devicePassword, keyType, userId, keyInfo, startDate, endDate, cycleType) {
        super(CommandConstants.CMD_ADD_PASWD_CARD_KEY);

        this.deviceId = deviceId;
        this.devicePassword = devicePassword;
        this.keyType = keyType;
        this.userId = userId;
        this.keyInfo = keyInfo;
        this.startDate = startDate;
        this.endDate = endDate;
        this.cycleType = cycleType;

    }

    get deviceId() {
        return this._deviceId;
    }

    set deviceId(deviceId) {
        this._deviceId = deviceId;
    }

    get devicePassword() {
        return this._devicePassword;
    }

    set devicePassword(devicePassword) {
        this._devicePassword = devicePassword;
    }

    get keyType() {
        return this._keyType;
    }

    set keyType(keyType) {
        this._keyType = keyType;
    }

    get userId() {
        return this._userId;
    }

    set userId(userId) {
        this._userId = userId;
    }

    get keyInfo() {
        return this._keyInfo;
    }

    set keyInfo(keyInfo) {
        this._keyInfo = keyInfo;
    }

    get startDate() {
        return this._startDate;
    }

    set startDate(startDate) {
        // copy the Date
        this._startDate = new Date(startDate.getTime());
    }

    get endDate() {
        return this._endDate;
    }

    set endDate(endDate) {
        // copy the Date
        this._endDate = new Date(endDate.getTime());
    }

    get cycleType() {
        return this._cycleType;
    }

    set cycleType(cycleType) {
        this._cycleType = cycleType;
    }

    get buffer() {

        console.log("build add card command");

        let startOfBuffer = super.buffer;

        let validTimeStr = "";
        if (this.endDate)
            validTimeStr = generateTime2Dev(this.endDate);

        let startDateStr = "";
        if (this.startDate)
            startDateStr = generateTime2Dev(this.startDate);

        let content = this.code + CommandConstants.ARG_SYSTEM_CODE +
            this.deviceId + this.devicePassword + int2HexStr(this.keyType) +
            this.userId + this.keyInfo + validTimeStr + startDateStr;

        if (this.cycleType !== -1)
            content += int2HexStr(this.cycleType);

        let length = int2HexStr(content.length / 2 + 1);

        let payload = startOfBuffer.toString('hex') + length + content + getChecksum(length + content);

        console.log("payload: " + payload);

        return Buffer.from(payload,'hex');

    }

}

module.exports = AddCardCommand;