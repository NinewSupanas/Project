var express = require('express');
var cors = require('cors');
const mysql = require('mysql');

const port = 8000; // port sever

const connection = mysql.createConnection({
    host:'sql12.freesqldatabase.com',
    user:'sql12712112',
    database:'sql12712112',
    password:'fE5j68QzaX',
    port:'3306'
});

const table ='teach_table';

var app = express();
app.use(cors());
app.use(express.json());

connection.connect((err) =>{
    if(err) {
        console.error('Error onnecting to Database :', err);
        return;
    }
    console.log(`Connected to database with threadID ${connection.threadId}`);

});

//API
app.get('/',(req,res) => {
    res.send('Server is working')
});

//api คุยกับ DB
app.get('/getdata',(req ,res)=>{
    connection.query(`SELECT * FROM ${table}`,(err,result) =>{
        if(err){
            res.status(500).send(err);
        }else {
            res.json(result)
        }
    });
});

//insert 
app.post('/insert',async (req,res )=>{
    const student_data = req.body;

    if(!student_data || Object.keys(student_data).length === 0 ){
        return res.status(400).json({
            message: "No student data provided"
        });
    }

    const {ID, Name} = student_data

    const query =`
    INSERT INTO ${table} (ID, Name)
    VALUES (?,?)
    
    `;

    const values = [ID, Name];

    connection.query(query, values, (err,result) =>{
        if (err) {
            console.error(err);
            return res.status(500).json({
                message:'Database insertion failed'
            });
        }

        res.status(201).json({
            message:'Student data inserted successfully'
        });
    });
});

//query
// http://localhost:8000/search?column=id&value=3
app.get('/search', async(req,res)=> {
    const column = req.query.column;
    const value = req.query.value;

    if (!column || !value){
        return res.status(400).send('Column and value query parameters arerequired');

    }
    const query =` SELECT * FROM ${table} WHERE ${column} =?`;

    connection.query(query, value, (err,result) =>{
        if(err){
            console.error(err);
            return res.status(500).json({
                message:'Database seaching failed'
            });
        }
        res.status(200).json(result);
    })
})
//Delete
// http://localhost:8000/delete?column=name&value=test2
app.delete('/delete',async(req,res)=>{
    const column = req.query.column;
    const value = req.query.value;

    if(!column || !value){
        return res.status(400).send('Column and value query parameters are required');
    }
    const query =`DELETE FROM ${table} WHERE ${column} =?`;

    connection.query(query, value, (err, result)=>{
        if(err){
            console.error(err);
            return res.status(500).json({
                message:'database deletion failed'
            });
        }
        res.status(200).json({
            message: 'Delete deletion succeded',
            affctedRows:result.affctedRows
        });
    });
});


//UPDATE
// http://localhost:8000/update?column=id&value=1
app.put('/update', async (req, res) => {
    const column =req.query.column;
    const value = req.query.value;

    const update_data = req.body;

    if(!column || !value){
        return res.status(400).send('Column and value query parameters are required');

    }

    if(!update_data || Object.keys(update_data).length === 0){
        return res.status(400).json({
            message:"No student data provide to update"
        });
    }

    const values =[...Object.values(update_data),value]
    const setClause = Object.keys(update_data).map(key => `${key} =?`).join(',');
    const query =`UPDATE ${table} SET ${setClause} WHERE ${column} =?`

    connection.query(query, values, (err, result) =>{
        if (err){
            return res.status(500).json({
                message:'Database updation failed ',err
            });
        }
        res.status(200).json({
            message: 'Student data updated successfully',
            affctedRows: result.affctedRows
        });
    });
});

app.listen(port,() => {
    console.log(`Server is runging on http://localhost:${port}`);
})