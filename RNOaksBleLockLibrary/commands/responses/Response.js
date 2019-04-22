"use strict";

const SYSTEM_CODE_LENGTH = 2;

/**
 * Abstract base class for responses.
 */
class Response {

    constructor(buffer) {

        let startPos = 0;

        this._command = buffer[startPos++];

        // ignore system code
        startPos += SYSTEM_CODE_LENGTH;

        this._lockId = buffer.slice(startPos, startPos + 4).toString('hex');

        startPos += 4;

        this._lockStatus = buffer[startPos++];

        this.bytesParsed = startPos;

    }

    // only getters
    get command() {
        return this._command;
    }

    get lockId() {
        return this._lockId;
    }

    get lockStatus() {
        return this._lockStatus;
    }

    get bytesParsed() {
        return this._bytesParsed;
    }

    set bytesParsed(bytesParsed) {
        this._bytesParsed = bytesParsed;
    }

}

module.exports = Response;