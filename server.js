const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer ({dest: __dirname + "/public/images"});

//

mongoose
.connect("mongodb+srv://tlogue321:5vUhcARKV5OZ7rYo@cluster0.9ltvhyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
    console.log("Connected to Mongodb");
})
.catch(error => console.log("Couldn't connect to Mongodb", error));

const craftSchema = new mongoose.Schema({
    name:String,
    description:String,
    supplies:[String],
    image:String,
 });

 const Craft = mongoose.model("Craft" , craftSchema);

 app.get("/",(req,res)=> {
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/crafts", (req, res) =>{
    getCrafts(res);
});

const getCrafts = async(res) => {
    const crafts = await Craft.find();
    res.send(crafts);
};

app.get("/api/crafts/:id" , (req,res) => {
   getCraft(res, req.params.id);
});

const getCraft = async(res, id) => {
    const craft = await Craft.findOne({ _id: id })
    res.send(craft);
};


app.post("/api/crafts", upload.single("img"), (req,res) => {
    const result = validateCraft(req.body);

    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const craft = new Craft ({
        name:req.body.name,
        description:req.body.description,
        supplies:req.body.supplies.split(","),
        img: String,
    });

    if (req.file) {
        craft.img = "images/" + req.file.filename;
    }

    createCraft(res, craft);
});

const createCraft = async (res, craft) => {
    const result = await craft.save();
    res.send(craft);
}

app.put("/api/crafts/:id", upload.single("img"), (req,res) => {

    const result = validateCraft(req.body);

    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    updateCraft(req,res);
});

const updateCraft = async (req, res) => {
    let field = {
        name:req.body.name,
        description:req.body.description,
        supplies:req.body.supplies.split(",")
    }

    if(req.file) {
        field.img = "images/" + req.file.filename;
    }

    const results = await Craft.updateOne({_id: req.params.id}, field);
    res.send(results);
};


app.delete("/api.crafts/:id",(req,res)=>{
   removeCrafts(res, req.params.id);
});

const removeCrafts = async(res, id) => {
    const craft = await Craft.findByIdAndDelete(id);
    res.send(craft);
};



const validateCraft = (craft) => {
    const craftSchema = Joi.object({
        _id: Joi.allow(""),
        supplies: Joi.string().min(4).required(),
        name: Joi.string().min(3).required(),
        description: Joi.string().min(3).required(),
        img: Joi.object({
            filename: Joi.string().required(),
        }),
    });

    return craftSchema.validate(craft);
};
    
    
app.listen(3007,()=>{
    console.log("listening");
});