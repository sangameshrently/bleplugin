"use strict";

const OpenCloseCommand = require('./OpenCloseCommand.js');

class LockCommand extends OpenCloseCommand {

    constructor(deviceId,devicePassword,timezoneRawOffset,currentTime) {
        super(false,deviceId,devicePassword,timezoneRawOffset,currentTime);
    }

}

module.exports = LockCommand;