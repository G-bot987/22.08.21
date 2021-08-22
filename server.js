const express = require('express');
const fs = require("fs/promises")
const {uuid} = require('uuidv4');
// used to join file systems. 
const path = require('path');

// process.env.PORT research this 
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.static("public"))
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.post('/api/notes', (req, res) => {
  // Log that a POST request was received
    
  console.info(`${req.method} request received to add a note`);
 
  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;
 

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    
    const newNote = {
      title,
      text,
      id: uuid()
    };
addNote(newNote)
      
   

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting Note');
  }


});


app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/notes.html"))
})

// write a function called get notes - which will do a db call and get the notes from db.json with fs
function getNotes() {
    return new Promise((resolve, reject) => {
        fs.readFile('./db/db.json').then(notes => {
            const notesParsed = JSON.parse(notes);
            resolve(notesParsed);
        }).catch(error => {
            reject(error);
        });
    })
}

function addNote(note) {
    return new Promise((resolve, reject) => {


        getNotes().then(notes => {
            // note is added, notes array.
            notes.push(note);
            // fs is used to write the new notes to the db.json file. it is stringed, 
            fs.writeFile("./db/db.json", JSON.stringify(notes)).then(() => {
                // once the new notes have been written to the db.json we will then run getnotes to get the updated notes.
                getNotes().then(savedNotes => {
                    resolve(savedNotes);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    })
}




  




app.get("/api/notes", (req, res) => {
    getNotes().then(notes => {
        res.json(notes);
    });
})

// * is everything 
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"))
})



app.listen(PORT)
