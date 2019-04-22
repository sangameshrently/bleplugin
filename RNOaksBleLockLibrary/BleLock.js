/**
    Copyright: Rently Keyless, 2019

    Author: Ron Gerbasi @ 2wayTV
    Date: February 2019
 */

"use strict";

const LockController = require('./lockController.js');

const RNDahaoLockError = require('./RNDahaoLockError');

const {KeyTypeEnum,ConfigTypeEnum,maxNumberOfLogs} = require('./constants');

const BleLockConstants = require('./BleLockConstants');

class BleLock {

    constructor(lockMac) {
        this._lockMac = lockMac;
    }

    get lockMac() {
        return this._lockMac;
    }

    get lockController() {
        return this._lockController;
    }

    bleInit(lockController) {
        this._lockController = lockController;
    }

    oneKeyDisconnectDevice() {
        this.lockController.disconnectDevice(this.lockMac);
    }

    commandTimeOut() {
        // command timeout is handled by disconnecting the device
        this.lockController.commandTimeOut(this.lockMac);
    }

    async initLock({ V3LockDeviceId, plainPsw}) {

        // calculate currentTime and timezoneRawOffset
        let date = new Date(); // this is UTC
        let timezoneRawOffset = (date.getTimezoneOffset()*60*1000); // make it milliseconds

        // we subtract the timezoneRawOffset because we can't get a local time in millis from Date.
        // it's always UTC time
        let currentTime = date.getTime() - timezoneRawOffset;

        await this.lockController.initLock(this.lockMac,V3LockDeviceId,plainPsw,timezoneRawOffset,currentTime);
    }

    async resetLock({ V3LockDeviceId, plainPsw}) {
        await this.lockController.resetLock(this.lockMac,V3LockDeviceId,plainPsw);

        return BleLockConstants.RESET_SUCCESS;
    }

    async setLockTime({ V3LockDeviceId, plainPsw, currentTime, timezoneRawOffset }) {
        await this.lockController.setClock(this.lockMac,V3LockDeviceId,plainPsw,timezoneRawOffset,currentTime);

        return BleLockConstants.SET_CLOCK_SUCCESS;
    }

    async getLockTime({ V3LockDeviceId, plainPsw }) {
        let response = await this.lockController.readClock(this.lockMac,V3LockDeviceId,plainPsw);

        return response.date.getTime();
    }

    async unlock({ lockKey, V3LockDeviceId, currentTime, timezoneRawOffset }) {
        await this.lockController.unlock(this.lockMac,V3LockDeviceId,lockKey,timezoneRawOffset,currentTime);

        return BleLockConstants.UNLOCK_SUCCESS;
    }

    async lock({ lockKey, V3LockDeviceId, currentTime, timezoneRawOffset }) {
        await this.lockController.lock(this.lockMac,V3LockDeviceId,lockKey,timezoneRawOffset,currentTime);

        return BleLockConstants.LOCK_SUCCESS;
    }

    async getAutoLockTime({ V3LockDeviceId, plainPsw}) {
        let response = await this.lockController.readDeviceConfig(this.lockMac,V3LockDeviceId,plainPsw,ConfigTypeEnum.AUTO_LOCK);

        return response.configValues;
    }

    async setAutoLockTime({ V3LockDeviceId, plainPsw, time }) {

        let configValues = (time>0) ? [1,time*1000] : [0,0];

        await this.lockController.setDeviceConfig(this.lockMac,V3LockDeviceId,plainPsw,ConfigTypeEnum.AUTO_LOCK,configValues);

        return BleLockConstants.SET_AUTO_LOCK_TIME_SUCCESS;

    }

    async isDoorSensorEnabled({V3LockDeviceId, plainPsw}) {
        let response = await this.lockController.readDeviceConfig(this.lockMac,V3LockDeviceId,plainPsw,ConfigTypeEnum.DOOR_SENSOR);

        let isEnabled = !(!! + response.configValues[0]);

        return isEnabled;
    }

    async setDoorSensorLocking({ V3LockDeviceId, plainPsw, isEnabled }) {
        let configValues = [!isEnabled+0,0];

        await this.lockController.setDeviceConfig(this.lockMac,V3LockDeviceId,plainPsw,ConfigTypeEnum.DOOR_SENSOR,configValues);

        return BleLockConstants.SET_DOOR_SENSOR_SUCCESS;
    }

