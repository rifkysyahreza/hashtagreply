const puppeteer = require("puppeteer");
const Twitter = require("twitter-v2");
const readlineSync = require("readline-sync"); // import modul readline-sync with readlineSync name
const fs = require("fs");

const client = new Twitter({
  bearer_token:
    "your_bearer_token_here",
});

async function main() {
  var username = readlineSync.question("username : "); // input username
  var password = readlineSync.question("password : ", { hideEchoBack: true }); // input password, hideEchoBack is for censoring the password
  var keyword = readlineSync.question("keyword : "); // input keyword, example: #Binance #Giveaway
  var kata = readlineSync.question("kata-kata : "); // input a word for reply the tweet
  var max_tweet = readlineSync.question("how much : "); // input how much tweet your want to reply

  const options = { waitUntil: "networkidle2" }; // waiting for the page fully loaded
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage(); // open new page on chrome driver

  //===================================LOGIN===================================
  await page.goto("https://twitter.com/i/flow/login", options); // go to this URL and wait for the page to fully loaded
  const emailField = await page.$("input[name=text]"); // mlooking for <input name='username'> element
  await emailField.type(username); // input username from CLI input
  await emailField.dispose();

  const [btnNext] = await page.$x("//span[contains(., 'Next')]"); // looking for <span> element that has 'Next' string in it
  await btnNext.click(); // click Next button
  await btnNext.dispose();
  await page.waitForSelector(".css-901oao"); // waiting for .css-901oao selector appear, then execute next line
  //await new Promise(r => setTimeout(r, 2000));  // this code is for waiting or delay the next execution in miliseconds, in this line, the page waiting for 2 seconds to next execution

  const passField = await page.$("input[name=password]"); // looking for <input name='password'> element
  await passField.type(password); // input password from CLI input
  await passField.dispose();

  const [btnLogin] = await page.$x("//span[contains(., 'Log in')]"); // looking for <span> element that has 'Log in' string in it
  await btnLogin.click(); // click log in button
  await btnLogin.dispose();
  await page.waitForNavigation(); // waiting for next URL loaded
  //===================================LOGIN===================================

  if (page.url() == "https://twitter.com/home") {
    // condition if success log in and not success
    console.log("Login Sukses");

    //===================================API_GET===================================
    const {
      data: tweets,
      meta,
      errors,
    } = await client.get("tweets/search/recent", {
      query: `${keyword} -is:retweet -is:reply lang:en`, // search tweet with keyword input except retweet and reply that contain keyword
      max_results: max_tweet, // max API result
    });

    if (errors) {
      console.log("Errors:", errors);
      return;
    }
    //===================================API_GET==================================

    let tweetArrayRaw = []; // raw list of tweet id from API
    for (const tweet of tweets) {
      // console.log(tweet['id']);
      tweetArrayRaw.push(tweet["id"].toString().split("\n"));
    }

    let text = tweetArrayRaw.toString(); // turn raw list into string
    let tweetArrayNow = text.split(","); // turn string into list that ready to use

    let i = 0;
    const writeStream = fs.createWriteStream("./now.txt"); // write the ready to use list into a txt
    tweetArrayNow.forEach((value) =>
      writeStream.write(`${tweetArrayNow[i++]}\n`)
    );

    // read file and turn it into a list variable for double checking
    let tweetArrayCheck = fs
      .readFileSync("./previous.txt", "utf8")
      .toString()
      .split("\n");
    for (let i = 0; i < tweetArrayCheck.length; i++) {
      tweetArrayCheck[i] = tweetArrayCheck[i].replace("\r", "");
    }

    // ready for checking is the tweet already used in this code or not
    let tweetArrayTest = fs
      .readFileSync("./previous.txt", "utf8")
      .toString()
      .split("\n");
    let tweetArrayTotal = [];
    tweetArrayTest.pop();

    if (tweetArrayTest.length > 1) {
      //===================================CHECK_PREVIOUS_LINK===================================
      for (let i = 0; i < tweetArrayCheck.length; i++) {
        for (let j = 0; j < tweetArrayNow.length; j++) {
          if (tweetArrayCheck[i] == tweetArrayNow[j]) {
            tweetArrayNow.splice(j, 1);
          }
        }
      }
      tweetArrayTotal = tweetArrayCheck.concat(tweetArrayNow);
      //===================================CHECK_PREVIOUS_LINK===================================
    } else {
      tweetArrayTotal = tweetArrayNow;
    }

    i = 0;
    const writeStreamCheck = fs.createWriteStream("./previous.txt"); // write previous.txt file
    tweetArrayTotal.forEach((value) =>
      writeStreamCheck.write(`${tweetArrayTotal[i++]}\n`)
    );

    // looping for auto reply
    for (let i in tweetArrayNow) {
      await page.goto(
        `https://twitter.com/anyuser/status/${tweetArrayNow[i]}`,
        options
      );
      await page.waitForSelector(".DraftEditor-root"); // wait for page load

      const commentField = await page.$("div.DraftEditor-root"); // search for div.DraftEditor-root element
      await commentField.click("div.DraftEditor-root"); // click reply element
      await commentField.type(kata); // input the word from the TweetComment.txt into reply section
      await passField.dispose();

      const [btnBalas] = await page.$x("//span[contains(., 'Balas')]"); // search reply button **change 'Balas' into your language preference of 'Reply'**
      await btnBalas.click(); // click the reply button
      await btnBalas.dispose();

      await page.goto("https://twitter.com/home", options);
      await page.waitForSelector(".DraftEditor-root");
    }
  } else {
    console.log("Login Gagal");
  }

  //await browser.close();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
