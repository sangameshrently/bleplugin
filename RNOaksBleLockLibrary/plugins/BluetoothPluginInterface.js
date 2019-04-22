"use strict";

const EventEmitter = require('EventEmitter');

class BluetoothPluginInterface extends EventEmitter {

    constructor() {
        //most likely should set up your listener for devices being found
        super();
    }

    /**
     * Sets the service and characteristic UUIDs for the lock.  This should be set before scanning.
     *
     * @param serviceUUID {string} format is 'fee7'
     * @param characteristicUUID {string} format is 'fec6'
     */
    setServiceAndCharacteristicUUIDs(serviceUUID,characteristicUUID) {

    }

    /**
     * Sets the header that will be at the start of a new response from the lock.
     *
     * @param notifyHeader {string} format is "55AA"
     */
    setNotifyHeader(notifyHeader) {

    }

    /**
     * Starts a bluetooth device scan.  The scan should produce single event notifies with no repeats.
     */
    startScan() {

    }

    /**
     * Stop the bluetooth device scan.
     */
    stopScan() {

    }

    /**
     * Disconnect the device.
     *
     * @param lockMac {string} mac of the lock with format "FB:FB:CD:BF:27:FF"
     */
    disconnectDevice(lockMac) {
        // disconnect the device
    }

    /**
     * A bluetooth command has timed out (from the library's perspective).
     *
     * @param lockMac {string} mac of the lock with format "FB:FB:CD:BF:27:FF"
     */
    commandTimeOut(lockMac) {
        // the device needs to be disconnected on a timeout
    }

    /**
     * Get the broadcast info of the lock.
     *
     * @param lockMac {string} mac of the lock with format "FB:FB:CD:BF:27:FF"
     * @returns {Promise<Object>}
     */
    async getLockBroadcastInfo(lockMac) {

        /*

            format of the returned object should be:
            {
                rssi: -70,
                modelNum: 12,
                hardwareVer: 1,
                firmwareVer: 2,
                specialValue: 0,
                recordStatus: 1,
                lockStatus: 0,
                settingMode: false,
                touch: false,
                battery: 78
            }

            this is rssi and the parsed manufacturer data

         */
    }

    /**
     *
     * Write to the device on the already specified characteristic.  This write is wrapped in a
     * Promise and should only resolve() after the corresponding notify(s) have occurred and are coalesced
     * into a single Buffer object that is run through ResponseFactory to create a Response object.
     *
     * @param lockMac {string} mac of the lock with format "FB:FB:CD:BF:27:FF"
     * @param command {Command} unencrypted buffer of bytes representing a command
     * @returns {Promise<Response>} response from the lock wrapped in a promise
     */
    async writeToDevice(lockMac, command) {

        /*
            Writes must be broken into 20 byte packets.  The hub code can be used as an implementation reference.
            Notifies come in 20 byte packets and should combined into one buffer, if needed.  Use the notifyHeader
            to check if the notify is for a new buffer or not.
         */

        let response = null;

        return response;
    }

    /*
        Event name: 'foundDevice'

        This event is emitting for every found device (not a list of them, but every single one) and
        repeats should NOT occur.  Reference the noble code in the hub.

        Should send an object in the following format:

        let device = {
                deviceID : peripheral.id.slice(-8).toUpperCase(),
                lockMac : peripheral.address.toUpperCase(),
                rssi : peripheral.rssi,

                name : peripheral.advertisement.localName.slice(0,10),
                lockType : 'V3Lock',

                // these are retrieved from the manufacturer data being parsed.
                modelNum : 12,
                hardwareVer : 1,
                firmwareVer : 2,
                specialValue : 0,
                recordStatus : 1,
                lockStatus : 0,
                settingMode : false,
                touch : false,
                battery : 82
            };

            in this example, peripheral is the low level noble ble object and deviceID and name should
            be modified according to the code above.

     */

    //TODO: need to add an event for removing of a device that was previously found in a scan but is no longer there

    // on(eventName,listener) {
    //
    // }

}

module.exports = BluetoothPluginInterface;