var http = require("http");

function download(url, callback) {
  http.get(url, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
    });
  }).on("error", function() {
    callback(null);
  });
}

function question(language, category, question, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3) {
  this.language = language;
  this.category = category;
  this.question = question;
  this.correctAnswer = correctAnswer;
  this.wrongAnswer1 = wrongAnswer1;
  this.wrongAnswer2 = wrongAnswer2;
  this.wrongAnswer3 = wrongAnswer3;
}

function getRandomNumberDifferentTo(number, max) {
  var result = Math.floor(Math.random()*(max-1));
  return result < number ? result : result + 1;
}

function getRandomNumberDifferentToAll(numbers, max) {
  var noneNumbers = numbers.slice(0);
  noneNumbers.sort();
  var result = Math.floor(Math.random()*(max-noneNumbers.length));
  for (var i = 0; i < noneNumbers.length; ++i) {
    if(result >= noneNumbers[i]) {
      ++result;
    }
  }
  return result;
}

function getRandomNumbersDifferentTo(number, max, count) {
  var result = new Array();
  result[0] = number;

  for (var i = 0; i < count; ++i) {
    result.push(getRandomNumberDifferentToAll(result, max));
  }

  return result.splice(1);
}

function addWrongAnswers(questions) {
  for (var i = 0; i < questions.length; ++i) {
    var numbers = getRandomNumbersDifferentTo(i, questions.length, 3);
    questions[i].wrongAnswer1 = questions[numbers[0]].correctAnswer;
    questions[i].wrongAnswer2 = questions[numbers[1]].correctAnswer;
    questions[i].wrongAnswer3 = questions[numbers[2]].correctAnswer;
  }
}

function addWrongAnswersFromPool(question, answerPool) {
  var numbers = getRandomNumbersDifferentTo(answerPool.indexOf(question.correctAnswer), answerPool.length, 3);
  question.wrongAnswer1 = answerPool[numbers[0]];
  question.wrongAnswer2 = answerPool[numbers[1]];
  question.wrongAnswer3 = answerPool[numbers[2]];
}

function addWrongAnswersFromPoolToAll(questions, answerPool) {
  for (var i = 0; i < questions.length; ++i) {
    addWrongAnswersFromPool(questions[i], answerPool);
  }
}

function printQuestions(questions) {
  for (var i = 0; i < questions.length; ++i) {
    printQuestion(questions[i]);
  }
}

function printQuestion(question) {
  console.log(question.language + " / " + question.category + " / " + question.question + " / " + question.correctAnswer + " / " 
    + question.wrongAnswer1 + " / " + question.wrongAnswer2 + " / " + question.wrongAnswer3);
}

function addToDatabase(questions) {
  printQuestions(questions);
}

function generateQuestions() {
  getCapitalCities(function(questions) { addToDatabase(questions); });
  getReligionByCountry(function(questions) { addToDatabase(questions); });
  getOscarWinners(function(questions) { addToDatabase(questions); });
}

generateQuestions();


// ------------------------------------------------------------------------- //
//                  actual site parsing starts here                          //
// ------------------------------------------------------------------------- //

function getCapitalCities(callback) {
  var url = "http://en.wikipedia.org/wiki/List_of_national_capitals_in_alphabetical_order";
  download(url, function(data) {
    var result = new Array();
    if (data) {
      // <table class="wikitable sortable" style="font-size:95%;">
      var table = data.match(/<table class="wikitable sortable"([\s\S]*?)<\/table>/);

      /*
      <tr>
      <td><a href="/wiki/Abuja" title="Abuja">Abuja</a></td>
      <td><b><span class="flagicon"><img ... />&#160;</span><a href="/wiki/Nigeria" title="Nigeria">Nigeria</a></b></td>
      <td></td>
      </tr>
      */
      var row = table[0].match(/<tr>[\s\S]*?<\/tr>/g);
      for (var i = 0; i < row.length; ++i) {
        var reg = new RegExp(/title="(.*?)"/g);
        var capital = reg.exec(row[i]);
        var country = reg.exec(row[i]);
        if(capital != null && country != null) {
          result.push(new question("en", "Geography", "What is the capital of " + country[1] + "?", capital[1], "1", "2", "3"));
        }
      }

      addWrongAnswers(result);
    }
    callback(result); 
  });
}

