module.exports.lockType = Object.freeze({V3LOCK: 'V3Lock', V2LOCK: 'V2Lock'});
module.exports.createType = Object.freeze({CUSTOM:'custom', AUTO:'auto'}); // Period passcode create type enum
module.exports.ekeyType = Object.freeze({ADMIN:'admin', GUEST:'guest'});
module.exports.codeType = Object.freeze({PERIOD:'Period', PERMANENT:'Permanent', CYCLIC:'Cyclic'}); // period passcode code type enum
module.exports.lockActionType = Object.freeze({UNLOCK:'unlock', LOCK:'lock'});// lockAction type enum
module.exports.operationType = Object.freeze({INITLOCK:'init', LOCK:'lock',UNLOCK:'unlock'});// lockAction type enum
module.exports.logRecordType = Object.freeze({LOCK: 11, UNLOCK: 1});// operation log recordType type enum
module.exports.bleTimeOutTime = 25;
module.exports.maxNumberOfLogs = 20;

module.exports.LockActionEnum = Object.freeze({TYPE_OPEN_LOCK: 0, TYPE_CLOSE_LOCK: 1});
module.exports.KeyTypeEnum = Object.freeze({KEY_PASSWORD: 2,KEY_CARD: 3});
module.exports.ConfigTypeEnum = Object.freeze({AUTO_LOCK: 1, DOOR_SENSOR: 4});

module.exports.BluetoothPluginMethods = Object.freeze(['setServiceAndCharacteristicUUIDs', 'setNotifyHeader',
                                                'startScan','stopScan','commandTimeOut','getLockBroadcastInfo',
                                                'writeToDevice']);

Object.freeze(exports);
