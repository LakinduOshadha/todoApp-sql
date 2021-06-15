// @author Lakindu Oshadha (lakinduoshadha98@gmail.com)

let express = require('express')
let mysql = require('mysql')
let sanitizeHTML = require('sanitize-html')

let app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))

// Connecting to SQL database
let dbConfig = {
  host:'us-cdbr-east-04.cleardb.com',
  user: 'b15a695a411349',
  password: 'f15eacc4',
  database: 'heroku_22a4d4d84eb1c85',
  connectTimeout : 60000
}

console.log('Trying to connect to the database')
let db = mysql.createPool(dbConfig)
db.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error
  app.listen(process.env.PORT || 3000)
  console.log('MySQL Connected')
  console.log('The solution is: ', results[0].solution)
})

// Password Protection
function passwordProtected(req, res, next) {
  res.set('WWW-Authenticate', 'Basic realm ="Simple Todo App"')
  if (req.headers.authorization == "Basic TGFraW5kdU9zaGFkaGE6UGFzc3dvcmQ=") {
    next()
  } else {
    res.status(401).send("Authentication Required")
  }
}

app.use(passwordProtected)

// Homepage GET request
app.get('/',passwordProtected, function(req, res) {
  // Retrieving data from database
  let sql = 'SELECT * FROM items'
  db.query(sql, (err, results) => {
    if (err) throw err

    // Sending response
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple To-Do App</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    </head>
    <body>
      <div class="container">
        <h1 class="display-4 text-center py-1">To-Do App</h1>
        
        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action="/create-item" method="POST">
            <div class="d-flex align-items-center">
              <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button id="add-button" class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div> 
        <ul id="item-list" class="list-group pb-5">
        </ul>
      </div>

      <script>
      let items = ${JSON.stringify(results)}
      </script>
      <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
      <script src='/browser.js'></script>

    </body>
    </html>
    `)
  })
})

// creates item for create-item POST request
app.post('/create-item', function(req, res) {
  // Sanitizing the input
  let sanitizedText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: []})
  if (sanitizedText == "") {return}

  let post = {item: sanitizedText}
  let sql = 'INSERT INTO items SET ?'

  db.query(sql, post, (err, results) => {
    if (err) throw err

  sql = `SELECT * FROM items WHERE id=${results.insertId}`
  db.query(sql, (err, results) => {
    if (err) throw err
    res.json({
      id: results[0].id,
      item: results[0].item
    })
  })
  })  
})

// updates item for update-item POST request
app.post('/update-item', function(req, res) {
 // Sanitizing the input{
  let sanitizedText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: []})
  if (sanitizedText == "") {return}

  let sql = `UPDATE items SET item = '${sanitizedText}' WHERE id = ${req.body.id}`

  db.query(sql, err => {
    if(err) {
      throw err
    }
    res.send("success")
  })
})

// deletes item for delete-item POST request
app.post('/delete-item', function(req, res){
  let sql = `DELETE FROM items WHERE id = ${req.body.id}`

  db.query(sql, err => {
    if(err) {
      throw err
    }
    res.send("success")
  })
})

