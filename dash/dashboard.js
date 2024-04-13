const db = require('../db');
const bcrypt = require('bcrypt');
// const auth = require('../auth/authentication');


// TOOLS MODULE

// USER PROFILE
function getUser_Data(req, res) {
  const companyId = req.params.companyId;
  const getUserDetailsQuery = `SELECT * FROM ems_schema.ems_user_info WHERE "companyId" = $1`;
  
  db.query(getUserDetailsQuery, [companyId], (getUserDetailsError, getUserDetailsResult) => {
    if (getUserDetailsError) {
      
      return res.status(401).json({ message: 'Error while Fetching Data', error: getUserDetailsError });
    }

    if (getUserDetailsResult.rows.length === 0) {
      return res.status(404).json({ message: 'No data Found' });
    }

    res.json({ getUser_Data: getUserDetailsResult.rows });
  });
}
  
function delete_user(req, res) {
  const personalEmail = req.params.personalEmail;

  const checkUserQuery = `SELECT * FROM ems_schema.ems_user_info WHERE "personalEmail" = $1`;
  db.query(checkUserQuery, [personalEmail], (checkError, checkResult) => {
    if (checkError) {
        res.status(500).json({ message: 'Error while checking user', error: checkError });
    }

    if (checkResult.rows.length === 0) {
        res.status(404).json({ message: 'User Not Found' });
    }

    const deleteUserQuery = `DELETE FROM ems_schema.ems_user_info WHERE "personalEmail" = $1`;
    db.query(deleteUserQuery, [personalEmail], (deleteError, deleteResult) => {
      if (deleteError) {
        return res.status(500).json({ message: 'Error while deleting user', error: deleteError });
      }

      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ message: 'User Not Found' });
      }

      res.status(200).json({ message: 'User Deleted Successfully' });
    });
  });
}

function updateUser (req,res){

  const personalEmail=req.params.personalEmail;
  const {userName,firstName,lastName,contactNo,shift,designation,plant,privileges}=req.body;

  const updateQuery=`UPDATE ems_schema.ems_user_info SET
    "userName"=$1,"firstName"=$2,"lastName"=$3,"contactNo"=$4,shift=$5, designation=$6,plant=$7,privileges=$8 WHERE "personalEmail"=$9`;

  db.query(updateQuery,[
    userName,
    firstName,
    lastName,
    contactNo,
    shift,
    designation,
    plant,
    privileges,
    personalEmail
    ],(error)=>{
    if(error){
      console.error('Error updating user data:',error);
      return res.status(404).send('error occured');
    }
  });
}

function updatePassword(req, res){
  const {password} = req.body;
  const personalEmail = req.params.personalEmail;

  const updatePasswordQuery = `UPDATE ems_schema.ems_user_info SET password = $1 WHERE "personalEmail" = $2`;

  bcrypt.hash(password , 10 , (hashError, hashedPassword) => {
    if(hashError){
      console.log(hashError);
      return res.status(402).json({message : "error while hashing password"});
    }
    db.query(updatePasswordQuery, [hashedPassword, personalEmail], (updatePasswordError, updatePasswordResult) =>{
      if(updatePasswordError){
        console.log(updatePasswordError);
        return res.status(401).json({message : 'error while updating password'});
      }
      res.status(200).json({message : 'password updated successfully'});
    })
  });
}

//getUserById
function getUserById(req, res) {
  const userId = req.params.userId;
  const getUserByIdQuery = ` SELECT ui.*, ci.*
  FROM ems_schema.ems_user_info ui
  JOIN ems_schema.ems_company_info ci ON ui."companyId" = ci."companyId"
  WHERE ui."userId" = $1;`;
  
  db.query((getUserByIdQuery), [userId], (getUserByIdError, getUserByIdResult) => {
    if (getUserByIdError) {
      
      return res.status(401).json({ message: 'Error while Fetching User Data ', error: getUserByIdError });
    }

    if (getUserByIdResult.rows.length === 0) {
      return res.status(404).json({ message: 'No data Found' });
    }

    res.json({ getUserById: getUserByIdResult.rows });
  });
}

// FEEDER PAGE

