"use strict";

const EventEmitter = require('EventEmitter');
const Promise = require('bluebird');
const RNBlueLibraryError = require('./RNBlueLibraryError.js');

const Device = require('./device.js');

const RentlyBlueAPI = require('./RentlyBlueAPI.js');

const LockController = require('./lockController');

// library does an emitter on the side, so it doesn't have to subclass event emitter
const myEmitter = new (class extends EventEmitter {
})();

const DEFAULT_TIMEZONE_STR = "Pacific Time (US & Canada)";

const SCAN_TIMER = 10; // default scan timer before stop scanning in seconds.  Really should be passed instead

class RNOaksBleLockLibrary {

    /**
     *
     * @api {SDK} RNOaksBleLockLibrary(userId,getToken,environment,bluetoothPlugin) Initialize the Library
     * @apiName init
     * @apiGroup InitLibrary
     * @apiVersion  1.0.1
     * @apiDescription Receives and stores userId, getToken function and environment string from App
     *
     * @apiParam {number} userId userID of the user
     * @apiParam {function(string)} getToken function that takes lockMac and returns token object with deviceToken and expiryDate for that lockMac.
     * @apiParam {string=development,production} [environment] project environment
     * @apiParam {BluetoothPluginInterface} plug-in for bluetooth commands to the device
     *
     * @apiParamExample {type} Request :
     *
     * import RNOaksOpenMobileLibrary from 'react-native-rently-blue-mobile-library';
     * const ObjRNOaksOpenMobileLib = new RNOaksOpenMobileLibrary(112234, {getToken: (lockMac)=>{
     *    //fetch new token object with deviceToken and expiryDate for lockMac
     *    return {
     *      accessToken: 'eyJ*******************XI',
     *      expiresAt:1550043870766
     *    };
     * }, environment: 'development'});
     *
     *
     */
    constructor(userId, getToken, environment = '', bluetoothPlugin) {

        this._devices = new Map();

        this._lockController = new LockController(bluetoothPlugin);

        this.addListener = (eventName, listener) => {
            return myEmitter.addListener(eventName, listener);
        };

        this.eventNames = () => {
            return myEmitter.eventNames();
        };

        this.getMaxListeners = () => {
            return myEmitter.getMaxListeners();
        };

        this.listenerCount = (eventName) => {
            return myEmitter.listenerCount(eventName);
        };

        this.listeners = (eventName) => {
            return myEmitter.listeners(eventName);
        };

        this.on = (eventName, callback) => {
            return myEmitter.on(eventName, callback);
        };

        this.once = (eventName, callback) => {
            return myEmitter.once(eventName, callback);
        };

        this.prependListener = (eventName, listener) => {
            return myEmitter.prependListener(eventName, listener);
        };

        this.prependOnceListener = (eventName, listener) => {
            return myEmitter.prependOnceListener(eventName, listener);
        };

        this.removeAllListeners = (eventName) => {
            return myEmitter.removeAllListeners(eventName);
        };

        this.removeListener = (eventName, callback) => {
            return myEmitter.removeListener(eventName, callback);
        };

        this.setMaxListeners = (n) => {
            return myEmitter.setMaxListeners(n);
        };

        this.rawListeners = (eventName) => {
            return myEmitter.rawListeners(eventName);
        };

        if (userId && typeof (userId) === 'number') {
            this.userId = userId;
        } else {
            throw new RNBlueLibraryError(RNBlueLibraryError.LIBRARY_INIT_ERROR, 'User id is required to init Oaks library');
        }

        if (getToken && typeof (getToken) === 'function') {
            this.getToken = getToken;
            RentlyBlueAPI.setHostUrl(environment);
        } else {
            throw new RNBlueLibraryError(RNBlueLibraryError.LIBRARY_INIT_ERROR, '\'getToken\' function is required to init Oaks library');
        }

        this._lockController.on('foundDevice',device => myEmitter.emit('foundDevice', device));

        console.log("Initialized Oaks Open Mobile Library");

    }

    /**
     *
     * Get the map of the devices the library has created.
     *
     * @returns {Map<string, Device>}
     */
    get devices() {
        // return a clone, not the original Map
        return new Map(this._devices);
    }

    /**
     * Get the timezone string.
     *
     * @returns {string}
     */
    get timezoneString() {
        return (this._timezoneString===undefined)?DEFAULT_TIMEZONE_STR:this._timezoneString;
    }

    /**
     * Sets the timezone string
     *
     * @param timezoneString {string}
     */
    set timezoneString(timezoneString) {
        this._timezoneString = timezoneString;
    }

