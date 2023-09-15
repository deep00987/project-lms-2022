require('dotenv').config()
const {google} = require('googleapis')

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
)

const scopes = [
  'https://mail.google.com/',
]

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: "https://mail.google.com/",
})

async function getGmailTokens(){
  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });
  try {
    const token = await oauth2Client.getAccessToken()
    return token
  } catch (error) {
    throw error
  }
  
}
//nothing
module.exports = {getGmailTokens}