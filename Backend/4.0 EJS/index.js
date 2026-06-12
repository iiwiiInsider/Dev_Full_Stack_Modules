const path = require('path');
const express = require('express');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Core logic: advice based on day of week using getDay()
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const adviceMap = {
  Sunday: 'Recharge a bit and plan your week—light prep goes a long way.',
  Monday: 'Set your top 3 priorities and start strong.',
  Tuesday: 'Great day for deep work—protect your focus.',
  Wednesday: 'Midweek check-in: adjust plans and keep momentum.',
  Thursday: 'Learn something new or help a teammate today.',
  Friday: 'Wrap things up and celebrate the wins.',
  Saturday: 'Get outside, explore, and have some fun.'
};

function getAdvice(date = new Date()) {
  const dayNumber = date.getDay(); // 0 (Sun) - 6 (Sat)
  const dayName = dayNames[dayNumber];
  const isWeekend = dayNumber === 0 || dayNumber === 6;
  const advice = adviceMap[dayName] || 'Make it a good one!';
  return { dayNumber, dayName, isWeekend, advice };
}

app.get('/', (req, res) => {
  const info = getAdvice();
  res.render('index', info);
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = { app, getAdvice };
