'use strict'

const UnlockCommand = require('./commands/UnlockCommand');
const LockCommand = require('./commands/LockCommand');
const SetClockCommand = require('./commands/SetClockCommand');
const ReadClockCommand = require('./commands/ReadClockCommand');
const ResetLockCommand = require('./commands/ResetLockCommand');
const AddKeyCommand = require('./commands/AddKeyCommand');
const DeleteKeyCommand = require('./commands/DeleteKeyCommand');
const AddCardCommand = require('./commands/AddCardCommand');
const ReadOpenRecordCommand = require('./commands/ReadOpenRecordCommand');
const SetDeviceConfigCommand = require('./commands/SetDeviceConfigCommand');
const ReadDeviceConfigCommand = require('./commands/ReadDeviceConfigCommand');
const DeleteOpenRecordCommand = require('./commands/DeleteOpenRecordCommand');

const {BluetoothPluginMethods} = require('./constants');

const BluetoothPluginInterface = require('./plugins/BluetoothPluginInterface');
const CommandConstants = require('./commands/CommandConstants');

const lockServiceUUID = 'fee7';
const lockCharsUUID = 'fec6';

class LockController {

    /**
     *
     * @param blePlugin {BluetoothPluginInterface}
     */
    constructor(blePlugin) {
        this._blePlugin = blePlugin;

        let prototype = Object.getPrototypeOf(blePlugin);

        try {
            //verify the plugin has the methods you expect
            for(const method of BluetoothPluginMethods) {
                if (!prototype.hasOwnProperty(method)) {
                    throw(new Error("Invalid plugin, missing method: " + method));
                }
            }
        } catch(error) {
            throw(error);
        }

        blePlugin.setServiceAndCharacteristicUUIDs(lockServiceUUID,lockCharsUUID);
        blePlugin.setNotifyHeader(CommandConstants.CMD_HEADER_SERVER_CLIENT);

        // forward event listeners to blePlugin

        this.addListener = (eventName, listener) => {
            return this._blePlugin.addListener(eventName, listener);
        };

        this.eventNames = () => {
            return this._blePlugin.eventNames();
        };

        this.getMaxListeners = () => {
            return this._blePlugin.getMaxListeners();
        };

        this.listenerCount = (eventName) => {
            return this._blePlugin.listenerCount(eventName);
        };

        this.listeners = (eventName) => {
            return this._blePlugin.listeners(eventName);
        };

        this.on = (eventName, callback) => {
            return this._blePlugin.on(eventName, callback);
        };

        this.once = (eventName, callback) => {
            return this._blePlugin.once(eventName, callback);
        };

        this.prependListener = (eventName, listener) => {
            return this._blePlugin.prependListener(eventName, listener);
        };

        this.prependOnceListener = (eventName, listener) => {
            return this._blePlugin.prependOnceListener(eventName, listener);
        };

        this.removeAllListeners = (eventName) => {
            return this._blePlugin.removeAllListeners(eventName);
        };

        this.removeListener = (eventName, callback) => {
            return this._blePlugin.removeListener(eventName, callback);
        };

        this.setMaxListeners = (n) => {
            return this._blePlugin.setMaxListeners(n);
        };

        this.rawListeners = (eventName) => {
            return this._blePlugin.rawListeners(eventName);
        };
    }

    startScanning() {
        this._blePlugin.startScan();
    }

    stopScanning() {
        this._blePlugin.stopScan();
    }

    disconnectDevice(lockMac) {
        this._blePlugin.disconnectDevice(lockMac);
    }

    commandTimeOut(lockMac) {
        this._blePlugin.commandTimeOut(lockMac);
    }

    async getLockBroadcastInfo(lockMac) {
        return await this._blePlugin.getLockBroadcastInfo(lockMac);
    }

    async resetLock(lockMac, deviceId, devicePsw) {

        let resetLockCommand = new ResetLockCommand(deviceId,devicePsw);

        //log("ResetLock: " + resetLockCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, resetLockCommand);

    }

