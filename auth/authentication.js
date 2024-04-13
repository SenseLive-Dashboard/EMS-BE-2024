const bcrypt = require('bcrypt');
require('dotenv').config();
const db = require('../db');
const jwtUtils = require('../token/jwtUtils');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// GENERATE ID
// Helper function to generate a unique 10-digit ID
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

// FUNCTION FOR SENDING VERIFICATION TOKEN VIA MAIL
function sendTokenEmail(email, token) {

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user:'kpohekar19@gmail.com',
      pass:'woptjevenzhqmrpp'
    },
  });
  // console.log(user);
  const templatePath = path.join(__dirname, '../mail-body/email-template.ejs');
  fs.readFile(templatePath, 'utf8', (err, templateData) => {
    if (err) {
      console.error('Error reading email template:', err);
      return;
    }
    const compiledTemplate = ejs.compile(templateData);
    const html = compiledTemplate({ token });
    const mailOptions = {
      from: process.env.mailid,
      to: email,
      subject: 'Registration Token',
      html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  });
}


// FUNCTION FOR SENDING RESET VERIFICATION TOKEN VIA MAIL
function sendResetTokenEmail(personalemail, resetToken) {

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.mailid,
    pass: process.env.mailpass
  },
});

const templatePath = path.join(__dirname, '../mail-body/email-template-forgot-password.ejs');
fs.readFile(templatePath, 'utf8', (err, templateData) => {
  if (err) {
    console.error('Error reading email template:', err);
    return;
  }
  const compiledTemplate = ejs.compile(templateData);
  const html = compiledTemplate({ resetToken });
  const mailOptions = {
    from: process.env.mailid,
    to: personalemail,
    subject: 'Reset Password Link',
    html: html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
});
}

