"use strict";

const Command = require('./Command.js');

const CommandConstants = require('./CommandConstants.js');

const {int2HexStr,getChecksum} = require('./CommandUtils');

class ReadClockCommand extends Command {

    constructor(deviceId,devicePassword) {
        super(CommandConstants.CMD_READ_TIME);

        this.deviceId = deviceId;
        this.devicePassword = devicePassword;

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

    get buffer() {

        console.log("build read clock command");

        let startOfBuffer = super.buffer;

        let content = this.code + CommandConstants.ARG_SYSTEM_CODE + this.deviceId + this.devicePassword;

        let length = int2HexStr(content.length / 2 + 1);

        let payload = startOfBuffer.toString('hex') + length + content + getChecksum(length + content);

        console.log("payload: " + payload);

        return Buffer.from(payload,'hex');

    }

}

module.exports = ReadClockCommand;