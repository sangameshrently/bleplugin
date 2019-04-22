"use strict";

class RNTTLockError extends Error {

  constructor(code = RNTTLockError.FAILED, message = '') {
    super();

    this.name = 'RNTTLockError';
    this.message = message || RNTTLockError.getErrorMessage(code);
    this.code = code;
  }

  static getErrorMessage(code) {
    switch (code) {
      case RNTTLockError.CRC_ERROR: return 'CRC error';
      case RNTTLockError.INVALID_ADMIN_CODE: return 'Wrong administrator passcode';
      case RNTTLockError.OUT_OF_MEMORY: return 'No free memory in lock';
      case RNTTLockError.LOCK_IN_SETTING_MODE: return 'Lock is in setting mode';
      case RNTTLockError.LOCK_HAS_NO_ADMINISTRATOR: return 'Lock has no administrator';
      case RNTTLockError.LOCK_NOT_IN_SETTING_MODE: return 'Lock is not in setting mode';
      case RNTTLockError.INVALID_DYNAMIC_PASSWORD: return 'Invalid dynamic code';
      case RNTTLockError.NO_BATTERY: return 'Lock has no battery';
      case RNTTLockError.EKEY_HAS_EXPIRED: return 'Ekey has expired';
      case RNTTLockError.INVALID_PASSCODE_LENGTH: return 'Passcode must be 4-9 digits';
      case RNTTLockError.EKEY_NOT_VALID_YET: return 'Ekey has not become valid yet';
      case RNTTLockError.AES_KEY_INVALID: return 'AES parse error';
      case RNTTLockError.PASSCODE_ALREADY_EXISTS: return 'Passcode already exists';
      case RNTTLockError.IC_CARD_DOES_NOT_EXIST: return 'IC card does not exist';
      case RNTTLockError.FINGERPRINT_DOES_NOT_EXIST: return 'Fingerprint does not exist';
      case RNTTLockError.DOES_NOT_SUPPORT_PASSCODE_MODIFICATION: return 'Lock does not support passcode modification';
      case RNTTLockError.LOCK_MAY_HAVE_BEEN_RESET: return 'Key invalid, lock may have been reset';
      case RNTTLockError.ADMIN_PASSCODE_SAME_AS_ERASE_PASSCODE: return 'Admin passcode is the same as the delete passcode';
      case RNTTLockError.NO_PERMISSION: return 'Not administator, has no permission';
      case RNTTLockError.RESET_KEYBOARD_PASSWORD: return 'There was an error';
      case RNTTLockError.UPDATE_PASSCODE_ERROR: return 'Error updating passcode';
      case RNTTLockError.INVALID_FLAG: return 'Invalid flag';
      case RNTTLockError.INVALID_PARAMETER_LENGTH: return 'Invalid parameter length';
      case RNTTLockError.DUPLICATE_FINGERPRINT: return 'Duplication of fingerprints';
      case RNTTLockError.INVALID_CLIENT_PARAMETER: return 'Invalid special string';
      case RNTTLockError.ACTIVE_DEVICE_ERR: return 'No device found with the MAC address specified';
      case RNTTLockError.INITIALIZE_PASSCODE_FAILED: return 'Failed to initialize passcode';
      case RNTTLockError.EKEY_FLAG_INVALID: return 'Invalid eKey, lock flag position is low';
      case RNTTLockError.USER_NOT_LOGIN: return 'User not login';
      case RNTTLockError.PASSCODE_DOES_NOT_EXIST: return 'Passcode does not exist';
      case RNTTLockError.INVALID_COMMAND: return 'Invalid command';
      case RNTTLockError.INVALID_VENDOR: return 'Invalid vendor string';
      case RNTTLockError.COMMAND_TIMED_OUT: return 'Command timed out';
      case RNTTLockError.LOCK_DISCONNECTED: return 'Connection was disrupted. Please try again';
      case RNTTLockError.DOOR_SENSOR_NOT_SUPPORTED: return 'Lock does not support door sensor';
      case RNTTLockError.FAILED_TO_PARSE_LOCKVER: return 'Error parsing lock version string';
      case RNTTLockError.NOT_ADMIN_KEY: return 'Not an admin eKey';
      case RNTTLockError.COMMAND_IN_PROGRESS: return 'There is a command already in progress';
      case RNTTLockError.NO_LOCATION_PERMISSION: return 'App does not have permission to access location';
      case RNTTLockError.MANUAL_LOCK_NOT_SUPPORTED: return 'Lock does not support locking through Bluetooth';
      case RNTTLockError.UNDEFINED_COMMAND: return 'Unrecognized command';
      case RNTTLockError.TTLOCK_API_NULL: return 'Native error';
      case RNTTLockError.LOCK_NOT_FOUND: return 'Lock is not found';
      case RNTTLockError.NO_LOGS_FOUND: return 'No logs found';
      case RNTTLockError.BATTERY_LEVEL_NOT_FOUND: return 'Battery level not found';
      default: return 'Error Occurred: Unknown error occurred';
    }
  }

