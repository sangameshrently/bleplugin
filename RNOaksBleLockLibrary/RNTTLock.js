// import {
//   NativeModules,
//   Platform,
// } from 'react-native';
// import Promise from 'bluebird';
// import RNTTLockError from './RNTTLockError';

"use strict";

const Promise = require('bluebird');
const RNTTLockError = require('./RNTTLockError.js');

/**
 * This is basically the passthrough class from js funtion calls to the native calls.
 *
 * We are not calling any native code, as it's all in javascript. So, these functions should
 * just call the proper javascript code
 */

//const TTLock = NativeModules.RNTTLock;

module.exports.commandTimeOut = () => {
  //return TTLock.commandTimeOut()
}

module.exports.getLockKeyInfo = (lockMac) => {
  //return TTLock.getLockKeyInfo(lockMac)
}

module.exports.addAdministrator = (lockMac) => {
  //return TTLock.addAdministrator(lockMac);
};

module.exports.resetLock = (/*{ lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, userType }*/) => {
  //return checkAdmin(userType).then(() => TTLock.resetLock(lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr));
};

module.exports.setLockTime = (/*{ lockMac, scienerOpenId, lockVer, lockKey, lockFlagPos, aesKeyStr, currentTime }*/) => {
  //return TTLock.setLockTime(lockMac, scienerOpenId, lockVer, lockKey, currentTime, lockFlagPos, aesKeyStr);
};

module.exports.getLockTime = (/*{ lockMac, scienerOpenId, lockVer, lockFlagPos, aesKeyStr }*/) => {
  // const args = Platform.select({
  //   ios: { lockMac, scienerOpenId, lockVer, lockFlagPos, aesKeyStr },
  //   android: { lockMac, lockVer, aesKeyStr },
  // });
  // return TTLock.getLockTime(lockMac, scienerOpenId, lockVer, lockFlagPos, aesKeyStr);
};

module.exports.unlock = /*async*/ (/*{ lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, startDate, endDate, userType }*/) => {
  // return (userType === '110301') ?
  //   TTLock.unlockByAdministrator( lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr ) :
  //   TTLock.unlockByUser( lockMac, scienerOpenId, lockVer, startDate, endDate, lockKey, lockFlagPos, aesKeyStr );
};

module.exports.lock = /*async*/ (eKey) => {
  // const { lockMac, scienerOpenId, lockVer, startDate, endDate, lockKey, lockFlagPos, aesKeyStr, specialValue, userType } = eKey;
  // if (!(await TTLock.isSupportManualLock(specialValue))) {
  //   return Promise.reject(new RNTTLockError(RNTTLockError.MANUAL_LOCK_NOT_SUPPORTED));
  // }
  // if (Platform.OS === 'ios') {
  //   const isAdmin = (userType === '110301') ? 1 : 0;
  //   return TTLock.lock(lockMac, scienerOpenId, lockVer, startDate, endDate, lockKey, lockFlagPos, aesKeyStr, specialValue, isAdmin);
  // } else {
  //   return TTLock.lock(lockMac, scienerOpenId, lockVer, startDate, endDate, lockKey, lockFlagPos, aesKeyStr, specialValue );
  // }
};

module.exports.getAutoLockTime = /*async*/ (/*{lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, userType}*/) => {
  //return checkAdmin(userType).then(() => TTLock.getAutoLockTimes(lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr));
};

module.exports.setAutoLockTime = /*async*/ (/*{lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, userType, time}*/) => {
  //return checkAdmin(userType).then(() => TTLock.modifyAutoLockTime(lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, time, aesKeyStr));
};

module.exports.getBattery = (/*{lockMac}*/) => {
  //return TTLock.getBattery(lockMac);
};

module.exports.deletePasscode = /*async*/ (/*{lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, userType, passcode}*/) => {
  //return checkAdmin(userType).then(() => TTLock.deleteOneKeyboardPassword(lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, passcode, aesKeyStr));
};

module.exports.addPeriodPasscode = (/*{ lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, userType, passcode, startDate, endDate}*/) => {
  // const {
  //   INITIALIZE_PASSCODE_FAILED,
  //   INVALID_PASSCODE_LENGTH,
  // } = RNTTLockError;
  // if (typeof passcode !== 'string') {
  //   return Promise.reject(new RNTTLockError(INITIALIZE_PASSCODE_FAILED, 'Passcode must be string'));
  // } else if ((passcode.length < 4) || (passcode.length > 9)) {
  //   return Promise.reject(new RNTTLockError(INVALID_PASSCODE_LENGTH));
  // } else if (!/^\d+$/.test(passcode)) {
  //   return Promise.reject(new RNTTLockError(INITIALIZE_PASSCODE_FAILED, 'Passcode must be numeric'));
  // }
  // return checkAdmin(userType).then(() => TTLock.addPeriodPasscode(lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, passcode, startDate, endDate, aesKeyStr));
};

