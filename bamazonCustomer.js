var inquirer = require("inquirer");
var mysql = require("mysql");


// MySQL connection 
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
    database: "Bamazon"
});
connection.connect(function(err) {
    if (err) throw err;
});

//retrieve the stores items.
connection.query('SELECT * FROM products', function(err, res) {
    if (err) throw err;
    
    console.log("Item # | Product -- Department -- Price -- Quantity ");

    //print out their column values
    for (var i=0; i<res.length; i++){
    	if (i<9){
    		console.log(" " + res[i].Item_ID + "     | " + res[i].Product_Name + " -- " + res[i].Department_Name + "--" + res[i].Price + "--" + res[i].Stock_Quantity);
    	}
    	else if (i >= 9){
    		console.log(res[i].Item_ID + "     | " + res[i].Product_Name + " -- " + res[i].Department_Name + "--" + res[i].Price + "--" + res[i].Stock_Quantity);
    	}
    }

    promptUser();
});

var promptUser = function(){

    //user message
	inquirer.prompt([{
		name: "Item_ID",
		message: "Enter the ID of the item you wish to purchase.",

        // validate
		validate: function(value){
            if (isNaN(value) == false) {
                return true;
            }
            else {
            	return false;
            }
		}
	},{

        name: "userQuantity",
        message: "How many would you like to buy?",

        //validate
        validate: function(value){
            if (isNaN(value) == false) {
                return true;
            }
            else {
                return false;
            }
        }
        // Handle answer data
    }]).then(function(answers){

    		var currentItem = answers.Item_ID;
    		var currentAmount = answers.userQuantity;

            //perform the transaction if quanity availble. otherwise decline
            connection.query('SELECT * FROM products WHERE ?',{
                Item_ID: answers.Item_ID
            },function(err, res){

                //If the amount requested is greater than the amount in stock.
                if (currentAmount > res[0].Stock_Quantity){
                    console.log("You cannot buy that many!");

                    promptUser();
                }
                else { 
                    console.log("You can buy it!");

                    //update in the database
                    var newInventory = (res[0].Stock_Quantity - currentAmount);
                    var Total = res[0].Price*currentAmount;

                    connection.query('UPDATE products SET ? WHERE ?',[{
                        Stock_Quantity: newInventory
                    },{
                        Item_ID: currentItem
                    }], function(err, res){
                        console.log("You were charged $" + Total);

                        // prompt
                        promptUser();
                    });
                }
            })
	   })
}  