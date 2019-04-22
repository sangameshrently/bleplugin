"use strict";

class RNDahaoLockError extends Error {

    constructor(code = RNDahaoLockError.FAILED, message = '') {
        super();
        this.name = 'RNDahaoLockError';
        this.message = message || RNDahaoLockError.getErrorMessage(code);
        this.code = code;
    }

    static getErrorMessage(code) {
        switch (code) {
            case RNDahaoLockError.DHBLE_RESULT_SERVICE_NOT_FOUND:
                return 'Service not found';
            case RNDahaoLockError.METHOD_ERR_DEVICE_NOT_CONN:
                return 'Device not connected';
            case RNDahaoLockError.METHOD_ERR_FROM_DEV:
                return 'Unknown Error';
            case RNDahaoLockError.METHOD_NOT_SUPPORT_BLE:
                return 'Bluetooth method not supported';
            case RNDahaoLockError.METHOD_BLE_NOT_ENABLED:
                return 'Bluetooth not enabled';
            case RNDahaoLockError.METHOD_OPERATE_TIMEOUT:
                return 'Operation timed out';
            case RNDahaoLockError.METHOD_PARAM_ERR:
                return 'Missing/Invalid parameters';
            case RNDahaoLockError.METHOD_NOT_SCAN_DEV:
                return 'Scan error';
            case RNDahaoLockError.METHOD_SERVICE_NOT_FOUND:
                return 'Bluetooth method not found';
            case RNDahaoLockError.DHBLE_RESULT_NG:
                return 'Operation Failed';
            case RNDahaoLockError.DHBLE_RESULT_SYSTEM_ERROR:
                return 'System password error';
            case RNDahaoLockError.DHBLE_RESULT_LOCK_ID_ERROR:
                return 'Lock ID is inconsistent';
            case RNDahaoLockError.DHBLE_RESULT_PASSWORD_ERROR:
                return 'User password error';
            case RNDahaoLockError.DHBLE_RESULT_TIMEOUT:
                return 'Time needs to be set';
            case RNDahaoLockError.DHBLE_RESULT_NO_LOGIN:
                return 'Not logged in';
            case RNDahaoLockError.DHBLE_RESULT_KEY_EXIST:
                return 'Key already exists';
            case RNDahaoLockError.DHBLE_RESULT_KEY_FULL:
                return 'Key is full';
            case RNDahaoLockError.DHBLE_RESULT_KEY_EMPTY:
                return 'Key is empty';
            case RNDahaoLockError.ACTIVE_DEVICE_ERR:
                return 'No device found with the MAC address specified';
            case RNDahaoLockError.INITLOCKFAILED:
                return 'Init failed';
            case RNDahaoLockError.COMMAND_TIMED_OUT:
                return 'Command timed out';
            case RNDahaoLockError.INITIALIZE_PASSCODE_FAILED:
                return 'Failed to initialize passcode';
            case RNDahaoLockError.INVALID_PASSCODE_LENGTH:
                return 'Passcode must be 4-9 digits';
            case RNDahaoLockError.COMMAND_IN_PROGRESS:
                return 'There is a command already in progress';
            case RNDahaoLockError.DHBLE_RESULT_CHARACTERISTIC_NOT_FOUND:
                return 'Characteristic not found.';
            default:
                return 'Error Occurred: Unknown error occurred';
        }
    }

