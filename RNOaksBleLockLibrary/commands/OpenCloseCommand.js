"use strict";

const Command = require('./Command.js');

const CommandConstants = require('./CommandConstants.js');

const {generateTime2Dev,getChecksum} = require('./CommandUtils');

class OpenCloseCommand extends Command {

    constructor(open,deviceId,devicePassword,timezoneRawOffset,currentTime) {
        super(open?CommandConstants.CMD_OPEN_LOCK:CommandConstants.CMD_CLOSE_LOCK);

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

        if (this.code===CommandConstants.CMD_OPEN_LOCK) {
            console.log("build unlock command");
        } else {
            console.log("build lock command");
        }

        let startOfBuffer = super.buffer;

        // this is a hacky method from the java code, i know it's 16 len password
        // so ignore for now
        //deviceId = this.parseDeviceId(deviceId, devicePassword);

        let date = new Date(this.currentTime + this.timezoneRawOffset);

        let timeStr = generateTime2Dev(date);

        console.log("Date from the server: " + date);
        console.log("devicePassword.length: " + this.devicePassword.length);

        let content;
        if (this.devicePassword.length<16) {
            content = this.code + CommandConstants.ARG_SYSTEM_CODE
                + this.deviceId + this.devicePassword + timeStr;
        } else {
            content = this.code + CommandConstants.ARG_SYSTEM_CODE
                + this.devicePassword + timeStr;
        }

        let length = ('00'+(content.length / 2 + 1).toString(16)).slice(-2);
        let payload = startOfBuffer.toString('hex') + length + content + getChecksum(length + content);

        console.log("payload: " + payload);

        return Buffer.from(payload,'hex');

    }

}

module.exports = OpenCloseCommand;