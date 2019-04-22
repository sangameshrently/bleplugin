
"use strict";

const CommandConstants = require('./CommandConstants.js');

const PLAIN_PASSWORD_LENGTH = 8;

/**
 * Abstract base class for commands.
 */
class Command {

    constructor(code = CommandConstants.CMD_UNDEFINED) {

        this.header = CommandConstants.CMD_HEADER_CLIENT_SERVER;
        this.code = code;

    }

    get header() {
        return this._header;
    }

    set header(header) {
        this._header = header;
    }

    get code() {
        return this._code;
    }

    set code(code) {
        this._code = code;
    }

    /**
     * Using a getter, build the hex Buffer for the command.
     */
    get buffer() {
        return Buffer.from(this.header,'hex');
    }

}

module.exports = Command;