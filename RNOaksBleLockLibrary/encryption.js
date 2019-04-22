'use strict';

const aesjs = require('aes-js');

const ENCRYPTION_FRAME = 16;    // encrypted bytes must align to multiples of this frame

/**
 * Set key to encrypt the message
 */
function Encryption(key) {
    this.format = 'hex';
    this.aes = new aesjs.AES(key);
}

/**
 * Return from function will be encrypted message buffer
 */
Encryption.prototype.encrypt = function(message) {

    // the first 3 bytes are not encrypted as they are the header and length
    let partialMessage = message.slice(3);
    let encryptedBufferLength = partialMessage.length;

    let fillLength = (encryptedBufferLength % ENCRYPTION_FRAME);

    // need to fill in 00 to align to encryption frame
    if (fillLength>0) {

        fillLength = ENCRYPTION_FRAME - fillLength;

        console.log("not on the encryption frame boundary");

        let fillBuffer = Buffer.alloc(fillLength,'00','hex');

        partialMessage = Buffer.concat([partialMessage,fillBuffer]);

        // update length and recalc checksum
        encryptedBufferLength += fillLength;

        // checksum includes the length and the partialMessage
        let checksumBuffer = Buffer.alloc(encryptedBufferLength+1);
        partialMessage.copy(checksumBuffer,1);
        checksumBuffer[0] = encryptedBufferLength;

        // set the new checksum in the message
        partialMessage[encryptedBufferLength-1] = getChecksum(checksumBuffer);

        console.log("filled buffer        : " + partialMessage.toString('hex'));

    }

    console.log("Raw message          : " + message.toString(this.format));

    // loop through and encrypt ENCRYPTION_FRAME number of bytes each pass
    let framesToEncrypt = (encryptedBufferLength / ENCRYPTION_FRAME);

    if (framesToEncrypt!==Math.floor(framesToEncrypt))
        console.log("alignment of buffer to 16 bytes failed.");

    console.log("frames to Encrypt:" + framesToEncrypt);

    let arrayOfFrames = [];

    let sliceOffset = 0;
    for (let i=0; i<framesToEncrypt; i++) {

        arrayOfFrames.push(Buffer.from(this.aes.encrypt(partialMessage.slice(sliceOffset,sliceOffset+ENCRYPTION_FRAME))));
        sliceOffset += ENCRYPTION_FRAME;
    }

    let encryptedBuffer;

    // construct the full encrypted buffer from the encrypted frames
    if (arrayOfFrames.length===1) {
        encryptedBuffer = arrayOfFrames[0];
    } else {
        encryptedBuffer = Buffer.concat(arrayOfFrames);
    }

    console.log("Encrypted data       : " + encryptedBuffer.toString(this.format));

    let newBuffer = Buffer.alloc(encryptedBufferLength+3,'00','hex');

    newBuffer[0] = message[0];
    newBuffer[1] = message[1];

    newBuffer[2] = encryptedBufferLength;

    encryptedBuffer.copy(newBuffer,3,0);

    console.log("Final buffer         : " + newBuffer.toString(this.format));

    return newBuffer;

}

/**
 * Return from this function will be decrypted message buffer
 */
Encryption.prototype.decrypt = function(message) {

    //TODO: once this is cleaned up, figure out if we want to pass in header and length

    let length = message.length;
    let framesToDecrypt = (length / ENCRYPTION_FRAME);

    if (framesToDecrypt!==Math.floor(framesToDecrypt))
        console.log("buffer is not aligned to 16 bytes");

    console.log("frames to Decrypt:" + framesToDecrypt);

    let arrayOfFrames = [];

    let sliceOffset = 0;
    for (let i=0; i<framesToDecrypt; i++) {

        arrayOfFrames.push(Buffer.from(this.aes.decrypt(message.slice(sliceOffset,sliceOffset+ENCRYPTION_FRAME))));
        sliceOffset += ENCRYPTION_FRAME;
    }

    let decryptedBuffer;

    // construct the full decryptedBuffer buffer from the decrypted frames
    if (arrayOfFrames.length===1) {
        decryptedBuffer = arrayOfFrames[0];
    } else {
        decryptedBuffer = Buffer.concat(arrayOfFrames);
    }

    console.log("Decrypted data       : " + decryptedBuffer.toString(this.format));
    return decryptedBuffer;
}

function getChecksum(buffer) {

    let checksum = 0;
    for (let i = 0; i < buffer.length; i++) {
        checksum = checksum ^ buffer[i];
    }
    return checksum;
}

module.exports = Encryption;
