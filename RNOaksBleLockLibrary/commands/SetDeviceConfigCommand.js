"use strict";

const Command = require('./Command.js');

const CommandConstants = require('./CommandConstants.js');

const {int2HexStr,getChecksum} = require('./CommandUtils');

class SetDeviceConfigCommand extends Command {

    constructor(deviceId, devicePassword, configType, configValues) {
        super(CommandConstants.CMD_CONFIG_LORA_LOCK_DEVICE);

        this.deviceId = deviceId;
        this.devicePassword = devicePassword;
        this.configType = configType;
        this.configValues = configValues;

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

    get configValues() {
        return this._configValues;
    }

    set configValues(configValues) {
        // shallow copy
        this._configValues = configValues.slice(0);
    }

    get buffer() {

        console.log("build config device command");

        let startOfBuffer = super.buffer;

        let values = this.configValues;

        let content = this.code + CommandConstants.ARG_SYSTEM_CODE + this.deviceId +
            this.devicePassword + int2HexStr(this.configType) + int2HexStr(values[0]);

        if (values.length>1) {
            content += int2HexStr(values[1],4);
        }

        let length = int2HexStr(content.length / 2 + 1);

        let payload = startOfBuffer.toString('hex') + length + content + getChecksum(length + content);

        console.log("payload: " + payload);

        return Buffer.from(payload,'hex');

    }

}

module.exports = SetDeviceConfigCommand;