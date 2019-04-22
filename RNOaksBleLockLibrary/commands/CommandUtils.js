"use strict";

const Encryption = require('../encryption');

const PLAIN_PASSWORD_LENGTH = 8;

class CommandUtils {

    // parseDeviceId is a very hacky method from the java codebase
    static parseDeviceId(deviceId,devicePsw) {
        if (devicePsw.length===PLAIN_PASSWORD_LENGTH) {
            return deviceId;
        } else {
            return "";
        }
    }

    static generateCurrentTime() {
        return Command.generateTime2Dev(new Date());
    }

    // this follows javas bitwise version. produces same result as generateTime2Dev
    static generateTime2DevBit(d) {

        let temp = (((d.getFullYear() - 2000) << 26) & 0xfc000000) + (((d.getMonth()+1) << 22) & 0x3c00000)
            + ((d.getDay() << 17) & 0x3e0000) + ((d.getHours() << 12) & 0x1f000)
            + ((d.getMinutes() << 6) & 0xfc0) + (d.getSeconds() & 0x3f);

        return temp.toString(16);
    }

    static generateTime2Dev(d) {

        var yr = ('000000' + ((d.getUTCFullYear() - 2000)).toString(2)).slice(-6);
        var mo = ('0000' + ((d.getUTCMonth() + 1)).toString(2)).slice(-4);
        var dy = ('00000' + (d.getUTCDay()).toString(2)).slice(-5);
        var hr = ('00000' + (d.getUTCHours()).toString(2)).slice(-5);
        var mi = ('000000' + (d.getUTCMinutes()).toString(2)).slice(-6);
        var sc = ('000000' + d.getUTCSeconds().toString(2)).slice(-6);

        var date = yr + mo + dy + hr + mi + sc;

        return parseInt(date, 2).toString(16);

    }

    static getActiveLocalTimeString(uint32Date) {

        let year = ((0xfc000000 & uint32Date) >> 26) + 2000;
        let month = ((0x3c00000 & uint32Date) >> 22) - 1;
        let day = ((0x3e0000 & uint32Date) >> 17);
        let hour = ((0x1f000 & uint32Date) >> 12);
        let minute = ((0xfc0 & uint32Date) >> 6);
        let second = (0x3f & uint32Date);

        let date = new Date(year,month,day,hour,minute,second);

        // setup the correct timezone offset
        date = new Date(date.getTime() - date.getTimezoneOffset()*60*1000);

        let dateStr = date.toISOString();

        let dateSplit = dateStr.split('T');

        let timeString = dateSplit[1].slice(0,8);

        return dateSplit[0] + " " + timeString;

    }

    static int2HexStr(decimal,numOfDigits=2) {
        //return ('00' + decimal.toString(16)).slice(-2);
        let str = decimal.toString(16);
        return str.padStart(numOfDigits,'0');
    }

    static getChecksum(str) {
        let bytes = Buffer.from(str, 'hex');

        let checksum = 0;
        for (let i = 0; i < bytes.length; i++) {
            checksum = checksum ^ bytes[i];
        }
        return ('00' + checksum.toString(16)).slice(-2);
    }

}

module.exports = CommandUtils;