    /**
     *
     * @api {SDK} objRNOaksOpenMobileLib.createDevice(lockData,deviceToken,expiryDate) Creates Lock Instance
     * @apiName Create lock
     * @apiGroup CreateLockInstance
     * @apiVersion  1.0.1
     * @apiDescription Returns a lock object for lockdata, devicetoken and expiry date
     *
     * @apiParam {object} lockData object returned from 'foundDevice' eventEmitter on lock scan
     * @apiParam {string} lockData.address mac address of lock
     * @apiParam {bool} lockData.settingMode mode for checking whether the lock is initialized (settingMode = true - Lock not initialized, settingMode = false - Lock initialized)
     * @apiParam {bool} lockData.touch mode for checking whether the lock is touched (touch = true - Lock touched , touch = false - Lock is idle )
     * @apiParam {string} lockData.battery battery status in percentage
     * @apiParam {string} lockData.rssi signal strength. The signal strength is mostly negative. The higher the value, stronger the signal.
     * @apiParam {string} deviceToken deviceToken of lock, retrieved from getToken method response
     * @apiParam {number} expiryDate expiry date of deviceToken, retrieved from getToken method response (Time in milliseconds)
     *
     * @apiParamExample {type} Request :
     *
     * import RNOaksOpenMobileLibrary from 'react-native-rently-blue-mobile-library';
     * const lockObject = objRNOaksOpenMobileLib.createDevice({
     *     address: 'F3:71:AA:33:22:31',
     *     settingMode: false,
     *     touch: false,
     *     battery: 100,
     *     rssi: -66,
     *  }, 'df3************7c2',1543490189000)
     *
     * @apiSuccess (Success) {device} lockObject instance of Device class
     *
     */
    createDevice(lockData, deviceToken, expiresAt) {
        let device = new Device(this._lockController, lockData, deviceToken, expiresAt, this.getToken, this.userId);

        device.timezoneString = this.timezoneString;

        //TODO: this cannot be properly awaited on and can cause a race condition if it is not retrieved before another call
        device.setEkey();

        if (device) {
            this._devices.set(lockData.lockMac,device);
        }

        return device;
    }

    // Start Bluetooth Scan
    /**
     *
     * @api {SDK} ObjRNOaksOpenMobileLib.startScan() Start Scan
     * @apiName startScan
     * @apiGroup Scan
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to start scanning nearby BLE locks
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiExample {type} Request :
     * ObjRNOaksOpenMobileLib.startScan()
     *
     */
    startScan() {
        console.log("Started scan through Oaks Open Mobile Library");

        //TODO: add back in check on request permission for android phones
        try { // Start sciener and dahao scan parallely
            //TTLock.startScan();
            this._lockController.startScanning();
            RentlyBlueAPI.initAPI();

            setTimeout(()=>this.stopScan(),SCAN_TIMER*1000);

        } catch (error) {
            console.warn(error);
        }
    };

    // Stop Bluetooth Scan
    /**
     *
     * @api {SDK} ObjRNOaksOpenMobileLib.stopScan() Stop Scan
     * @apiName stopScan
     * @apiGroup Scan
     * @apiVersion  1.0.1
     *
     * @apiDescription Calls the BT sdk to stop scanning locks
     *
     * @apiSuccess (Success) {bool} success Status of API call
     *
     * @apiExample {type} Request :
     * ObjRNOaksOpenMobileLib.stopScan()
     *
     */
    stopScan() {

        console.log("Stopped scan through Oaks Open Mobile Library");

        try { // Stop sciener and dahao scan parallely
            //TTLock.stopScan();
            this._lockController.stopScanning();
        } catch (error) {
            console.warn(error);
        }
    };

    // permissions for location services is for phones, so we should
    // be able to remove this method
    async requestLocationPermission() {
        return Promise.resolve("permission_granted");
        // if (!(Platform.OS === 'android' && Platform.Version >= 23)) return;
        // try {
        //     const granted = await PermissionsAndroid.request(
        //         PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
        //             title: 'Location Permission',
        //             message: 'The app needs access to your location in order to discover nearby locks'
        //         });
        //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //         return Promise.resolve("permission_granted");
        //     } else {
        //         return Promise.reject(
        //             new RNBlueLibraryError(RNBlueLibraryError.NO_LOCATION_PERMISSION)
        //         );
        //     }
        // } catch (err) {
        //     return Promise.reject(
        //         new RNBlueLibraryError(
        //             RNBlueLibraryError.NO_LOCATION_PERMISSION,
        //             `Location permission denied with reason: ${err}`
        //         ));
        // }
    };

}// class end

module.exports = RNOaksBleLockLibrary;