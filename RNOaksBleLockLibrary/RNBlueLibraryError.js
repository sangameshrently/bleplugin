"use strict";

class RNBlueLibraryError extends Error {

    constructor(code = RNBlueLibraryError.FAILED, message = '') {
        super();
        this.name = 'RNBlueLibraryError';
        this.message = message || RNBlueLibraryError.getErrorMessage(code);
        this.code = code;
    }

    static getErrorMessage(code) {
        switch (code) {
            case RNBlueLibraryError.NOT_IN_SETTINGS_MODE: return 'Touch the lock and try again or the lock is already initialised';
            case RNBlueLibraryError.GET_LOCK_TIME_ERROR: return 'Get Lock Time error. Please try again later';
            case RNBlueLibraryError.SET_LOCK_TIME_ERROR: return 'Set Lock Time error. Please try again later';
            case RNBlueLibraryError.COMMAND_IN_PROGRESS: return 'Please wait. A command is in progress';
            case RNBlueLibraryError.TOKEN_EXPIRED: return 'Device token has been expired';
            case RNBlueLibraryError.EKEY_EXPIRED: return 'Ekey has been expired';
            case RNBlueLibraryError.FAILED_TO_FETCH_TOKEN: return 'Failed to get new token';
            case RNBlueLibraryError.FAILED_TO_PARSE_LOCKVER: return 'Error parsing lock version string';
            case RNBlueLibraryError.NO_LOCATION_PERMISSION: return 'App does not have permission to access location';
            case RNBlueLibraryError.EKEY_NOT_AVAILABLE: return 'Ekey is not available for this device';
            case RNBlueLibraryError.TOKEN_NOT_AVAILABLE: return 'Device Token is not available for this device';
            case RNBlueLibraryError.HOST_NOT_FOUND: return 'Host URL not set';
            case RNBlueLibraryError.FAILED_TO_GET_PROPER_RESPONSE: return 'Failed to get proper response from server';
            case RNBlueLibraryError.LIBRARY_INIT_ERROR: return 'Invalid parameters. Failed to init libray';
            default: return 'Unknown error occurred';
        }
    }

}

RNBlueLibraryError.FAILED = 51;
RNBlueLibraryError.NOT_IN_SETTINGS_MODE = 52;
RNBlueLibraryError.GET_LOCK_TIME_ERROR = 53;
RNBlueLibraryError.SET_LOCK_TIME_ERROR = 54;
RNBlueLibraryError.COMMAND_IN_PROGRESS = 55;
RNBlueLibraryError.TOKEN_EXPIRED = 56;
RNBlueLibraryError.EKEY_EXPIRED = 57;
RNBlueLibraryError.FAILED_TO_FETCH_TOKEN = 58;
RNBlueLibraryError.FAILED_TO_PARSE_LOCKVER = 59;
RNBlueLibraryError.NO_LOCATION_PERMISSION = 60;
RNBlueLibraryError.MISSING_PARAM = 61;
RNBlueLibraryError.EKEY_NOT_AVAILABLE = 62;
RNBlueLibraryError.TOKEN_NOT_AVAILABLE = 63;
RNBlueLibraryError.HOST_NOT_FOUND = 64;
RNBlueLibraryError.FAILED_TO_GET_PROPER_RESPONSE = 65;
RNBlueLibraryError.LIBRARY_INIT_ERROR = 66;

module.exports = RNBlueLibraryError;