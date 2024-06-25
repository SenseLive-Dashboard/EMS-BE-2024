const express = require('express');
const router = express.Router();
const authentication = require('./auth/authentication');
const dashboard = require('./dash/dashboard');


// AUTHENTICATION ROUTES
router.post('/login' , authentication.loginUser);
router.post('/register-company', authentication.register_company);
router.put('/updateCompany/:companyId', authentication.updateCompany);
router.post('/register-user',authentication.register_user);
router.post('/verify', authentication.verifyToken);
router.post('/re-verify-mail', authentication.resendToken);
router.post('/forgot', authentication.forgotPassword);
router.post('/reset-password', authentication.resetPassword);
router.post('/resend-forgot', authentication.resendResetToken);
router.get('/user', authentication.getUserDetails);


// USER PROFILE
router.get('/getUser_Data/:companyId',dashboard.getUser_Data);
router.delete('/delete_user/:personalEmail' , dashboard.delete_user);
router.put('/updateUser/:personalEmail',dashboard.updateUser);
router.put('/updatePassword/:personalEmail', dashboard.updatePassword);
router.get('/getUserById/:userId' , dashboard.getUserById);

// FEEDER
router.get('/getFeederData/:companyId/:parameter' , dashboard.getFeederData);
router.delete('/delete_feeder/:feederId' , dashboard.delete_feeder);
router.put('/editfeeders/:feederId', dashboard.editFeeders);
router.post('/addfeeder', dashboard.addfeeder);


//feeder operations
router.get('/currentoperations/:device_uid',dashboard.currentoperations);
router.get('/getAlertsByFeederId/:feederId' , dashboard.getAlertsByFeederId);


// SHIFTS
router.get('/getDay_Shift/:companyId' , dashboard.getDay_Shift);
router.post('/addShift' , dashboard.addShift);
router.delete('/delete_shift/:shiftCode' , dashboard.delete_shift);
router.put('/editshift/:shiftCode',dashboard.edit_shift);


// ALERTS
router.post('/addAlerts', dashboard.addAlerts);
router.put('/editAlerts/:alertId', dashboard.editAlerts);
router.get('/getAlerts/:companyId' , dashboard.getAlerts);
router.delete('/deleteAlert/:alertId' , dashboard.delete_alerts);


// PARAMETERISED
router.get('/parametersbyinterval/:device_uid/:interval', dashboard.parametersbyinterval);
router.get('/parametersbydate/:device_uid', dashboard.parametersbycustomdate);


//HARMONICS
router.get('/harmonicsbyinterval/:device_uid/:interval', dashboard.harmonicsbyinterval);
router.get('/harmonicsbydate/:device_uid', dashboard.harmonicsbycustomdate);


// OTHERS
router.get('/getArray' , dashboard.getArray);
router.post('/getReportData' , dashboard.getReportData);
// router.get('/live-device-detail/:company' , dashboard.getDeviceDetails);

//CONSUMPTION_PAGE

// router.get('/consumptionWithIntervals/:Uid/:intervals/:shiftCode',dashboard.consumptionForFixIntervals);
// router.get('/consumptionWithCustomIntervals/:startDate/:endDate/:Uid/:shiftCode',dashboard. consumptionForCustomDates);
router.get('/consumptionWithIntervals/:Uid/:intervals/:shiftCodes',dashboard.consumptionForFixIntervals);
router.get('/consumptionWithCustomIntervals/:startDate/:endDate/:Uid/:shiftCodes',dashboard.consumptionForCustomDates);

//quick analysis
router.get('/quickanalysis/:device_uid/:duration',dashboard.quickanalysisPF);
router.get('/quickanalysisch/:device_uid/:duration',dashboard.quickAnalysisCurrentHarmonic);
router.get('/quickanalysisvh/:device_uid/:duration',dashboard.quickAnalysisvoltageHarmonic);
router.get('/highload/:device_uid/:duration',dashboard.quickAnalysishighload);
router.get('/energy/:device_uid/:duration',dashboard.quickAnalysishighenergy);
router.get('/rms/:device_uid/:duration',dashboard.quickAnalysisRMS);
router.get('/currentimbalancing/:device_uid/:duration',dashboard.currentImbalancing);
router.get('/voltageimbalance/:device_uid/:duration',dashboard.voltageImbalancing);


//Overview Page
router.get('/fetchOverview/:device_uid/:timeInterval' , dashboard.fetchOverview);
router.get('/overviewBargraph/:device_uid/:timeInterval' , dashboard.overviewBargraph);
router.get('/overviewPiechart/:companyId/:timeInterval' , dashboard.overviewPiechart);
router.get('/overviewSummary/:companyId' , dashboard.overviewSummary);
router.get('/fetchLatestEntry/:device_uid' , dashboard.fetchLatestEntry);


//feeder Group
router.get('/getFeederGroup/:companyId',dashboard.getFeederGroup);
router.post('/insertFeederGroup',dashboard.postFeederGroup);
router.put('/updateFeederGroup/:feederUid',dashboard.putFeederGroup);
router.delete('/deleteQuery/:groupId',dashboard.deleteFeederGroup);

//power parameters
router.get('/power/:device_uid/:duration',dashboard.powerparameter);


//---------Kaushal------------//
router.get('/feederGetDemandBarGraphByDate/:deviceIds/:startTime/:endTime', dashboard.getActualDemandByDevicesAndRange);
router.get('/feederGetDemandBarGraphByInterval/:deviceIds/:timeInterval', dashboard.getActualDemandByDevicesAndInterval);
router.get('/fetchMaxDemand/:companyId', dashboard.fetchMaxDemand);
router.get('/feederGetKWHByDate/:deviceIds/:startTime/:endTime', dashboard.getKWHByDevicesAndRange);
router.get('/feederGetKWHByInterval/:deviceIds/:timeInterval', dashboard.getKWHByDevicesAndInterval);
router.get('/feederGetKVAHByDate/:deviceIds/:startTime/:endTime', dashboard.getKVAHByDevicesAndRange);
router.get('/feederGetKVAHByInterval/:deviceIds/:timeInterval', dashboard.getKVAHByDevicesAndInterval);
router.get('/feederGetKVARHByDate/:deviceIds/:startTime/:endTime', dashboard.getKVARHByDevicesAndRange);
router.get('/feederGetKVARHByInterval/:deviceIds/:timeInterval', dashboard.getKVARHByDevicesAndInterval);
router.get('/getTodayKWHForFeeders/:deviceIds', dashboard.getKWHForToday);
router.get('/getYesterdayKWHForFeeders/:deviceIds', dashboard.getKWHForYesterday);
router.get('/getThisMonthKWHForFeeders/:deviceIds', dashboard.getKWHForThisMonth);
router.get('/getPowerParamtersFeeders/:deviceIds', dashboard.getSumOfLatestValues);

//tod
router.post('/todReport' , dashboard.todReport);


module.exports = router;