    static resolveAPIError(code) {
        switch (parseInt(code)) {
            case 10:
                return RNDahaoLockError.INITLOCKFAILED;
            default:
                return RNDahaoLockError.FAILED;
        }
    }
    // TODO: technically we no longer need this switch statement unless there is something that needs to be mapped
    // previously the platform was checked in the case part
    static resolveNativeErrorCode(code) {
        switch (parseInt(code)) {
            case -1:
                return RNDahaoLockError.DHBLE_RESULT_SERVICE_NOT_FOUND;
            case -2:
                return RNDahaoLockError.METHOD_ERR_DEVICE_NOT_CONN;
            case -3:
                return RNDahaoLockError.METHOD_ERR_FROM_DEV;
            case -4:
                return RNDahaoLockError.METHOD_NOT_SUPPORT_BLE;
            case -5:
                return RNDahaoLockError.METHOD_BLE_NOT_ENABLED;
            case -6:
                return RNDahaoLockError.METHOD_OPERATE_TIMEOUT;
            case -8:
                return RNDahaoLockError.METHOD_PARAM_ERR;
            case -9:
                return RNDahaoLockError.METHOD_NOT_SCAN_DEV;
            case -10:
                return RNDahaoLockError.METHOD_SERVICE_NOT_FOUND;
            case -11:
                return RNDahaoLockError.DHBLE_RESULT_CHARACTERISTIC_NOT_FOUND;
            case 0:
                return RNDahaoLockError.DHBLE_RESULT_OK;
            case 1:
                return RNDahaoLockError.DHBLE_RESULT_NG;
            case 2:
                return RNDahaoLockError.DHBLE_RESULT_SYSTEM_ERROR;
            case 3:
                return RNDahaoLockError.DHBLE_RESULT_LOCK_ID_ERROR;
            case 4:
                return RNDahaoLockError.DHBLE_RESULT_PASSWORD_ERROR;
            case 5:
                return RNDahaoLockError.DHBLE_RESULT_TIMEOUT;
            case 6:
                return RNDahaoLockError.DHBLE_RESULT_NO_LOGIN;
            case 7:
                return RNDahaoLockError.DHBLE_RESULT_KEY_EXIST;
            case 8:
                return RNDahaoLockError.DHBLE_RESULT_KEY_FULL;
            case 9:
                return RNDahaoLockError.DHBLE_RESULT_KEY_EMPTY;
            case 0x404: // TODO: since this is over a byte, there needs to be a endianess check here
                return RNDahaoLockError.ACTIVE_DEVICE_ERR;
            case 0x0A:
                return RNDahaoLockError.COMMAND_IN_PROGRESS;
            case 12:
                return RNDahaoLockError.INVALID_PASSCODE_LENGTH;
            case 13:
                return RNDahaoLockError.INITIALIZE_PASSCODE_FAILED;
            default:
                return RNDahaoLockError.FAILED;
        }
    }
}

//From iOS DHBle SDK
RNDahaoLockError.DHBLE_RESULT_SERVICE_NOT_FOUND = -1;
RNDahaoLockError.METHOD_ERR_DEVICE_NOT_CONN = -2;
RNDahaoLockError.METHOD_ERR_FROM_DEV = -3;
RNDahaoLockError.METHOD_NOT_SUPPORT_BLE = -4;
RNDahaoLockError.METHOD_BLE_NOT_ENABLED = -5;
RNDahaoLockError.METHOD_OPERATE_TIMEOUT = -6;
RNDahaoLockError.METHOD_PARAM_ERR = -8;
RNDahaoLockError.METHOD_NOT_SCAN_DEV = -9;
RNDahaoLockError.METHOD_SERVICE_NOT_FOUND = -10;
RNDahaoLockError.DHBLE_RESULT_OK = 0;
RNDahaoLockError.DHBLE_RESULT_NG = 1;
RNDahaoLockError.DHBLE_RESULT_SYSTEM_ERROR = 2;
/* 系统密码错误 */
RNDahaoLockError.DHBLE_RESULT_LOCK_ID_ERROR = 3;
/* 锁ID不一致 */
RNDahaoLockError.DHBLE_RESULT_PASSWORD_ERROR = 4;
/* 用户密码错误 */
RNDahaoLockError.DHBLE_RESULT_TIMEOUT = 5;
/* 超时 */
RNDahaoLockError.DHBLE_RESULT_NO_LOGIN = 6;
/* 没有登录 */
RNDahaoLockError.DHBLE_RESULT_KEY_EXIST = 7;
/* 钥匙己经存在 */
RNDahaoLockError.DHBLE_RESULT_KEY_FULL = 8;
/* 钥匙己满 */
RNDahaoLockError.DHBLE_RESULT_KEY_EMPTY = 9;
/* 钥匙为空 */
RNDahaoLockError.INVALID_PASSCODE_LENGTH = 12;
RNDahaoLockError.INITIALIZE_PASSCODE_FAILED = 13;
RNDahaoLockError.COMMAND_IN_PROGRESS = 43;


//From iOS Native Code
RNDahaoLockError.ACTIVE_DEVICE_ERR = 0x404;
RNDahaoLockError.FAILED = 11;
RNDahaoLockError.COMMAND_TIMED_OUT = 18;


//From RentlyBlueLambda API
RNDahaoLockError.INITLOCKFAILED = 10;

// add for characteristics error
RNDahaoLockError.DHBLE_RESULT_CHARACTERISTIC_NOT_FOUND = -11;

module.exports = RNDahaoLockError;