//get user information from feder
function getFeederData(req, res) {
  const companyId = req.params.companyId; 
  const getFeederQuery = 'SELECT * FROM ems_schema.ems_feeder WHERE "companyId" = $1';
  
  db.query(getFeederQuery, [companyId], (getFeederError, getFeederResult) => {
    if (getFeederError) {
      return res.status(500).json({ message: 'Error while fetching data', error: getFeederError });
    }

    if (getFeederResult.rows.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.json({ getFeederData: getFeederResult.rows });
  });
}
  
//delete feeder details  

function delete_feeder(req, res)
 {
  const feederId = req.params.feederId;

  const checkFeederQuery = 'SELECT * FROM ems_schema.ems_feeder WHERE "feederId" = $1';
  db.query(checkFeederQuery, [feederId], (checkError, checkResult) => {
    if (checkError) {
      console.error('Error while checking feeder:', checkError); 
      return res.status(500).json({ message: 'Error while checking feeder', error: checkError });
    }

    if (checkResult.rows.length === 0) {
    
      return res.status(404).json({ message: 'Feeder Not Found' });
    }

    const deleteFeederQuery = 'DELETE FROM ems_schema.ems_feeder WHERE "feederId" = $1';
    db.query(deleteFeederQuery, [feederId], (deleteError, deleteResult) => {
      if (deleteError) {
        console.error('Error while deleting feeder:', deleteError);
        return res.status(500).json({ message: 'Error while deleting feeder', error: deleteError });
      }

      if (deleteResult.rowCount === 0) {
        console.log('Feeder not found during delete:', feederId); 
        return res.status(404).json({ message: 'Feeder Not Found' });
      }

     
      return res.status(200).json({ message: 'Feeder Deleted Successfully' });
    });
  });
}

//update any information in feeder

function editFeeders(req, res) {
  const { feederUid, name, location, virtualGroupName, thresholdValue, action } = req.body;
  const feederId = req.params.feederId;

  const feederCheckQuery = 'SELECT * FROM ems_schema.ems_feeder WHERE "feederId" = $1';

  db.query(feederCheckQuery, [feederId], (error, feederCheckResult) => {
    if (error) {
      console.error('Error during feeder check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (feederCheckResult.rows.length === 0) 
      {
      
        return res.status(404).json({ message: 'Feeder not found!' });
      }

      const updateFeederQuery = `UPDATE ems_schema.ems_feeder 
        SET "feederUid" = $1, "name" = $2, "location" = $3, "virtualGroupName" = $4, 
        "thresholdValue" = $5, "action" = $6
        WHERE "feederId" = $7`;

      const updateValues = [feederUid, name, location, virtualGroupName, thresholdValue, action, feederId];

  

      db.query(updateFeederQuery, updateValues, (updateError) => {
        if (updateError)
         {
          console.error('Error updating feeder:', updateError);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Feeder Updated Successfully' });
      });
    } 
    catch (error) 
    {
      console.error('Error updating feeder:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

  //add feeder details
function addfeeder(req, res) {
 
  const { feederUid, name, location, groupName, virtualGroupName, thresholdValue, action, companyId } = req.body;

  const addfeederQuery = `
    INSERT INTO ems_schema.ems_feeder 
    ("feederUid", "name", "location", "groupName", "virtualGroupName", "thresholdValue", "action", "companyId") 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT ("feederId") DO NOTHING
    RETURNING "feederId"`;

  db.query(addfeederQuery, [feederUid, name, location, groupName, virtualGroupName, thresholdValue, action, companyId], (error, result) => {
    if (error) {
      console.error('Error adding feeder:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (result.rows.length > 0) {
      res.json({ message: 'Feeder added successfully', feederId: result.rows[0].feederId });
    } 
  });
}

function generateId() {
  const IdLength = 10;
  let Id = '';

  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < IdLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    Id += characters.charAt(randomIndex);
  }
  return Id;
}


//   SHIFTS PAGE 
function addShift(req,res){
  // const shiftCode = auth.generateId();
  const shiftCode = generateId();
  const { startTime, endTime, totalDuration, companyId, shiftName} = req.body;
  const getDayShiftQuery = `SELECT * FROM ems_schema.ems_day_shift WHERE "shiftCode" = $1`;
  const insertShiftQuery  = `INSERT INTO ems_schema.ems_day_shift ("shiftCode", "startTime", "endTime", "totalDuration", "companyId", "shiftName") VALUES($1,$2,$3,$4,$5,$6)`;

  db.query(getDayShiftQuery, [shiftCode], (getError, getResult) => {
    if (getError){
        return res.status(401).json({ message: 'Error while Fetching Data', error: getError });
    }
    if (getResult.rows.length > 0) {
        return res.status(404).json({ message: 'Shift already exists!' });
    }else{
      db.query(insertShiftQuery , [shiftCode, startTime, endTime, totalDuration,companyId,shiftName] , (insertError , insertResult) =>{
        if(insertError){
          console.log(insertError);
          return res.status(402).json({message:'Error while inserting data',insertError});
        }
        return res.status(200).json({message:'Shift added successfully'});
      });
    }
  });
}
 
  
function getDay_Shift(req, res) {
  const companyId = req.params.companyId;
  const getDayShiftQuery = `SELECT * FROM ems_schema.ems_day_shift WHERE "companyId"=$1`;
  
  db.query(getDayShiftQuery, [companyId], (getError, getResult) => {
    if (getError) {       
      return res.status(401).json({ message: 'Error while Fetching Data', error: getError });
    } 
    if (getResult.rows.length === 0) {
      return res.status(404).json({ message: 'No data Found' });
    } 
    res.json({ getDay_Shift : getResult.rows });
  });
}
  
  
function delete_shift(req, res) {
  const shiftCode = req.params.shiftCode;

  const checkShiftQuery = `SELECT * FROM ems_schema.ems_day_shift WHERE "shiftCode" = $1`;
  const deleteShiftQuery = `DELETE FROM ems_schema.ems_day_shift WHERE "shiftCode" = $1`;

  db.query(checkShiftQuery, [shiftCode], (checkError, checkResult) => {
    if (checkError) {
        res.status(500).json({ message: 'Error while checking shifts', error: checkError });
    }

    if (checkResult.rows.length === 0) {
        res.status(404).json({ message: 'Shift Not Found' });
    }else{
      db.query(deleteShiftQuery, [shiftCode], (deleteError, deleteResult) => {
        if (deleteError) {
            res.status(500).json({ message: 'Error while deleting shift', error: deleteError });
        }
  
        if (deleteResult.rowCount === 0) {
            res.status(404).json({ message: 'Shift Not Found' ,deleteError});
        }
  
          res.status(200).json({ message: 'Shift deleted successfully' });
      });
    }
  });
}  

function edit_shift(req,res) {
    const shiftCode = req.params.shiftCode;
    const { startTime, endTime, totalDuration, shiftName} = req.body;

    const checkShiftQuery = `SELECT * FROM ems_schema.ems_day_shift WHERE "shiftCode" = $1`;
    const editshiftQuery = `UPDATE ems_schema.ems_day_shift SET "startTime" = $2, "endTime" = $3, "totalDuration" =$4, "shiftName"=$5 WHERE "shiftCode" = $1`;

    db.query(checkShiftQuery, [shiftCode], (checkError, checkResult) => {
      if (checkError) {
         res.status(500).json({ message: 'Error while checking shifts', error: checkError });
      }
  
      if (checkResult.rows.length === 0) {
         res.status(404).json({ message: 'Shift Not Found' });
      }else{
        db.query(editshiftQuery,[shiftCode, startTime, endTime, totalDuration, shiftName],
          (editerror,editresult) => {
              if(editerror){
                  return res.status(401).json({message:'Error updating data',editerror});
              }
              return res.status(200).json({ message: 'Shift updated successfully' });
      })
      }
    })
}

//   ALERTS AND EVENTS PAGE

function addAlerts(req,res){
  const { name , feederName , parameter , condition , threshold , repeat , startTime , endTime , message , userName ,companyId , action} = req.body;

  const insertQuery = `
  INSERT INTO ems_schema.ems_alerts 
  ("name", "feederName", "parameter", "condition", "threshold", "repeat", "startTime", "endTime", "message", "userName", "companyId") 
  VALUES ($1, $2, $3, $4, $5, $6, TO_TIMESTAMP($7 , 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP($8, 'YYYY-MM-DD HH24:MI:SS'), $9, $10 , $11)
`;
  
  const alertId =  generateId();
  db.query(insertQuery , [name , feederName , parameter , condition , threshold , repeat , startTime , endTime , message , userName ,companyId ] , (insertError , insertResult) =>{
    if(insertError){
      console.log(insertError);
      return res.status(402).json({message:'Error while inserting data',insertError});
    }
    res.status(200).json({message:' Alert added successfully'});
  });
}


function editAlerts(req, res) {
  const alertId = req.params.alertId;
  const { name, feederName, parameter, condition, threshold, repeat, startTime, endTime, message, userName, companyId } = req.body;

  const deviceCheckQuery = `SELECT * FROM ems_schema.ems_alerts WHERE "alertId" = $1`;
  db.query(deviceCheckQuery, [alertId], (deviceCheckError, deviceCheckResult) => {
    if (deviceCheckError) {
      console.log(deviceCheckError);
      return res.status(401).json({ message: 'Error while checking Alerts', deviceCheckError });
    }
    if (deviceCheckResult.length === 0) {
      return res.status(404).json({ message: 'Alert not found!', deviceCheckResult });
    }

    const devicesQuery = `UPDATE ems_schema.ems_alerts SET "name" = $1, "feederName" = $2, "parameter" = $3, "condition" = $4, "threshold" = $5, "repeat" = $6, "startTime" = TO_TIMESTAMP($7, 'YYYY-MM-DD HH24:MI:SS'), "endTime" = TO_TIMESTAMP($8, 'YYYY-MM-DD HH24:MI:SS'), "message" = $9, "userName" = $10, "companyId" = $11 WHERE "alertId" = $12`;

    db.query(devicesQuery, [name, feederName, parameter, condition, threshold, repeat, startTime, endTime, message, userName, companyId, alertId], (updateError, updateResult) => {
      if (updateError) {
        console.log(updateError);
        return res.status(401).json({ message: 'Error during updating alert', updateError });
      }
      if (updateResult.rowCount === 0) {
        return res.status(404).json({ message: 'Alert not found!' });
      }
      res.status(200).json({ message: 'Alerts Updated Successfully' });
    });
  });
}


function getAlerts(req, res) {
  const companyId = req.params.companyId;
  const getAlertsQuery = `SELECT * FROM ems_schema.ems_alerts WHERE "companyId" = $1`;
  
  db.query(getAlertsQuery, [companyId], (getError, getResult) => {
    if (getError) {
      
      return res.status(401).json({ message: 'Error while Fetching Data', error: getError });
    }

    if (getResult.rows.length === 0) {
      return res.status(404).json({ message: 'No data Found' });
    }

    res.json({ getAlerts : getResult.rows });
  });
}

function getAlertsByFeederId(req, res) {
  let feederIds = req.params.feederId;
  if (typeof feederIds === 'string') {
    feederIds = feederIds.split(',');
  }
  
  const getAlertsQuery = `SELECT * FROM ems_schema.ems_alerts WHERE "feederName" = ($1)`;
  
  const executeQueries = (feederId) => {
    return new Promise((resolve, reject) => {
      db.query(getAlertsQuery, [feederId], (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows);
      });
    });
  };
  

  if (Array.isArray(feederIds)) {
    Promise.all(feederIds.map((feederId) => executeQueries(feederId)))
      .then((results) => {
        res.json({ getAlerts : results.flat() });
      })
      .catch((error) => {
        res.status(404).json(error);
      });
  } else {
    executeQueries(feederIds)
      .then((result) => {
        res.json({ getAlerts : result });
      })
      .catch((error) => {
        res.status(404).json(error);
    });
  }  
}
  
function delete_alerts(req, res) {
  const alertId = req.params.alertId;

  const checkAlertQuery = `SELECT * FROM ems_schema.ems_alerts WHERE "alertId" = $1`;
  db.query(checkAlertQuery, [alertId], (checkError, checkResult) => {
    if (checkError) {
      return res.status(401).json({ message: 'Error while checking Alerts', error: checkError });
    }

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Alert Not Found' });
    }
    
    const deleteAlertQuery = `DELETE FROM ems_schema.ems_alerts WHERE "alertId" = $1`;
    db.query(deleteAlertQuery, [alertId], (deleteError, deleteResult) => {
      if (deleteError) {
        return res.status(500).json({ message: 'Error while deleting Alert', error: deleteError });
      }

      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ message: 'Alert Not Found' ,deleteError});
      }

      return res.status(200).json({ message: 'Alert Deleted Successfully' });
    });
  });
}

// PARAMETERISED PAGE

function parametersbyinterval(req, res) {
  const device_uid = req.params.device_uid;
  const timeInterval = req.params.interval;

  if (!device_uid || !timeInterval) {
  return res.status(400).json({ message: 'Invalid device ID or time interval' });
  } 

  let duration, bucket_interval;
  switch (timeInterval) {

    case '12hour':
      duration = '12 hours';
      bucket_interval = '10';    //10min
      break;
    case 'day':
      duration = '1 day';
      bucket_interval = '30';   //30min
      break;
    case 'week':
      duration = '7 days';
      bucket_interval = '60';   //1hr=60min
      break;
    case 'month':
      duration = '30 days';
      bucket_interval = '240';   //4hr=4*60
      break;
    case '6months':
      duration = '6 months';
      bucket_interval = '480';   //8hr=8*60
      break;
    case '1year':
      duration = '1 year';
      bucket_interval = '1440';   //24hr=24*60
      break; 
    case '2year':
      duration = '2 year';
      bucket_interval = '1440';    //24hr=24*60
      break; 
    default:
      return res.status(400).json({ message: 'Invalid time interval' });
    }

    const fetchdataquery = `SELECT
    TO_CHAR(date_trunc('hour', date_time) 
        + (EXTRACT(MINUTE FROM date_time)::int / ${bucket_interval} * INTERVAL '${bucket_interval} minutes'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS bucket_start,
    ROUND(AVG("kva"), 2) AS avg_kva,
    ROUND(AVG("kw"), 2) AS avg_kw,
    ROUND(AVG("kvar"), 2) AS avg_kvar,
    ROUND(AVG("voltage_12"), 2) AS avg_voltage_12,
    ROUND(AVG("voltage_23"), 2) AS avg_voltage_23,
    ROUND(AVG("voltage_31"), 2) AS avg_voltage_31,
    ROUND(AVG("voltage_l"), 2) AS avg_vl,
    ROUND(AVG("voltage_1n"), 2) AS avg_voltage_1n,
    ROUND(AVG("voltage_2n"), 2) AS avg_voltage_2n,
    ROUND(AVG("voltage_3n"), 2) AS avg_voltage_3n,
    ROUND(AVG("voltage_n"), 2) AS avg_vn,
    ROUND(AVG("current_1"), 2) AS avg_current_1,
    ROUND(AVG("current_2"), 2) AS avg_current_2,
    ROUND(AVG("current_3"), 2) AS avg_current_3,
    ROUND(AVG("current"), 2) AS avg_c,
    ROUND(AVG("pf"), 2) AS avg_pf
  FROM
    ems_schema.ems_actual_data
  WHERE
    device_uid = $1
    AND date_time >= NOW() - INTERVAL '${duration}'
  GROUP BY
    bucket_start
  ORDER BY
    bucket_start;`

  db.query(fetchdataquery,[device_uid],(dataerror, dataresult) => {
    if (dataerror) {
      console.log(fetchdataquery);
      return res.status(401).json({ message: 'Error fetching data', dataerror });
    }  
    return res.status(200).json(dataresult.rows);
    // const total_buckets = dataresult.rows.length;
    // return res.status(200).json({ total_buckets: total_buckets, data: dataresult.rows, });
  });
}

function parametersbycustomdate(req, res) {
  const device_uid = req.params.device_uid;
  const startdate = new Date(req.query.startdate); 
  const enddate = new Date(req.query.enddate);
  const durationHours = Math.abs(enddate - startdate) / 36e5;

  if (!device_uid || !startdate || !enddate) {
    return res.status(400).json({ message: 'Invalid device ID, start date or end date' });
  }
  
  let bucketInterval;
  switch (true) {
    case durationHours <= 12:
      bucketInterval = '10'; // 10 minutes
      break;
    case durationHours <= 24:
      bucketInterval = '30'; // 30 minutes
      break;
    case durationHours <= 7 * 24:
      bucketInterval = '60'; // 1 hour
      break;
    case durationHours <= 30 * 24:
      bucketInterval = '240'; // 4 hours
      break;
    case durationHours <= 6 * 30 * 24:
      bucketInterval = '480'; // 8 hours
      break;
    default:
      bucketInterval = '1440'; // 24 hours
  }


  const databydatequery = `
  SELECT
  TO_CHAR(date_trunc('hour', date_time) 
  + (EXTRACT(MINUTE FROM date_time)::int / ${bucketInterval} * INTERVAL '${bucketInterval} minutes'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS bucket_start, 
  ROUND(AVG("kva"), 2) AS avg_kva,
  ROUND(AVG("kw"), 2) AS avg_kw,
  ROUND(AVG("kvar"), 2) AS avg_kvar,
  ROUND(AVG("voltage_12"), 2) AS avg_voltage_12,
  ROUND(AVG("voltage_23"), 2) AS avg_voltage_23,
  ROUND(AVG("voltage_31"), 2) AS avg_voltage_31,
  ROUND(AVG("voltage_l"), 2) AS avg_vl,
  ROUND(AVG("voltage_1n"), 2) AS avg_voltage_1n,
  ROUND(AVG("voltage_2n"), 2) AS avg_voltage_2n,
  ROUND(AVG("voltage_3n"), 2) AS avg_voltage_3n,
  ROUND(AVG("voltage_n"), 2) AS avg_vn,
  ROUND(AVG("current_1"), 2) AS avg_current_1,
  ROUND(AVG("current_2"), 2) AS avg_current_2,
  ROUND(AVG("current_3"), 2) AS avg_current_3,
  ROUND(AVG("current"), 2) AS avg_c,
  ROUND(AVG("pf"), 2) AS avg_pf          
  FROM
      ems_schema.ems_actual_data
  WHERE
      device_uid = $1
      AND date_time >= TO_TIMESTAMP($2, 'YYYY/MM/DD')
      AND date_time <= TO_TIMESTAMP($3, 'YYYY/MM/DD')
  GROUP BY
      bucket_start
  ORDER BY
      bucket_start`;

  db.query(databydatequery,[device_uid,startdate,enddate],(dataerror, dataresult) => {
    if (dataerror) {
      return res.status(401).json({ message: 'Error fetching data', dataerror });
    }  
    return res.status(200).json(dataresult.rows);

  });
  
}  

//HARMONICS
function harmonicsbyinterval(req, res) {
  const device_uid = req.params.device_uid;
  const timeInterval = req.params.interval;

  if (!device_uid || !timeInterval) {
  return res.status(400).json({ message: 'Invalid device ID or time interval' });
  }

  let duration, bucket_interval;
  switch (timeInterval) {

    case '12hour':
      duration = '12 hours';
      bucket_interval = '10';    //10min
      break;
    case 'day':
      duration = '1 day';
      bucket_interval = '30';   //30min
      break;
    case 'week':
      duration = '7 days';
      bucket_interval = '60';   //1hr=60min
      break;
    case 'month':
      duration = '30 days';
      bucket_interval = '240';   //4hr=4*60
      break;
    case '6months':
      duration = '6 months';
      bucket_interval = '480';   //8hr=8*60
      break;
    case '1year':
      duration = '1 year';
      bucket_interval = '1440';   //24hr=24*60
      break; 
    case '2year':
      duration = '2 year';
      bucket_interval = '1440';    //24hr=24*60
      break; 
    default:
      return res.status(400).json({ message: 'Invalid time interval' });
    }

    const fetchdataquery = `SELECT
    TO_CHAR(date_trunc('hour', date_time) 
    + (EXTRACT(MINUTE FROM date_time)::int / ${bucket_interval} * INTERVAL '${bucket_interval} minutes'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS bucket_start,
        ROUND(AVG("thd_v1n"), 2) AS avg_thd_v1n,
        ROUND(AVG("thd_v2n"), 2) AS avg_thd_v2n,
        ROUND(AVG("thd_v3n"), 2) AS avg_thd_v3n,
        ROUND(AVG("thd_v12"), 2) AS avg_thd_v12,
        ROUND(AVG("thd_v23"), 2) AS avg_thd_v23,
        ROUND(AVG("thd_v31"), 2) AS avg_thd_v31,
        ROUND(AVG("thd_i1"), 2) AS avg_thd_i1,
        ROUND(AVG("thd_i2"), 2) AS avg_thd_i2,
        ROUND(AVG("thd_i3"), 2) AS avg_thd_i3
  FROM
    ems_schema.ems_actual_data
  WHERE
    device_uid = $1
    AND date_time >= NOW() - INTERVAL '${duration}'
  GROUP BY
    bucket_start
  ORDER BY
    bucket_start;`

  db.query(fetchdataquery,[device_uid],(dataerror, dataresult) => {
    if (dataerror) {
      console.log(fetchdataquery);
      return res.status(401).json({ message: 'Error fetching data', dataerror });
    }  
    return res.status(200).json(dataresult.rows);
  });
}

function harmonicsbycustomdate(req, res) {
  const device_uid = req.params.device_uid;
  const startdate = new Date(req.query.startdate); 
  const enddate = new Date(req.query.enddate);
  const durationHours = Math.abs(enddate - startdate) / 36e5;

  if (!device_uid || !startdate || !enddate) {
    return res.status(400).json({ message: 'Invalid device ID, start date or end date' });
  }
  
  let bucketInterval;
  switch (true) {
    case durationHours <= 12:
      bucketInterval = '10'; // 10 minutes
      break;
    case durationHours <= 24:
      bucketInterval = '30'; // 30 minutes
      break;
    case durationHours <= 7 * 24:
      bucketInterval = '60'; // 1 hour
      break;
    case durationHours <= 30 * 24:
      bucketInterval = '240'; // 4 hours
      break;
    case durationHours <= 6 * 30 * 24:
      bucketInterval = '480'; // 8 hours
      break;
    default:
      bucketInterval = '1440'; // 24 hours
  }

  const databydatequery = `
  SELECT
  TO_CHAR(date_trunc('hour', date_time) 
  + (EXTRACT(MINUTE FROM date_time)::int / ${bucketInterval} * INTERVAL '${bucketInterval} minutes'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS bucket_start, 
  ROUND(AVG("thd_v1n"), 2) AS avg_thd_v1n,
  ROUND(AVG("thd_v2n"), 2) AS avg_thd_v2n,
  ROUND(AVG("thd_v3n"), 2) AS avg_thd_v3n,
  ROUND(AVG("thd_v12"), 2) AS avg_thd_v12,
  ROUND(AVG("thd_v23"), 2) AS avg_thd_v23,
  ROUND(AVG("thd_v31"), 2) AS avg_thd_v31,
  ROUND(AVG("thd_i1"), 2) AS avg_thd_i1,
  ROUND(AVG("thd_i2"), 2) AS avg_thd_i2,
  ROUND(AVG("thd_i3"), 2) AS avg_thd_i3

  FROM
      ems_schema.ems_actual_data
  WHERE
      device_uid = $1
      AND date_time >= TO_TIMESTAMP($2, 'YYYY/MM/DD')
      AND date_time <= TO_TIMESTAMP($3, 'YYYY/MM/DD')
  GROUP BY
      bucket_start
  ORDER BY
      bucket_start`;

  db.query(databydatequery,[device_uid,startdate,enddate],(dataerror, dataresult) => {
    if (dataerror) {
      return res.status(401).json({ message: 'Error fetching data', dataerror });
    }  
    return res.status(200).json(dataresult.rows);
  });
  
}

// OTHERS

function getArray(req, res) {
  const ArrayQuery = `
    SELECT column_name
    FROM information_schema.columns 
    WHERE table_name = 'ems_actual_data'
    AND ordinal_position > 4`;

  db.query(ArrayQuery, (getError, getResult) => {
    if (getError) {
      return res.status(401).json({ message: 'Error while Fetching Data', error: getError });
    }

    if (getResult.rows.length === 0) {
      return res.status(404).json({ message: 'No data Found' });
    }

    // Extract values and store in an array
    const dataArray = getResult.rows.map(row => row.column_name);
    
    res.json(dataArray);
  });
}


function getReportData(req, res) {
  const { device_uid, start_time, end_time, parameters } = req.body;

  if (!parameters || !Array.isArray(parameters) || parameters.length === 0) {
    return res.status(400).json({ message: 'Invalid parameters provided' });
  }

  const validParameters = [
    'device_uid', 'date_time', 'voltage_1n', 'voltage_2n', 'voltage_3n', 'voltage_n', 'voltage_12', 'voltage_23', 'voltage_31', 'voltage_l',
    'current_1', 'current_2', 'current_3', 'current', 'kw_1', 'kw_2', 'kw_3',
    'kvar_1', 'kvar_2', 'kvar_3', 'kva_1', 'kva_2', 'kva_3', 'pf_1', 'pf_2', 'pf_3', 'pf',
    'freq', 'kw', 'kvar', 'kva', 'imp_kwh', 'exp_kwh', 'kwh', 'imp_kvarh', 'exp_kvarh', 'kvarh', 'kvah',
    'thd_v1n', 'thd_v2n', 'thd_v3n', 'thd_v12', 'thd_v23', 'thd_v31', 'thd_i1', 'thd_i2', 'thd_i3',
    'max_kw', 'min_kw', 'max_kvar', 'min_kvar', 'max_int_v1n', 'max_int_v2n', 'max_int_v3n', 'max_int_v12',
    'max_int_v23', 'max_int_v31', 'max_kva', 'max_int_i1', 'max_int_i2', 'max_int_i3', 'run_h', 'on_h'
  ];  
  const invalidParameters = parameters.filter(param => !validParameters.includes(param));

  if (invalidParameters.length > 0) {
    return res.status(400).json({ message: `Invalid parameters: ${invalidParameters.join(', ')}` });
  }

  const selectedColumns = parameters.map((param, index) => `${param} AS ${param}`).join(', ');

  try {
    const checkDeviceListQuery = `
      SELECT 1
      FROM ems_schema.ems_actual_data
      WHERE device_uid = $1
      LIMIT 1;
    `;
  
    const fetchDevicesQuery = `
      SELECT ${selectedColumns}
      FROM ems_schema.ems_actual_data
      WHERE device_uid = $1 AND date_time >= $2 AND date_time <= $3
      ORDER BY date_time DESC;
    `;
  
    db.query(checkDeviceListQuery, [device_uid], (checkError, checkResult) => {
      if (checkError) {
        return res.status(401).json({ message: 'Error checking device:', checkError});
      }
  
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Device not found in ems_actual_data table'});
      }
  
      db.query(fetchDevicesQuery, [device_uid, start_time, end_time], (fetchError, fetchResult) => {
        if (fetchError) {
          return res.status(401).json({ message: 'error while fetching devices', fetchError});
        }

        if (fetchResult.rows.length === 0) {
          return res.status(404).json({message : 'No data found for the specified time range or parameters.'})
        }

        return res.json({ device_uid, data: fetchResult.rows });
      });
    });
  } catch (error) {
    console.error('Error in device retrieval:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}  

function getDeviceDetails(req, res) {
  try {
    const Company = req.params.company;


    const deviceDetailsQuery = 'SELECT * FROM ems.ems_devices WHERE company = $1';
    db.query(deviceDetailsQuery, [Company], (deviceDetailsError, deviceDetail) => {
      if (deviceDetailsError) {
        return res.status(401).json({ message: 'Error fetching data:',deviceDetailsError});
      }

      if (deviceDetail.length === 0) {
        return res.status(404).json({ message: 'Device details not found' });
      }

      res.status(200).json(deviceDetail.rows);
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error'});
  }
}

//CONSUMPTION_PAGE
function consumptionForFixIntervals(req,res){
  const intervals=req.params.intervals;
  const device_uid=req.params.Uid;
  const shiftCodes = req.params.shiftCodes.split(',');

  let query;
  let shiftplaceholders;
  switch (intervals){
  case '12hours' :
    shiftplaceholders = shiftCodes.map((_, index) => `$${index + 2}`).join(', ');

      query= `
        SELECT
            device_uid,
            TO_CHAR(DATE_TRUNC('hour', date_time), 'YYYY-MM-DD HH24:MI:SS') AS bucket_start_date,
            "shiftCode", 
            MAX(kwh) - MIN(kwh) AS avg_kwh,
            MAX(kvah) - MIN(kvah) AS avg_kvah,
            MAX(imp_kvarh) - MIN(imp_kvarh) AS avg_imp_kvarh,
            MAX(exp_kvarh) - MIN(exp_kvarh) AS avg_exp_kvarh,
            MAX(kvarh) - MIN(kvarh) AS avg_kvarh
        FROM
            ems_schema.ems_actual_data
        JOIN
            ems_schema.ems_day_shift ON date_time::time BETWEEN "startTime" AND "endTime"
        WHERE
            device_uid = $1
            AND date_time >= CURRENT_TIMESTAMP - INTERVAL '12 HOURS'
            AND "shiftCode" IN (${shiftplaceholders})
        GROUP BY
            device_uid, date_trunc('hour', date_time), "shiftCode" 
        ORDER BY
            bucket_start_date;`;
      break;
    case 'day' :
      shiftplaceholders = shiftCodes.map((_, index) => `$${index + 2}`).join(', ');
      query= `
      SELECT
      device_uid,
      TO_CHAR(DATE_TRUNC('hour', date_time), 'YYYY-MM-DD HH24:MI:SS') AS bucket_start_date,
      "shiftCode", 
      MAX(kwh) - MIN(kwh) AS avg_kwh,
      MAX(kvah) - MIN(kvah) AS avg_kvah,
      MAX(imp_kvarh) - MIN(imp_kvarh) AS avg_imp_kvarh,
      MAX(exp_kvarh) - MIN(exp_kvarh) AS avg_exp_kvarh,
      MAX(kvarh) - MIN(kvarh) AS avg_kvarh
  FROM
      ems_schema.ems_actual_data
  JOIN
      ems_schema.ems_day_shift ON date_time::time BETWEEN "startTime" AND "endTime"
  WHERE
      device_uid = $1
      AND date_time >= CURRENT_TIMESTAMP - INTERVAL '1 DAY'
      AND "shiftCode" IN (${shiftplaceholders})
  GROUP BY
      device_uid, date_trunc('hour', date_time), "shiftCode" 
  ORDER BY
      bucket_start_date;`;
      break;
    case 'week':
      shiftplaceholders = shiftCodes.map((_, index) => `$${index + 2}`).join(', ');
      query= `        
      SELECT
      device_uid,
      bucket_start_date,
      ROUND(AVG(diff_kwh), 2) AS avg_kwh,
      ROUND(AVG(diff_kvah), 2) AS avg_kvah,
      ROUND(AVG(diff_imp_kvarh), 2) AS avg_imp_kvarh,
      ROUND(AVG(diff_exp_kvarh), 2) AS avg_exp_kvarh,
      ROUND(AVG(diff_kvarh), 2) AS avg_kvarh
  FROM (
      SELECT
          device_uid,
          TO_CHAR(DATE_TRUNC('day', date_time), 'YYYY-MM-DD HH24:MI:SS') AS bucket_start_date,
          "shiftCode",
          MAX(kwh) - MIN(kwh) AS diff_kwh,
          MAX(kvah) - MIN(kvah) AS diff_kvah,
          MAX(imp_kvarh) - MIN(imp_kvarh) AS diff_imp_kvarh,
          MAX(exp_kvarh) - MIN(exp_kvarh) AS diff_exp_kvarh,
          MAX(kvarh) - MIN(kvarh) AS diff_kvarh
      FROM
          ems_schema.ems_actual_data
      JOIN
          ems_schema.ems_day_shift ON date_time::time BETWEEN "startTime" AND "endTime"
      WHERE
          device_uid = $1
          AND date_time >= CURRENT_TIMESTAMP - INTERVAL '1 WEEK'
          AND "shiftCode" IN (${shiftplaceholders})
      GROUP BY
          device_uid, bucket_start_date, "shiftCode"
  ) AS diffs
  GROUP BY
      device_uid, bucket_start_date
  ORDER BY
      bucket_start_date;`;
      break;
    case 'month':
      shiftplaceholders = shiftCodes.map((_, index) => `$${index + 2}`).join(', ');
      query= `SELECT
      device_uid,
      bucket_start_date,
      ROUND(AVG(diff_kwh), 2) AS avg_kwh,
      ROUND(AVG(diff_kvah), 2) AS avg_kvah,
      ROUND(AVG(diff_imp_kvarh), 2) AS avg_imp_kvarh,
      ROUND(AVG(diff_exp_kvarh), 2) AS avg_exp_kvarh,
      ROUND(AVG(diff_kvarh), 2) AS avg_kvarh
  FROM (
      SELECT
          device_uid,
          TO_CHAR(DATE_TRUNC('day', date_time), 'YYYY-MM-DD HH24:MI:SS') AS bucket_start_date,
          "shiftCode",
          MAX(kwh) - MIN(kwh) AS diff_kwh,
          MAX(kvah) - MIN(kvah) AS diff_kvah,
          MAX(imp_kvarh) - MIN(imp_kvarh) AS diff_imp_kvarh,
          MAX(exp_kvarh) - MIN(exp_kvarh) AS diff_exp_kvarh,
          MAX(kvarh) - MIN(kvarh) AS diff_kvarh
      FROM
          ems_schema.ems_actual_data
      JOIN
          ems_schema.ems_day_shift ON date_time::time BETWEEN "startTime" AND "endTime"
      WHERE
          device_uid = $1
          AND date_time >= CURRENT_TIMESTAMP - INTERVAL '1 MONTH'
          AND "shiftCode" IN (${shiftplaceholders})
      GROUP BY
          device_uid, bucket_start_date, "shiftCode"
  ) AS diffs
  GROUP BY
      device_uid, bucket_start_date
  ORDER BY
      bucket_start_date;`
  ;
      break;
    case '6month':
      shiftplaceholders = shiftCodes.map((_, index) => `$${index + 2}`).join(', ');
      query= `        SELECT
      device_uid,
      bucket_start_date,
      ROUND(AVG(diff_kwh), 2) AS avg_kwh,
      ROUND(AVG(diff_kvah), 2) AS avg_kvah,
      ROUND(AVG(diff_imp_kvarh), 2) AS avg_imp_kvarh,
      ROUND(AVG(diff_exp_kvarh), 2) AS avg_exp_kvarh,
      ROUND(AVG(diff_kvarh), 2) AS avg_kvarh
  FROM (
      SELECT
          device_uid,
          TO_CHAR(DATE_TRUNC('month', date_time), 'YYYY-MM-DD HH24:MI:SS') AS bucket_start_date,
          "shiftCode",
          MAX(kwh) - MIN(kwh) AS diff_kwh,
          MAX(kvah) - MIN(kvah) AS diff_kvah,
          MAX(imp_kvarh) - MIN(imp_kvarh) AS diff_imp_kvarh,
          MAX(exp_kvarh) - MIN(exp_kvarh) AS diff_exp_kvarh,
          MAX(kvarh) - MIN(kvarh) AS diff_kvarh
      FROM
          ems_schema.ems_actual_data
      JOIN
          ems_schema.ems_day_shift ON date_time::time BETWEEN "startTime" AND "endTime"
      WHERE
          device_uid = $1
          AND date_time >= CURRENT_TIMESTAMP - INTERVAL '6 MONTHS'
          AND "shiftCode" IN (${shiftplaceholders})
      GROUP BY
          device_uid, bucket_start_date, "shiftCode"
  ) AS diffs
  GROUP BY
      device_uid, bucket_start_date
  ORDER BY
      bucket_start_date;`;
      break;
    case 'year':
      shiftplaceholders = shiftCodes.map((_, index) => `$${index + 2}`).join(', ');
      query= `       SELECT
      device_uid,
      bucket_start_date,
      ROUND(AVG(diff_kwh), 2) AS avg_kwh,
      ROUND(AVG(diff_kvah), 2) AS avg_kvah,
      ROUND(AVG(diff_imp_kvarh), 2) AS avg_imp_kvarh,
      ROUND(AVG(diff_exp_kvarh), 2) AS avg_exp_kvarh,
      ROUND(AVG(diff_kvarh), 2) AS avg_kvarh
  FROM (
      SELECT
          device_uid,
          TO_CHAR(DATE_TRUNC('month', date_time), 'YYYY-MM-DD HH24:MI:SS') AS bucket_start_date,
          "shiftCode",
          MAX(kwh) - MIN(kwh) AS diff_kwh,
          MAX(kvah) - MIN(kvah) AS diff_kvah,
          MAX(imp_kvarh) - MIN(imp_kvarh) AS diff_imp_kvarh,
          MAX(exp_kvarh) - MIN(exp_kvarh) AS diff_exp_kvarh,
          MAX(kvarh) - MIN(kvarh) AS diff_kvarh
      FROM
          ems_schema.ems_actual_data
      JOIN
          ems_schema.ems_day_shift ON date_time::time BETWEEN "startTime" AND "endTime"
      WHERE
          device_uid = $1
          AND date_time >= CURRENT_TIMESTAMP - INTERVAL '1 YEAR'
          AND "shiftCode" IN (${shiftplaceholders})
      GROUP BY
          device_uid, bucket_start_date, "shiftCode"
  ) AS diffs
  GROUP BY
      device_uid, bucket_start_date
  ORDER BY
      bucket_start_date;`;
      break;
    case '2year':
      shiftplaceholders = shiftCodes.map((_, index) => `$${index + 2}`).join(', ');
      query= `       SELECT
      device_uid,
      bucket_start_date,
      ROUND(AVG(diff_kwh), 2) AS avg_kwh,
      ROUND(AVG(diff_kvah), 2) AS avg_kvah,
      ROUND(AVG(diff_imp_kvarh), 2) AS avg_imp_kvarh,
      ROUND(AVG(diff_exp_kvarh), 2) AS avg_exp_kvarh,
      ROUND(AVG(diff_kvarh), 2) AS avg_kvarh
  FROM (
      SELECT
          device_uid,
          TO_CHAR(DATE_TRUNC('month', date_time), 'YYYY-MM-DD HH24:MI:SS') AS bucket_start_date,
          "shiftCode",
          MAX(kwh) - MIN(kwh) AS diff_kwh,
          MAX(kvah) - MIN(kvah) AS diff_kvah,
          MAX(imp_kvarh) - MIN(imp_kvarh) AS diff_imp_kvarh,
          MAX(exp_kvarh) - MIN(exp_kvarh) AS diff_exp_kvarh,
          MAX(kvarh) - MIN(kvarh) AS diff_kvarh
      FROM
          ems_schema.ems_actual_data
      JOIN
          ems_schema.ems_day_shift ON date_time::time BETWEEN "startTime" AND "endTime"
      WHERE
          device_uid = $1
          AND date_time >= CURRENT_TIMESTAMP - INTERVAL '2 YEARS'
          AND "shiftCode" IN (${shiftplaceholders})
      GROUP BY
          device_uid, bucket_start_date, "shiftCode"
  ) AS diffs
  GROUP BY
      device_uid, bucket_start_date
  ORDER BY
      bucket_start_date;`;
      break;
    default:
      return res.status(400).json({ message: 'Invalid time interval' });
  }

  const params = [device_uid, ...shiftCodes];

  db.query(query, params, (error, result) => {
    if (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.json({ data: result.rows });
  });
}


function consumptionForCustomDates(req, res) {
  const startDate = new Date(req.params.startDate);
  const endDate = new Date(req.params.endDate);
  const device_uid = req.params.Uid;
  const shiftCodes = req.params.shiftCodes.split(',');

  let query;
  let shiftplaceholders;
  let bucketSize;

  const dateDifference = endDate - startDate;

  if (dateDifference < (30 * 24 * 60 * 60 * 1000)) { 
    bucketSize = 'day';
  } else {
    bucketSize = 'month';
  }

  shiftplaceholders = shiftCodes.map((_, index) => `$${index + 4}`).join(', '); 

  query = `
  SELECT
  device_uid,
  bucket_start_date,
  ROUND(AVG(diff_kwh), 2) AS avg_kwh,
  ROUND(AVG(diff_kvah), 2) AS avg_kvah,
  ROUND(AVG(diff_imp_kvarh), 2) AS avg_imp_kvarh,
  ROUND(AVG(diff_exp_kvarh), 2) AS avg_exp_kvarh,
  ROUND(AVG(diff_kvarh), 2) AS avg_kvarh
FROM (
  SELECT
      device_uid,
      TO_CHAR(DATE_TRUNC('${bucketSize}', date_time), 'YYYY-MM-DD HH24:MI:SS') AS bucket_start_date,
      "shiftCode",
      MAX(kwh) - MIN(kwh) AS diff_kwh,
      MAX(kvah) - MIN(kvah) AS diff_kvah,
      MAX(imp_kvarh) - MIN(imp_kvarh) AS diff_imp_kvarh,
      MAX(exp_kvarh) - MIN(exp_kvarh) AS diff_exp_kvarh,
      MAX(kvarh) - MIN(kvarh) AS diff_kvarh
  FROM
      ems_schema.ems_actual_data
  JOIN
      ems_schema.ems_day_shift ON date_time::time BETWEEN "startTime" AND "endTime"
  WHERE
      device_uid = $1
      AND date_time >= $2::timestamp
      AND date_time <= $3::timestamp
      AND "shiftCode" IN (${shiftplaceholders})
  GROUP BY
      device_uid, DATE_TRUNC('${bucketSize}', date_time), "shiftCode"
) AS diffs
GROUP BY
  device_uid, bucket_start_date
ORDER BY
  bucket_start_date;
`;

  const params = [device_uid, startDate, endDate, ...shiftCodes]; // Adjusted index

  db.query(query, params, (error, result) => {
    if (error) {
      console.error('Error fetching data:', error);
      console.log(query);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.json({ data: result.rows });
  });
}


//OVERVIEW PAGE
function fetchOverview(req, res) {
  const device_uid = req.params.device_uid;
  const timeInterval = req.params.timeInterval;

  const intervalMap = {
    '12hour': '12 HOURS',
    'day': '1 DAY',
    'week': '7 DAYS',
    'month': '1 MONTH'
  };

  const duration = intervalMap[timeInterval]; 

  if (!duration) {
    return res.status(400).json({ message: 'Invalid time interval' });
  }

  const query = `
  WITH interval_1 AS (
    SELECT  
        CASE WHEN MAX(kvarh) - MIN(kvarh) >= 0 THEN MAX(kvarh) - MIN(kvarh) ELSE NULL END AS kvarh_1_lead,
        CASE WHEN MAX(kvarh) - MIN(kvarh) <= 0 THEN MAX(kvarh) - MIN(kvarh) ELSE NULL END AS kvarh_1_lag,
        MAX(kvah) - MIN(kvah) AS kvah_diff_interval_1,
        MAX(kwh) - MIN(kwh) AS kwh_diff_interval_1,
        MAX(max_kva) AS kva_max_interval_1,
        MAX(max_kw) AS kw_max_interval_1,
        ROUND(AVG(pf), 2) as pf_interval_1
    FROM ems_schema.ems_actual_data  
    WHERE device_uid = $1 
    AND date_time >= (CURRENT_TIMESTAMP - INTERVAL '${duration}')
   ),
interval_2 AS (
    SELECT  
        CASE WHEN MAX(kvarh) - MIN(kvarh) >= 0 THEN MAX(kvarh) - MIN(kvarh) ELSE NULL END AS kvarh_2_lead,
        CASE WHEN MAX(kvarh) - MIN(kvarh) <= 0 THEN MAX(kvarh) - MIN(kvarh) ELSE NULL END AS kvarh_2_lag,
        MAX(kvah) - MIN(kvah) AS kvah_diff_interval_2,
        MAX(kwh) - MIN(kwh) AS kwh_diff_interval_2,
        MAX(max_kva) AS kva_max_interval_2,
        MAX(max_kw) AS kw_max_interval_2,
        ROUND(AVG(pf), 2) as pf_interval_2
    FROM ems_schema.ems_actual_data  
    WHERE device_uid = 'SL02202361' 
    AND date_time >= (CURRENT_TIMESTAMP - INTERVAL '${duration}' - INTERVAL '${duration}')
)
SELECT 
    kvarh_1_lead, kvarh_1_lag, kvarh_2_lead, kvarh_2_lag, 
    kvah_diff_interval_1, kvah_diff_interval_2,
    kwh_diff_interval_1, kwh_diff_interval_2,
    kva_max_interval_1, kva_max_interval_2,
    kw_max_interval_1, kw_max_interval_2,
    pf_interval_1, pf_interval_2
FROM 
    interval_1, interval_2; 

  `
  db.query(query, [device_uid], (fetchOverviewError, fetchOverviewResult) => {
    if (fetchOverviewError) {
      return res.status(401).json({ message: 'error while fetching overview data', error: fetchOverviewError });
    }
    res.status(200).json({ fetchOverview: fetchOverviewResult.rows[0]});
  });
}

// function fetchOverview(req, res) {
//   const device_uid = req.params.device_uid;
//   const timeInterval = req.params.timeInterval;

//   const intervalMap = {
//     '12hour': '12 HOURS- 12hours',
//     'day': '1 DAY',
//     'week': '7 DAYS',
//     'month': '1 MONTH'
//   };

//   const duration = intervalMap[timeInterval];

//   if (!duration) {
//     return res.status(400).json({ message: 'Invalid time interval' });
//   }

//   const query = `
//   SELECT device_uid, 
//     CASE WHEN MAX(kvarh) - MIN(kvarh) >= 0 THEN MAX(kvarh) - MIN(kvarh) ELSE NULL END AS kvarh_leading,
//     CASE WHEN MAX(kvarh) - MIN(kvarh) <= 0 THEN MAX(kvarh) - MIN(kvarh) ELSE NULL END AS kvarh_lagging,
//     MAX(kvah) - MIN(kvah) AS kvah_difference,
//     MAX(kwh) - MIN(kwh) AS kwh_difference,
//     MAX(max_kva) AS max_kva,
//     MAX(max_kw) AS max_kw,
//     ROUND(AVG(pf), 2) as pf_difference
//   FROM ems_schema.ems_actual_data
//   WHERE device_uid = $1 AND date_time >= (CURRENT_TIMESTAMP - INTERVAL '${duration}')
//   GROUP BY device_uid;`

//   db.query(query, [device_uid], (fetchOverviewError, fetchOverviewResult) => {
//     if (fetchOverviewError) {
//       return res.status(401).json({ message: 'error while fetching overview data', error: fetchOverviewError });
//     }
//     res.status(200).json({ fetchOverview: fetchOverviewResult.rows[0]});
//   });
// }


// function fetchOverview(req, res) {
//   const device_uid = req.params.device_uid;
//   const timeInterval = req.params.timeInterval;

//   const intervalMap = {
//     '12hour': '12 HOURS',
//     'day': '1 DAY',
//     'week': '7 DAYS',
//     'month': '1 MONTH'
//   };

//   const duration = intervalMap[timeInterval];

//   if (!duration) {
//     return res.status(400).json({ message: 'Invalid time interval' });
//   }

//   // Calculate timestamps for bucket1 (12 hours before the previous 12 hours) and bucket2 (12th hour to 24th hour)
//   const currentTimestamp = new Date();
//   const bucket1StartTimestamp = new Date(currentTimestamp);
//   bucket1StartTimestamp.setHours(currentTimestamp.getHours() - 24); // 24 hours ago
//   const bucket1EndTimestamp = new Date(bucket1StartTimestamp);
//   bucket1EndTimestamp.setHours(bucket1EndTimestamp.getHours() + 12); // 12 hours before the previous 12 hours

//   const bucket2StartTimestamp = new Date(currentTimestamp);
//   bucket2StartTimestamp.setHours(bucket2StartTimestamp.getHours() - 12); // 12 hours ago
//   const bucket2EndTimestamp = new Date(currentTimestamp); // Current timestamp

//   const query = `
//   SELECT device_uid, 
//     CASE WHEN MAX(kvarh) - MIN(kvarh) >= 0 THEN MAX(kvarh) - MIN(kvarh) ELSE NULL END AS kvarh_leading,
//     CASE WHEN MAX(kvarh) - MIN(kvarh) <= 0 THEN MAX(kvarh) - MIN(kvarh) ELSE NULL END AS kvarh_lagging,
//     MAX(kvah) - MIN(kvah) AS kvah_difference,
//     MAX(kwh) - MIN(kwh) AS kwh_difference,
//     MAX(max_kva) AS max_kva,
//     MAX(max_kw) AS max_kw,
//     ROUND(AVG(pf), 2) as pf_difference
//   FROM ems_schema.ems_actual_data
//   WHERE device_uid = $1 
//     AND ((date_time >= $2 AND date_time <= $3) OR (date_time >= $4 AND date_time <= $5))
//   GROUP BY device_uid;`;

//   db.query(query, [device_uid, bucket1StartTimestamp, bucket1EndTimestamp, bucket2StartTimestamp, bucket2EndTimestamp], (fetchOverviewError, fetchOverviewResult) => {
//     if (fetchOverviewError) {
//       return res.status(401).json({ message: 'error while fetching overview data', error: fetchOverviewError });
//     }
//     res.status(200).json({ fetchOverview: fetchOverviewResult.rows[0]});
//   });
// }



// BARGRAPH-OVERVIEW PAGE
function overviewBargraph(req, res) {
  const device_uid = req.params.device_uid;
  const timeInterval = req.params.timeInterval;

  let sql;
  switch (timeInterval) {
    case '12hour':
      sql = `
      SELECT
          DATE_TRUNC('hour', "date_time") AS bucket_date,
          MAX(kvah) - MIN(kvah) AS kvah_difference,
          MAX(kwh) - MIN(kwh) AS kwh_difference
        FROM
          ems_schema.ems_actual_data
        WHERE
          device_uid = $1 AND date_time >= CURRENT_TIMESTAMP - INTERVAL '12 hours'
        GROUP BY
          DATE_TRUNC('hour', "date_time")
        ORDER BY
          DATE_TRUNC('hour', "date_time");
      `;
      break;

    case 'day':
      sql = `
        SELECT
          DATE_TRUNC('hour', "date_time") AS bucket_date,
          MAX(kvah) - MIN(kvah) AS kvah_difference,
          MAX(kwh) - MIN(kwh) AS kwh_difference
        FROM
          ems_schema.ems_actual_data
        WHERE
          device_uid = $1 AND date_time >= CURRENT_TIMESTAMP - INTERVAL '1 day'
        GROUP BY
          DATE_TRUNC('hour', "date_time")
        ORDER BY
          DATE_TRUNC('hour', "date_time");
      `;
      break;

    case 'week':
      sql = `
        SELECT
          DATE("date_time") AS bucket_date,
          MAX(kvah) - MIN(kvah) AS kvah_difference,
          MAX(kwh) - MIN(kwh) AS kwh_difference
        FROM
          ems_schema.ems_actual_data
        WHERE
          device_uid = $1 AND date_time >= CURRENT_TIMESTAMP - INTERVAL '1 week'
        GROUP BY
          DATE("date_time");
      `;
      break;

    case 'month':
      sql = `
        SELECT
          DATE("date_time") AS bucket_date,
          MAX(kvah) - MIN(kvah) AS kvah_difference,
          MAX(kwh) - MIN(kwh) AS kwh_difference
        FROM
          ems_schema.ems_actual_data
        WHERE
          device_uid = $1 AND date_time >= CURRENT_TIMESTAMP - INTERVAL '1 month'
        GROUP BY
          DATE("date_time");
      `;
      break;

    default:
      return res.status(400).json({ message: 'Invalid interval specified' });
  }

  db.query(sql, [device_uid], (bargraphError, bargraphResults) => {
    if (bargraphError) {
      console.error('Error fetching Bargraph data:', bargraphError);
      return res.status(401).json({ message: 'Error fetching  Bargraph data'});
    }
   // console.log(bargraphResults);
    res.json({ data: bargraphResults.rows});
  });
}

// PIECHART-OVERVIEW PAGE
function overviewPiechart(req, res) {
  const timeInterval  = req.params.timeInterval;
  const companyId  = req.params.companyId;

  const intervalMap = {
    '1hour' : '1 hour' , 
    '12hour': '12 hours',
    'day': '1 day',
    'week': '7 days',
    'month': '28 days',
  };

  const duration = intervalMap[timeInterval];

  if (!duration) {
    return res.status(400).json({ message: 'Invalid time interval' });
  }
  const sql = `select MAX(kwh) - MIN(kwh) AS kwh_difference, device_uid  
  from ems_schema.ems_actual_data 
  where date_time >= (CURRENT_TIMESTAMP - interval '${duration}') 
    and device_uid in (select device_uid from ems_schema.ems_feeder 
  where "companyId" = $1)
  group by device_uid ;
  `;

  db.query(sql,[companyId],(piechartError, piechartResult) => {
    if (piechartError) {
      console.error('Error fetching piechart data:', piechartError);
      return res.status(401).json({ message: 'Error While Fetching Piechart data' });
    }
    // console.log(sql);
    res.status(200).json({ data: piechartResult.rows });
  });
}

//SUMMARY-OVERVIEW PAGE
function overviewSummary(req, res) {
  const companyId  = req.params.companyId;
    const summarySql =`WITH feeder_data AS (
      SELECT
          ef."feederUid",
          ef."name" AS "device_name",
          ea."device_uid",
          MAX(CASE WHEN ea.date_time >= CURRENT_DATE AND ea.date_time < CURRENT_DATE + INTERVAL '1 day' THEN ea.kwh ELSE NULL END)-
          MIN(CASE WHEN ea.date_time >= CURRENT_DATE AND ea.date_time < CURRENT_DATE + INTERVAL '1 day' THEN ea.kwh ELSE NULL END) AS max_today,
          MAX(CASE WHEN ea.date_time BETWEEN CURRENT_DATE - INTERVAL '1 day' AND CURRENT_DATE THEN ea.kwh ELSE NULL END) - 
          MIN(CASE WHEN ea.date_time BETWEEN CURRENT_DATE - INTERVAL '1 day' AND CURRENT_DATE THEN ea.kwh ELSE NULL END) AS max_yesterday,
          MAX(CASE WHEN ea.date_time >= DATE_TRUNC('month', CURRENT_DATE) AND ea.date_time < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' THEN ea.kwh ELSE NULL END) - 
          MIN(CASE WHEN ea.date_time >= DATE_TRUNC('month', CURRENT_DATE) AND ea.date_time < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' THEN ea.kwh ELSE NULL END) AS max_this_month,
          MAX(CASE WHEN ea.date_time >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND ea.date_time < DATE_TRUNC('month', CURRENT_DATE) THEN ea.kwh ELSE NULL END) - 
          MIN(CASE WHEN ea.date_time >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND ea.date_time < DATE_TRUNC('month', CURRENT_DATE) THEN ea.kwh ELSE NULL END) AS max_last_month
      FROM
          ems_schema.ems_feeder ef
          JOIN ems_schema.ems_actual_data ea ON ef."feederUid" = ea.device_uid
      WHERE
          ef."companyId" = $1
      GROUP BY
          ef."feederUid", ef."name", ea."device_uid"
  )
  SELECT
      fd."feederUid",
      fd."device_name",
      fd."device_uid",
      COALESCE(fd.max_today::text, 'N/A') AS max_today,
      COALESCE(fd.max_yesterday::text, 'N/A') AS max_yesterday,
      COALESCE(fd.max_this_month::text, 'N/A') AS max_this_month,
      COALESCE(fd.max_last_month::text, 'N/A') AS max_last_month
  FROM
      feeder_data fd;
  `;
  db.query(summarySql,[companyId],(summaryError, summaryResult) => {
    if (summaryError) {
      console.error('Error fetching data:', summaryError);
      return res.status(401).json({ message: 'Error While Fetching Summary data' });
    }
    // console.log(sql);
    res.status(200).json({ data: summaryResult.rows });
  });
}

//SUMMERY LATEST ENTRY
function fetchLatestEntry(req, res) {
  const device_uid  = req.params.device_uid;

  const fetchLatestQuery = `SELECT *
  FROM ems_schema.ems_actual_data
  WHERE device_uid = $1
  ORDER BY date_time DESC
  LIMIT 1;
  `;

  db.query(fetchLatestQuery,[device_uid],(fetchLatestError, fetchLatestResult) => {
    if (fetchLatestError) {
      console.error('Error fetching latest data:', fetchLatestError);
      return res.status(401).json({ message: 'Error While Fetching latest data' });
    }
    // console.log(fetchLatestQuery);
    res.status(200).json({ data: fetchLatestResult.rows });
  });
}

//current
function currentoperations(req, res) {
  const device_uid = req.params.device_uid;

  const now = new Date();

  now.setHours(0, 0, 0, 0);

  const startDate = now.toISOString();

  const currentQuery = `
    SELECT MIN("current") AS min_current,
           MAX("current") AS max_current,
           AVG("current") AS avg_current,
           MIN("voltage_l") AS min_voltage,
           MAX("voltage_l") AS max_voltage,
           AVG("voltage_l") AS avg_voltage,
           MIN("voltage_n") AS min_phvoltage,
           MAX("voltage_n") AS max_phvoltage,
           AVG("voltage_n") AS avg_phvoltage
    FROM ems_schema.ems_actual_data
    WHERE
      date_time >= $1
      AND device_uid = $2;
  `;

  db.query(currentQuery, [startDate, device_uid], (fetchError, fetchResult) => {
    if (fetchError) {
      console.error(fetchError);
      return res.status(401).json({ message: 'Error while fetching minimum, maximum, and average current values' });
    }

    res.status(200).json({data:fetchResult.rows});
  });
}

//power factor

function quickanalysisPF(req, res) {
    const { device_uid } = req.params;
    let duration = req.param.duration; 

    switch (duration) {
      case '12h':
        duration = '12 HOURS';
        break;
      case '1d':
        duration = '1 DAY';
        break;
      case '1w':
        duration = '7 DAYS';
        break;
      default:
        duration = '1 DAY';
        break;
    }

  const powerFactorQuery = ` SELECT
      TO_CHAR(date_trunc('hour', date_time) 
        + (EXTRACT(MINUTE FROM date_time)::int / 30* INTERVAL '30 minutes'), 'YY-MM-DD HH24:MI') AS bucket_start,
      MIN(pf) AS min_power_factor
    FROM
      ems_schema.ems_actual_data
    WHERE
      date_time >= NOW() - INTERVAL '${duration}'
      AND device_uid = $1
    GROUP BY
      bucket_start;`;

  db.query(powerFactorQuery, [device_uid], (fetchError, fetchResult) => {
    if (fetchError) {
      console.error('Error executing query:', fetchError);
      return res.status(401).json({ message: 'Error while fetching power factor values' });
    }

    const result = fetchResult.rows.map(row => ({
      bucket_start: row.bucket_start,
      min_power_factor: row.min_power_factor
    }));

    return res.status(200).json(result);
  });
}

//Current in harmonics highest

function quickAnalysisCurrentHarmonic(req, res) {
  const { device_uid } = req.params;
  let duration = req.params.duration; // Changed from req.param to req.query

  switch (duration) {
    case '12h':
      duration = '12 HOURS';
      break;
    case '1d':
      duration = '1 DAY';
      break;
    case '1w':
      duration = '7 DAYS';
      break;
    default:
      duration = '1 DAY';
      break;
  }

  const harmoniccurrentQuery = `
  SELECT
    TO_CHAR(date_trunc('hour', date_time + (EXTRACT(MINUTE FROM date_time)::int / 30 * INTERVAL '30 minutes')), 'YY-MM-DD HH24:MI') AS bucket_start,
    MAX(thd_i1::numeric) AS i1,
    MAX(thd_i2::numeric) AS i2,
    MAX(thd_i3::numeric) AS i3
  FROM
    ems_schema.ems_actual_data
  WHERE
    date_time >= NOW() - INTERVAL '${duration}'
    AND device_uid = $1
  GROUP BY
    bucket_start;
`;

db.query(harmoniccurrentQuery, [device_uid], (fetchError, fetchResult) => {
  if (fetchError) {
    console.error('Error executing query:', fetchError);
    return res.status(500).json({ message: 'Error while fetching current in harmonic values' });
  }

  const result = fetchResult.rows.map(row => ({
    bucket_start: row.bucket_start,
    HARMONIC_CURRENT_I1: row.i1,
    HARMONIC_CURRENT_I2: row.i2,
    HARMONIC_CURRENT_I3: row.i3
  }));

  res.status(200).json(result);
});
}


//HIGHEST VOLATGE IN HARMONICS

function quickAnalysisvoltageHarmonic(req, res) {
  const { device_uid } = req.params;
  let duration = req.param.duration; // Changed from req.param to req.query

  switch (duration) 
  {
    case '12h':
      duration = '12 HOURS';
      break;
    case '1d':
      duration = '1 DAY';
      break;
    case '1w':
      duration = '7 DAYS';
      break;
    default:
      duration = '1 DAY';
      break;
  }

  const harmonicVOLTAGEQuery = `
  SELECT
    TO_CHAR(date_trunc('hour', date_time + (EXTRACT(MINUTE FROM date_time)::int / 30 * INTERVAL '30 minutes')), 'YY-MM-DD HH24:MI') AS bucket_start,
    MAX(thd_v12::numeric) AS v1,
    MAX(thd_v23::numeric) AS v2,
    MAX(thd_v31::numeric) AS v3
  FROM
    ems_schema.ems_actual_data
  WHERE
    date_time >= NOW() - INTERVAL '${duration}'
    AND device_uid = $1
  GROUP BY
    bucket_start;
`;

db.query(harmonicVOLTAGEQuery, [device_uid], (fetchError, fetchResult) => {
  if (fetchError) {
    console.error('Error executing query:', fetchError);
    return res.status(500).json({ message: 'Error while fetching current in harmonic values' });
  }

  const result = fetchResult.rows.map(row => ({
    bucket_start: row.bucket_start,
    HARMONIC_voltage_12: row.v1,
    HARMONIC_voltage_23: row.v2,
    HARMONIC_voltage_31: row.v3
  }));

  res.status(200).json(result);
});
}

// high load

function quickAnalysishighload(req, res) {
  const { device_uid } = req.params;
  let duration = req.param.duration; 

  switch (duration) 
  {
    case '12h':
      duration = '12 HOURS';
      break;
    case '1d':
      duration = '1 DAY';
      break;
    case '1w':
      duration = '7 DAYS';
      break;
    default:
      duration = '1 DAY';
      break;
  }

  const highloadquery = `
  SELECT
    TO_CHAR(date_trunc('hour', date_time + (EXTRACT(MINUTE FROM date_time)::int / 30 * INTERVAL '30 minutes')), 'YY-MM-DD HH24:MI') AS bucket_start,
    MAX(kw_1::numeric) AS kw_1,
    MAX(kw_2::numeric) AS kw_2,
    MAX(kw_3::numeric) AS kw_3
  FROM
    ems_schema.ems_actual_data
  WHERE
    date_time >= NOW() - INTERVAL '${duration}'
    AND device_uid = $1
  GROUP BY
    bucket_start;
`;

db.query(highloadquery, [device_uid], (fetchError, fetchResult) => {
  if (fetchError) {
    console.error('Error executing query:', fetchError);
    return res.status(500).json({ message: 'Error while fetching current in harmonic values' });
  }

  const result = fetchResult.rows.map(row => ({
    bucket_start: row.bucket_start,
   high_load_kw1: row.kw_1,
   high_load_kw2: row.kw_2,
   high_load_kw3: row.kw_3
  }));

  res.status(200).json(result);
});
}

//high energy consumption area

function quickAnalysishighenergy(req, res) {
  const { device_uid } = req.params;
  let duration = req.params.duration; 

  switch (duration) {
    case '12h':
      duration = '12 HOURS';
      break;
    case '1d':
      duration = '1 DAY';
      break;
    case '1w':
      duration = '7 DAYS';
      break;
    default:
      duration = '1 DAY';
      break;
  }

  const highenergyquery= `
  SELECT
    TO_CHAR(date_trunc('hour', date_time + (EXTRACT(MINUTE FROM date_time)::int / 30 * INTERVAL '30 minutes')), 'YY-MM-DD HH24:MI') AS bucket_start,
    MAX(kwh::numeric) AS kwh_max
  FROM
    ems_schema.ems_actual_data
  WHERE
    date_time >= NOW() - INTERVAL '${duration}'
    AND device_uid = $1
  GROUP BY
    bucket_start;
`;

  db.query(highenergyquery, [device_uid], (fetchError, fetchResult) => {
    if (fetchError) {
      console.error('Error executing query:', fetchError);
      return res.status(500).json({ message: 'Error while fetching current in harmonic values', error: fetchError });
    }

    const result = fetchResult.rows.map(row => ({
      bucket_start: row.bucket_start,
      kwh_max: row.kwh_max,
    }));

    res.status(200).json(result);
  });
}

// max  RMS
function quickAnalysisRMS(req, res) {
  const { device_uid } = req.params;
  let duration = req.params.duration;

  switch (duration)  {
    case '12h':
      duration = '12 HOURS';
      break;
    case '1d':
      duration = '1 DAY';
      break;
    case '1w':
      duration = '7 DAYS';
      break;
    default:
      duration = '1 DAY';
      break;
  }

  const rmsquery = `
    SELECT
      TO_CHAR(date_trunc('hour', date_time + (EXTRACT(MINUTE FROM date_time)::int / 30 * INTERVAL '30 minutes')), 'YY-MM-DD HH24:MI') AS bucket_start,
      MAX(current::numeric * 0.707) AS current_max,
      MAX(voltage_l::numeric * 0.707) AS voltage_max
    FROM
      ems_schema.ems_actual_data
    WHERE
      date_time >= NOW() - INTERVAL '${duration}'
      AND device_uid = $1
    GROUP BY
      bucket_start;
  `;

  db.query(rmsquery, [device_uid], (fetchError, fetchResult) => {
    if (fetchError) {
      console.error('Error executing query:', fetchError);
      return res.status(500).json({ message: 'Error while fetching current in harmonic values', error: fetchError });
    }

    const result = fetchResult.rows.map(row => ({
      bucket_start: row.bucket_start,
      current_max: row.current_max,
      voltage_max: row.voltage_max,
    }));

 
    res.status(200).json(result);
  });
}

//CURRENT IMBALANCING

function currentImbalancing(req, res) {
  const { device_uid } = req.body;
  let duration = req.body.duration;

  switch (duration) {
    case '12h':
      duration = '12 HOURS';
      break;
    case '1d':
      duration = '1 DAY';
      break;
    case '1w':
      duration = '7 DAYS';
      break;
    default:
      duration = '1 DAY';
      break;
  }

  const imbalancingquery = `
  SELECT
  TO_CHAR(date_trunc('hour', date_time + (EXTRACT(MINUTE FROM date_time)::int / 30 * INTERVAL '30 minutes')), 'YY-MM-DD HH24:MI') AS bucket_start,
  MAX(ABS(current::numeric)) AS current_max,
  MIN(ABS(current::numeric)) AS current_min,
  AVG(ABS(current::numeric)) AS avg_current,
  (MAX(ABS(current::numeric)) - MIN(ABS(current::numeric))) / AVG(ABS(current::numeric)) * 100 AS current_imbalance
FROM
  ems_schema.ems_actual_data
WHERE
  date_time >= NOW() - INTERVAL '${duration}'
  AND device_uid = $1
GROUP BY
  bucket_start;

  `;

  db.query(imbalancingquery, [device_uid], (fetchError, fetchResult) => {
    if (fetchError) {
      console.error('Error executing query:', fetchError);
      return res.status(500).json({ message: 'Error while fetching current in harmonic values', error: fetchError });
    }

    const result = fetchResult.rows.map(row => ({
      bucket_start: row.bucket_start,
      current_imbalance: row.current_imbalance,
    }));

    res.status(200).json(result);
  });
}

//VOLTAGE IMBALANCING

function voltageImbalancing(req, res) {
  const { device_uid } = req.body;
  let duration = req.body.duration;

  switch (duration) {
    case '12h':
      duration = '12 HOURS';
      break;
    case '1d':
      duration = '1 DAY';
      break;
    case '1w':
      duration = '7 DAYS';
      break;
    default:
      duration = '1 DAY';
      break;
  }

  const imbalancingquery = `
  SELECT
    TO_CHAR(date_trunc('hour', date_time + (EXTRACT(MINUTE FROM date_time)::int / 30 * INTERVAL '30 minutes')), 'YY-MM-DD HH24:MI') AS bucket_start,
    MAX(ABS(voltage_l::numeric)) AS voltage_max,
    MIN(ABS(voltage_l::numeric)) AS voltage_min,
    AVG(ABS(voltage_l::numeric)) AS avg_voltage,
    (MAX(ABS(voltage_l::numeric)) - MIN(ABS(voltage_l::numeric))) / AVG(ABS(voltage_l::numeric)) * 100 AS voltage_imbalance
  FROM
    ems_schema.ems_actual_data
  WHERE
    date_time >= NOW() - INTERVAL '${duration}'
    AND device_uid = $1
  GROUP BY
    bucket_start;
  `;

  db.query(imbalancingquery, [device_uid], (fetchError, fetchResult) => {
    if (fetchError) {
      console.error('Error executing query:', fetchError);
      return res.status(500).json({ message: 'Error while fetching voltage imbalance values', error: fetchError });
    }

    const result = fetchResult.rows.map(row => ({
      bucket_start: row.bucket_start,
      voltage_imbalance: row.voltage_imbalance,
    }));

    res.status(200).json(result);
  });
}

//feeder Group

function getFeederGroup(req,res){
  const companyId = req.params.companyId;
  const getQuery =`SELECT * FROM ems_schema.ems_feeder_group WHERE "companyId" = $1`;

  db.query(getQuery,[companyId],(error,result)=>{
    if(error){
      console.error('Error fetching user data:',error);
      res.status(401).json({message:'Error occured'});
      return;
    } 
    if(result.rows.length === 0) {
      res.status(404).json({message:'User not found'})
    }
    else{
      res.status(200).json({data : result.rows});
    }
    
  });
}

function postFeederGroup(req,res){
  const {feederNames,feederUid,groupName,companyId}=req.body;
  const insertQuery=`INSERT INTO ems_schema.ems_feeder_group("feederNames","feederUid","groupName","companyId") VALUES($1,$2,$3,$4)`;
  db.query(insertQuery,[feederNames,feederUid,groupName,companyId],(error,result)=>{
    if(error){
      console.error('Error inserting data:',error);
      res.status(404).send('Error inserting data');
      return;
    }
    res.json({message:'User created successfully',insertId:result.insertId});
  });

}

function putFeederGroup(req,res){
  const feederUid = req.params.feederUid;
  const {feederNames,groupName,companyId}=req.body;
  const updateQuery=`UPDATE ems_schema.ems_feeder_group SET "feederNames"=$1,"groupName"=$2,"companyId"=$3 WHERE "feederUid"=$4`;

  db.query(updateQuery,[feederNames,groupName,companyId,feederUid],(error)=>{
    if(error){
      console.error('Error updating data:',error);
      return res.status(404).send('error updating feeder group table')
    }
    res.json({message:'User updated successfully'});
    });

}

function deleteFeederGroup(req,res){
  const groupId=req.params.groupId;
  const deleteQuery=`DELETE FROM ems_schema.ems_feeder_group WHERE "groupId"=$1`;
  db.query(deleteQuery,[groupId],(error)=>{
    if(error){
      console.error('Error deleting feeder group data:',error);
      res.status(404).send('error occured');
      return;
    }
    res.json({message:'User deleted successfully'});
  })
}

//power parameters

function powerparameter(req, res) {
  let duration = req.params.duration;

  switch (duration) {
    case '12h':
      duration = '12 HOURS';
      break;
    case '1d':
      duration = '1 DAY';
      break;
    case '1w':
      duration = '7 DAYS';
      break;
    default:
      duration = '1 DAY';
      break;
  }

  const device_uid = req.params.device_uid;

  const currentQuery = `
    SELECT 
      MIN("kw") AS min_kw,
      MAX("kw") AS max_kw,
      AVG("kw") AS avg_kw,
      MIN("kva") AS min_kva,
      MAX("kva") AS max_kva,
      AVG("kva") AS avg_kva,
      MIN("kvar") AS min_kvar,
      MAX("kvar") AS max_kvar,
      AVG("kvar") AS avg_kvar,
      MIN("pf") AS min_pf,
      MAX("pf") AS max_pf,
      AVG("pf") AS avg_pf
    FROM ems_schema.ems_actual_data
    WHERE
      date_time >= NOW() - INTERVAL '${duration}'
      AND device_uid = $1;
  `;

  db.query(currentQuery, [device_uid], (fetchError, fetchResult) => {
    if (fetchError) {
      console.error(fetchError);
      return res.status(500).json({ message: 'Error while fetching data' });
    }

    if (fetchResult.rows.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified device' });
    }

    const result = {
      min_kw: fetchResult.rows[0].min_kw,
      max_kw: fetchResult.rows[0].max_kw,
      avg_kw: fetchResult.rows[0].avg_kw,
      min_kva: fetchResult.rows[0].min_kva,
      max_kva: fetchResult.rows[0].max_kva,
      avg_kva: fetchResult.rows[0].avg_kva,
      min_kvar: fetchResult.rows[0].min_kvar,
      max_kvar: fetchResult.rows[0].max_kvar,
      avg_kvar: fetchResult.rows[0].avg_kvar,
      min_pf: fetchResult.rows[0].min_pf,
      max_pf: fetchResult.rows[0].max_pf,
      avg_pf: fetchResult.rows[0].avg_pf
    };

    res.status(200).json(result);
  });
}

//---------------Kaushal-------------//
function getActualDemandByDevicesAndRange(req, res) {
  let deviceIds = req.params.deviceIds;
  let startTime = req.params.startTime;
  let endTime = req.params.endTime;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  const getMaxKvaQuery = `
    SELECT "device_uid", MAX("kva") AS maxKva
    FROM ems_schema.ems_actual_data
    WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
      AND "date_time" BETWEEN $${deviceIds.length + 1} AND $${deviceIds.length + 2}
    GROUP BY "device_uid";
  `;

  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = [...deviceIds, startTime, endTime];

      db.query(getMaxKvaQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows);
      });
    });
  };

  executeQuery()
    .then((result) => {
      res.json({ maxKvaResults: result });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}


function getActualDemandByDevicesAndInterval(req, res) {
  let deviceIds = req.params.deviceIds;
  let timeInterval = req.params.timeInterval;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  let intervalInSeconds;

  switch (timeInterval) {
    case '12hour':
      intervalInSeconds = 12 * 60 * 60; // 12 hours in seconds
      break;
    case 'day':
      intervalInSeconds = 24 * 60 * 60; // 1 day in seconds
      break;
    case 'week':
      intervalInSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
      break;
    case 'month':
      // Note: Calculating a rough approximation of a month, considering 30 days
      intervalInSeconds = 30 * 24 * 60 * 60;
      break;
    default:
      res.status(400).json({ message: 'Invalid time interval' });
      return;
  }

  const getMaxKvaQuery = `
    SELECT "device_uid", MAX("kva") AS maxKva
    FROM ems_schema.ems_actual_data
    WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
      AND "date_time" >= NOW() - interval '${intervalInSeconds}' second
    GROUP BY "device_uid";
  `;

  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = [...deviceIds];

      db.query(getMaxKvaQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows);
      });
    });
  };

  executeQuery()
    .then((result) => {
      res.json({ maxKvaResults: result });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

async function fetchMaxDemand(req, res) {
  try {
    const companyId = req.params.companyId;

    const fetchMaxDemandQuery = `
      SELECT "contractDemandKva" as MaxDemand
      FROM ems_schema.ems_company_info
      WHERE "companyId" = $1
      LIMIT 1;
    `;

    const fetchMaxDemandResult = await db.query(fetchMaxDemandQuery, [companyId]);

    // Check if there is any result
    if (fetchMaxDemandResult.rows.length === 0) {
      return res.status(404).json({ message: 'No data found for the given companyId' });
    }

    res.status(200).json({ data: fetchMaxDemandResult.rows[0] });
  } catch (error) {
    console.error('Error fetching max demand data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

function getKWHByDevicesAndRange(req, res) {
  let deviceIds = req.params.deviceIds;
  let startTime = req.params.startTime;
  let endTime = req.params.endTime;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  const getMaxKwhQuery = `
  SELECT SUM(diff_kwh) AS total_kwh
    FROM (SELECT "device_uid", MAX("kwh") - MIN("kwh") AS diff_kwh
    FROM ems_schema.ems_actual_data
    WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
      AND "date_time" BETWEEN $${deviceIds.length + 1} AND $${deviceIds.length + 2}
    GROUP BY "device_uid"
    ) as subquery;
  `;

  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = [...deviceIds, startTime, endTime];

      db.query(getMaxKwhQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows);
      });
    });
  };

  executeQuery()
    .then((result) => {
      res.json({ KwhResults: result });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

function getKWHByDevicesAndInterval(req, res) {
  let deviceIds = req.params.deviceIds;
  let timeInterval = req.params.timeInterval;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  let intervalInSeconds;

  switch (timeInterval) {
    case '12hour':
      intervalInSeconds = 12 * 60 * 60; // 12 hours in seconds
      break;
    case 'day':
      intervalInSeconds = 24 * 60 * 60; // 1 day in seconds
      break;
    case 'week':
      intervalInSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
      break;
    case 'month':
      // Note: Calculating a rough approximation of a month, considering 30 days
      intervalInSeconds = 30 * 24 * 60 * 60;
      break;
    default:
      res.status(400).json({ message: 'Invalid time interval' });
      return;
  }

  const getTotalKwhQuery = `
    SELECT SUM(diff_kwh) AS total_kwh
    FROM (
      SELECT "device_uid", MAX("kwh") - MIN("kwh") AS diff_kwh
      FROM ems_schema.ems_actual_data
      WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
        AND "date_time" >= NOW() - interval '${intervalInSeconds}' second
      GROUP BY "device_uid"
    ) AS subquery;
  `;

  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = [...deviceIds];

      db.query(getTotalKwhQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows[0].total_kwh || 0); // Using 0 if no result
      });
    });
  };

  executeQuery()
    .then((totalKwh) => {
      res.json({ total_kwh: totalKwh });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

function getKVAHByDevicesAndRange(req, res) {
  let deviceIds = req.params.deviceIds;
  let startTime = req.params.startTime;
  let endTime = req.params.endTime;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  const getMaxKvahQuery = `
    SELECT SUM(diff_kvah) AS total_kvah
      FROM (SELECT "device_uid", MAX("kvah") - MIN("kvah") AS diff_kvah
      FROM ems_schema.ems_actual_data
      WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
        AND "date_time" BETWEEN $${deviceIds.length + 1} AND $${deviceIds.length + 2}
      GROUP BY "device_uid"
      ) as subquery;
  `;

  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = [...deviceIds, startTime, endTime];

      db.query(getMaxKvahQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows);
      });
    });
  };

  executeQuery()
    .then((result) => {
      res.json({ KvahResults: result });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

function getKVAHByDevicesAndInterval(req, res) {
  let deviceIds = req.params.deviceIds;
  let timeInterval = req.params.timeInterval;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  let intervalInSeconds;

  switch (timeInterval) {
    case '12hour':
      intervalInSeconds = 12 * 60 * 60; // 12 hours in seconds
      break;
    case 'day':
      intervalInSeconds = 24 * 60 * 60; // 1 day in seconds
      break;
    case 'week':
      intervalInSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
      break;
    case 'month':
      // Note: Calculating a rough approximation of a month, considering 30 days
      intervalInSeconds = 30 * 24 * 60 * 60;
      break;
    default:
      res.status(400).json({ message: 'Invalid time interval' });
      return;
  }

  const getTotalKvahQuery = `
    SELECT SUM(diff_kvah) AS total_kvah
    FROM (
      SELECT "device_uid", MAX("kvah") - MIN("kvah") AS diff_kvah
      FROM ems_schema.ems_actual_data
      WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
        AND "date_time" >= NOW() - interval '${intervalInSeconds}' second
      GROUP BY "device_uid"
    ) AS subquery;
  `;


  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = [...deviceIds];

      db.query(getTotalKvahQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows[0].total_kvah || 0); // Using 0 if no result
      });
    });
  };

  executeQuery()
    .then((totalKvah) => {
      res.json({ total_kvah: totalKvah });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

function getKVARHByDevicesAndRange(req, res) {
  let deviceIds = req.params.deviceIds;
  let startTime = req.params.startTime;
  let endTime = req.params.endTime;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  const getMaxKvarhQuery = `
    SELECT SUM(diff_kvarh) AS total_kvarh
      FROM (SELECT "device_uid", MAX("kvarh") - MIN("kvarh") AS diff_kvarh
      FROM ems_schema.ems_actual_data
      WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
        AND "date_time" BETWEEN $${deviceIds.length + 1} AND $${deviceIds.length + 2}
      GROUP BY "device_uid"
      ) as subquery;
  `;

  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = [...deviceIds, startTime, endTime];

      db.query(getMaxKvarhQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows);
      });
    });
  };

  executeQuery()
    .then((result) => {
      res.json({ KvarhResults: result });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

function getKVARHByDevicesAndInterval(req, res) {
  let deviceIds = req.params.deviceIds;
  let timeInterval = req.params.timeInterval;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  let intervalInSeconds;

  switch (timeInterval) {
    case '12hour':
      intervalInSeconds = 12 * 60 * 60; // 12 hours in seconds
      break;
    case 'day':
      intervalInSeconds = 24 * 60 * 60; // 1 day in seconds
      break;
    case 'week':
      intervalInSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
      break;
    case 'month':
      // Note: Calculating a rough approximation of a month, considering 30 days
      intervalInSeconds = 30 * 24 * 60 * 60;
      break;
    default:
      res.status(400).json({ message: 'Invalid time interval' });
      return;
  }

  const getTotalKvarhQuery = `
    SELECT SUM(diff_kvarh) AS total_kvarh
    FROM (
      SELECT "device_uid", MAX("kvarh") - MIN("kvarh") AS diff_kvarh
      FROM ems_schema.ems_actual_data
      WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
        AND "date_time" >= NOW() - interval '${intervalInSeconds}' second
      GROUP BY "device_uid"
    ) AS subquery;
  `;


  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = [...deviceIds];

      db.query(getTotalKvarhQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows[0].total_kvarh || 0); // Using 0 if no result
      });
    });
  };

  executeQuery()
    .then((totalKvarh) => {
      res.json({ total_kvarh: totalKvarh });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

function getKWHForToday(req, res) {
  let deviceIds = req.params.deviceIds;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  const getTodayKwhQuery = `
    SELECT SUM(diff_kwh) AS today_kwh
    FROM (
      SELECT "device_uid", MAX("kwh") - MIN("kwh") AS diff_kwh
      FROM ems_schema.ems_actual_data
      WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
        AND "date_time" >= CURRENT_DATE  -- Start of today
        AND "date_time" < CURRENT_DATE + INTERVAL '1 day' -- End of today
      GROUP BY "device_uid"
    ) AS subquery;
  `;

  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = deviceIds;

      db.query(getTodayKwhQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows[0].today_kwh || 0); // Using 0 if no result
      });
    });
  };

  executeQuery()
    .then((todayKwh) => {
      res.json({ today_kwh: todayKwh });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

function getKWHForYesterday(req, res) {
  let deviceIds = req.params.deviceIds;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  const getYesterdayKwhQuery = `
    SELECT SUM(diff_kwh) AS yesterday_kwh
    FROM (
      SELECT "device_uid", MAX("kwh") - MIN("kwh") AS diff_kwh
      FROM ems_schema.ems_actual_data
      WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
        AND "date_time" >= CURRENT_DATE - INTERVAL '1 day' -- Start of yesterday
        AND "date_time" < CURRENT_DATE -- End of yesterday
      GROUP BY "device_uid"
    ) AS subquery;
  `;

  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = deviceIds;

      db.query(getYesterdayKwhQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows[0].yesterday_kwh || 0); // Using 0 if no result
      });
    });
  };

  executeQuery()
    .then((yesterdayKwh) => {
      res.json({ yesterday_kwh: yesterdayKwh });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

function getKWHForThisMonth(req, res) {
  let deviceIds = req.params.deviceIds;

  if (typeof deviceIds === 'string') {
    deviceIds = deviceIds.split(',');
  }

  const getThisMonthKwhQuery = `
    SELECT SUM(diff_kwh) AS this_month_kwh
    FROM (
      SELECT "device_uid", MAX("kwh") - MIN("kwh") AS diff_kwh
      FROM ems_schema.ems_actual_data
      WHERE "device_uid" IN (${deviceIds.map((_, index) => `$${index + 1}`).join(', ')})
        AND EXTRACT(YEAR FROM "date_time") = EXTRACT(YEAR FROM CURRENT_DATE) -- Current year
        AND EXTRACT(MONTH FROM "date_time") = EXTRACT(MONTH FROM CURRENT_DATE) -- Current month
      GROUP BY "device_uid"
    ) AS subquery;
  `;

  const executeQuery = () => {
    return new Promise((resolve, reject) => {
      const params = deviceIds;

      db.query(getThisMonthKwhQuery, params, (getError, getResult) => {
        if (getError) {
          return reject({ message: 'Error while Fetching Data', error: getError });
        }

        resolve(getResult.rows[0].this_month_kwh || 0); // Using 0 if no result
      });
    });
  };

  executeQuery()
    .then((thisMonthKwh) => {
      res.json({ this_month_kwh: thisMonthKwh });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}


async function getSumOfLatestValues(req, res) {
  try {
    let deviceIdsParam = req.params.deviceIds;

    if (typeof deviceIdsParam === 'string') {
      deviceIdsParam = deviceIdsParam.split(',');
    }

    const sumValuesQuery = `
      SELECT COALESCE(SUM(kw), 0) AS total_kw,
        COALESCE(SUM(kva), 0) AS total_kva,
        COALESCE(SUM(kvar), 0) AS total_kvar,
        COALESCE(AVG(pf), 0) AS avg_pf
      FROM (
        SELECT "device_uid", kw, kva, kvar, pf
        FROM ems_schema.ems_actual_data
        WHERE "device_uid" IN (${deviceIdsParam.map((_, index) => `$${index + 1}`).join(', ')})
          AND date_time >= NOW() - interval '30 minutes'
        ORDER BY date_time DESC
        LIMIT 1
      ) as subquery
      GROUP BY "device_uid";
    `;

    const queryParameters = [...deviceIdsParam];
    const queryResult = await db.query(sumValuesQuery, queryParameters);
    res.json({ sumResults: queryResult.rows });
  } catch (error) {
    console.error('Error in getSumOfLatestValues:', error);
    res.status(404).json({ message: 'Error while Fetching Data', error });
  }
}

function todReport(req, res) {
  try {
    const { startDate, endDate, device_uid } = req.body;
    const query = `SELECT
                    TO_CHAR(DATE_TRUNC('day', date_time), 'YYYY-MM-DD ') AS date_time,
                    (MAX(COALESCE(Zone_kwh_A, 0) + COALESCE(previous_day_kwh_22_24, 0)) + COALESCE(MAX(Zone_kwh_B1), 0) + COALESCE(MAX(Zone_kwh_B2), 0) + COALESCE(MAX(Zone_kwh_C), 0) + COALESCE(MAX(Zone_kwh_D), 0)) as total_kwh,
                    (MAX(COALESCE(Zone_kvah_A, 0) + COALESCE(previous_day_kvah_22_24, 0)) + COALESCE(MAX(Zone_kvah_B1), 0) + COALESCE(MAX(Zone_kvah_B2), 0) + COALESCE(MAX(Zone_kvah_C), 0) + COALESCE(MAX(Zone_kvah_D), 0)) as total_kvah,
                    MAX(Zone_kwh_A + COALESCE(previous_day_kwh_22_24, 0)) AS Zone_kwh_A,
                    MAX(Zone_kvah_A + COALESCE(previous_day_kvah_22_24, 0)) AS Zone_kvah_A,
                    GREATEST(MAX(Zone_kva_A), MAX(previous_day_kva_22_24)) AS Zone_kva_A,
                    MAX(Zone_kwh_B1) AS Zone_kwh_B1,
                    MAX(Zone_kvah_B1) AS Zone_kvah_B1,
                    MAX(Zone_kva_B1) AS Zone_kva_B1,
                    MAX(Zone_kwh_B2) AS Zone_kwh_B2,
                    MAX(Zone_kvah_B2) AS Zone_kvah_B2,
                    MAX(Zone_kva_B2) AS Zone_kva_B2,
                    MAX(Zone_kwh_C) AS Zone_kwh_C,
                    MAX(Zone_kvah_C) AS Zone_kvah_C,
                    MAX(Zone_kva_C) AS Zone_kva_C,
                    MAX(Zone_kwh_D) AS Zone_kwh_D,
                    MAX(Zone_kvah_D) AS Zone_kvah_D,
                    MAX(Zone_kva_D) AS Zone_kva_D
                  FROM (
                    SELECT
                      date(date_time) AS date_time,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 0 AND 5 THEN kwh END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 0 AND 5 THEN kwh END) AS Zone_kwh_A,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 0 AND 5 THEN kvah END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 0 AND 5 THEN kvah END) AS Zone_kvah_A,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 0 AND 5 THEN kva END) as Zone_kva_A,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 6 AND 8 THEN kwh END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 6 AND 8 THEN kwh END) AS Zone_kwh_B1,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 6 AND 8 THEN kvah END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 6 AND 8 THEN kvah END) AS Zone_kvah_B1,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 6 AND 8 THEN kva END) as Zone_kva_B1,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 12 AND 17 THEN kwh END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 12 AND 17 THEN kwh END) AS Zone_kwh_B2,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 12 AND 17 THEN kvah END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 12 AND 17 THEN kvah END) AS Zone_kvah_B2,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 12 AND 17 THEN kva END) as Zone_kva_B2,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 9 AND 11 THEN kwh END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 9 AND 11 THEN kwh END) AS Zone_kwh_C,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 9 AND 11 THEN kvah END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 9 AND 11 THEN kvah END) AS Zone_kvah_C,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 9 AND 11 THEN kva END) as Zone_kva_C,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 18 AND 21 THEN kwh END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 18 AND 21 THEN kwh END) AS Zone_kwh_D,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 18 AND 21 THEN kvah END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 18 AND 21 THEN kvah END) AS Zone_kvah_D,
                      MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 18 AND 21 THEN kva END) as Zone_kva_D,
                      LAG(MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 22 AND 23 THEN kwh END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 22 AND 23 THEN kwh END)) OVER (ORDER BY date(date_time)) 
                        AS previous_day_kwh_22_24,
                      LAG(MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 22 AND 23 THEN kvah END) -
                        MIN(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 22 AND 23 THEN kvah END)) OVER (ORDER BY date(date_time)) 
                        AS previous_day_kvah_22_24,
                      LAG(MAX(CASE WHEN EXTRACT(HOUR FROM date_time) BETWEEN 22 AND 23 THEN kva END)) OVER (ORDER BY date(date_time)) 
                        AS previous_day_kva_22_24
                    FROM
                      ems_schema.ems_actual_data
                    WHERE
                      date_time BETWEEN $1 AND $2 AND device_uid = $3
                    GROUP BY date(date_time)
                  ) AS subquery
                  GROUP BY date(date_time)
                  ORDER BY date(date_time) DESC;`;

    db.query(query, [startDate, endDate, device_uid], (error, result) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      return res.json({ data: result.rows });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ message: 'Unexpected error occurred' });
  }
}


module.exports = {

    getUser_Data,
    delete_user,
    updateUser,
    updatePassword,
    getUserById,

  //feeder page
    addfeeder,  //add feeders data 
    getFeederData, // select operations to show feeder details
    delete_feeder, //feeder deletion
    editFeeders, //update feeder

  // feeder operations
    currentoperations, //current section
    getAlertsByFeederId,

  //quick analysis
    quickanalysisPF,
    quickAnalysisCurrentHarmonic,
    quickAnalysisvoltageHarmonic,
    quickAnalysishighload,
    quickAnalysishighenergy,
    quickAnalysisRMS,
    currentImbalancing,
    voltageImbalancing,

  // shifts page
    addShift,
    getDay_Shift,
    delete_shift,
    edit_shift,

  // alerts page
    addAlerts,
    editAlerts,
    getAlerts,
    delete_alerts,

  // parameterised
    parametersbyinterval,
    parametersbycustomdate,
    
  // others
    getArray,
    getReportData,
    getDeviceDetails,

  //HARMONICS
    harmonicsbyinterval,
    harmonicsbycustomdate,

  //CONSUMPTION_PAGE
    consumptionForFixIntervals,
    consumptionForCustomDates,

  //Overview Page 
    fetchOverview,
    overviewBargraph,
    overviewPiechart,
    overviewSummary,
    fetchLatestEntry,
     
  //feeder Group
    getFeederGroup,
    postFeederGroup,
    putFeederGroup,
    deleteFeederGroup,

  //powerparameter
    powerparameter,

  //----Feeder Page By Kaushal-----**///
    getActualDemandByDevicesAndRange,
    getActualDemandByDevicesAndInterval,
    fetchMaxDemand,
    getKWHByDevicesAndRange,
    getKWHByDevicesAndInterval,
    getKVAHByDevicesAndRange,
    getKVAHByDevicesAndInterval,
    getKVARHByDevicesAndRange,
    getKVARHByDevicesAndInterval,
    getKWHForToday,
    getKWHForYesterday,
    getKWHForThisMonth,
    getSumOfLatestValues,

    //TOD Report
    todReport
}