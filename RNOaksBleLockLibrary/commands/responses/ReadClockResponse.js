"use strict";

const Response = require('./Response');

class ReadClockResponse extends Response {

    constructor(buffer) {

        super(buffer);

        let startPos = super.bytesParsed;

        // year, month (0 indexed), day, minutes, hours, seconds
        this._date = new Date(2000+buffer[startPos++],buffer[startPos++]-1,buffer[startPos++],buffer[startPos++],
                                buffer[startPos++],buffer[startPos++]);

        this.bytesParsed = startPos;

    }

    get date() {
        return this._date;
    }

}

module.exports = ReadClockResponse;