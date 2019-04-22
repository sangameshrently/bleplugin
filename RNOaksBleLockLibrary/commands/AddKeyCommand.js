"use strict";

const Command = require('./Command.js');

const CommandConstants = require('./CommandConstants.js');

const {int2HexStr,getChecksum,generateTime2Dev} = require('./CommandUtils');

class AddKeyCommand extends Command {

    constructor(deviceId,devicePassword,keyType,keyIdList,startDateList,endDateList,cycleType) {
        super(CommandConstants.CMD_FLASH_ADD_PASWD_CARD_KEY);

        this.deviceId = deviceId;
        this.devicePassword = devicePassword;
        this.keyType = keyType;
        this.keyIdList = keyIdList;
        this.startDateList = startDateList;
        this.endDateList = endDateList;
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

    get keyIdList() {
        return this._keyIdList;
    }

    set keyIdList(keyIdList) {
        // shallow copy
        this._keyIdList = keyIdList.slice(0);
    }

    get startDateList() {
        return this._startDateList;
    }

    set startDateList(startDateList) {
        //shallow copy
        this._startDateList = startDateList.slice(0);
    }

    get endDateList() {
        return this._endDateList;
    }

    set endDateList(endDateList) {
        //shallow copy
        this._endDateList = endDateList.slice(0);
    }

    get cycleType() {
        return this._cycleType;
    }

    set cycleType(cycleType) {
        this._cycleType = cycleType;
    }

    get buffer() {

        console.log("build add key command");

        let startOfBuffer = super.buffer;

        if (this.cycleType === -1) {
            this.cycleType = 0;
        }
        let keyCount = this.keyIdList.length;
        let keyInfo = "";

        for (let i = 0; i < keyCount; i++) {
            let time = generateTime2Dev(this.endDateList[i]);
            keyInfo += this.keyIdList[i] + time;
        }

        let startTimeInfo = "";
        if (this.startDateList && this.startDateList.length>0) {
            for (let date of this.startDateList) {
                startTimeInfo += generateTime2Dev(date);
            }
        }

        let content = this.code + CommandConstants.ARG_SYSTEM_CODE +
            this.deviceId + this.devicePassword + int2HexStr(this.keyType) +
            int2HexStr(keyCount) + keyInfo + startTimeInfo +
            int2HexStr(this.cycleType);

        let length = int2HexStr(content.length / 2 + 1);

        let payload = startOfBuffer.toString('hex') + length + content + getChecksum(length + content);

        console.log("payload: " + payload);

        return Buffer.from(payload,'hex');

    }

}

module.exports = AddKeyCommand;