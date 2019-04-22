"use strict";

const Command = require('./Command.js');

const CommandConstants = require('./CommandConstants.js');

const {int2HexStr,getChecksum} = require('./CommandUtils');

class ReadDeviceConfigCommand extends Command {

    constructor(deviceId, devicePassword, configType) {
        super(CommandConstants.CMD_READ_LORA_LOCK_CONFIG);

        this.deviceId = deviceId;
        this.devicePassword = devicePassword;
        this.configType = configType;

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

    get configType() {
        return this._configType;
    }

    set configType(configType) {
        this._configType = configType;
    }

    get buffer() {

        console.log("build read device config command");

        let startOfBuffer = super.buffer;

        let content = this.code + CommandConstants.ARG_SYSTEM_CODE + this.deviceId +
            this.devicePassword + int2HexStr(this.configType);

        let length = int2HexStr(content.length / 2 + 1);

        let payload = startOfBuffer.toString('hex') + length + content + getChecksum(length + content);

        console.log("payload: " + payload);

        return Buffer.from(payload,'hex');

    }

}

module.exports = ReadDeviceConfigCommand;