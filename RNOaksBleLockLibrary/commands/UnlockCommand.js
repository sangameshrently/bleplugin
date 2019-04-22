"use strict";

const OpenCloseCommand = require('./OpenCloseCommand.js');

class UnlockCommand extends OpenCloseCommand {

    constructor(deviceId,devicePassword,timezoneRawOffset,currentTime) {
        super(true,deviceId,devicePassword,timezoneRawOffset,currentTime);
    }

}

module.exports = UnlockCommand;