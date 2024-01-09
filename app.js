const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'userData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
app.post('/register', async (request, response) => {
  let {username, name, password, gender, location} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`
  let hashedPassword = await bcrypt.hash(request.body.password, 10)
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    let createUserQuery = `
      INSERT INTO 
        user (username, name, password, gender, location) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}',
          '${location}'
        )`
    if (password.length < 5) {
      response.status(400);
      response.send('Password is too short');
    } else {
      await db.run(createUserQuery)
      response.status(200);
      response.send('User created successfully');
    }
  } else {
    response.status(400);
    response.send('User already exists');
  }
})
