"use strict";

const Encryption = require('../../encryption');

const CommandConstants = require('../CommandConstants.js');

const DefaultResponse = require('./DefaultResponse');
const AddCardResponse = require('./AddCardResponse');
const ReadClockResponse = require('./ReadClockResponse');
const ReadOpenRecordResponse = require('./ReadOpenRecordResponse');
const ReadDeviceConfigResponse = require('./ReadDeviceConfigResponse');

const {getChecksum} = require('../CommandUtils');

const AES_KEY = Buffer.from("217108a1b10401a1f291311303b121c1","hex");

class ResponseFactory {

    /**
     *
     * Creates a Response from a buffer.
     *
     * @param buffer
     * @returns {Response,DefaultResponse,ReadClockResponse,ReadDeviceConfigResponse}
     */
    static createResponse(buffer) {

        let encryption = new Encryption(AES_KEY);

        let decryptedBuffer = encryption.decrypt(buffer);

        let checksumStr = getChecksum(buffer.length.toString(16) +
                                                decryptedBuffer.slice(0,buffer.length-1).toString('hex'));

        //verify checksum
        if (decryptedBuffer[decryptedBuffer.length-1]!==parseInt(checksumStr,16)) {
            console.log("failed checksum validity");
            return null;
        }

        let command = decryptedBuffer.slice(0, 1).toString('hex').toUpperCase();

        switch(command) {
            case CommandConstants.CMD_ADD_PASWD_CARD_KEY:
                return new AddCardResponse(decryptedBuffer);
            case CommandConstants.CMD_READ_TIME:
                return new ReadClockResponse(decryptedBuffer);
            case CommandConstants.CMD_READ_LOCK_RECORD:
                return new ReadOpenRecordResponse(decryptedBuffer);
            case CommandConstants.CMD_READ_LORA_LOCK_CONFIG:
                return new ReadDeviceConfigResponse(decryptedBuffer);
            default:
                return new DefaultResponse(decryptedBuffer);
        }

    }

}

module.exports = ResponseFactory;