    async initLock(lockMac, deviceId, devicePassword, timezoneRawOffset, currentTime) {

        let initLockCommand = new UnlockCommand(deviceId,devicePassword,timezoneRawOffset,currentTime);

        //log("InitLock: " + initLockCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, initLockCommand);

    }

    async unlock(lockMac, deviceId, devicePassword, timezoneRawOffset, currentTime) {

        let unlockCommand = new UnlockCommand(deviceId,devicePassword,timezoneRawOffset,currentTime);

        //log("UnlockCommand: " + unlockCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, unlockCommand);
    }

    async lock(lockMac, deviceId, devicePassword, timezoneRawOffset, currentTime) {

        let lockCommand = new LockCommand(deviceId,devicePassword,timezoneRawOffset,currentTime);

        //log("LockCommand: " + lockCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, lockCommand);
    }

    async setClock(lockMac, deviceId, devicePassword, timezoneRawOffset, currentTime) {

        let setClockCommand = new SetClockCommand(deviceId,devicePassword,timezoneRawOffset,currentTime);

        //log("SetClockCommand: " + setClockCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, setClockCommand);

    }

    /**
     *
     * @param leDevice
     * @param deviceId
     * @param devicePassword
     * @returns {Promise<Response,ReadClockResponse>}
     */
    async readClock(lockMac, deviceId, devicePassword) {

        let readClockCommand = new ReadClockCommand(deviceId,devicePassword);

        //log("ReadClockCommand: " + readClockCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, readClockCommand);

    }

    async addKey(lockMac, deviceId, devicePassword, keyType, keyIdList, startDateList, endDateList, cycleType) {

        let addKeyCommand = new AddKeyCommand(deviceId,devicePassword,keyType,keyIdList,
                                                            startDateList,endDateList,cycleType);

        //log("AddKey: " + addKeyCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, addKeyCommand);

    }

    async deleteKey(lockMac, deviceId, devicePassword, keyType, keyId) {

        let deleteKeyCommand = new DeleteKeyCommand(deviceId,devicePassword,keyType,keyId);

        //log("DeleteKey: " + deleteKeyCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, deleteKeyCommand);

    }

    async addCard(lockMac, deviceId, devicePassword, keyType, userId, keyInfo,
                                startDate, endDate, cycleType) {

        let addCardCommand = new AddCardCommand(deviceId, devicePassword, keyType, userId, keyInfo,
                                            startDate, endDate, cycleType);

        //log("AddCard: " + addCardCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, addCardCommand);

    }

    async readOpenRecord(lockMac, deviceId, devicePassword, keyIndex) {

        let readOpenRecordCommand = new ReadOpenRecordCommand(deviceId,devicePassword,keyIndex);

        //log("ReadOpenRecord: " + readOpenRecordCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, readOpenRecordCommand);

    }

    async deleteOpenRecord(lockMac, deviceId, devicePassword, delMask) {

        let deleteOpenRecordCommand = new DeleteOpenRecordCommand(deviceId,devicePassword,delMask);

        //log("DeleteOpenRecord: " + deleteOpenRecordCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, deleteOpenRecordCommand);

    }

    async setDeviceConfig(lockMac, deviceId, devicePassword, configType, configValues) {

        let setDeviceConfigCommand = new SetDeviceConfigCommand(deviceId,devicePassword,configType,configValues);

        //log("ConfigDevice: " + setDeviceConfigCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, setDeviceConfigCommand);

    }

    async readDeviceConfig(lockMac, deviceId, devicePassword, configType) {

        let readDeviceConfigCommand = new ReadDeviceConfigCommand(deviceId,devicePassword,configType);

        //log("ReadConfigDevice: " + readDeviceConfigCommand.buffer.toString('hex'));

        return await this._blePlugin.writeToDevice(lockMac, readDeviceConfigCommand);

    }

}

module.exports = LockController;