  static resolveNativeErrorCode(code) {
    switch (parseInt(code)) {
      /*
        These are errors that both the Android and iOS TTLock SDKs define
       */
      // case Platform.select({ ios: 0x01, android: 1 }): return RNTTLockError.CRC_ERROR;
      // case Platform.select({ ios: 0x02, android: 2 }): return RNTTLockError.NO_PERMISSION;
      // case Platform.select({ ios: 0x03, android: 3 }): return RNTTLockError.INVALID_ADMIN_CODE;
      // case Platform.select({ ios: 0x16 }): // There are two errors for no memory in iOS
      // case Platform.select({ ios: 0x04, android: 22 }): return RNTTLockError.OUT_OF_MEMORY;
      // case Platform.select({ ios: 0x05, android: 5 }): return RNTTLockError.LOCK_IN_SETTING_MODE;
      // case Platform.select({ ios: 0x06, android: 6 }): return RNTTLockError.LOCK_HAS_NO_ADMINISTRATOR;
      // case Platform.select({ ios: 0x07, android: 7 }): return RNTTLockError.LOCK_NOT_IN_SETTING_MODE;
      // case Platform.select({ ios: 0x08, android: 8 }): return RNTTLockError.INVALID_DYNAMIC_PASSWORD;
      // case Platform.select({ ios: 0x0a, android: 10 }): return RNTTLockError.NO_BATTERY;
      // case Platform.select({ ios: 0x0e, android: 14 }): return RNTTLockError.EKEY_HAS_EXPIRED;
      // case Platform.select({ ios: 0x0f, android: 15 }): return RNTTLockError.INVALID_PASSCODE_LENGTH;
      // case Platform.select({ ios: 0x11, android: 17 }): return RNTTLockError.EKEY_NOT_VALID_YET;
      // case Platform.select({ ios: 0x12, android: 48 }): return RNTTLockError.AES_KEY_INVALID;
      // case Platform.select({ ios: 0x14, android: 20 }): return RNTTLockError.PASSCODE_ALREADY_EXISTS;
      // case Platform.select({ ios: 0x15, android: 21 }): return RNTTLockError.PASSCODE_DOES_NOT_EXIST;
      // case Platform.select({ ios: 0x18, android: 24 }): return RNTTLockError.IC_CARD_DOES_NOT_EXIST;
      // case Platform.select({ ios: 0x1A, android: 26 }): return RNTTLockError.FINGERPRINT_DOES_NOT_EXIST;
      // case Platform.select({ ios: 0x60, android: 96 }): return RNTTLockError.DOES_NOT_SUPPORT_PASSCODE_MODIFICATION;
      // case Platform.select({ ios: 0x00, android: 49 }): return RNTTLockError.LOCK_MAY_HAVE_BEEN_RESET;
      // case Platform.select({ ios: 0x10, android: 16 }): return RNTTLockError.ADMIN_PASSCODE_SAME_AS_ERASE_PASSCODE;
      // /*
      //   These are errors that the iOS TTLock SDK defines but the Android TTLock SDK does not
      //  */
      // case Platform.select({ ios: 0x0b }): return RNTTLockError.RESET_KEYBOARD_PASSWORD;
      // case Platform.select({ ios: 0x0c }): return RNTTLockError.UPDATE_PASSCODE_ERROR;
      // case Platform.select({ ios: 0x0d }): return RNTTLockError.INVALID_FLAG;
      // case Platform.select({ ios: 0x17 }): return RNTTLockError.INVALID_PARAMETER_LENGTH;
      // case Platform.select({ ios: 0x19 }): return RNTTLockError.DUPLICATE_FINGERPRINT;
      // case Platform.select({ ios: 0x1D }): return RNTTLockError.INVALID_CLIENT_PARAMETER;
      // case Platform.select({ ios: 0x404 }): return RNTTLockError.ACTIVE_DEVICE_ERR;
      //
      // /*
      //   These are errors that only the Android SDK defines but the iOS TTLock SDK does not
      //  */
      // case Platform.select({ android: 11 }): return RNTTLockError.INITIALIZE_PASSCODE_FAILED;
      // case Platform.select({ android: 13 }): return RNTTLockError.EKEY_FLAG_INVALID;
      // case Platform.select({ android: 18 }): return RNTTLockError.USER_NOT_LOGIN;
      // case Platform.select({ android: 27 }): return RNTTLockError.INVALID_COMMAND;
      // case Platform.select({ android: 29 }): return RNTTLockError.INVALID_VENDOR;
      // /*
      //   These are errors that neither the Android TTLock SDK nor iOS TTLock SDK defines but are defined
      //   in both the native Android and iOS code
      //  */
      // case Platform.select({ ios: 0x1b, android: -1 }): return RNTTLockError.LOCK_DISCONNECTED;
      // case Platform.select({ ios: 0x21, android: -2 }): return RNTTLockError.UNDEFINED_COMMAND;
      // /*
      //   These are errors that neither the Android TTLock SDK or iOS TTLock SDK defines but are defined
      //   in the Android native code
      //  */
      // case Platform.select({ android: -3 }): return RNTTLockError.TTLOCK_API_NULL;
      // case Platform.select({ android: -4 }): return RNTTLockError.LOCK_NOT_FOUND;
      // /*
      //   These are errors that neither the Android TTLock SDK or iOS TTLock SDK defines but are defined
      //   in the ios native code
      //  */
      // case Platform.select({ ios: 0x09 }): return RNTTLockError.COMMAND_IN_PROGRESS;
      // case Platform.select({ ios: 0x20 }): return RNTTLockError.MANUAL_LOCK_NOT_SUPPORTED;
      // case Platform.select({ ios: 0x1C }): return RNTTLockError.NO_LOGS_FOUND;
      // case Platform.select({ ios: 0x1E }): return RNTTLockError.COMMAND_TIMED_OUT;
      // case Platform.select({ ios: 0x1F }): return RNTTLockError.BATTERY_LEVEL_NOT_FOUND;
      default: return RNTTLockError.FAILED;
    }
  }
}

