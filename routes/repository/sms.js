const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

exports.sendSMS = (to, message) => {
  client.messages
    .create({
      from: "+16314898658",
      to: "+6309560442139",
    })
    .then((message) => console.log(message.sid))
    .done();
};
