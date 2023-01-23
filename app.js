

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todoDB')

const itemSchema = {
  name: String
};

const listSchema = {
  name: String,
  items:[itemSchema]
};

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model('List', listSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {
  var items = []
  Item.find({}, function (err,arr) {
    res.render("list", {listTitle: "Today", newListItems: arr});
  });
  

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const lname = req.body.list;
  const I = new Item({name:item})
  if (lname === "Today"){    
    I.save();
    res.redirect('/')
  } else {
    List.findOne({name:lname}, function(err,flist){
      flist.items.push(I);
      flist.save();
      res.redirect('/'+lname);
    })
  }
  
  
});

app.post('/delete', function(req,res){
  const id = req.body.item;
  const lname = req.body.lname
  if (lname === "today"){
    Item.findByIdAndRemove(id, function(err){
      res.redirect('/')
    })
  } else {
    
    List.findOneAndUpdate({name: lname}, {$pull: {items: {_id: id}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + lname);
      }
    });
  }
  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


app.get("/:listname", function(req,res){
  const lname = req.params.listname.toLowerCase();

  List.findOne({name:lname}, function(err,i){
    if (!err){
      if (i){
        res.render("list", {listTitle: lname, newListItems: i.items});
      }else{
        const list = List({
          name: lname,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + lname);
      }
    }
  })

})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