// COMPANY REGISTRATION
function register_company(req,res) {
  const companyId = generateId();

  const { companyName, companyEmail, companyLocation, energyConsumerLtHt, sanctionedLoadKw, contractDemandKva, connectedLoadKw, tariff, percentContractDemand, electricityBill, energyDetail, energyValue } = req.body;
  
  const insertQuery = `INSERT INTO ems_schema.ems_company_info
  ("companyId", "companyName", "companyEmail", "companyLocation", "energyConsumptionLtHt", "sanctionedLoadKw", "contractDemandKva", "connectedLoadKw", "tariff", "percentContractDemand", "electricityBill", "energyDetail", "energyValue")
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
  const insertvalues = [companyId, companyName, companyEmail, companyLocation, energyConsumerLtHt, sanctionedLoadKw, contractDemandKva, connectedLoadKw, tariff, percentContractDemand, electricityBill, energyDetail, energyValue];
  
  if (!companyName || !companyEmail || !companyLocation || !energyConsumerLtHt || !sanctionedLoadKw || !contractDemandKva || !connectedLoadKw || !tariff) {
    return res.status(401).json({ message: 'Please fill all required parameters' });
  }  

  // if (energyConsumerLtHt !== 'LT' && energyConsumerLtHt !== 'HT') {
  //   return res.status(401).json({ message: 'Invalid value for energy_consumer_lt_ht.'});
  // }

  // if (energyDetail && energyDetail !== 'Solar' && energyDetail !== 'Digi') {
  //   return res.status(401).json({ message: 'Invalid value for energy_detail. Must be "solar" or "digi".' });
  // }

  db.query(insertQuery,insertvalues, (insertError,insertresult) => {
        if (insertError) {
            console.error('Error occured while inserting data', insertError);
            return res.status(401).json({ message: 'Error while regristering company',error : insertError });
        }  
        return res.status(200).json({message:'Company Registered.'});
    })

}

function updateCompany(req,res) {

  const companyId=req.params.companyId;
  const { companyName, companyEmail, companyLocation, energyConsumerLtHt, sanctionedLoadKw, contractDemandKva, connectedLoadKw, tariff, percentContractDemand, electricityBill, energyDetail, energyValue } = req.body;
  
  const updateQuery = `
  UPDATE ems_schema.ems_company_info
  SET 
    "companyName" = $1,
    "companyEmail" = $2,
    "companyLocation" = $3,
    "energyConsumptionLtHt" = $4,
    "sanctionedLoadKw" = $5,
    "contractDemandKva" = $6,
    "connectedLoadKw" = $7,
    "tariff" = $8,
    "percentContractDemand" = $9,
    "electricityBill" = $10,
    "energyDetail" = $11,
    "energyValue" = $12
  WHERE "companyId" = $13;
`;
const values = [
  companyName,
  companyEmail,
  companyLocation,
  energyConsumerLtHt,
  sanctionedLoadKw,
  contractDemandKva,
  connectedLoadKw,
  tariff,
  percentContractDemand,
  electricityBill,
  energyDetail,
  energyValue,
  companyId,
];
  
  if (!companyName || !companyEmail || !companyLocation || !energyConsumerLtHt || !sanctionedLoadKw || !contractDemandKva || !connectedLoadKw || !tariff) {
    return res.status(401).json({ message: 'Please fill all required parameters' });
  } 

  db.query(updateQuery, values, (err, results) => {
    if (err)
      {
        console.error('Error updating Company Data:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

    res.json({ message: 'Company Data Updated Successfully' });
  });

}


// VERIFY TOKEN 
function verifyToken(req, res) {
  const { token } = req.body;

  // Check if the token matches the one stored in the database
  const tokenCheckQuery = 'SELECT * FROM ems_schema.ems_user_info WHERE Verificationtoken = $1';
  db.query(tokenCheckQuery, [token], (error, tokenCheckResult) => {
    if (error) {
      console.error('Error during token verification:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
    try {
      if (tokenCheckResult.length === 0) {
        console.log('Token verification failed');
        return res.status(400).json({ message: 'Token verification failed' });
      }
      // Token matches, update the user's status as verified
      const updateQuery = 'UPDATE ems_schema.ems_user_info SET verified = $1 WHERE Verificationtoken = $2';
      db.query(updateQuery, [true, token], (error, updateResult) => {
        if (error) {
          console.error('Error updating user verification status:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        console.log('Token verification successful');
        res.json({ message: 'Token verification successful. You can now log in.' });
      });
    } catch (error) {
      console.error('Error during token verification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

// REGISTER USER
function register_user(req,res){
  const {firstName, lastName, companyName, contactno, shift, personalemail, password, designation,  plant, privileges } = req.body;
  const verificationtoken = jwtUtils.generateToken({personalemail:personalemail});
 
  const checkUserQuery = `SELECT * FROM ems_schema.ems_user_info WHERE "personalEmail" = $1`;
  
  


  
  const RegistrationQuery  = `INSERT INTO ems_schema.ems_user_info 
  ("userId","userName", "firstName", "lastName","companyId", "contactNo" , shift, "personalEmail", "password", "designation", "verificationToken", verified , plant, "privileges")
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9, $10, $11, $12, $13, $14)`;

  db.query(checkUserQuery, [personalemail] , (checkUserError, checkUserResult) => {
    if ( checkUserError ){
        return res.status(401).json({message: 'Eroor while checking username',checkUserError}); 
    }
    if ( checkUserResult.length > 0 ){
      console.log('result',checkUserResult);
        return res.status(402).json({message : 'User already Exists'});
    }
    bcrypt.hash(password , 10 , (hashError , hashPassword) =>{
      if (hashError){
          res.status(401).json({message: 'Error while hashing password',hashError});
      }
      db.query(fetchCompanyIdQuery, [companyName], (fetchCompanyIdError, companyIdResult) =>{
        if(fetchCompanyIdError){
          return res.json(401).json({message : 'error while fetching compant id', fetchCompanyIdError});
        }
        companyId = companyIdResult.rows[0];
        const userId = generateId();
        db.query(RegistrationQuery , [
          userId, 
          personalemail,
          firstName, 
          lastName, 
          companyId.companyId, 
          contactno, 
          shift, 
          personalemail, 
          hashPassword, 
          designation,
          verificationtoken,
          '0',  
          plant, 
          privileges,] , (RegError , RegResult) =>{
          if(RegError){
            console.log(RegError);
            
            return res.status(402).json({message:'Error while registering ',RegError});
          }
          sendTokenEmail(personalemail, verificationtoken);

          res.status(200).json({message:' Register successfully and successfully sent mail'});
        });
      });
    });
  });
}

function getUserDetails(req, res) {
  const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwtUtils.verifyToken(token);
    if (!decodedToken) {
      console.log('Invalid Token');
      return res.status(401).json({ message: 'Invalid token' });
    }
    const fetchUserQuery = 'SELECT * FROM ems_schema.ems_user_info WHERE "userName" = $1';
    const fetchCompanyQuery = `SELECT * FROM ems_schema.ems_company_info WHERE "companyId" = $1`;
    db.query(fetchUserQuery, [decodedToken.userName], (checkUserError, result) => {
      if (checkUserError) {
        console.log('Error executing query:', error);
        return res.status(401).json({ message: 'Error executing user name query'});
      }
      if (result.rowCount === 0) {
        // Log the error and response
        return res.status(404).json({ message: 'User not found' });
      }
      const userDetail = result.rows[0];
      db.query(fetchCompanyQuery, [userDetail.companyId], (fetchCompanyError, fetchCompanyResult) => {
        if(fetchCompanyError){
          console.log(fetchCompanyError);
          return res.status(401).json({message : 'error fetching company details'});
        }
        companyDetails = fetchCompanyResult.rows[0];
        res.status(200).json({getUserDetails : userDetail, companyDetails : companyDetails});
      })
      // res.status(200).json(userDetail);
    });
}

// LOGIN USER
function loginUser (req,res){
  const {Username , Password} = req.body;
  const checkUserNameQuery = `SELECT * FROM ems_schema.ems_user_info WHERE "personalEmail" = $1`;

  db.query(checkUserNameQuery, [Username] , (checkUserNameError , checkUserNameResult) =>{
      if(checkUserNameError){
          res.status(401).json({message :'Error While Checkimg UserName',checkUserNameError});
      }
      if(checkUserNameResult.rows.length === 0){
          res.status(401).json({message : 'UserName Not Found',checkUserNameResult});
      }
      user = checkUserNameResult.rows[0];
      if (user.verified === 0) {
        // console.error('User is not verified. Please verify your account.');
        return res.status(401).json({ message: 'User is not verified. Please verify your account.' });
      }
      bcrypt.compare(Password, user.password ,(passwordcheckError , passwordCheckResult ) => {
          if(passwordcheckError){
              res.status(401).json({message: 'Error During Password Comparison'});
          }
          if(!passwordCheckResult){
              res.status(402).json({message: 'Invalid credentials'});
          }
          // const jwToken = jwt.sign({userName : user.userName},process.env.jwt);
          const jwToken = jwtUtils.generateToken({ userName : Username });
          res.status(200).json({message : 'Login Succcessful', token : jwToken});
      });
  });
}

//RESEND TOKEN
function resendToken(req, res) {
  const { personalEmail } = req.body;

  const checkUserQuery = 'SELECT * FROM ems_schema.ems_user_info WHERE "userName" = $1';
  db.query(checkUserQuery, [personalEmail], (checkUserNameError, userResult) => {
    if (checkUserNameError) {
      console.log('Error checking user availability:', error);
      return res.status(401).json({ message: 'Error checking user availability' });
    }
    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (userResult[0].Verified === '1') {
      return res.status(400).json({ message: 'User already verified' });
    } else {
      const verificationToken = jwtUtils.generateToken({ personalEmail: personalEmail });

      const updateQuery = 'UPDATE ems_schema.ems_user_info SET "verificationToken" = $1 WHERE "personalEmail" = $2';
      db.query(updateQuery, [verificationToken, personalEmail], (updateError, updateResult) => {
        if (updateError) {
          console.log('Error updating verification token:', error);
          return res.status(401).json({ message: 'Error updating verification token' });
        }
          sendTokenEmail(personalEmail, verificationToken);

          console.log('Verification token resent');
          res.json({ message: 'Verification token resent. Check your email for the new token.' });
      });
    }
  });
}

//FORGOT PASSWORD
function forgotPassword(req, res) {
  const { personalEmail } = req.body;

  const query = 'SELECT * FROM ems_schema.ems_user_info WHERE "personalEmail" = $1';
  db.query(query, [personalEmail], (fetchUserNameError, result) => {
    if (fetchUserNameError) {
      console.error(fetchUserNameError);
      return res.status(401).json({ message: 'error while fetching username'});
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwtUtils.generateToken({ personalEmail });

    const userId = result.rows[0].userid; 
    const insertQuery = 'INSERT INTO ems_schema.ems_reset_tokens ("userId", token) VALUES ($1, $2)';
    db.query(insertQuery, [userId, resetToken], (insertError) => {
      if (insertError) {
        console.error(insertError);
        return res.status(401).json({ message: 'Error saving reset token' });
      }
      sendResetTokenEmail(personalEmail, resetToken);
      res.json({ message: 'Reset token sent to your email' });
    });
  });
}

//RESEND RESET TOKEN
function resendResetToken(req, res) {
  const { personalEmail } = req.body;

  const checkUserQuery = 'SELECT * FROM ems_schema.ems_user_info WHERE "personalEmail" = $1';
  db.query(checkUserQuery, [personalEmail], (checkError, userResult) => {
    if (checkError) {
      console.log('Error checking user availability:', error);
      return res.status(401).json({ message: 'Error checking user availability' });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = userResult[0].UserId;
    const verificationToken = jwtUtils.generateToken({ personalEmail: personalEmail });

    const updateQuery = 'UPDATE ems_schema.ems_reset_tokens SET token = $1 WHERE "userId" = $2';
    db.query(updateQuery, [verificationToken, userId], (updateError, updateResult) => {
      if (updateError) {
        console.log('Error updating Resend link:', error);
        return res.status(401).json({ message: 'Error updating Resend link'});
      }

        sendResetTokenEmail(personalEmail, verificationToken);
        res.status(200).json({ message: 'Resend link resent. Check your email for the new token.' });
    });
  });
}

//RESET PASSWORD
function resetPassword(req, res) {
  const { token, password } = req.body;

  const query = 'SELECT * FROM ems_schema.ems_reset_tokens WHERE token = $1';
  db.query(query, [token], (checkTokenError, result) => {
    if (checkTokenError) {
      console.log('Error during reset password query:', checkTokenError);
      return res.status(401).json({ message: 'Error during reset password query'});
    }

    if (result.rowCount === 0) {
      return res.status(402).json({ message: 'Invalid token' });
    }
    const tokenData = result.rows[0];
    const userId = tokenData.userid;

    bcrypt.hash(password, 10, (hashError, hashedPassword) => {
      if (hashError) {
        console.log('Error during password hashing:', hashError);
        return res.status(401).json({ message: 'Error during password hashing' });
      }
      
      const updateQuery = 'UPDATE ems.ems_users SET Password = $1 WHERE UserId = $2';
      db.query(updateQuery, [hashedPassword, userId], (updateError, updateResult) => {
        if (updateError) {
          console.log('Error updating password:', updateError);
          return res.status(401).json({ message: 'Error updating password' });
        }

        // Delete the reset token from the reset_tokens table
        const deleteQuery = 'DELETE FROM ems.ems_reset_tokens WHERE token = $1';
        db.query(deleteQuery, [token], (deleteError, deleteResult) => {
          if (deleteError) {
            console.error('Error deleting reset token:', deleteError);
            res.status(401).json({message : 'Error deleting reset token'});
          }
          res.status(200).json({ message: 'Password reset successful'});
        });
      });
    });
  });
}

module.exports = {
  register_company,
  register_user,
  loginUser,
  getUserDetails,
  forgotPassword,
  resendResetToken,
  resetPassword,
  sendTokenEmail,
  sendResetTokenEmail,
  verifyToken,
  resendToken,
  generateId,
  updateCompany
}