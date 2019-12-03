
// budget controller module
let budgetContoller = (function(){

    // constructors
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // calculates the percentages
    Expense.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage = -1;
        }
    };

    // returns calculated percentage
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };


    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // function to calculate total
    var calculateTotal = function(type){
        var sum = 0;
        
        // loop thru either expense or income array and sum them
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });

        data.total[type] = sum;
    };

    // data structure
    var data = {

        allItems: {
            exp: [],
            inc: []
        }, 

        total: {
            exp: 0,
            inc: 0
        },

        budget: 0,

        percentage: -1
    };


    //public methods -- implemented by closures
    return {

        addItem: function(type, des, val){
           
            var newItem, ID;
            
            // create new ID
            if(data.allItems[type].length > 0){

                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            } else{

                ID = 0;
            }

            // create new item based on 'inc' or 'exp' type
            if(type === 'inc'){
                newItem = new Income(ID, des, val);

            }else if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }

            // push it into data structure
            data.allItems[type].push(newItem);

            // return new element
            return newItem;

        },


        //method called to delete item - backend/budegetController
        deleteItem: function(type, id){

            var ids, index;

            // loop thru item ID
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },


        //method to calculate budget
        calculateBudget: function(){

            //1. calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //2. calculate budget: income - expense
            data.budget = data.total.inc - data.total.exp;

            //3. calculate percentage of income spent
            if(data.total.inc > 0){

                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);

            } else{

                data.percentage = -1;
            }
        },


        // using the expense constructor methods
        calcPercentages: function(){

            // calcultes the percentage for each item in expense array
            data.allItems.exp.forEach(function(cur){
                cur.calculatePercentage(data.total.inc);
            });
        },

        //
        getPercentages: function(){
            // loop thru exp array
            var allPercentages = data.allItems.exp.map(function(cur){
                //call getPercentage method, calculate percentage
                return cur.getPercentage();
            });
            // return all calculated percentage values
            return allPercentages;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }
         },

       
         //test method at backend/console
        test: function(){
            console.log(data);
        }
    };


})();


//UI controller module
var uiController = (function(){

    // object to hold classes
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription:'.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer:'.income__list',
        expenseContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'


    };

    // format number and strings
    var formatNumber = function(num, type){

        var numSplit, int, dec;

        // convert input to absolute value
        num = Math.abs(num);

        // limit input to rounded 2dp
        num = num.toFixed(2);

        //split the input value
        numSplit = num.split('.');
        
        int = numSplit[0];

        dec = numSplit[1];

        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, 3);
        }

       return (type === 'exp'? '-' : '+') + int  + '.' + dec;
    };
    
    
    var nodeListforEach = function(list, callback){

        for(var i=0; i<list.length; i++){
            callback(list[i], i);
            
        }
    };


    return { 

        // public method -- closures
        getInput: function(){
           
            return {
                 // object returned on input values
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
                //percentage: parseFloat(document.querySelector(DOMstrings.percntageLabel).value)
             };

        },


        // adding item to UI list
        addListItem: function(obj, type){

            var html, newHtml, element;

            if(type === 'inc'){

                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>'+
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' + 
                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
            
            } else if(type === 'exp'){

                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>'+
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">13%</div>'+
                '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },


        // delelete list item(s) from UI
        deleteListItem: function(selectorID){

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },


        // clear input fields 
        clearFields: function(){

            var fields, fieldsArr;

            // select input fields to be cleared 
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            // convert list into array
            fieldsArr = Array.prototype.slice.call(fields);

            // loop thru array
            fieldsArr.forEach(function(cur, index, array){
                cur.value = '';                
            });

            // set focus to initial field after ENTER or click
            fieldsArr[0].focus();
        },

        // display budget
        displayBudget: function(obj){
            
            var type;

            obj.budget >= 0 ? type = 'inc' : type='exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0){

                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            } else{

                document.querySelector(DOMstrings.percentageLabel).textContent = '--';

            }

        },

        // display percentage
        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expPercentageLabel);


            nodeListforEach(fields, function(cur, index){
                if(percentages[index] > 0){
                    cur.textContent = percentages[index] + '%';
                }else{
                    cur.textContent = '--';
                }
            }); 

        },

        // Display date 
        displayDate: function(){

            var now, months, month, year;

            now = new Date();

            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            days = ['1', '2', '3','4', '4', '5', '6', 
                    '7', '8', '9', '10', '11', '12', '13', '14'];            
            
            year = now.getFullYear();
            month = now.getMonth();
            day = now.getDay();

            document.querySelector(DOMstrings.dateLabel).textContent =  months[month] + ' ' + days[day] + ' ' + year;

        },


        changeInputType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            // toggle input fields
            nodeListforEach(fields, function(cur){
                cur.classList.toggle('red-focus');   
            });

            // toggle button color
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');

        },


        // method to make DOMstrings object public -- closures
        getDOMstrings: function(){

            return DOMstrings;
        }
    };

})();


// global app controller module
var controller = (function(budgetCtrl, uiCtrl){

    var setUpEventListeners = function() {

        var DOM = uiCtrl.getDOMstrings();

        // when the add button is clicked
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        // when enter key is pressed
        document.addEventListener('keypress', function(event){

            if(event.keyCode === 13 || event.which === 13){

                ctrlAddItem();
            }
        });

        // when delete button is fired
       document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

       // change inputType color
       document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeInputType);
    };


    var updateBudget = function(){

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. return budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget to UI
        uiCtrl.displayBudget(budget);
    };

    var updatePercentage = function(){

        // 1. calculate percentage
        budgetCtrl.calcPercentages();

        // 2. read percentages from budgetcontroller
        var percentages =  budgetCtrl.getPercentages();

        // 3. update the UI with new percentages
        uiCtrl.displayPercentages(percentages);
    };


    
    var ctrlAddItem = function(){

        var input, newItem;

        // 1. Get the input field data
        input = uiCtrl.getInput();

        // input validations
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){

            // 2. Add the item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to UI
            uiCtrl.addListItem(newItem, input.type);

            // 4. clear input fields
            uiCtrl.clearFields();

            //5. update and calculate Budget
            updateBudget();

            // 6. calculate and update percentages
            updatePercentage(); 

       }

    };


    // called when delete button is fired
    var ctrlDeleteItem = function(event){

        var itemID, splitID, ID, type;

        // traverse the DOM to find parent id
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            splitID = itemID.split('-');

            type = splitID[0];

            // convert ID from string- used in deleteItem method
            ID = parseInt(splitID[1]);

            // 1. delete item for data structure(budget controller module)
            budgetCtrl.deleteItem(type, ID);

            // 2. delete item form UI list
            uiCtrl.deleteListItem(itemID);

            // 3. re-calculate budget and update UI
            updateBudget();

            // 6. calculate and update percentages
            updatePercentage(); 
        }

    };


    // initialize the app
    return {
        init: function() {
            console.log('App started');

            uiCtrl.displayDate();

            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            setUpEventListeners();
        }
    };

})(budgetContoller, uiController);

controller.init();