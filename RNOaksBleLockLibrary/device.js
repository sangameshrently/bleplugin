"use strict";
import { Buffer } from 'buffer'

const {lockType,createType,codeType,ekeyType,lockActionType,logRecordType,bleTimeOutTime} = require('./constants');


const RNBlueLibraryError = require('./RNBlueLibraryError.js');
const RNTTLockError = require('./RNTTLockError.js');
const RNDahaoLockError = require('./RNDahaoLockError.js');

const RentlyBlueAPI = require("./RentlyBlueAPI.js");
const RNTTLock = require("./RNTTLock.js");

const BleLock = require('./BleLock');

const aesjs = require('aes-js');

//TODO: these should ultimately be passed into the library
const APP_ID = Buffer.from("0B6CB51E802B44AA8B58E121CDC15036",'hex');
const APP_KEY = Buffer.from("1047FC99E93A43BFA7C68B2030ECF447",'hex');

console.log('APP_KEY',APP_KEY)
class Device {

    constructor(lockController, lockData, deviceToken, expiresAt, getToken, userId) {

        this.userId = userId;
        this.lockMac = lockData.lockMac;
        this.deviceID = lockData.deviceID;
        this.name = lockData.name;
        this.lockType = lockData.lockType;
        this.settingMode = lockData.settingMode;
        this.touch = lockData.touch;
        this.battery = lockData.battery;
        this.modelNum = lockData.modelNum;
        this.hardwareVer = lockData.hardwareVer;
        this.firmwareVer = lockData.firmwareVer;
        this.rssi = lockData.rssi;
        this.deviceAuthToken = deviceToken;
        this.tokenExpiresAt = expiresAt;
        this.getToken = getToken;
        this.ekey = null;
        this.isFetchingEkey = false;

        let length = APP_KEY.length;

        // swap bytes
        let swappedKey = Buffer.alloc(length);
        for (let i = 0; i < length; i += 2) {
            swappedKey[i] = APP_KEY[i + 1];
            swappedKey[i + 1] = APP_KEY[i];
        }

        this._passwordKey = swappedKey;

        // NOTE: we cannot extend BleLock because we lack protected members in javascript.
        // also, extending BleLock will paint us in a corner if we need to implement TTLock
        // for V2
        this._bleLock = new BleLock(this.lockMac);

        this._bleLock.bleInit(lockController);

    }

    get timezoneString() {
        return this._timezoneString;
    }

    set timezoneString(timezoneString) {
        this._timezoneString = timezoneString;
    }

    setEkey() {
        this.fetchEkey().then(() => {
            console.log('ekey set');
        }).catch((err) => {
            console.log('failed to set ekey')
        });
    }

