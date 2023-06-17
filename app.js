const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _=require("lodash");
require('dotenv').config();
const app=express();

//this line of code will tell app.js generated by express to use ejs as view engine.
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// main().catch(err => console.log(err));
const uri=process.env.uri;
mongoose.connect(uri+"/todolistDB");
console.log("Database connected sucessfully.")
const itemSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    }
});
const Item = new mongoose.model("Item",itemSchema);

const item1=new Item({
    name:"Welcome to your todolist!"
})
const item2=new Item({
    name:"Hit the + button to add a new item."
})
const item3=new Item({
    name:"<-- Hit this to delete an item."
})
const defaultItems=[item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}
const List= new mongoose.model("List",listSchema);

// const res=await Item.find({});
// console.log(res);
// mongoose.disconnect();


app.get("/",function(req,res){
    let today=new Date();
    // let currentDay=today.getDay();
    // let day="";
    // if(currentDay===6 || currentDay===0){
        //     day="weekend";
        // }
        // else{
            //     day="weekday";
            // }
            // let weekday=["Sunday","Monday","Tuesday","Wednessday","Thursday","Friday","Saturday"];
            // res.render('lists',{kindOfDay:weekday[currentDay]});
            let options={
                weekday: 'long', 
                day: 'numeric', 
                month: 'long'
            };
            let day=today.toLocaleDateString("en-us",options);
            const func=async ()=>{
                const foundItems=await Item.find({});
                // console.log(foundItems); 
                if(foundItems.length===0){
                    Item.insertMany(defaultItems);
                    res.redirect("/");
                }
                else
                    res.render("lists",{listTitle:"Today",newListItems:foundItems});
            };
    func();

})
app.post("/",function(req,res){
    let itemName=req.body.newItem; 
    const listName= req.body.list;
    const item=new Item({
        name: itemName
    })
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        const func = async ()=>{
            const foundList= await List.findOne({name:listName}).exec();
            foundList.items.push(item)
            foundList.save();
        }
        func();
        res.redirect("/"+listName); 
    }
});

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
        const func=async ()=>{
            await Item.deleteOne({_id:checkedItemId});
        }
        func();
        res.redirect("/"); 
    }
    else{
        const func=async ()=>{

            await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});
        }
        func();
        res.redirect("/"+listName);
    }
})

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName); 
    const func=async ()=>{
        const foundList=await List.findOne({name:customListName}).exec();
        if(foundList){
            res.render("lists",{listTitle:foundList.name,newListItems:foundList.items});
        }
        else{
            const list=new List({ 
                name:customListName,
                items: defaultItems 
            })
            list.save();
            res.redirect("/"+customListName);
        }
    }
    func();
})
app.get("/about",function(req,res){
    res.render("about");
})

app.listen(process.env.PORT||3000,function(){
    console.log("server is started.");  
})