    async getBattery() {
        let info = await this.lockController.getLockBroadcastInfo(this.lockMac);

        return info.battery;
    }

    async deletePasscode({V3LockDeviceId,plainPsw,passcode}) {
        let paddedPasscode = ("FFFFFFFF"+passcode).slice(-8);

        await this.lockController.deleteKey(this.lockMac,V3LockDeviceId,plainPsw,KeyTypeEnum.KEY_PASSWORD,paddedPasscode);

        return BleLockConstants.DELETE_PASSCODE_SUCCESS;
    }

    async addPeriodPasscode({ V3LockDeviceId, plainPsw , startAt, endAt, passcode, timezoneRawOffset })  {
        const {
            INITIALIZE_PASSCODE_FAILED,
            INVALID_PASSCODE_LENGTH,
        } = RNDahaoLockError;
        if (typeof passcode !== 'string') {
            return Promise.reject(new RNDahaoLockError(INITIALIZE_PASSCODE_FAILED, 'Passcode must be string'));
        } else if ((passcode.length < 4) || (passcode.length > 9)) {
            return Promise.reject(new RNDahaoLockError(INVALID_PASSCODE_LENGTH));
        } else if (!/^\d+$/.test(passcode)) {
            return Promise.reject(new RNDahaoLockError(INITIALIZE_PASSCODE_FAILED, 'Passcode must be numeric'));
        }

        let cycleType = 128;

        let startDate = new Date(startAt+timezoneRawOffset);
        let endDate = new Date(endAt+timezoneRawOffset);

        let paddedPasscode = ("FFFFFFFF"+passcode).slice(-8);

        await this.lockController.addKey(this.lockMac,V3LockDeviceId,plainPsw,KeyTypeEnum.KEY_PASSWORD,
            [paddedPasscode],[startDate],[endDate],cycleType);

    }

    async addCyclicPasscode({ V3LockDeviceId, plainPsw , startAt, endAt, passcode, cycleType, timezoneRawOffset }) {
        const {
            INITIALIZE_PASSCODE_FAILED,
            INVALID_PASSCODE_LENGTH,
        } = RNDahaoLockError;
        if (typeof passcode !== 'string') {
            return Promise.reject(new RNDahaoLockError(INITIALIZE_PASSCODE_FAILED, 'Passcode must be string'));
        } else if ((passcode.length < 4) || (passcode.length > 9)) {
            return Promise.reject(new RNDahaoLockError(INVALID_PASSCODE_LENGTH));
        } else if (!/^\d+$/.test(passcode)) {
            return Promise.reject(new RNDahaoLockError(INITIALIZE_PASSCODE_FAILED, 'Passcode must be numeric'));
        }

        let startDate = new Date(startAt+timezoneRawOffset);
        let endDate = new Date(endAt+timezoneRawOffset);

        let paddedPasscode = ("FFFFFFFF"+passcode).slice(-8);

        await this.lockController.addKey(this.lockMac,V3LockDeviceId,plainPsw,KeyTypeEnum.KEY_PASSWORD,
            [paddedPasscode],[startDate],[endDate],cycleType);
    }

    async addMasterCode({ V3LockDeviceId, plainPsw }) {

        let lockKey = {};

        // could use randomAlphaNumeric(7), but it looks like this code makes
        // the masterCode never start with zero.  is that intentional or
        // is this just so you dont have to pad the masterCode with zeros
        // in case you get a small randomID.  if the second option is the case
        // then this is reducing the number of masterCodes for no reason

        let randomID = Math.floor(Math.random() * 9000000) + 1000000;
        let cardIdStr = randomID.toString();

        lockKey.masterCode = cardIdStr;

        // start is -1 day and end is in 10 year
        let startDate = new Date();
        startDate.setDate(startDate.getDate()-1);
        let endDate = new Date();
        endDate.setFullYear(endDate.getFullYear()+10);

        let timezoneOffset = startDate.getTimezoneOffset()*60*1000; // from minutes to milliseconds

        // need to pad to 8 characters, and the padding is F on master code
        cardIdStr = ("FFFFFFFF"+cardIdStr).slice(-8);

        // timezone is subtracted because getTime returns UTC and we need millis from local time
        lockKey.startDate = startDate.getTime()-timezoneOffset;
        lockKey.endDate = endDate.getTime()-timezoneOffset;
        lockKey.timezoneOffset = -timezoneOffset;

        await this.lockController.addKey(this.lockMac,V3LockDeviceId,plainPsw,KeyTypeEnum.KEY_PASSWORD,
            [cardIdStr],[startDate],[endDate], 128);

        return lockKey;

    }

