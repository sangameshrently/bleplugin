"use strict";

class ResponseBuffer {

    constructor(contentLength, buffer) {

        // clone buffer
        this._buffer = Buffer.concat([buffer]);

        this._contentLength = contentLength;

    }

    get buffer() {
        return this._buffer;
    }

    get contentLength() {
        return this._contentLength;
    }

    isComplete() {

        return this._buffer.length >= this.contentLength;
    }

    append(buffer) {

        this._buffer = Buffer.concat([this.buffer,buffer]);

    }

}

module.exports = ResponseBuffer;
