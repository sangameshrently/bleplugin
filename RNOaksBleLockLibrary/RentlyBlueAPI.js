"use strict";

const axios = require('axios');
const RNBlueLibraryError = require('./RNBlueLibraryError.js');
const Device = require('./device.js');
const lockType = require('./constants.js').lockType;

const bluebaseURL = "https://api.rentlyopensesame.com/oakslock/";
const productionBaseURL = "https://api.rentlyopensesame.com/oakslock/";

var axiosInstance;
var baseUrl;

const interceptRequest = async ({method, url, headers = {}, params = {}, ...rest}) => {
    const config = {
        url,
        method,
        params,
        headers,
        ...rest,
    };
    console.log(`---- lib:[${method}]:(${config.baseURL}${url}) \n(${JSON.stringify(config.headers)}) \n`);
    if (!config.headers.Authorization) {
        throw new RNBlueLibraryError(RNBlueLibraryError.TOKEN_NOT_AVAILABLE);
        return;
    }
    return config;
};

const initAPI = () => {

    // need to fix interceptRequest do any of the axios inits

    if (!axiosInstance) {
        axiosInstance = axios.create({});
        axiosInstance.defaults.timeout = 10000;
        axiosInstance.interceptors.request.use(interceptRequest);
    }
};
module.exports.initAPI = initAPI;

const setHostUrl = (environment = '') => {
    initAPI();
    baseUrl = (environment === 'production') ? productionBaseURL : bluebaseURL;
    axiosInstance.defaults.baseURL = baseUrl;// + 'api/';

    console.log("RentlyBlueApi - setting host url to: " + baseUrl);
};
module.exports.setHostUrl = setHostUrl;

const checkHostUrl = () => {
    const {defaults: {baseURL} = {}} = axiosInstance || {};
    console.log('---- checkHostUrl : ', baseURL);
    if (baseURL) {
        return Promise.resolve();
    } else {
        return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.HOST_NOT_FOUND));
    }
};
module.exports.checkHostUrl = checkHostUrl;

const checkAuthError = (device,error) => {
    return isAuthError(error)
        .then((error) => {
            console.log('==== isAuthError ', error);
            return getNewDeviceToken(device,error);
        });
};

const isAuthError = (error) => {
    const {response: {status} = {}} = error;
    //console.log('==== isForbidden: ', (status === 403));
    const isAuthError = (status === 401);
    if (isAuthError) {
        return Promise.resolve(error);
    } else {
        return Promise.reject(error);
    }
};

const getNewDeviceToken = (dev,error) => {
    const {
        config: {
            headers: {
                Authorization = '',
            } = {},
        } = {}
    } = error;

    if (Authorization) {
        //let dev = Device.getDeviceByToken(Authorization);
        if (dev) {
            return dev.getToken(dev.lockMac)
                .then((resp) => {
                    const {accessToken = '', expiresAt = ''} = resp;
                    if (accessToken) {
                        dev.deviceAuthToken = accessToken;
                        dev.tokenExpiresAt = expiresAt;
                        return Promise.resolve(accessToken);
                    } else {
                        return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.FAILED_TO_FETCH_TOKEN));
                    }
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        } else {
            return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.FAILED_TO_FETCH_TOKEN));
        }
    } else {
        return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.FAILED_TO_FETCH_TOKEN));
    }

};

//----------- getEkey -----------
const getEkeySuccess = (deviceToken) => {
    const URL = `keys/getKey`;
    return axiosInstance({
        method: 'get',
        headers: {'Authorization': `Bearer ${deviceToken}`},
        url: URL,
    })
        .then((response) => {
            if (response.data) {
                const {success = true, message, ...data} = response.data;
                const {key = {}} = data;

                if (success) {
                    return Promise.resolve(key);
                } else {
                    return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.FAILED_TO_GET_PROPER_RESPONSE, message));
                }
            } else {
                return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.EKEY_NOT_AVAILABLE));
            }
        });
};

