"use strict";

const Command = require('./Command.js');

const CommandConstants = require('./CommandConstants.js');

const {int2HexStr,getChecksum} = require('./CommandUtils');

class DeleteKeyCommand extends Command {

    constructor(deviceId,devicePassword,keyType,keyId) {
        super(CommandConstants.CMD_FLASH_DELETE_PASWD_CARD_KEY);

        this.deviceId = deviceId;
        this.devicePassword = devicePassword;
        this.keyType = keyType;
        this.keyId = keyId;

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

    get keyId() {
        return this._keyId;
    }

    set keyId(keyId) {
        this._keyId = keyId;
    }

    get buffer() {

        console.log("build delete key command");

        let startOfBuffer = super.buffer;

        let content = this.code + CommandConstants.ARG_SYSTEM_CODE +
                        this.deviceId + this.devicePassword + int2HexStr(this.keyType) + this.keyId;

        let length = int2HexStr(content.length / 2 + 1);

        let payload = startOfBuffer.toString('hex') + length + content + getChecksum(length + content);

        console.log("payload: " + payload);

        return Buffer.from(payload,'hex');

    }

}

module.exports = DeleteKeyCommand;