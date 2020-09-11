const fs = require("fs");

const readline = require("readline");
const { google } = require("googleapis");

fs.mkdir("./Decrypted_Message", function () {
  console.log("Folder Created Successfully!");
});

// For Decryption
var aesjs = require("aes-js");
var pbkdf2 = require("pbkdf2");
var key = pbkdf2.pbkdf2Sync("password", "salt", 5, 256 / 8, "sha512");
// var key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
console.log(key);

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), listLabels);
});

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}
var labels;
var mail_message;

function listLabels(auth) {
  let i = 0;
  const gmail = google.gmail({ version: "v1", auth });
  var nextPageToken = null;
  gmail.users.messages.list(
    {
      userId: "me",
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      labels = res.data.messages[0].id;
      console.log(labels);
      gmail.users.messages.get(
        {
          auth: auth,
          userId: "me",
          id: labels,
        },
        function (err, response) {
          if (err) {
            console.log("The API returned an error: " + err);
            return;
          }

          const unread = response.data.labelIds[0];
          var from;
          var to;
          var subject;

          for (let i = 0; i < response.data.payload.headers.length; i++) {
            if (response.data.payload.headers[i].name == "From") {
              from = response.data.payload.headers[i].value;
            } else if (
              response.data.payload.headers[i].name == "Delivered-To"
            ) {
              to = response.data.payload.headers[i].value;
            } else if (response.data.payload.headers[i].name == "Subject") {
              subject = response.data.payload.headers[i].value;
            }
          }

          mail_message = response.data.snippet;
          // console.log(response.data);

          var encryptedBytes = aesjs.utils.hex.toBytes(mail_message);
          var aesCtr = new aesjs.ModeOfOperation.ctr(key);
          var decryptedBytes = aesCtr.decrypt(encryptedBytes);
          var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

          if (from == "mailerservicevs@gmail.com") {
            console.log(
              "You have one Encrypted Message from your Organization!"
            );
            console.log("Decrypting your message and saving it locally...");
            fs.writeFile(
              `./Decrypted_Message/${subject}.txt`,
              `Label: ${unread}\n\nFrom:${from}\n\nTo:${to}\n\nSubject:${subject}\n\nEncrypted Message:${mail_message}\n\nDecrypted Message:${decryptedText}`,
              function (err) {
                if (err) throw err;
                console.log("Message Saved!");
              }
            );
          } else {
            console.log(
              "No Message from your Organization! Try after Some time"
            );
          }
        }
      );
    }
  );
}