const getEkey = (device,deviceToken) => {
    return getEkeySuccess(deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling getEkey api with new token ', accessToken);
                    return getEkeySuccess(accessToken);
                })
                .catch((error) => {
                    //console.log('==== final error ', error);
                    return Promise.reject(error);
                });
        });
};
module.exports.getEkey = getEkey;

//----------- getTimeByLockMacSuccess -----------
const getTimeByLockMacSuccess = (lockMac, deviceToken) => {
    const URL = `time?lockMac=${lockMac}`;
    return axiosInstance({
        method: 'get',
        headers: {'Authorization': `Bearer ${deviceToken}`},
        url: URL,
    })
        .then((response) => {
            if (response.data) {
                const {success = true, message, ...data} = response.data;
                if (success) {
                    return Promise.resolve(response.data);
                } else {
                    return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.FAILED_TO_GET_PROPER_RESPONSE, message));
                }
            } else {
                return Promise.reject(new RNBlueLibraryError(RNBlueLibraryError.FAILED_TO_GET_PROPER_RESPONSE, 'invalid time'));
            }
        });
};

const getTimeByLockMac = (device, lockMac, deviceToken) => {
    return getTimeByLockMacSuccess(lockMac, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling getTimeByLockMac api with new token ', accessToken);
                    return getTimeByLockMacSuccess(lockMac, accessToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.getTimeByLockMac = getTimeByLockMac;

//----------- initDahaoLock -----------
const initDahaoLockSuccess = (deviceID, deviceToken) => {
    const URL = `keys/initV3Lock?device_id=${deviceID}`;
    return axiosInstance({
        method: 'get',
        headers: {'Authorization': `Bearer ${deviceToken}`},
        url: URL,
    })
        .then((response) => {
            return Promise.resolve(response.data)
        });
};

const initDahaoLock = (device, deviceID, deviceToken) => {
    return initDahaoLockSuccess(deviceID, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling initDahaoLock api with new token ', accessToken);
                    return initDahaoLockSuccess(deviceID, accessToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.initDahaoLock = initDahaoLock;


//----------- updateLock -----------
const updateLockSuccess = (lockInfo, deviceToken) => {
    const {lockMac,...rest} = lockInfo;
    const URL = `locks/${lockMac}`;
    let params = {
        ...rest
    };
    return axiosInstance({
        method: 'put',
        headers: {'Content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${deviceToken}`},
        url: URL,
        params: params
    })
        .then((response) => {
            return Promise.resolve(response.data)
        });
};

const updateLock = (device, lockInfo, deviceToken) => {
    console.log('==== updateLock : ', lockInfo);
    return updateLockSuccess(lockInfo, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling updateLock api with new token ', accessToken);
                    return updateLockSuccess(lockInfo, accessToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.updateLock = updateLock;


//----------- deleteLock -----------
const deleteLockSuccess = (lockMac, deviceToken) => {
    const URL = `locks/${lockMac}`;
    return axiosInstance({
        method: 'delete',
        headers: {'Authorization': `Bearer ${deviceToken}`},
        url: URL,
    })
        .then((response) => {
            return Promise.resolve(response.data)
        });
};

const deleteLock = (device, lockMac, deviceToken) => {

    return deleteLockSuccess(lockMac, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling deleteLock api with new token ', accessToken);
                    return deleteLockSuccess(lockMac, accessToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.deleteLock = deleteLock;

//----------- createLock -----------
const createLockSuccess = (deviceInfo, deviceToken) => {
    let URL = `locks?`;
    let params = {
        lockMac: deviceInfo.lockMac,
        adminPs: deviceInfo.adminPs,
        masterCode: deviceInfo.masterCode,
        battery: deviceInfo.battery,
        modelNum: deviceInfo.modelNum,
        hardwareVer: deviceInfo.hardwareVer,
        firmwareVer: deviceInfo.firmwareVer,
        startDate: 0,
        endDate: 0,
        userType: deviceInfo.userType,
        keyStatus: deviceInfo.keyStatus
    }
    switch (deviceInfo.lockType) {
        case lockType.V3LOCK: {
            params.timezoneOffset = deviceInfo.timezoneOffset;
            params.plainPsw = deviceInfo.plainPsw;
            params.lockType = deviceInfo.lockType;
            params.V3LockDeviceId = deviceInfo.deviceID;
            break;
        }
        case lockType.V2LOCK: {
            params.bleLockName = deviceInfo.bleLockName;
            params.V2LockAlias = deviceInfo.V2LockAlias;
            params.lockKey = deviceInfo.lockKey;
            params.lockFlagPos = deviceInfo.lockFlagPos;
            params.aesKeyStr = deviceInfo.aesKeyStr;
            params.lockVer = JSON.parse(JSON.stringify(deviceInfo.lockVer));
            params.pwdInfo = deviceInfo.pwdInfo
            params.timestamp = deviceInfo.timestamp;
            params.specialValue = deviceInfo.specialValue;
            break;
        }
    }
    return axiosInstance({
        method: 'post',
        headers: {'Content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${deviceToken}`},
        url: URL,
        params: params
    })
        .then((response) => {

            let { data = {} } = response || {};

            data['masterCode'] = params.masterCode;
            return Promise.resolve(data);
        });
}

const createLock = (device, deviceInfo, deviceToken) => {
    return createLockSuccess(deviceInfo, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling createLock api with new token ', accessToken);
                    return createLockSuccess(deviceInfo, accessToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.createLock = createLock;


//----------- addPeriodPasscode -----------
const addPeriodPasscodeSuccess = (codeInfo, deviceToken) => {
    let URL = `codes?`
    let params = {
        name: codeInfo.name,
        createType: codeInfo.createType,
        type: codeInfo.type,
        code: codeInfo.code,
        startAt: codeInfo.startAt,
        endAt: codeInfo.endAt,
        lockMac: codeInfo.lockMac
    }
    return axiosInstance({
        method: 'post',
        headers: {'Content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${deviceToken}`},
        url: URL,
        params: params
    })
        .then((response) => {
            return Promise.resolve(response.data)
        });
}

const addPeriodPasscode = (device, codeInfo, deviceToken) => {
    return addPeriodPasscodeSuccess(codeInfo, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling addPeriodPasscode api with new token ', accessToken);
                    return addPeriodPasscodeSuccess(codeInfo, accessToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.addPeriodPasscode = addPeriodPasscode;

//----------- addFOB -----------
const addFOBSuccess = (fobInfo, deviceToken) => {
    let URL = `fobs?`;
    let params = {
        lockMac: fobInfo.lockMac,
        fobNumber: fobInfo.fobNumber,
        fobName: fobInfo.fobName,
        startDate: fobInfo.startDate,
        endDate: fobInfo.endDate,
        startTime: fobInfo.startTime,
        endTime: fobInfo.endTime,
        cycleType: fobInfo.cycleType
    }
    return axiosInstance({
        method: 'post',
        headers: {'Content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${deviceToken}`},
        url: URL,
        params: params
    })
        .then((response) => {
            return Promise.resolve(response.data)
        });
}

const addFOB = (device, fobInfo, deviceToken) => {
    return addFOBSuccess(fobInfo, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling addFOB api with new token ', accessToken);
                    return addFOBSuccess(fobInfo, accessToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.addFOB = addFOB;

//----------- addCyclicPasscode -----------
const addCyclicPasscodeSuccess = (codeInfo, deviceToken) => {
    let URL = `codes/repeating?`;
    let params = {
        name: codeInfo.name,
        createType: codeInfo.createType,
        type: codeInfo.type,
        code: codeInfo.code,
        startDate: codeInfo.startDate,
        endDate: codeInfo.endDate,
        startTime: codeInfo.startTime,
        endTime: codeInfo.endTime,
        lockMac: codeInfo.lockMac
    }
    console.log('---- params : ', params);
    return axiosInstance({
        method: 'post',
        headers: {'Content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${deviceToken}`},
        url: URL,
        params: params
    })
        .then((response) => {
            return Promise.resolve(response.data)
        });
}

const addCyclicPasscode = (device, codeInfo, deviceToken) => {
    return addCyclicPasscodeSuccess(codeInfo, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling addCyclicPasscode api with new token ', accessToken);
                    return addCyclicPasscodeSuccess(codeInfo, accessToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.addCyclicPasscode = addCyclicPasscode;


//----------- deletePasscode -----------
const deletePasscodeSuccess = (codeId, deviceToken) => {
    const URL = `codes/${codeId}`;
    return axiosInstance({
        method: 'delete',
        headers: {'Authorization': `Bearer ${deviceToken}`},
        url: URL,
    })
        .then((response) => {
            return Promise.resolve(response.data)
        });
}

const deletePasscode = (device, codeId, deviceToken) => {
    return deletePasscodeSuccess(codeId, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling delete Passcode api with new token ', accessToken);
                    return deletePasscodeSuccess(codeId, accessToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.deletePasscode = deletePasscode;

//----------- deleteFOB -----------
const deleteFOBSuccess = (fobId, deviceToken) => {
    const URL = `fobs/${fobId}`;
    return axiosInstance({
        method: 'delete',
        headers: {'Authorization': `Bearer ${deviceToken}`},
        url: URL,
    })
        .then((response) => {
            return Promise.resolve(response.data)
        });
};

const deleteFOB = (device, fobId, deviceToken) => {
    return deleteFOBSuccess(fobId, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling delete fob api with new token ', accessToken);
                    return deleteFOBSuccess(fobId, accessToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.deleteFOB = deleteFOB;

//----------- uploadLogs -----------
const uploadLogsSuccess = (lockMac, records, deviceToken) => {
    const URL = `logs/`;
    const data = {
        lockMac: lockMac,
        records: records,
    };
    console.log('==== uploadLogsSuccess : ', deviceToken, data, URL);
    return axiosInstance({
        method: 'post',
        headers: {'Content-type': 'application/json', 'Authorization': `Bearer ${deviceToken}`},
        url: URL,
        data: data,
    })
        .then((response) => {
            console.log('==== uploadLogsSuccess response ', response.data);
            return Promise.resolve(response.data)
        });
};

const uploadLogs = (device, lockMac, records, deviceToken) => {
    console.log('==== uploadLogs : ', lockMac, records, deviceToken);
    return uploadLogsSuccess(lockMac, records, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling upload Logs api with new token ', accessToken);
                    return uploadLogsSuccess(lockMac, records, accessToken);
                })
                .catch((error) => {
                    console.log('==== uploadLogsSuccess error ', error);
                    return Promise.reject(error);
                });
        });
};
module.exports.uploadLogs = uploadLogs;

//----------- setDeviceTimezone -----------
const setDeviceTimezoneSuccess = (lockMac, timezoneStr, deviceToken) => {
    let URL = `device/setDeviceTimezone?`;
    let params = {
        deviceMac:lockMac,
        timezone:timezoneStr
    }
    console.log('---- params : ', params);
    return axiosInstance({
        method: 'post',
        headers: {'Content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${deviceToken}`},
        url: URL,
        params: params
    })
        .then((response) => {
            return Promise.resolve(response.data)
        });
};

const setDeviceTimezone = (device, lockMac, timezoneStr, deviceToken)  => {
    return setDeviceTimezoneSuccess(lockMac, timezoneStr, deviceToken)
        .catch((error) => {
            return checkAuthError(device,error)
                .then((accessToken) => {
                    console.log('==== calling setDeviceTimezone api with new token ', accessToken);
                    return setDeviceTimezoneSuccess(lockMac, timezoneStr, deviceToken);
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        });
};
module.exports.setDeviceTimezone = setDeviceTimezone;