    refreshToken() {
        return this.getToken(this.lockMac)
            .then((resp) => {
                const {accessToken = '', expiresAt = ''} = resp;
                if (accessToken) {
                    this.deviceAuthToken = accessToken;
                    this.tokenExpiresAt = expiresAt;
                    return Promise.resolve();
                } else {
                    return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.TOKEN_NOT_AVAILABLE));
                }
            }).catch((error) => {
                return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.TOKEN_NOT_AVAILABLE));
            });
    }

    static startOperationWithTimeout(fn, args, userId, blelock) {
        return new Promise((resolve, reject) => {

            if (args.lockType === lockType.V2LOCK) {
                args.scienerOpenId = userId;
            }

            Device.stopTimeout('beforeStart');

            Device.timeout = setTimeout(() => {
                console.log('==== after timeout reset global variables ====');
                Device.pendingCommand = false;
                if (args.lockType === lockType.V3LOCK) {
                    blelock.commandTimeOut();
                    reject(new RNDahaoLockError(RNDahaoLockError.COMMAND_TIMED_OUT));
                }
                if (args.lockType === lockType.V2LOCK) {
                    RNTTLock.commandTimeOut();
                    reject(new RNTTLockError(RNTTLockError.COMMAND_TIMED_OUT));
                }
            }, bleTimeOutTime * 1000);

            console.log('==== startOperation : ');//+ fn);
            fn.call(blelock,args).then(resolve).catch(reject);
        });
    };

    //--------- lock methods ----------------------
    // Function to initialize lock

    static calculateCycleType(days) {
        var cycleType = 0;
        for (let i = 0; i < days.length; i++) {
            if (days[i]) {
                cycleType += Math.pow(2, i);
            }
        }
        return cycleType;
    }

    static rejectWithError(deviceType = '', error) {

        if (error instanceof RNBlueLibraryError || error instanceof RNTTLockError || error instanceof RNDahaoLockError) {
            console.log('==== rejectWithError known : ', error.constructor.name, error);
            throw error;
        } else if (error instanceof Error) {
            switch (deviceType) {
                case lockType.V3LOCK: {
                    throw new RNDahaoLockError(RNDahaoLockError.resolveNativeErrorCode(error.code));
                    break;
                }
                case lockType.V2LOCK: {
                    throw new RNTTLockError(RNTTLockError.resolveNativeErrorCode(error.code));
                    break;
                }
                default: {
                    throw new RNBlueLibraryError(RNBlueLibraryError.FAILED, String(error));
                    break;
                }
            }
        } else {
            // It was thrown from somewhere else
            throw new RNBlueLibraryError(RNBlueLibraryError.FAILED, String(error));
        }
    };

    static getLockVer(args) {

        return args;

        // TODO: this is for v2 lock only
        // let {lockVer} = args;
        //
        // if (lockVer) {
        //     try {
        //         lockVer = Platform.select({
        //             ios: JSON.parse(lockVer),
        //             android: lockVer,
        //         });
        //     } catch (error) {
        //         throw new RNBlueLibraryError(RNBlueLibraryError.FAILED_TO_PARSE_LOCKVER);
        //     }
        //     args.lockVer = lockVer;
        //     return args;
        // } else {
        //     return args;
        // }
    };

    async fetchEkey() {
        //console.log('==== fetchEkey', this.lockMac);

        this.isFetchingEkey = true;
        try {
            if (this.deviceAuthToken) {
                const {id, eKey, type} = await RentlyBlueAPI.getEkey(this,this.deviceAuthToken);
                this.ekey = eKey;

                //TODO: would be nice if the server sent us this, instead of us having to decrypt it, then we wouldn't need the key
                if (this.ekey && (type===ekeyType.ADMIN) && this.ekey.lockType===lockType.V3LOCK) {
                    this.ekey.plainPsw = decryptPassword(this._passwordKey,this.ekey.adminPs);
                }
                this.keyType = type;
                return Promise.resolve();
            } else {
                this.ekey = null;
                return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.TOKEN_NOT_AVAILABLE));
            }
        } catch (error) {
            this.ekey = null;
            return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.EKEY_NOT_AVAILABLE));
        } finally {
            this.isFetchingEkey = false;
        }
    }

    //Function to reset the lock
    /**
     *
     * @api {SDK} lockObject.resetLock() Reset the Lock
     * @apiName resetLock
     * @apiGroup InitializeLock
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to reset the Lock
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Request :
     * lockObject.resetLock().then((response) => {
     *
     * })
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true
     * }
     *
     */
    async resetLock() {
        console.log('==== ekey', this.ekey);

        if (this.ekey == null) {
            console.log("cannot resetLock, it's already reset");
            return;
        }

        try {
            await this.checkDeviceTokenExpire();
            await this.resetBLELock(this.ekey);
            this.ekey = null;
            return await RentlyBlueAPI.deleteLock(this, this.lockMac, this.deviceAuthToken); // Delete lock from database
        } catch (error) {
            Device.rejectWithError(this.ekey.lockType, error);
        }

    };

    async resetBLELock(lockKey) {
        try {
            switch (lockKey.lockType) {
                case lockType.V3LOCK:
                    await this.execute(this._bleLock.resetLock, {...lockKey});
                    break;
                case lockType.V2LOCK:
                    await this.execute(RNTTLock.resetLock, {...lockKey});
                    break;
            }
        } catch (error) {
            Device.rejectWithError(lockKey.lockType, error);
        }
    };

    /**
     *
     * @api {SDK} lockObject.lock() Lock the Lock
     * @apiName lock
     * @apiGroup LockUnlock
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to lock the Lock
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Request :
     * lockObject.lock().then((response) => {
     *
     * })
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true
     * }
     *
     */
    //Function to lock the lock
    async lock() {
        return this.checkDeviceTokenExpire().then(() => this.lockUnlockDevice(lockActionType.LOCK));
    };

    /**
     *
     * @api {SDK} lockObject.unlock() Unlock the Lock
     * @apiName unlock
     * @apiGroup LockUnlock
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to unlock the Lock
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Request :
     * lockObject.unlock().then((response) => {
     *
     * })
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true
     * }
     *
     */
    //Function to unlock the lock
    async unlock() {
        return this.checkDeviceTokenExpire().then(() => this.lockUnlockDevice(lockActionType.UNLOCK));
    };

    //Function to get the lock's time
    /**
     *
     * @api {SDK} lockObject.getLockTime() Get Lock Time
     * @apiName getLockTime
     * @apiGroup Time
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to get lock's time
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     * @apiSuccess (Success) {string} time lock time in lock preset timezone
     *
     * @apiParamExample  {type} Request :
     * lockObject.getLockTime().then((response) => {
     *
     * })
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true,
     *   time: 'Thu, 07 Feb 2019 07:49:32 GMT-5',
     * }
     *
     */
    async getLockTime() {
        console.log('==== ekey', this.ekey);
        try {
            await this.checkDeviceTokenExpire();
            await this.getCurrentTimeByLockMac();
            if (this.ekey.currentTime !== 0) {
                let lockTime = '';
                switch (this.ekey.lockType) {
                    case lockType.V3LOCK:
                        lockTime = await this.execute(this._bleLock.getLockTime, {...this.ekey});
                        break;
                    case lockType.V2LOCK:
                        lockTime = await this.execute(RNTTLock.getLockTime, {...this.ekey});
                        break;
                }
                var originalDate = new Date(lockTime + this.ekey.timezoneRawOffset).toUTCString() + '' + this.ekey.timezoneRawOffset / 3600000.0;
                return {success: true, time: originalDate};
            } else {
                Device.rejectWithError(this.ekey.lockType, new RNBlueLibraryError(RNBlueLibraryError.GET_LOCK_TIME_ERROR));
            }
        } catch (error) {
            Device.rejectWithError('', error);
        }

    };

    /**
     *
     * @api {SDK} lockObject.setLockTime() Set Lock Time
     * @apiName setLockTime
     * @apiGroup Time
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT SDK and sets the lock time in lock preset timezone

     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Request :
     * lockObject.setLockTime().then((response) => {
     *
     * })
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true
     * }
     *
     */
    //Function to set the lock's time
    async setLockTime() {
        console.log('==== ekey', this.ekey);
        try {
            await this.checkDeviceTokenExpire();
            await this.getCurrentTimeByLockMac();
            if (this.ekey.currentTime !== 0) {
                let response = '';
                switch (this.ekey.lockType) {
                    case lockType.V3LOCK:
                        response = await this.execute(this._bleLock.setLockTime, {...this.ekey});
                        break;
                    case lockType.V2LOCK:
                        response = await this.execute(RNTTLock.setLockTime, {...this.ekey});
                        break;
                }
                if (this.ekey.updateTZ) {
                    const lockInfo = { lockMac: this.ekey.lockMac, timezoneOffset: this.ekey.timezoneRawOffset};
                    await RentlyBlueAPI.updateLock(this, lockInfo, this.deviceAuthToken); // Update lock info to database
                }
                return Device.returnResultWithMsg(response);
            } else {
                Device.rejectWithError(this.ekey.lockType, new RNBlueLibraryError(RNBlueLibraryError.SET_LOCK_TIME_ERROR))
            }
        } catch (error) {
            Device.rejectWithError('', error);
        }
    };

    /**
     *
     * @api {SDK} lockObject.isDoorSensorEnabled() Is Door Sensor Enabled
     * @apiName isDoorSensorEnabled
     * @apiGroup DoorSensor
     * @apiVersion  1.0.1
     *
     * @apiDescription Check if door sensor is enabled.
     *
     *
     * @apiSuccess (Success) {bool} isEnabled Status of Door Sensor
     *
     * @apiParamExample  {type} Request :
     * lockObject.isDoorSensorEnabled().then((response) => {
     *
     * })
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success : true,
     *   isEnabled : true
     * }
     *
     */
    async isDoorSensorEnabled() {
        try {
            await this.checkDeviceTokenExpire();
            let isDoorEnabled;
            switch (this.ekey.lockType) {
                case lockType.V3LOCK:
                    isDoorEnabled = await this.execute(this._bleLock.isDoorSensorEnabled, {...this.ekey});
                    break;
                case lockType.V2LOCK:
                    isDoorEnabled = await this.execute(RNTTLock.isDoorSensorEnabled, {...this.ekey});
                    break;
            }
            return isDoorEnabled;
        } catch (error) {
            return Device.rejectWithError(this.ekey.lockType, error)
        }
    }

    /**
     *
     * @api {SDK} lockObject.isSupportIC() Is Lock Support IC Card
     * @apiName isSupportIC
     * @apiGroup ICCard
     * @apiVersion  1.0.1
     *
     * @apiDescription Check if the lock supports an IC card (fob)
     *
     *
     * @apiSuccess (Success) {bool} isSupported Status of whether Lock Supports IC Card
     *
     * @apiParamExample  {type} Request :
     * lockObject.isSupportIC().then((response) => {
     *
     * })
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success : true,
     *   isSupported : true
     * }
     *
     */
    async isSupportIC() {
        try {
            await this.checkDeviceTokenExpire();
            let isSupportfob;
            switch (this.ekey.lockType) {
                case lockType.V3LOCK:
                    isSupportfob = true;
                    break;
                case lockType.V2LOCK:
                    isSupportfob = await this.execute(RNTTLock.isSupportIC, {...this.ekey});
                    break;
            }
            return isSupportfob;
        } catch (error) {
            return Device.rejectWithError(this.ekey.lockType, error)
        }
    }

    /**
     *
     * @api {SDK} lockObject.isSupportDoorSensor() Is Lock Support Door Sensor
     * @apiName isSupportDoorSensor
     * @apiGroup DoorSensor
     * @apiVersion  1.0.1
     *
     * @apiDescription Check if the lock supports the door sensor.
     *
     *
     * @apiSuccess (Success) {bool} isSupported Status of whether Lock Supports Door Sensor
     *
     * @apiParamExample  {type} Request :
     * lockObject.isSupportDoorSensor().then((response) => {
     *
     * })
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success : true,
     *   isSupported : true
     * }
     *
     */
    async isSupportDoorSensor() {
        try {
            await this.checkDeviceTokenExpire();
            let isSupportSensor;
            switch (this.ekey.lockType) {
                case lockType.V3LOCK:
                    isSupportSensor = true;
                    break;
                case lockType.V2LOCK:
                    isSupportSensor = await this.execute(RNTTLock.isSupportDoorSensor, {...this.ekey});
                    break;
            }
            return isSupportSensor;
        } catch (error) {
            return Device.rejectWithError(this.ekey.lockType, error)
        }
    }

    /**
     *
     * @api {SDK} lockObject.setDoorSensorLocking(isEnabled) Set Door Sensor Locking
     * @apiName setDoorSensorLocking
     * @apiGroup DoorSensor
     * @apiVersion  1.0.1
     *
     * @apiDescription Enable/disable auto-locking by the magnetic door sensor.
     *
     * @apiParam {bool} isEnabled  true if sensor should be enabled, else false.
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Request :
     * lockObject.setDoorSensorLocking(false).then((response) => {
     *
     * })
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true
     * }
     *
     */
    async setDoorSensorLocking(isEnable) {
        let isSupportSensor = await this.isSupportDoorSensor();
        if (isSupportSensor) {
            try {
                await this.checkDeviceTokenExpire();
                this.ekey.isEnabled = isEnabled;
                let message;
                switch (this.ekey.lockType) {
                    case lockType.V3LOCK:
                        message = await this.execute(this._bleLock.setDoorSensorLocking, {...this.ekey});
                        break;
                    case lockType.V2LOCK:
                        message = await this.execute(RNTTLock.setDoorSensorLocking, {...this.ekey});
                        break;
                }
                return Device.returnResultWithMsg(message);
            } catch (error) {
                return Device.rejectWithError(this.ekey.lockType, error)
            }
        } else {
            return Device.rejectWithError(this.ekey.lockType, Error('Door sensor not supported'))
        }
    }

    /**
     *
     * @api {SDK} lockObject.addPeriodPasscode(startAt,endAt,passcode,codeName) Add Period Passcode
     * @apiName addPeriodPasscode
     * @apiGroup Passcode
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to add passCode to the Lock for a period of time. Passcode will be permanent if both startDate and endDate is passed as 0.
     *
     * @apiParam {number} startAt the start date for the new passcode in milliseconds UTC (0 for permanent passcode).
     * @apiParam {number} endAt the end date for the new passcode in milliseconds UTC (0 for permanent passcode).
     * @apiParam {string} passcode The passcode to add.(Passcode length is between 4-8)
     * @apiParam {string} [codeName] name of the passcode
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Request :
     * lockObject.addPeriodPasscode('1544085020639', '1544297058593', '123456', 'passCode').then((response) => {
     *
     * });
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true
     * }
     *
     */
    //Function to add period passcode
    async addPeriodPasscode(startAt, endAt, passcode, codeName) {
        try {
            await this.checkDeviceTokenExpire();
            await this.getCurrentTimeByLockMac();
            let codeInfo = { //Period passcode info : includes, startdate,endDate,code, etc...
                name: codeName,
                createType: createType.CUSTOM,
                type: codeType.PERIOD,
                code: passcode,
                startAt: startAt,
                endAt: endAt,
                lockMac: this.lockMac
            };
            switch (this.ekey.lockType) {
                case lockType.V3LOCK:
                    await this.execute(this._bleLock.addPeriodPasscode, {...this.ekey, startAt, endAt, passcode});
                    break;
                case lockType.V2LOCK:
                    await this.execute(RNTTLock.addPeriodPasscode, {
                        ...this.ekey,
                        passcode,
                        startDate: startAt,
                        endDate: endAt
                    });
                    break;
            }
            return await RentlyBlueAPI.addPeriodPasscode(this, codeInfo, this.deviceAuthToken); // Update period passcode to lock database
        } catch (error) {
            Device.rejectWithError(this.ekey.lockType, error);
        }
    };

    static getValidDate(dateString, isStart, timeArray) {
        let dateTimeErrorStr = 'Invalid date/time. Dates should be in yyyy-MM-dd and time in HH:mm format.';
        var today = new Date();
        var validDate = today;
        if (!dateString) {
            validDate = new Date((isStart) ? today.getFullYear() : today.getFullYear() + 10, today.getMonth(), today.getDate(), timeArray[0], timeArray[1], timeArray[2]); // set current date
        } else {
            const dateArray = dateString.split("-");
            if (dateArray.count < 3) {
                return Promise.reject(new RNTTLockError(RNTTLockError.FAILED, dateTimeErrorStr));
            }
            validDate = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], timeArray[0], timeArray[1], timeArray[2]);
        }
        return validDate;
    }

    static dateToString(inputDate, dateString) {
        var updateddateString = dateString;
        if (!dateString) {
            let month = String(inputDate.getMonth() + 1);
            let day = String(inputDate.getDate());
            const year = String(inputDate.getFullYear());

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            updateddateString = year + "-" + month + "-" + day;
        }
        return updateddateString;
    }

    /**
     *
     * @api {SDK} lockObject.addCyclicPasscode(startDate,endDate,startTime,endTime,passcode,codeName,days) Add Cyclic Passcode
     * @apiName addCyclicPasscode
     * @apiGroup Passcode
     * @apiVersion  1.0.1
     *
     * @apiDescription Adds custom passcode for a period of time to repeat on some days of week within a range of dates
     *
     * @apiParam {string} [startDate] start date of code yyyy-MM-dd. If startDate is not passed, current date is set by default
     * @apiParam {string} [endDate] end date of the code yyyy-MM-dd, If endDate is not passed, endDate is set to 10 yrs from current date by default
     * @apiParam {string} startTime start time of the passcode hh:mm:ss
     * @apiParam {string} endTime end time of the passcode hh:mm:ss
     * @apiParam {string} passcode passcode to be added, Passcode limit is between 4 - 8 digits
     * @apiParam {string} [codeName] name of the code
     * @apiParam {array[bool]} days array of status of days, the code should work (day[0] - Sunday to day[6] - Saturday)
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Request :
     * // 123456 code works on all Mondays and all Wednesdays between 9 AM to 7 PM from 1st Dec 2018 to 20th Dec 2018
     * lockObject.addCyclicPasscode('2018-12-01', '2018-12-20','09:00:08', '19:00:08', '123456', 'passCode', [false,true,false,true,false,false,false]).then((response) => {
     *
     * });
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true,
     *   codeId: 50
     * }
     *
     */
    //Function to add period passcode
    async addCyclicPasscode(startDate, endDate, startTime, endTime, passcode, codeName, days) {
        if (this.ekey.lockType === lockType.V2LOCK) {
            return Promise.reject(new RNTTLockError(RNTTLockError.FAILED, `Lock does not support cyclic code`));
        }
        let addInfo = await this.validateAndCalculateDateTime(false, startDate, endDate, startTime, endTime, passcode, codeName, days)
        try {
            await this.execute(this._bleLock.addCyclicPasscode, {
                ...this.ekey,
                startAt: addInfo.startAt,
                endAt: addInfo.endAt,
                passcode: addInfo.passcode,
                cycleType: addInfo.cycleType
            });
            let codeInfo = {
                name: addInfo.codeName,
                createType: createType.CUSTOM,
                type: codeType.CYCLIC,
                code: addInfo.passcode,
                startDate: addInfo.startDate,
                endDate: addInfo.endDate,
                startTime: addInfo.startTime.substring(0, 5),
                endTime: addInfo.endTime.substring(0, 5),
                lockMac: this.lockMac,
                cycleType: addInfo.cycleType,
            };
            return await RentlyBlueAPI.addCyclicPasscode(this, codeInfo, this.deviceAuthToken); // Update period passcode to lock database
        } catch (error) {
            Device.rejectWithError(this.ekey.lockType, error);
        }
    };

    async validateAndCalculateDateTime(isaddIC, startDate, endDate, startTime, endTime, passcode, codeName, days) {
        let cycleType;
        if (this.ekey.lockType === lockType.V3LOCK) {
            cycleType = Device.calculateCycleType(days);
            if (cycleType === 0) {
                if (isaddIC) {
                    cycleType = 128;
                } else {
                    return Promise.reject(new RNDahaoLockError(RNDahaoLockError.FAILED, `No days selected`));
                }
            }
            if (!startTime || !endTime) {
                return Promise.reject(new RNDahaoLockError(RNDahaoLockError.FAILED, `Enter start time and end time`));
            }
        }
        if (!startTime) {
            startTime = "00:00:08";
        }
        if (!endTime) {
            endTime = "23:59:00";
        }
        let dateTimeErrorStr = 'Invalid date/time. Dates should be in yyyy-MM-dd and time in HH:mm format.';

        var today = new Date();
        var startFromDT = today;
        var endOnDT = today;

        var startTimeArr = startTime.split(":");
        var endTimeArr = endTime.split(":");

        if (startTimeArr.count < 3 || endTimeArr.count < 3) {
            return Promise.reject(new RNTTLockError(RNTTLockError.FAILED, dateTimeErrorStr));
        }
        startFromDT = Device.getValidDate(startDate, true, startTimeArr);
        endOnDT = Device.getValidDate(endDate, false, endTimeArr)
        startDate = Device.dateToString(startFromDT, startDate);
        endDate = Device.dateToString(endOnDT, endDate);

        if (!Device.isValidDate(startFromDT) || !Device.isValidDate(endOnDT)) {
            return Promise.reject(new RNTTLockError(RNTTLockError.FAILED, dateTimeErrorStr));
        } else {
            try {
                await this.getCurrentTimeByLockMac();
            } catch (error) {
                Device.rejectWithError(this.ekey.lockType, error);
            }
            let startMili = startFromDT.getTime()
            let endMili = endOnDT.getTime()

            let startAt = startMili;
            let endAt = endMili;
            return {
                startAt: startAt, endAt: endAt,
                startDate: startDate, endDate: endDate,
                startTime: startTime, endTime: endTime,
                isaddIC: isaddIC, passcode: passcode, codeName: codeName, cycleType: cycleType
            };
        }
    }

    /**
     *
     * @api {SDK} lockObject.addICCard(startDate,endDate,startTime,endTime,fobName,days) Add IC Card by Learn Card
     * @apiName addICCard
     * @apiGroup ICCard
     * @apiVersion  1.0.1
     *
     * @apiDescription Adds IC Card for a period of time or repeat for a period of time on some days of week within a range of dates.
     * Lock enters add IC Card mode with a beep sound and stays in add IC card mode for about 15 seconds waiting for an IC Card to get added.
     * Showing the IC Card near the lock will add the IC Card and lock ensures adding succesfully with a beep sound
     *
     * @apiParam {string} [startDate] start date of the IC Card yyyy-MM-dd. If startDate is not passed, current date is set by default
     * @apiParam {string} [endDate] end date of the IC Card yyyy-MM-dd, If endDate is not passed, endDate is set to 10 yrs from current date by default
     * @apiParam {string} startTime start time of the IC Card hh:mm:ss
     * @apiParam {string} endTime end time of the IC Card hh:mm:ss
     * @apiParam {string} [fobName] name of the IC Card
     * @apiParam {array[bool]} days array of status of days, the IC Card should work.
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Cyclic IC Card Request :
     * // IC Card works on all Mondays and all Wednesdays between 9 AM to 7 PM from 1st Dec 2018 to 20th Dec 2018
     * lockObject.addICCard('2018-12-01', '2018-12-20','09:00:08', '19:00:08', 'IC Card', [false,true,false,true,false,false,false]).then((response) => {
     *
     * });
     *
     * @apiParamExample  {type} Periodic IC Card Request :
     * // No selection of cyclic days adds the IC Card as a period IC Card (Only for suppported locks).
     * // IC Card works on all days between 9 AM to 7 PM from 1st Dec 2018 to 20th Dec 2018
     * lockObject.addICCard('2018-12-01', '2018-12-20','09:00:08', '19:00:08', 'IC Card', [false,false,false,false,false,false,false]).then((response) => {
     *
     * });
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true,
     *   fobId: 45
     * }
     *
     */
    async addICCard(startDate, endDate, startTime, endTime, codeName, days) {
        try {
            await this.checkDeviceTokenExpire();
            let isSupportFOB = await this.isSupportIC();
            if (isSupportFOB) {
                let addInfo = await this.validateAndCalculateDateTime(true, startDate, endDate, startTime, endTime, null, codeName, days);
                let response;
                if (this.ekey.lockType == lockType.V2LOCK) {
                    response = await this.execute(RNTTLock.addICCard, {...this.ekey});
                    if (response.success == '1') {
                        response = await this.execute(RNTTLock.modifyICPeriod, {
                            ...this.ekey,
                            cardNo: parseFloat(response.fobNumber),
                            startDate: addInfo.startAt,
                            endDate: addInfo.endAt
                        });
                    } else {
                        return Promise.reject(new RNTTLockError(RNTTLockError.FAILED, `${response}`));
                    }
                } else if (this.ekey.lockType == lockType.V3LOCK) {
                    response = await this.execute(this._bleLock.addICCard, {
                        ...this.ekey,
                        startAt: addInfo.startAt,
                        endAt: addInfo.endAt,
                        cycleType: addInfo.cycleType
                    });

                    console.log(response);

                }
                let fobinfo = {
                    lockMac: this.ekey.lockMac,
                    fobNumber: response.fobNumber,
                    fobName: addInfo.codeName,
                    startDate: addInfo.startDate,
                    endDate: addInfo.endDate,
                    startTime: addInfo.startTime.substring(0, 5),
                    endTime: addInfo.endTime.substring(0, 5),
                    cycleType: (this.ekey.lockType == lockType.V2LOCK) ? null : addInfo.cycleType
                };
                return await RentlyBlueAPI.addFOB(this, fobinfo, this.deviceAuthToken);
            } else {
                Device.rejectWithError(this.ekey.lockType, 'Lock does not support add fob operation');
            }
        } catch (error) {
            Device.rejectWithError(this.ekey.lockType, error);
        }
    }

    /**
     *
     * @api {SDK} lockObject.addICCardWithNumber(startDate,endDate,startTime,endTime,fobNumber,fobName,days) Add IC Card With Number
     * @apiName addICCardWithNumber
     * @apiGroup ICCard
     * @apiVersion  1.0.1
     *
     * @apiDescription Adds IC Card for a period of time or repeat for a period of time on some days of week within a range of dates.
     *
     *
     * @apiParam {string} [startDate] start date of the IC Card yyyy-MM-dd. If startDate is not passed, current date is set by default
     * @apiParam {string} [endDate] end date of the IC Card yyyy-MM-dd, If endDate is not passed, endDate is set to 10 yrs from current date by default
     * @apiParam {string} startTime start time of the IC Card hh:mm:ss
     * @apiParam {string} endTime end time of the IC Card hh:mm:ss
     * @apiParam {string} fobNumber fobNumber to be added
     * @apiParam {string} [fobName] name of the IC Card
     * @apiParam {array[bool]} days array of status of days, the IC Card should work (day[0] - Sunday to day[6] - Saturday)
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Cyclic IC Card Request:
     * // IC Card works on all Mondays and all Wednesdays between 9 AM to 7 PM from 1st Dec 2018 to 20th Dec 2018
     * lockObject.addICCardWithNumber('2018-12-01', '2018-12-20','09:00:08', '19:00:08','C54DEF', 'IC Card', [false,true,false,true,false,false,false]).then((response) => {
     *
     * });
     *
     * @apiParamExample  {type} Periodic IC Card Request:
     * //No selection of cyclic days adds the IC Card as a period IC Card (Only for suppported locks).
     * // IC Card works on all days between 9 AM to 7 PM from 1st Dec 2018 to 20th Dec 2018
     * lockObject.addICCardWithNumber('2018-12-01', '2018-12-20','09:00:08', '19:00:08','C54DEF', 'IC Card', [false,false,false,false,false,false,false]).then((response) => {
     *
     * });
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true,
     *   fobId: 45
     * }
     *
     */
    async addICCardWithNumber(startDate, endDate, startTime, endTime, fobNumber, codeName, days) {
        if (this.ekey.lockType == lockType.V3LOCK) {
            try {
                await this.checkDeviceTokenExpire();
                let isSupportFOB = await this.isSupportIC();
                if (isSupportFOB) {
                    let addInfo = await this.validateAndCalculateDateTime(true, startDate, endDate, startTime, endTime, fobNumber, codeName, days);
                    await this.execute(this._bleLock.addICCardWithNumber, {
                        ...this.ekey,
                        startAt: addInfo.startAt,
                        endAt: addInfo.endAt,
                        fobNumber: addInfo.passcode,
                        cycleType: addInfo.cycleType
                    });
                    let fobinfo = {
                        lockMac: this.ekey.lockMac,
                        fobNumber: addInfo.passcode,
                        fobName: addInfo.codeName,
                        startDate: addInfo.startDate,
                        endDate: addInfo.endDate,
                        startTime: addInfo.startTime.substring(0, 5),
                        endTime: addInfo.endTime.substring(0, 5),
                        cycleType: addInfo.cycleType
                    };
                    return await RentlyBlueAPI.addFOB(this, fobinfo, this.deviceAuthToken);
                } else {
                    Device.rejectWithError(this.ekey.lockType, 'Lock does not support add fob operation');
                }
            } catch (error) {
                Device.rejectWithError(this.ekey.lockType, error);
            }
        } else if (this.ekey.lockType == lockType.V2LOCK) {
            Device.rejectWithError(this.ekey.lockType, 'Lock does not support add fob by fob number operation');
        }
    }

    /**
     *
     * @api {SDK} lockObject.deleteICCard(fobId,fobNumber) Delete IC Card
     * @apiName deleteICCard
     * @apiGroup ICCard
     * @apiVersion  1.0.1
     *
     * @apiDescription Deletes IC Card from the lock.
     *
     *
     * @apiParam {string} fobNumber fobNumber to be deleted
     * @apiParam {number} fobId fobId to be deleted (fobId is returned as a response from get fob list api)
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Request :
     * lockObject.deleteICCard(45,'C54DEF').then((response) => {
     *
     * });
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true
     * }
     *
     */
    async deleteICCard(fobId, fobNumber) {
        try {
            await this.checkDeviceTokenExpire();
            let isSupportFOB = await this.isSupportIC();
            if (isSupportFOB) {
                let message;
                switch (this.ekey.lockType) {
                    case lockType.V3LOCK:
                        message = await this.execute(this._bleLock.deleteICCard, {...this.ekey, fobNumber});
                        break;
                    case lockType.V2LOCK:
                        message = await this.execute(RNTTLock.deleteICCard, {
                            ...this.ekey,
                            cardNo: parseFloat(fobNumber)
                        });
                        break;
                }
                let response = await RentlyBlueAPI.deleteFOB(this, fobId, this.deviceAuthToken);
                if (response.success) {
                    return Device.returnResultWithMsg(message);
                } else {
                    Device.rejectWithError(this.ekey.lockType, RNBlueLibraryError(response.message));
                }
            } else {
                Device.rejectWithError(this.ekey.lockType, 'Lock does not support delete fob operation');

            }
        } catch (error) {
            Device.rejectWithError(this.ekey.lockType, error);
        }
    }

    /**
     *
     * @api {SDK} lockObject.deletePasscode(codeId,passcode) Delete Passcode
     * @apiName deletepasscode
     * @apiGroup Passcode
     * @apiVersion  1.0.1
     *
     * @apiDescription Deletes passcode from the lock.
     *
     *
     * @apiParam {string} passcode passcode to be deleted
     * @apiParam {number} codeId codeId to be deleted. (codeId is returned as a response on get code list api)
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Request :
     * lockObject.deletePasscode(45,'121234').then((response) => {
     *
     * });
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true
     * }
     *
     */
    async deletePasscode(codeId, passcode) {
        try {
            await this.checkDeviceTokenExpire();
            let message;
            switch (this.ekey.lockType) {
                case lockType.V3LOCK:
                    message = await this.execute(this._bleLock.deletePasscode, {...this.ekey, passcode});
                    break;
                case lockType.V2LOCK:
                    message = await this.execute(RNTTLock.deletePasscode, {...this.ekey, passcode});
                    break;
            }
            let response = await RentlyBlueAPI.deletePasscode(this, codeId, this.deviceAuthToken)
            if (response.success) {
                return Device.returnResultWithMsg(message);
            } else {
                Device.rejectWithError(this.ekey.lockType, RNBlueLibraryError(response.message));
            }
        } catch (error) {
            Device.rejectWithError(this.ekey.lockType, error);
        }
    }

    /**
     *
     * @api {SDK} lockObject.getAutoLockTime() Get Auto-lock Time
     * @apiName getAutoLockTime
     * @apiGroup AutoLock
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to read lock's auto-lock time and returns range and current auto-lock time of the lock
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     * @apiSuccess (Success) {number} minimum Lowest value for auto-lock time in seconds
     * @apiSuccess (Success) {number} maximum Highest value for auto-lock time in seconds
     * @apiSuccess (Success) {number} current Current value for auto-lock time in seconds (If current = 0 - Autolock is disbaled)
     *
     *
     * @apiParamExample  {type} Request :
     * lockObject.getAutoLockTime().then((response) => {
     *
     * });
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true
     *   minimum: 5,
     *   maximum: 1500,
     *   current: 10,
     * }
     *
     */
    //Function to getAutoLockTime
    async getAutoLockTime() {
        try {
            await this.checkDeviceTokenExpire();
            let response;
            switch (this.ekey.lockType) {
                case lockType.V3LOCK:
                    response = await this.execute(this._bleLock.getAutoLockTime, {...this.ekey});
                    break;
                case lockType.V2LOCK:
                    response = await this.execute(RNTTLock.getAutoLockTime, {...this.ekey});
                    break;
            }
            return {success: true, time: response};
        } catch (error) {
            Device.rejectWithError(this.ekey.lockType, error);
        }
    }

    /**
     *
     * @api {SDK} lockObject.setAutoLockTime(time) Set Auto-lock Time
     * @apiName setAutoLockTime
     * @apiGroup AutoLock
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to sets the lock's auto-lock time using eKey
     *
     * @apiParam {number} time auto-lock time to be set to the lock (Pass value in seconds within the given range. Passing zero will disbale auto lock time)
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiParamExample  {type} Request :
     * lockObject.setAutoLockTime(5).then((response) => {
     *
     * });
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true
     * }
     *
     */
    async setAutoLockTime(time) {
        try {
            await this.checkDeviceTokenExpire();
            let message;
            switch (this.ekey.lockType) {
                case lockType.V3LOCK:
                    message = await this.execute(this._bleLock.setAutoLockTime, {...this.ekey, time});
                    break;
                case lockType.V2LOCK:
                    message = await this.execute(RNTTLock.setAutoLockTime, {...this.ekey, time});
                    break;
            }
            return Device.returnResultWithMsg(message);
        } catch (error) {
            Device.rejectWithError(this.ekey.lockType, error);
        }

    }

    static isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    /**
     *
     * @api {SDK} lockObject.addAdministrator() Initializes the Lock
     * @apiName addAdministrator
     * @apiGroup InitializeLock
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to initialize the lock and on success uploads lock data to server and returns lock's master passcode to app.
     *
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     * @apiSuccess (Success) {string} serialNo Serial no of the lock created (will be deprecated soon)
     * @apiSuccess (Success) {string} masterCode masterCode of the lock created
     *
     * @apiParamExample  {type} Request :
     * lock.addAdministrator().then((response) => {
     *
     * })
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true,
     *   serialNo: 100028,
     *   masterCode: 123456
     * }
     *
     *
     */
    async addAdministrator() {

        let lockKey;

        try {
            await this.checkDeviceTokenExpire();

            //TODO: testing set device timezone here
            await RentlyBlueAPI.setDeviceTimezone(this,this.lockMac,this.timezoneString,this.deviceAuthToken);

            switch (this.lockType) {
                case lockType.V3LOCK: {
                    if (this.settingMode) { //Check initStatus of the lock
                        // get adminPs, V3LockDeviceId,plainPsw, currentTime
                        const adminKeyObject = await RentlyBlueAPI.initDahaoLock(this, this.deviceID, this.deviceAuthToken);

                        if (adminKeyObject.success) {
                            //lockKey = await this.execute(this._bleLock.addAdministrator, adminKeyObject); // Get lockKeyObject - masterCode,lockKey,etc...

                            console.log(adminKeyObject);

                            // this simply sends the unlock to the lock with the current time
                            await this.execute(this._bleLock.initLock, adminKeyObject);

                            lockKey = await this.execute(this._bleLock.addMasterCode, adminKeyObject);

                            console.log(lockKey);

                            lockKey = {
                                lockMac: this.lockMac,
                                lockType: this.lockType,
                                battery: this.battery,
                                modelNum: this.modelNum,
                                hardwareVer: this.hardwareVer,
                                firmwareVer: this.firmwareVer,
                                deviceID: this.deviceID,
                                userType: 110301, // TODO: fix these hardcoded values
                                keyStatus: 110401,
                                ...adminKeyObject,
                                ...lockKey};

                            console.log("==== lockKey: " + JSON.stringify(lockKey,null,2));

                        } else {
                            Device.rejectWithError(this.lockType, adminKeyObject.message); // Return success as false with appropriate error message
                        }
                    } else {
                        Device.rejectWithError(this.lockType, new RNBlueLibraryError(RNBlueLibraryError.NOT_IN_SETTINGS_MODE)); // Return success as false with appropriate error message
                    }
                    break;
                }
                case lockType.V2LOCK: {
                    if (this.settingMode && this.touch) { // Check initStatus of the lock
                        lockKey = await this.execute(RNTTLock.addAdministrator, this.lockMac); // Get lockKeyObject - lockkey,battery, etc...
                        lockKey.lockType = this.lockType;
                    } else {
                        Device.rejectWithError(this.lockType, new RNBlueLibraryError(RNBlueLibraryError.NOT_IN_SETTINGS_MODE)); // Return success as false with appropriate error message
                    }
                    break;
                }
            }
            const resp = await RentlyBlueAPI.createLock(this, lockKey, this.deviceAuthToken); // Get serial No from blueAPI

            console.log(resp);

            if (resp.success) {
                this.settingMode = false;
                await this.fetchEkey();
                console.log('==== fetchEkey for new added lock ', this.ekey);
                return resp;
            }
            else {
                if (lockKey.lockType == lockType.V2LOCK) {
                    lockKey.lockFlagPos = 0;
                }
                await this.resetBLELock(lockKey);
                return resp;
            }
        } catch (error) {
            console.log('==== error ', error);
            //Device.rejectWithError('', error);
            if(lockKey) {
                try {
                    await this.resetBLELock(lockKey);
                    Device.rejectWithError(this.lockType, error);
                }
                catch (error) {
                    Device.rejectWithError(this.lockType, error);
                }
            } else {
                Device.rejectWithError(this.lockType, error);
            }
        }
    };

    async getLog() {
        try {
            await this.checkDeviceTokenExpire();
            var records;
            switch (this.ekey.lockType) {
                case lockType.V3LOCK:
                    var {records, remaining = 0} = await this.execute(this._bleLock.getLog, {...this.ekey});
                    break;
                case lockType.V2LOCK:
                    records = await this.execute(RNTTLock.getLog, {...this.ekey});
                    break;
            }
            console.log('==== log remaining: ', remaining, ' records: ', records);

            if (records.length>0) {
                //add in userId.  Not sure the validity of this since it's just packaging the uid of the
                // library.
                records.map((record) => {
                    record.uid = this.userId;
                });
                await RentlyBlueAPI.uploadLogs(this, this.lockMac, records, this.deviceAuthToken);


                //TODO: change this from recursive to iterative
                if (remaining !== undefined && remaining > 0) {
                    console.log('==== call getLog again');
                    return this.getLog();
                } else {
                    console.log('==== return log success');
                    return {success: true, message: 'Logs successfully fetched and updated'};
                }
            } else {
                console.log('==== no logs to send to server');
                return {success: true, message: 'No logs to be fetched and updated.'};
            }

        } catch (error) {
            Device.rejectWithError(this.ekey.lockType, error);
        }
    }

    // NOTE: v3 locks dont need this, may be needed for v2 so leaving commented out for reference
    // Function to get lockkeyObject info
    // async getLockKeyInfo() {
    //     try {
    //         await this.checkDeviceTokenExpire();
    //         let lockKey = await this._bleLock.getLockKeyInfo(this.lockMac);
    //         if (lockKey)
    //             return lockKey;
    //         lockKey = await RNTTLock.getLockKeyInfo(this.lockMac);
    //         if (lockKey)
    //             return lockKey;
    //         throw new RNTTLockError(RNTTLockError.resolveNativeErrorCode(0x404));
    //     } catch (err) {
    //         throw err;
    //     }
    // };

    // Function to setLock Time
    async setLockTimeAfterUnlock() {
        switch (this.ekey.lockType) {
            case lockType.V3LOCK:
                await this.execute(this._bleLock.setLockTime, {...this.ekey});
                break;
            case lockType.V2LOCK:
                await this.execute(RNTTLock.setLockTime, {...this.ekey});
                break;
        }
    }

    checkDeviceTokenExpire() {
        const currentTime = (new Date()).getTime();
        if (currentTime >= this.tokenExpiresAt) {
            return this.refreshToken();
        } else {
            return Promise.resolve();
        }
    };

    static returnResultWithMsg(message) {
        let resultObject = {
            success: true,
            message: message,
        };
        return resultObject;
    };

    //Function to getTimeBSySerialNo
    async getCurrentTimeByLockMac() {
        try {
            const response = await RentlyBlueAPI.getTimeByLockMac(this, this.lockMac, this.deviceAuthToken);
            console.log('==== getCurrentTimeByLockMac ekey', this.ekey);
            if (response.success) {
                this.ekey.currentTime = response.currentTime;
                switch (this.ekey.lockType) {
                    case lockType.V3LOCK:
                        this.ekey.timezoneRawOffset = response.timezoneOffset;
                        this.ekey.updateTZ = response.updateTZ;
                        break;
                    case lockType.V2LOCK:
                        this.ekey.timezoneRawOffset = -28800000;
                        this.ekey.updateTZ = false;
                        break;
                }
            } else {
                this.ekey.currentTime = 0; // To perform offline unlock current time and timezone offset is set to zero
                this.ekey.timezoneRawOffset = 0;
            }
        } catch (e) {
            console.log('==== getCurrentTimeByLockMac error : ', e);
            this.ekey.currentTime = 0; // To perform offline unlock current time and timezone offset is set to zero
            this.ekey.timezoneRawOffset = 0;
        }

    };

    async lockUnlockDevice(actionType) {
        console.log('==== lockUnlockDevice : ', actionType);
        try {
            await this.getCurrentTimeByLockMac(); // Retrieve current time from memory or from API
            let message = '';
            let recordType = 1;
            switch (this.ekey.lockType) {
                case lockType.V3LOCK:
                    if (actionType === lockActionType.UNLOCK) {
                        message = await this.execute(this._bleLock.unlock, {...this.ekey});
                        recordType = logRecordType.UNLOCK;
                    } else {
                        message = await this.execute(this._bleLock.lock, {...this.ekey});
                        recordType = logRecordType.LOCK;
                    }
                    break;
                case lockType.V2LOCK:
                    if (actionType === lockActionType.UNLOCK) {
                        message = await this.execute(RNTTLock.unlock, {...this.ekey}, this)
                    } else {
                        message = await this.execute(RNTTLock.lock, {...this.ekey});
                    }
                    break;
            }
            if (this.ekey.lockType === lockType.V3LOCK) {
                const now = new Date();
                let operateDate = now.getFullYear() + '-'
                    + ("0" + (now.getMonth() + 1)).slice(-2) + '-'
                    + ("0" + now.getDate()).slice(-2) + ' '
                    + ("0" + now.getHours()).slice(-2) + ':'
                    + ("0" + now.getMinutes()).slice(-2) + ':'
                    + ("0" + now.getSeconds()).slice(-2);
                let records = [{
                    recordType: recordType,
                    success: 1,
                    uid: this.userId,
                    password: null,
                    operateDate: operateDate
                }];
                console.log('==== ~ records:', records);
                await RentlyBlueAPI.uploadLogs(this, this.lockMac, records, this.deviceAuthToken);
            }

            //TODO: determine if this call is actually needed here

            // if (this.ekey.currentTime != 0) { // Set lock time is ignored if current time is 0
            //     await this.setLockTimeAfterUnlock(); // Set the lock's time after unlock
            // }
            if (this.ekey.updateTZ) { // Update timezone
                const lockInfo = { lockMac: this.ekey.lockMac, timezoneOffset: this.ekey.timezoneRawOffset};
                await RentlyBlueAPI.updateLock(this, lockInfo, this.deviceAuthToken); // Update lock info to database
            }
            return Device.returnResultWithMsg(message);
        } catch (error) {
            Device.rejectWithError('', error);
        }
    };


    static checkParameters(obj) {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && obj[prop] === undefined) {
                return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.MISSING_PARAM, `Missing parameter: ${prop}`));
            }
        }
        return Promise.resolve();
    };

    checkEkeyExpire() {
        const currentTime = (new Date()).getTime();
        if (this.ekey && this.ekey.endDate !== 0 && currentTime >= this.ekey.endDate) {
            return this.checkDeviceTokenExpire().then(() => this.fetchEkey())
        }
        return Promise.resolve();
    };

    static checkForPendingCommand() {
        if (Device.pendingCommand) {
            return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.COMMAND_IN_PROGRESS));
        } else return Promise.resolve();
    };

    execute(fn, args) {
        return Device.checkParameters(args)
            .then(() => this.checkEkeyExpire())
            .then(RentlyBlueAPI.checkHostUrl)
            .then(Device.checkForPendingCommand)
            .then(() => Device.pendingCommand = true)
            .then(() => Device.getLockVer(args))
            .then((args) => Device.startOperationWithTimeout(fn, args, this.userId, this._bleLock))
            .then((resp) => {
                Device.pendingCommand = false;
                Device.stopTimeout();
                return resp;
            })
            .catch((error) => {
                console.log('==== execute error : ', error.constructor.name, ' error : ', error, ' code : ', error.code);

                if (error instanceof RNBlueLibraryError || error instanceof RNTTLockError || error instanceof RNDahaoLockError) {

                    if (error.code !== RNBlueLibraryError.COMMAND_IN_PROGRESS &&
                        error.code !== RNTTLockError.COMMAND_IN_PROGRESS &&
                        error.code !== RNDahaoLockError.COMMAND_IN_PROGRESS) {

                        Device.pendingCommand = false;
                        Device.stopTimeout();
                    }

                    throw error;

                } else if (error instanceof Error) {

                    Device.pendingCommand = false;
                    Device.stopTimeout();

                    if (args.lockType === lockType.V3LOCK) {
                        throw new RNDahaoLockError(RNDahaoLockError.resolveNativeErrorCode(error.code));
                    } else if (args.lockType === lockType.V2LOCK) {
                        throw new RNTTLockError(RNTTLockError.resolveNativeErrorCode(error.code));
                    } else {
                        throw new RNBlueLibraryError(RNBlueLibraryError.FAILED, String(error));
                    }

                } else {
                    throw new RNBlueLibraryError(RNBlueLibraryError.FAILED, String(error));
                }

            });
    };

    /**
     *
     * @api {SDK} lockObject.getBattery() Get Battery Status
     * @apiName getBattery
     * @apiGroup Info
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to check and return battery status of the lock
     *
     *
     * @apiSuccess (Success) {bool} success Status of API call
     * @apiSuccess (Success) {number} battery Battery Status of lock
     *
     * @apiParamExample  {type} Request :
     * lockObject.getBattery().then((response) => {
     *
     * });
     *
     *
     * @apiSuccessExample {type} Success-Response:
     * {
     *   success: true,
     *   battery: 98
     * }
     *
     */
    async getBattery() {
        try {
            await this.checkDeviceTokenExpire();
            let battery;
            switch (this.ekey.lockType) {
                case lockType.V3LOCK:
                    battery = await this.execute(this._bleLock.getBattery, {...this.ekey});
                    break;
                case lockType.V2LOCK:
                    battery = await this.execute(RNTTLock.getBattery, {...this.ekey});
                    break;
            }

            const lockInfo = { lockMac: this.ekey.lockMac, battery};
            await RentlyBlueAPI.updateLock(this, lockInfo, this.deviceAuthToken);
            return {success: true, battery: battery};
        } catch (error) {
            Device.rejectWithError(this.ekey.lockType, error);
        }
    }

    static stopTimeout(from = 'finally') {
        if (Device.timeout) {
            console.log('==== timer stopped : ', from, ' pendingCommand:', Device.pendingCommand);
            clearTimeout(Device.timeout);
        }
    };

}

//private function for decrypting password
function decryptPassword(key,password) {

    let aes = new aesjs.AES(key);
    let decryptedPassword = aes.decrypt(Buffer.from(password,'hex'));
    let hex = aesjs.utils.hex.fromBytes(decryptedPassword);

    return hex.slice(0,8).toUpperCase();

}

Device.timeout;
Device.pendingCommand = false;
Device.refreshingToken = false;

module.exports = Device;
