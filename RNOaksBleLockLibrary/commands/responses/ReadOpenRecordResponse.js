"use strict";

const Response = require('./Response');

const {getActiveLocalTimeString,generateTime2Dev} = require('../CommandUtils');

class ReadOpenRecordResponse extends Response {

    constructor(buffer) {

        console.log(buffer.toString('hex'));

        super(buffer);

        let startPos = super.bytesParsed;

        this._recordIndex = buffer.readUInt16BE(startPos);

        startPos += 2;

        this._recordCount = buffer.readUInt16BE(startPos);

        startPos += 2;

        let count = Math.floor((buffer.length - startPos)/14);

        if (this._recordCount===0) count = 0; // no records, the rest of the buffer is just garbage so ignore

        let keyList = [];

        for (let i=0; i<count; i++) {

            let record = {

                recordType: buffer[startPos++],
                success: buffer[startPos+8]

            };

            let password = buffer.slice(startPos,startPos+8).toString('hex').toUpperCase();

            // remove the paddind in the password
            let unpaddedPassword = password.replace(/F/g, "");

            record.password = unpaddedPassword;

            startPos += 9;

            // this is hardcoded value in the reference code
            if (record.recordType===31) {
                record.userId = buffer.slice(startPos,startPos+4).toString('hex');
                //TODO: why dont we have an operateDate for adding a fob via the lock???
            } else {
                record.operateDate = getActiveLocalTimeString(buffer.readUInt32BE(startPos));
            }

            startPos += 4;

            keyList.push(record);

        }

        this._records = keyList;

        this.bytesParsed = startPos;

    }

    get recordIndex() {
        return this._recordIndex;
    }

    get recordCount() {
        return this._recordCount;
    }

    get records() {
        return this._records;
    }

}

module.exports = ReadOpenRecordResponse;