"use strict";

const Command = require('./Command.js');

const CommandConstants = require('./CommandConstants.js');

const {int2HexStr,getChecksum} = require('./CommandUtils');

class DeleteOpenRecordCommand extends Command {

    constructor(deviceId, devicePassword, delMask) {
        super(CommandConstants.CMD_DEL_LOCK_RECORD);

        this.deviceId = deviceId;
        this.devicePassword = devicePassword;
        this.delMask = delMask;

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

    get delMask() {
        return this._delMask;
    }

    set delMask(delMask) {
        this._delMask = delMask;
    }

    get buffer() {

        console.log("build delete open record command");

        let startOfBuffer = super.buffer;

        let content = this.code + CommandConstants.ARG_SYSTEM_CODE
            + this.deviceId + this.devicePassword + int2HexStr(this.delMask);

        let length = int2HexStr(content.length / 2 + 1);

        let payload = startOfBuffer.toString('hex') + length + content + getChecksum(length + content);

        console.log("payload: " + payload);

        return Buffer.from(payload,'hex');

    }

}

module.exports = DeleteOpenRecordCommand;