module.exports.isDoorSensorEnabled = /*async*/ (key) => {
  // const { lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, userType, specialValue } = key;
  // const operationType = 1; // 1 - query, 2 - modify
  // const operationValue = 0; // 1 - on, 0 - off (It is useful when the operation is modify)
  // if (!(await TTLock.isSupportDoorSensor(specialValue))) {
  //   return Promise.reject(new RNTTLockError(RNTTLockError.DOOR_SENSOR_NOT_SUPPORTED));
  // }
  // return checkAdmin(userType).then(() => TTLock.operateDoorSensorLocking(lockMac, operationType, operationValue, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr));
};

module.exports.isSupportDoorSensor = /*async*/ (key) => {
  // const { specialValue } = key;
  // return TTLock.isSupportDoorSensor(specialValue)
}

// Does lock support IC card (fob)?
module.exports.isSupportIC = /*async*/ (key) => {
  // const { specialValue } = key;
  // if (typeof specialValue !== 'number') {
  //   throw new Error('specialValue must be a number');
  // }
  // return await TTLock.isSupportIC(specialValue);
};

module.exports.addICCard = /*async*/ (/*{lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, userType}*/) => {
  // await checkAdmin(userType);
  // return await TTLock.addICCard(lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr);


  // THIS CODE WAS ALREADY COMMENTED OUT
  // return event;
  // return () => new Promise((resolve, reject) => {
  //   NativeEmitter.once(event, ({ success, errorCode, cardNo }) => {
  //     if (success) {
  //       console.log("CARDNUMBER:-------",cardNo)
  //       resolve(cardNo);
  //     } else {
  //       reject(new RNTTLockError(RNTTLockError.resolveNativeErrorCode(errorCode)));
  //     }
  //   });
  // });
};

module.exports.deleteICCard = /*async*/ (/*{lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, userType, cardNo}*/) => {
  //return checkAdmin(userType).then(() => TTLock.deleteICCard(lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, cardNo, aesKeyStr));
};

module.exports.modifyICPeriod = /*async*/ (/*{lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, userType, cardNo, startDate, endDate}*/) => {
  // console.log('Passed cardID',cardNo);
  // console.log('Passed startDate',startDate);
  // console.log('Passed endDate',endDate);
  // return checkAdmin(userType).then(() => TTLock.modifyICPeriod(lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, cardNo, startDate, endDate, aesKeyStr));
};

module.exports.setDoorSensorLocking = /*async*/ (key) => {
  // const { lockMac, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr, userType, specialValue, isEnabled } = key;
  // const operationType = 2; // 1 - query, 2 - modify (It is useful when the operation is modify)
  // const operationValue = isEnabled ? 1 : 0; // 1 - on, 0 - off
  // if (!(await TTLock.isSupportDoorSensor(specialValue))) {
  //   return Promise.reject(new RNTTLockError(RNTTLockError.DOOR_SENSOR_NOT_SUPPORTED));
  // }
  // return checkAdmin(userType).then(() => TTLock.operateDoorSensorLocking(lockMac, operationType, operationValue, scienerOpenId, lockVer, adminPs, lockKey, lockFlagPos, aesKeyStr));
};

module.exports.getLog = (/*{lockMac, scienerOpenId, lockVer, lockFlagPos, aesKeyStr}*/) => {
  // console.log('==== rnttlock getLog',lockMac, scienerOpenId, lockVer, lockFlagPos, aesKeyStr);
  // if (Platform.OS === 'ios') {
  //   return TTLock.getOperateLog(lockMac, scienerOpenId, lockVer, lockFlagPos, aesKeyStr).then(JSON.parse);
  // } else {
  //   return TTLock.getOperateLog(lockMac, lockVer, aesKeyStr).then(JSON.parse);
  // }
};

const checkAdmin = (userType) => {
  if (userType !== '110301') {
    return Promise.reject(new RNTTLockError(RNTTLockError.NOT_ADMIN_KEY));
  } else return Promise.resolve();
};
