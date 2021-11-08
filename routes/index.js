const express = require('express');
const router = express.Router();

const schedule = require('node-schedule');
const discordClient = require('../discord-client')

const moment = require('moment-timezone');

const SERVER_ID = "906790632557772851";
const CHANNEL_ID = "906790633073704992";

/* GET home page. */
router.get('/', (req, res) => {
  const time = new Date();
  const japanTime = moment.tz(time.toISOString(), "Asia/Tokyo").format()

  if ("success" in req.query) {
    res.render('index', {success: true, time: time, japanTime: japanTime});
  } else {
    res.render('index', {time: time, japanTime: japanTime});
  }
});

router.post('/schedule', (req, res) => {
  const the_guild = discordClient.guilds.cache.get(SERVER_ID);
  const the_channel = the_guild.channels.cache.get(CHANNEL_ID);

  // interpret time as Tokyo time
  const scheduledTokyoTime = moment.tz(req.body.messageTime, "Asia/Tokyo");
  console.log(`scheduled tokyo time is ${scheduledTokyoTime}`)

  // convert time to the time on the machine
  const scheduledTimeOnMachine = new Date(scheduledTokyoTime.utc().format())
  console.log(`scheduled local time is ${scheduledTimeOnMachine}`)

  schedule.scheduleJob(scheduledTimeOnMachine, () => {
    the_channel.send(req.body.messageText);
  });

  the_channel.send(
      `Message: 
> ${req.body.messageText}
will be sent at (Japan Time):
\`${scheduledTokyoTime}\``
  );

  res.redirect("/?success");
});

module.exports = router;