/*
    From Android and iOS TTLock SDKs
   */
RNTTLockError.CRC_ERROR = 0;
RNTTLockError.INVALID_ADMIN_CODE = 1;
RNTTLockError.OUT_OF_MEMORY = 2;
RNTTLockError.LOCK_IN_SETTING_MODE = 3;
RNTTLockError.LOCK_HAS_NO_ADMINISTRATOR = 4;
RNTTLockError.LOCK_NOT_IN_SETTING_MODE = 5;
RNTTLockError.INVALID_DYNAMIC_PASSWORD = 6;
RNTTLockError.NO_BATTERY = 7;
RNTTLockError.EKEY_HAS_EXPIRED = 8;
RNTTLockError.INVALID_PASSCODE_LENGTH = 9;
RNTTLockError.EKEY_NOT_VALID_YET = 10;
RNTTLockError.AES_KEY_INVALID = 11;
RNTTLockError.FAILED = 12;
RNTTLockError.PASSCODE_ALREADY_EXISTS = 13;
RNTTLockError.IC_CARD_DOES_NOT_EXIST = 14;
RNTTLockError.FINGERPRINT_DOES_NOT_EXIST = 15;
RNTTLockError.DOES_NOT_SUPPORT_PASSCODE_MODIFICATION = 16;
RNTTLockError.LOCK_MAY_HAVE_BEEN_RESET = 17;
RNTTLockError.ADMIN_PASSCODE_SAME_AS_ERASE_PASSCODE = 18;
RNTTLockError.NO_PERMISSION = 19;
/*
  From iOS TTLock SDK
 */
RNTTLockError.RESET_KEYBOARD_PASSWORD = 20;
RNTTLockError.UPDATE_PASSCODE_ERROR = 21;
RNTTLockError.INVALID_FLAG = 22;
RNTTLockError.INVALID_PARAMETER_LENGTH = 23;
RNTTLockError.DUPLICATE_FINGERPRINT = 24;
RNTTLockError.INVALID_CLIENT_PARAMETER = 25;
RNTTLockError.ACTIVE_DEVICE_ERR = 0x404;

/*
  From Android TTLock SDK
 */
RNTTLockError.INITIALIZE_PASSCODE_FAILED = 27;
RNTTLockError.EKEY_FLAG_INVALID = 28; // Same as INVALID_FLAG?
RNTTLockError.USER_NOT_LOGIN = 29;
RNTTLockError.PASSCODE_DOES_NOT_EXIST = 30;
RNTTLockError.INVALID_COMMAND = 31;
RNTTLockError.INVALID_VENDOR = 32;
/*
  From Android and iOS native code
 */
RNTTLockError.UNDEFINED_COMMAND = 33;
RNTTLockError.LOCK_DISCONNECTED = 34;
/*
  From Android native code
 */
RNTTLockError.TTLOCK_API_NULL = 35;
RNTTLockError.LOCK_NOT_FOUND = 36;
/*
  From iOS native code
 */
RNTTLockError.NO_LOGS_FOUND = 37;
RNTTLockError.BATTERY_LEVEL_NOT_FOUND = 38;
/*
  From JavaScript code
 */
RNTTLockError.COMMAND_TIMED_OUT = 39;
RNTTLockError.DOOR_SENSOR_NOT_SUPPORTED = 40;
RNTTLockError.FAILED_TO_PARSE_LOCKVER = 41;
RNTTLockError.NOT_ADMIN_KEY = 42;
RNTTLockError.COMMAND_IN_PROGRESS = 43;
RNTTLockError.NO_LOCATION_PERMISSION = 44;
RNTTLockError.MANUAL_LOCK_NOT_SUPPORTED = 45;

module.exports = RNTTLockError;