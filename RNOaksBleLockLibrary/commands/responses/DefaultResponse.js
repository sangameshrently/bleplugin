"use strict";

const Response = require('./Response');

class DefaultResponse extends Response {

    constructor(buffer) {

        super(buffer);

        let startPos = super.bytesParsed;

        this._battery = buffer[startPos++];

        this.bytesParsed = startPos;

    }

    get battery() {
        return this._battery;
    }

}

module.exports = DefaultResponse;