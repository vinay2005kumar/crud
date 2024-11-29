const express=require('express')
const employee=require('./model')
const mongoose=require('mongoose')
const cors=require('cors')
const multer=require('multer')
const app=express()
const path = require('path');
app.use(cors({origin:'*'}))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const url='mongodb+srv://vinaybuttala:223344Vinay@cluster0.qnujb1h.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(url,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>console.log('db connected'))
.catch(()=>console.log('not connected'))
const storage=multer.diskStorage({
    destination:'uploads/',
    filename:(req,file,cb)=>{
        cb(null,Date.now()+''+file.originalname)
    }
})
const uploads=multer({
    storage:storage
})
app.get('/employee',async(req,res)=>{
    try{
    const result=await employee.find({})
    res.json(result)
    }
    catch(err){
        console.log(err)
    }
})
app.use(express.json()); 

app.post('/upload',uploads.single('file'),async(req,res)=>{
    try{
        const newEmployee=new employee({
            ...req.body,
            file:req.file.filename
        })
        await newEmployee.save()
        res.status(201).json(newEmployee)
        
    }
    catch(err){
        console.log(err)
        res.json('hello')
    }
})
app.put('/employee/:id', uploads.single('file'), async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (req.file) {
            updateData.file = req.file.filename;
        }

        const updatedEmployee = await employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedEmployee);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

app.get('/employee/:id',async(req,res)=>{
    try{
        const result=await employee.findById(req.params.id)
    }
    catch(err){
        console.log(err)
    }
})
app.delete('/employee/:id',async(req,res)=>{
    try{
        const result=await employee.findByIdAndDelete(req.params.id)
        res.json('deleted')
    }
    catch(err){
        console.log(err)
    }
})
const url1=process.env.port || 3001
app.listen(url1,()=>{
    console.log('listen');
})