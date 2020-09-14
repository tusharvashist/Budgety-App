var BudgetController = (function() {

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome>0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        }else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });

        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length !== 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }

            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }else {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        calculateBudget: function() {
            ///1. get sum of inc or exp
            calculateTotal('inc');
            calculateTotal('exp');

            ///2. calculate total budget
            data.budget = data.totals.inc - data.totals.exp;

            ///3. calculate percentage
            data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
        },

        getBudget: function(){
            return {
                totalExpense: data.totals.exp,
                totalIncome: data.totals.inc,
                budget: data.budget,
                percentage: data.percentage
            }
        },

        deleteBudget: function (type, ID) {
            //ID = 6
            //arrIds = [1,2,6,8]
            //index = 2
            var arrIds, index;

            arrIds = data.allItems[type].map(function (currnt) {
                return currnt.id;
            });
            index = arrIds.indexOf(ID);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculatePercentage: function () {
            data.allItems.exp.forEach(function (cur) {
                return cur.calcPercentage(data.totals.inc);
            });
        },

        gettingPercentage: function () {
            var perct = data.allItems.exp.map(function (currr) {
                return currr.getPercentage();
            })
            return perct;
        },

        testing: function() {
            console.log(data);
        }
    }

})();


var UIcontroller = (function() {
    var DOMStrings = {
        addType: '.add__type',
        addDescription: '.add__description',
        addValue: '.add__value',
        addButton: '.add__btn',
        addIncomeList: '.income__list',
        addExpenseList: '.expenses__list',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expenseValue: '.budget__expenses--value',
        percentageValue: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        monthYear: '.budget__title--month'
    }

    var formatNumber = function (num, type) {
        var numArr, int, dec, sign;
    
        num = Math.abs(num);
        num = num.toFixed(2);

        numArr = num.split('.');

        int = numArr[0];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, 3);
        }

        dec = numArr[1];

        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + int + '.' + dec;
    };

    return {
        getInput: function(){
            return {

                type: document.querySelector(DOMStrings.addType).value,
                description: document.querySelector(DOMStrings.addDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.addValue).value)
            }
        },

        addNewItem: function(type, obj) {
            var html, newHtml, element;

            //Create html
            if(type === 'inc') {
                element = DOMStrings.addIncomeList;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if(type === 'exp') {
                element = DOMStrings.addExpenseList;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //Edit paceholders
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //update ui
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.addDescription+','+DOMStrings.addValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            document.querySelector(DOMStrings.addDescription).focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(obj.budget, 'inc');
            document.querySelector(DOMStrings.incomeValue).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMStrings.expenseValue).textContent = formatNumber(obj.totalExpense, 'exp');
            if(obj.percentage > 0 && obj.percentage < Infinity) {
                document.querySelector(DOMStrings.percentageValue).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMStrings.percentageValue).textContent = '---';
            }
        },

        displayPercentage: function (prct) {
            var fields = document.querySelectorAll(DOMStrings.itemPercentage);

            var nodeForEach = function (list, callbck) {
                for(var i = 0; i< list.length; i++) {
                    callbck(list[i], i);
                }
            }

            nodeForEach(fields, function (item, index) {
                if(prct[index]>0) {
                    item.textContent = prct[index] + '%';
                }else {
                    item.textContent = '---';
                }
            })
        },

        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMStrings.monthYear).textContent = months[month] + ' ' + year
            console.log(month, year);
        },

        deleteList: function (selectedId) {
            var el = document.getElementById(selectedId);
            el.parentNode.removeChild(el);
        },

        getDOMstrings: function() {
            return DOMStrings;
        }
    }
    

})();


var AppController = (function(budgetCtrl, uiCtrl) {

    var startEventListners = function() {
        var DOM = uiCtrl.getDOMstrings();

        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
                uiCtrl.clearFields();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    }

    var budget = function() {
        ///1. calculate budget
        budgetCtrl.calculateBudget();
        ///2. get budget
        var budget = budgetCtrl.getBudget();
        ///3. display budget in ui
        uiCtrl.displayBudget(budget);
    }

    var ctrlAddItem = function() {
        
        var input, newerItem;
        
        ///1.Get value from user
        input = uiCtrl.getInput();

        if(input.description !== "" && input.value > 0 && !isNaN(input.value)){
            ///2.add value in budget controller
            newerItem = budgetCtrl.addItem(input.type, input.description, input.value);

            ///3.Add item to ui
            uiCtrl.addNewItem(input.type, newerItem);

            ///4. Clear fields
            uiCtrl.clearFields();

            ///5. Budget
            budget();

            ///6. update percentages
            updatePercentages();
        }

    }

    var ctrlDeleteItem = function (event) {
        var targetId;
        
        targetId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(targetId) {

            var newIDArr, type, ID;

            newIDArr = targetId.split('-');
            type = newIDArr[0];
            ID = parseInt(newIDArr[1]);

            ///1. Delete item from data structure
            budgetCtrl.deleteBudget(type, ID);
            ///2. Dalete item from UI
            uiCtrl.deleteList(targetId);
            ///3. Calculate budget
            budget();
            ///4. update percentages
            updatePercentages();
        }

    }

    var setZero = function () {
        var DOM = uiCtrl.getDOMstrings();
        document.querySelector(DOM.budgetValue).textContent = 0;
        document.querySelector(DOM.incomeValue).textContent = 0;
        document.querySelector(DOM.expenseValue).textContent = 0;
        document.querySelector(DOM.percentageValue).textContent = '---';
    }

    var updatePercentages = function() {
        ///1. calculate Percentages
        budgetCtrl.calculatePercentage();

        ///2. Get Percentages
        var percentages = budgetCtrl.gettingPercentage();

        ///3. Display
        uiCtrl.displayPercentage(percentages);
    }
 
    return {
        init: function() {
            startEventListners();
            setZero();
            uiCtrl.displayMonth();
            console.log('started!')
        }
    }

})(BudgetController, UIcontroller);

AppController.init();