function getReligionByCountry(callback) {
  var religions = ["Christian", "Muslim", "Unaffiliated", "Hindu", "Buddhist", "Folk Religion", "Other Religion", "Jewish"];

  var url = "http://en.wikipedia.org/wiki/Religions_by_country";
  download(url, function(data) {
    var result = new Array();
    if (data) {
      // <table class="wikitable sortable"">
      var table = data.match(/<table class="wikitable sortable"([\s\S]*?)<\/table>/);
      
      /*
      <tr>
      <td><a href="/wiki/Burundi" title="Burundi">Burundi</a></td>
      <td><a href="/wiki/Sub-Saharan_Africa" title="Sub-Saharan Africa">Sub-Saharan Africa</a></td>
      <td><a href="/wiki/Eastern_Africa" title="Eastern Africa">Eastern Africa</a></td>
      <td>8 380 000</td>
      <td>7 667 700</td>
      <td>91.50&#160;%</td>
      <td>234 640</td>
      <td>2.80&#160;%</td>
      <td>0</td>
      <td>0.00&#160;%</td>
      <td>0</td>
      <td>0.00&#160;%</td>
      <td>0</td>
      <td>0.00&#160;%</td>
      <td>477 660</td>
      <td>5.70&#160;%</td>
      <td>0</td>
      <td>0.00&#160;%</td>
      <td>0</td>
      <td>0.00&#160;%</td>
      </tr>
      */
      var row = table[0].match(/<tr>[\s\S]*?<\/tr>/g);
      for (var i = 0; i < row.length; ++i) {
        var country = row[i].match(/title="(.*?)"/);
        if(country != null) {
          
          // parse percentages
          var reg = new RegExp(/<td.*?>(.*?)&#160;%<\/td>/g);
          var religonPercentages = new Array();
          for(var i2 = 0; i2 < religions.length; i2++) {
            var value = reg.exec(row[i]);            
            religonPercentages.push(value == null ? 0 : parseFloat(value[1]));  
          }

          // find max percentage
          var max = -1;
          var maxIndex = -1;
          for(var i2 = 0; i2 < religonPercentages.length; i2++) {
            if(max < religonPercentages[i2]) {
              max = religonPercentages[i2];
              maxIndex = i2;
            }
          }

          if(max == 0) {
            continue;
          }

          result.push(new question("en", "Geography", "What is the dominant religion (" + religonPercentages[maxIndex] + "%) in " + country[1] + "?", 
            religions[maxIndex], "1", "2", "3"));
        }
      }

      addWrongAnswersFromPoolToAll(result, religions);
    }
    callback(result); 
  });
}

function getOscarWinners(callback) {
  var url = "http://en.wikipedia.org/wiki/Academy_Award_for_Best_Actor";
  download(url, function(data) {
    var result = new Array();
    if (data) {
      // <table class="wikitable" style="text-align: center;" border="2" cellpadding="4">
      var table = data.match(/<table class="wikitable" style="text-align: center;"([\s\S]*?)<\/table>/);
      
      /*
      <tr>
      <th scope="row" rowspan="6" style="text-align:center"><a href="/wiki/1989_in_film" title="1989 in film">1989</a><br />
      <small><a href="/wiki/62nd_Academy_Awards" title="62nd Academy Awards">(62nd)</a></small></th>
      </tr>
      <tr style="background:#FAEB86">
      <td><a href="/wiki/Daniel_Day-Lewis" title="Daniel Day-Lewis">Daniel Day-Lewis</a><img alt="Award winner" src="//upload.wikimedia.org/wikipedia/commons/f/f9/Double-dagger-14-plain.png" width="9" height="14" /></td>
      <td><i><a href="/wiki/My_Left_Foot_(film)" title="My Left Foot (film)" class="mw-redirect">My Left Foot</a></i></td>
      <td><a href="/wiki/Christy_Brown" title="Christy Brown">Christy Brown</a></td>
      <td rowspan="5"><sup id="cite_ref-Oscars62_65-0" class="reference"><a href="#cite_note-Oscars62-65"><span>[</span>65<span>]</span></a></sup></td>
      </tr>
      <tr>
      <td><a href="/wiki/Kenneth_Branagh" title="Kenneth Branagh">Kenneth Branagh</a></td>
      <td><i><a href="/wiki/Henry_V_(1989_film)" title="Henry V (1989 film)">Henry V</a></i></td>
      <td><a href="/wiki/Henry_V_of_England" title="Henry V of England">King Henry V of England</a></td>
      </tr>
      <tr>
      <td><a href="/wiki/Tom_Cruise" title="Tom Cruise">Tom Cruise</a></td>
      <td><i><a href="/wiki/Born_on_the_Fourth_of_July_(film)" title="Born on the Fourth of July (film)">Born on the Fourth of July</a></i></td>
      <td><a href="/wiki/Ron_Kovic" title="Ron Kovic">Ron Kovic</a></td>
      </tr>
      <tr>
      <td><a href="/wiki/Morgan_Freeman" title="Morgan Freeman">Morgan Freeman</a></td>
      <td><i><a href="/wiki/Driving_Miss_Daisy" title="Driving Miss Daisy">Driving Miss Daisy</a></i></td>
      <td>Hoke Colburn</td>
      </tr>
      <tr>
      <td><a href="/wiki/Robin_Williams" title="Robin Williams">Robin Williams</a></td>
      <td><i><a href="/wiki/Dead_Poets_Society" title="Dead Poets Society">Dead Poets Society</a></i></td>
      <td>John Charles "Keats" Keating</td>
      </tr>
      */
      var row = table[0].match(/ in film"[\s\S]*?_in_film/g);
      for (var i = 0; i < row.length; ++i) {
        var year = row[i].match(/>(.*?)</);
        
        // parse winner
        var winner = row[i].match(/<tr[\s\S]*?<td>(<i>)*(<a[\s\S]*?>)*([\s\S]*?)<[\s\S]*?<td>(<i>)*(<a[\s\S]*?>)*([\s\S]*?)<[\s\S]*?<td>(<i>)*(<a[\s\S]*?>)*([\s\S]*?)</);

        if(year != null && winner != null) {
          var reg = new RegExp(/<tr[\s\S]*?title="([\s\S]*?)"[\s\S]*?<\/tr>/g);

          // parse nominees
          var nominees = new Array();
          while(true) {
            var nominee = reg.exec(row[i]);
            if(nominee == null) {
              break;
            } else {
              nominees.push(nominee[1])
            }
          }

          if(nominees.length >= 4) {
            var q =new question("en", "Movies", "Who won an Academy Award (Oscar) in " + year[1] + " for his portrayal of " + winner[9] + " in " + winner[6] + "?", 
              winner[3], "1", "2", "3")
            addWrongAnswersFromPool(q, nominees);
            result.push(q);
          }
        }
      }      
    }
    callback(result); 
  });
}