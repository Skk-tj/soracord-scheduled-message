const express = require('express');
const router = express.Router();

const schedule = require('node-schedule');
const discordClient = require('../discord-client')

const moment = require('moment-timezone');

const SERVER_ID = "734575232245039145";
const LIVE_CHANNEL_ID = "735529538066579467";
const ADMIN_CHANNEL_ID = "734576939976753232";
const FAN_CLUB_CHANNEL_ID = "940694871667277894";
const LOG_CHANNEL_ID = "907160595994910761";

const CHANNELS = {
  "live": ["#sora-live", LIVE_CHANNEL_ID],
  "admin": ["#admin", ADMIN_CHANNEL_ID],
  "fanclub": ["#sora-fanclub", FAN_CLUB_CHANNEL_ID]
};

const channel_reverse_index = {
  "735529538066579467": "#sora-live",
  "734576939976753232": "#admin",
  "940694871667277894": "#sora-fanclub"
}

let scheduledMessages = [];

/* GET home page. */
router.get('/', (req, res) => {
  const time = new Date();
  const japanTime = moment.tz(time.toISOString(), "Asia/Tokyo").format()

  if ("success" in req.query) {
    res.render('index', {success: true, time: time, japanTime: japanTime, channels: CHANNELS});
  } else {
    res.render('index', {time: time, japanTime: japanTime, channels: CHANNELS});
  }
});

router.get('/list', (req, res) => {
  console.log(scheduledMessages);
  res.render('list', {messages: scheduledMessages});
});

router.get('/delete', (req, res) => {
  if ("message" in req.query) {
    const index = parseInt(req.query.message);
    const job = scheduledMessages[index].job;

    if (job !== null) {
      job.cancel();
    }

    console.log("job cancelled");

    scheduledMessages.splice(index, 1);

    console.log(`${index} deleted`);

    res.redirect("/list");
  } else {
    res.sendStatus(400);
  }
});

router.post('/schedule', (req, res) => {
  const the_channel_id = req.body.messageTarget

  if (!the_channel_id) {
    res.sendStatus(400);
    return
  }

  const the_guild = discordClient.guilds.cache.get(SERVER_ID);
  const the_channel = the_guild.channels.cache.get(the_channel_id);
  const the_log_channel = the_guild.channels.cache.get(LOG_CHANNEL_ID);

  // interpret time as Tokyo time
  const scheduledTokyoTime = moment.tz(req.body.messageTime, "Asia/Tokyo");
  console.log(`scheduled tokyo time is ${scheduledTokyoTime}`)

  // convert time to the time on the machine
  const scheduledTimeOnMachine = new Date(scheduledTokyoTime.clone().utc().format())
  console.log(`scheduled local time is ${scheduledTimeOnMachine}`)

  const job = schedule.scheduleJob(scheduledTimeOnMachine, () => {
    the_channel.send(req.body.messageText);
  });

  the_log_channel.send(
      `Message: 
> ${req.body.messageText}
will be sent at (Japan Time):
\`${scheduledTokyoTime.format()}\`
This message will be sent to <#${the_channel_id}>
`
  );

  scheduledMessages.push({
    time: scheduledTokyoTime.format(),
    channel: channel_reverse_index[the_channel_id],
    message: req.body.messageText,
    job: job
  });

  res.redirect("/?success");
});

module.exports = router;