    async addICCard({ V3LockDeviceId, plainPsw , startAt, endAt, cycleType, timezoneRawOffset }) {

        let userIdStr = randomAlphaNumeric(8);
        let keyInfoStr = "00000000";

        let startDate = new Date(startAt + timezoneRawOffset);
        let endDate = new Date(endAt + timezoneRawOffset);

        let response =  await this.lockController.addCard(this.lockMac, V3LockDeviceId, plainPsw, KeyTypeEnum.KEY_CARD,
            userIdStr,keyInfoStr,startDate,endDate,cycleType);

        // unfortunately, the response from add card is a log
        let record = (response.records)[0];

        return {fobNumber: record.password, userId: record.userId};

    }

    async addICCardWithNumber({ V3LockDeviceId, plainPsw , startAt, endAt, fobNumber, cycleType, timezoneRawOffset }) {
        const {
            INITIALIZE_PASSCODE_FAILED,
        } = RNDahaoLockError;
        if (typeof fobNumber !== 'string') {
            return Promise.reject(new RNDahaoLockError(INITIALIZE_PASSCODE_FAILED, 'Fob Number must be string'));
        }

        let startDate = new Date(startAt+timezoneRawOffset);
        let endDate = new Date(endAt+timezoneRawOffset);

        let paddedFob = ("00000000"+fobNumber).slice(-8);

        await this.lockController.addKey(this.lockMac, V3LockDeviceId, plainPsw, KeyTypeEnum.KEY_CARD, [paddedFob],
            [startDate], [endDate], cycleType);

        return BleLockConstants.ADD_FOB_SUCCESS;
    }

    async deleteICCard({V3LockDeviceId,plainPsw,fobNumber}) {
        let paddedFob = ("00000000"+fobNumber).slice(-8);
        await this.lockController.deleteKey(this.lockMac, V3LockDeviceId, plainPsw, KeyTypeEnum.KEY_CARD, paddedFob);

        return BleLockConstants.DELETE_FOB_SUCCESS;
    }

    async getLog({ V3LockDeviceId, plainPsw}) {
        console.log('==== rndahaolock getLog', V3LockDeviceId, plainPsw);

        let nextLogIndex = 0;

        let remaining = 0;
        let records = [];

        let response = null;

        /*
            In order for logs to be guaranteed to be fully grabbed and that
            the internal state machine of the lock is set to return us 0 logs
            the next time we call getLog (in device.js) we need to make sure to
            go one over the number of logs expected in our repeated called to readOpenRecord.

            This seems to increment the record index state in the lock, such that
            when it tries to get the next log, it realizes there are no more to get and we can
            once again call readOpenRecord with a 0 index and get the expected results.

            The only other way to overcome this would be to keep nextLogIndex as a member variable.

            The issue here is that logs can be retrieved by another device so this nextLogIndex would
            no longer be correct.
         */
        //TODO: there has to be a better way to log records than this
        let counter = 0;
        do {

            response = await this.lockController.readOpenRecord(this.lockMac,V3LockDeviceId,plainPsw,nextLogIndex);

            console.log(response);

            if (response.recordCount===0) {
                break; // no records so exit the loop
            }

            records.push(...(response.records));

            nextLogIndex = response.recordIndex + 1;

            counter++;

        } while (counter < maxNumberOfLogs && nextLogIndex <= response.recordCount);

        remaining = response.recordIndex - response.recordCount;

        return {records,remaining};

    }

    async deleteLog({ V3LockDeviceId, plainPsw}) {

        // TODO: what is this delete mask supposed to be?
        let delMask = 0x00;

        let response = await this.lockController.deleteOpenRecord(this.lockMac,V3LockDeviceId,plainPsw,delMask);

        console.log(response);

        return response;

    }

}

const NUMERIC_STRING = "0123456789";
function randomAlphaNumeric(length) {
    let str = "";

    while (length-- !== 0)
        str += NUMERIC_STRING[Math.floor(Math.random() * NUMERIC_STRING.length)];

    return str;
}

module.exports = BleLock;