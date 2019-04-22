"use strict";

const Command = require('./Command.js');

const CommandConstants = require('./CommandConstants.js');

const {int2HexStr,getChecksum} = require('./CommandUtils');

class SetClockCommand extends Command {

    constructor(deviceId,devicePassword,timezoneRawOffset,currentTime) {
        super(CommandConstants.CMD_SYNC_TIME);

        this.deviceId = deviceId;
        this.devicePassword = devicePassword;
        this.timezoneRawOffset = timezoneRawOffset;
        this.currentTime = currentTime;

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

    get timezoneRawOffset() {
        return this._timezoneRawOffset;
    }

    set timezoneRawOffset(timezoneRawOffset) {
        this._timezoneRawOffset = timezoneRawOffset;
    }

    get currentTime() {
        return this._currentTime;
    }

    set currentTime(currentTime) {
        this._currentTime = currentTime;
    }

    get buffer() {

        console.log("build set clock command");

        let startOfBuffer = super.buffer;

        let date = new Date(this.currentTime + this.timezoneRawOffset);

        console.log("Date being set on the lock: " + date);

        let content = this.code + CommandConstants.ARG_SYSTEM_CODE
            + this.deviceId
            + this.devicePassword + int2HexStr(date.getUTCFullYear() - 2000)
            + int2HexStr(date.getUTCMonth() + 1) + int2HexStr(date.getUTCDay())
            + int2HexStr(date.getUTCHours()) + int2HexStr(date.getUTCMinutes())
            + int2HexStr(date.getUTCSeconds()%60);

        let length = int2HexStr(content.length / 2 + 1);

        let payload = startOfBuffer.toString('hex') + length + content + getChecksum(length + content);

        console.log("payload: " + payload);

        return Buffer.from(payload,'hex');

    }

}

module.exports = SetClockCommand;