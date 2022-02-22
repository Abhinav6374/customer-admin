const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/demoDb",{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("Connection Sucessful")
}).catch((err)=>{
    console.log("Not Connected")
})