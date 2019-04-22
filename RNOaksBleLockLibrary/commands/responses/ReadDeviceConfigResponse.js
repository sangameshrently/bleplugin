"use strict";

const Response = require('./Response');

class ReadDeviceConfigResponse extends Response {

    constructor(buffer) {

        super(buffer);

        let startPos = super.bytesParsed;

        this._configType = buffer[startPos++];

        let configValues = [buffer[startPos++]];

        configValues.push(buffer.readUInt16BE(startPos));

        this._configValues = configValues;

        startPos += 2;

        this.bytesParsed = startPos;

    }

    get configType() {
        return this._configType;
    }

    get configValues() {
        return this._configValues;
    }

}

module.exports = ReadDeviceConfigResponse;