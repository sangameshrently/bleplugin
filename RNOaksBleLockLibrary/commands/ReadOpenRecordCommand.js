"use strict";

const Command = require('./Command.js');

const CommandConstants = require('./CommandConstants.js');

const {int2HexStr,getChecksum} = require('./CommandUtils');

class ReadOpenRecordCommand extends Command {

    constructor(deviceId, devicePassword, recordIndex) {
        super(CommandConstants.CMD_READ_LOCK_RECORD);

        this.deviceId = deviceId;
        this.devicePassword = devicePassword;
        this.recordIndex = recordIndex;

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

    get recordIndex() {
        return this._recordIndex;
    }

    set recordIndex(recordIndex) {
        this._recordIndex = recordIndex;
    }

    get buffer() {

        console.log("build read open record command");

        let startOfBuffer = super.buffer;

        let content = this.code + CommandConstants.ARG_SYSTEM_CODE
            + this.deviceId + this.devicePassword + int2HexStr(this.recordIndex,4);

        let length = int2HexStr(content.length / 2 + 1);

        let payload = startOfBuffer.toString('hex') + length + content + getChecksum(length + content);

        console.log("payload: " + payload);

        return Buffer.from(payload,'hex');

    }

}

module.exports = ReadOpenRecordCommand;