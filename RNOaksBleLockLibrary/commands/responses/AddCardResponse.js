"use strict";

const Response = require('./Response');

class AddCardResponse extends Response {

    constructor(buffer) {

        super(buffer);

        let startPos = super.bytesParsed;

        this._passwordStatus = buffer[startPos++];
        this._cardStatus = buffer[startPos++];

        this.bytesParsed = startPos;

    }

    get passwordStatus() {
        return this._passwordStatus;
    }

    get cardStatus() {
        return this._cardStatus;
    }

}

module.exports = AddCardResponse;