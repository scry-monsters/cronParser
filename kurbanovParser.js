// The code became quite big, so I added some comments to make it easier to understand what I wrote 

// Grabbing the 'second' (third) element in the arguments from the command line
const args = process.argv.slice(2);

if (!args.length) {
  console.error('Syntax for the command: node kurbanovParser.js "your_cron_string"');
  process.exit(1);
}

// Currently we have an array with the string inside it, so we will extract the string itself
const cronString = args[0];

function cronParser(cronString) {
  const cronFields = cronString.split(" ");
  const fields = ['minute', 'hour', 'day of month', 'month', 'day of week', 'command'];

  if (cronFields.length !== 6) {
    console.error("Incorrect input! Provide a valid cron string!");
    //Doesn't really matter if the exit code is 0 (which is the default value), 1 or 2, they just exit the app
    process.exit(0);
  }

  function maxValue(index) {
    if (index === 0) {
      // max minute count
      return 59; 
    } else if (index === 1) {
      // max hours in a day count
      return 23; 
    } else if (index === 2) {
      // max days in a month count
      return 31; 
    } else if (index === 3) {
      // max months count
      return 12; 
    } else if (index === 4) {
      // days in a week count, it starts at 0 so sunday is going to be under day 6
      return 6; 
    }
    return -1;
  }


  // helper function for the minutes 

    function minuteParser(minuteField) {
    if (minuteField === "*") {
      return Array.from({ length: 59 }, (_, i) => i + 1).join(" ");
    } 
    // This part gets a little tricky, so basically if we see the slash '/' then we want to separate the two number before and under it, we know that the first number is the starting point
    // and the second is the step we take, */15 will equal to 0,15,30,45 and so on 
    else if (minuteField.includes("/")) {
      let [stepValue, step] = minuteField.split("/");
      step = Number(step);
      if (stepValue === "*") {
        return stepCounter(0, maxValue(0), step);
      }
      if (!isNaN(step)) {
        return stepCounter(Number(stepValue), maxValue(0), step);
      }
      return "NaN";
    } else {
      return minuteField;
    }
  }

// a helper func to bring the results out for the user to see
  const results = fields.map((field, index) => {
    const value = cronFields[index];
    if (field === "minute") {
      return `${field} ${minuteParser(value)}`;
    } else if (field === 'command') {
      return `${field} ${cronFields.slice(5).join(' ')}`;
    } else if (value === '*') {
      return `${field} ${getAllValues(index)}`;
    } else if (value.includes('/')) {
      const [stepValue, step] = value.split('/').map(Number);
      if (!isNaN(stepValue) && !isNaN(step)) {
        return `${field} ${stepCounter(stepValue, maxValue(index), step)}`;
      } else {
        return `${field} NaN`;
      }
    } else {
      return `${field} ${parseField(value, maxValue(index))}`;
    }
  });

  return results.join('\n');
}

function parseField(field, max) {
  const values = field.split(',');
  // a set will be better than an array because it will check for duplicates and maintain order
  const result = new Set();
  values.forEach((value) => {
    // hyphen means a range of values
    if (value.includes('-')) {
      const [start, end] = value.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        result.add(i);
      }
    } else {
      const num = Number(value);
      if (!isNaN(num) && num <= max) {
        result.add(num);
      }
    }
  });

  return Array.from(result).join(' ');
}

function getAllValues(index) {
  //minutes
  if (index === 0) {
    //in this callback, '_' is a placeholder for the array elements (which are not used in this case), and 'i' represents the current index (which I will use)
    // btw I am adding 1 to everything so that the starting point won't be 0,1,2,3 and so on but 1,2,3,4 
    return Array.from({ length: 59 }, (_, i) => i + 1).join(' ');
    // hours in a day
  } else if (index === 1) {
    return Array.from({ length: 24 }, (_, i) => i + 1).join(' ');
    // days in a month
  } else if (index === 2) {
    return Array.from({ length: 31 }, (_, i) => i + 1).join(' ');
    // months
  } else if (index === 3) {
    return Array.from({ length: 12 }, (_, i) => i + 1).join(' ');
    //days of the week
  } else if (index === 4) {
    return Array.from({ length: 7 }, (_, i) => i + 1).join(' ');
  }

  return '';
}

//I don't think this needs any explaining
function stepCounter(start, end, step) {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result.join(' ');
}

const result = cronParser(cronString);
console.log(result);
