<script type="text/javascript">
window.onload = function(){ setTimeout( function(){ readStoredLists(); }, 1000); };

var debug = 1;

var rowData = "";

var taskList = "00:00";

var walkThroughTable = [];
var walkThroughAnimation = [];

// read as the very first function, set up everything.
function readStoredLists()
{
    //populate the 'saved lists drop down'
    var a = getCookieList();

    if (a !== null) 
        for (var i = 0, m = a.length; i < m; i++) 
            updateListSelect("savedItinearies",a[i],a[i],"store");

    // set up the minutes slots
    var l = document.getElementById("timeOfNewTaskSelect");
    for (var i = 1, j = 0;  i < 22; i++, j=j+5) 
    {
        if (j > 45) j=j+10;
        if (j > 60) j=j+15;
        l.add(new Option(j), i);
    }

    // set up the time system
    updateComboValue("task","");
    syncCombo("task","value");

    setSelectTimeOptions();
    updateTimeDisplay("now");

    // set everything to it's starting positions
    document.getElementById("savedItinearies").selectedIndex = 0;
    document.getElementById("ListName").value = "";
    hideListOptions("hide");
    document.getElementById("helpOptions").selectedIndex = 0;
    document.getElementById("cannedTasklist").selectedIndex = 0;
}

////////// Time Functions
function updateTimeDisplay(w)
{
    var d = new Array();
    var today=new Date();
    
    var day  = document.getElementById("startOfDay");        
    var hour = document.getElementById("startOfDayHour");
    var min  = document.getElementById("startOfDayMinute");

    if (hour.value === undefined 
        || parseInt(hour.value,10) < 0 
        || parseInt(hour.value,10) > 23 )
        hour.value = "0";

    if (min.value === undefined 
        || parseInt(min.value,10) < 0 
        || parseInt(min.value,10) > 59 )
        min.value = "0";

    if (day.value === undefined || day.value === "")
        day.value = hour.value+":"+min.value;

    d = day.value.split(":");
    d[0] = parseInt(d[0],10);
    d[1] = parseInt(d[1],10);

    if (w == "now") 
    {
        d[0]=today.getHours();
        d[1]=today.getMinutes();
    }
    else if (w == "day") // day value has changed.
    {  
        // do nothing
    }
    else if (w == "hour")  //hour value has changed
    {
        d[0] = hour.value;
    }
    else if (w == "minute") // min value has changed
    {
        d[1] = min.value;
    }

    if (d[1] < 10) 
        d[1] = "0"+parseInt(d[1],10);

    updateComboValue("startOfDay",d[0]+":"+d[1]); 
    updateComboValue("startOfDayHour",d[0]); 
    updateComboValue("startOfDayMinute",d[1]); 

    setSelectTimeOptionsLong(d);

    updateRows();
}

function setSelectTimeOptionsLong(t)
{
    var l = document.getElementById("startOfDaySelect");

    var o = l.length;
    while (o-- > 0) 
        l.remove(0);

    var today = new Date();

    var h, hours;

    if (t != null) 
        h = parseInt(t[0],10);

    if (h === null || h === undefined) 
        h = today.getHours();

    var minutes;
    if (t != 0) 
        minutes = parseInt(t[1],10);
    else
        minutes = today.getMinutes();

    var currentQuarter = Math.floor(minutes / 15);

    var quarters = [0,15,30,45];

    var hh;

    for (var i = 0, c = 0; i < 27; i++, c++) 
    {
        currentQuarter++;
        // find the hour cusp
        if (currentQuarter > 3 || c > 4) 
        {
            currentQuarter = 0;
            h++;
        }

        if (h > 23) 
            h = 0;

        // put a '0' in 00:9
        if (h < 10) 
            hh = " "+h; 
        else 
            hh = h;

        if(quarters[currentQuarter] == 0)
            l.add(new Option(hh+":"+"0"+quarters[currentQuarter]), i);
        else
            l.add(new Option(hh+":"+quarters[currentQuarter]), i);
    }

    l.selectedIndex = -1;
}

function setSelectTimeOptions()
{
    var lh = document.getElementById("startOfDayHourSelect");

    var lm = document.getElementById("startOfDayMinuteSelect");

    var o = lh.length;
    while (o-- > 0) 
        lh.remove(0);

    o = lm.length;
    while (o-- > 0) 
        lm.remove(0);
    
    // minutes
    for (var i = 0; i < 60; i = i+5 ) 
    {
        var o = new Option();
        o.text = i;
        o.value = i;
        lm.add(o,i);
    }
    lm.selectedIndex = -1;

    //hours 
    for (var i = 0; i < 24; i++ ) 
    {
        var o = new Option();
        o.text = i;
        o.value = i;
        lh.add(o,i);
    }
    lh.selectedIndex = -1;
}

function checkInputCompleteness()
{
    var s = document.getElementById("startOfDayInput");
    var v = s.value;
    var len = v.length;

    var l = v.charCodeAt(len-1);
    
    if (l == 8 || l == 46) return; // user pressed delete or backspace
    

    if (l < 48 || l > 58)
    {
        alert("You can only enter numbers, or a colon.");
        return;
    }
    if (len > 2) 
    {
        var p = v.split(":");

        if (p.length != 2)
        {
            alert("Start time input is not a time.");
            return;
        }

        var h = parseInt(p[0]);
        var m = parseInt(p[1]);

        if (h < 0 || h > 23)
        {
            alert("Hours in start time input are incorrect:"+v);
            s.value = "00:00";
            syncCombo('startOfDay','input');
            updateTimeDisplay('day');
            return;
        }
        if (m < 0 || m > 59)
        {
            s.value = "00:00";
            syncCombo('startOfDay','input');
            alert("Minutes in start time input are incorrect."+v);
            updateTimeDisplay('day');
            return;
        }
        if ((h < 10 && len == 4) || (h > 9 && len == 5)) {
            syncCombo('startOfDay','input');
            updateTimeDisplay('day');
        }
    }
}

function upDateTime(str, tt)
{
    var b = str.trim().split(":");
    var x = parseInt(b[0],10); 
    var y = parseInt(b[1],10);
    var f = 0;
    var t = parseInt(tt,10);
    
    if (isNaN(x)) x = 0; 
    if (isNaN(y)) y = 0; 
    if (isNaN(t)) t = 0; 

    y += t; 
    if (y > 59) 
    {
        x += Math.floor(y / 60);
        if (x > 23)
            x %= 24;
        y %= 60;
    }

    var s = new String();

    s += x+":";

    if (y < 10) 
        s += "0";

    s += y;

    return s;
}


function updateTimeDisplayDup(w)
{
    var d = new Array();
    var today=new Date();
    
    var day  = document.getElementById("startOfDay");        
    var hour = document.getElementById("startOfDayHour");
    var min  = document.getElementById("startOfDayMinute");

    if (hour.value === undefined || parseInt(hour.value,10) < 0 || parseInt(hour.value,10) > 23 )
        hour.value = "0";

    if (min.value === undefined || parseInt(min.value,10) < 0 || parseInt(min.value,10) > 59 )
        min.value = "0";

    if (day.value === undefined || day.value === "")
        day.value = hour.value+":"+min.value;

    d = day.value.split(":");
    d[0] = parseInt(d[0],10);
    d[1] = parseInt(d[1],10);

    if (w == "now") 
    {
        d[0]=today.getHours();
        d[1]=today.getMinutes();
    }
    else if (w == "day") // day value has changed.
    {  
        // do nothing
    }
    else if (w == "hour")  //hour value has changed
    {
        d[0] = hour.value;
    }
    else if (w == "minute") // min value has changed
    {
        d[1] = min.value;
    }

    if (d[1] < 10) 
        d[1] = "0"+parseInt(d[1],10);

    updateComboValue("startOfDay",d[0]+":"+d[1]); 
    updateComboValue("startOfDayHour",d[0]); 
    updateComboValue("startOfDayMinute",d[1]); 

    setSelectTimeOptionsLong(d);

    updateRows();
}

////////// Debugging functions
function getFunctionName(fn)
{
    var f = fn.caller.toString();
    var b = f.indexOf("{");
    return f.substring(9,b-1);
}

function onDebug(n,w)
{
    if (debug == n)
        console.log(getFunctionName(onDebug)+":: "+w);
}

///////// Functions called from the management UI

function clearItineraryList()
{
    var body = document.getElementById("taskListBody");
    var the_table = document.getElementById("taskListEntries");
    
    if (body != null)
        the_table.removeChild(body);
    setSaveListButton("tainted");
}

function clearTaskList()
{
    if (taskList == "00:00")
        return true;

    var p = taskList.split("@@");
    
    for (var i = 1, m = p.length-1; i < m; i=i+2) 
        updateListSelect("taskSelect", p[i+1], p[i+1], "remove");

    taskList = "00:00";
    
    var p = document.getElementById("taskInput");
    p.value = "";
    p.placeholder = "No Tasklist loaded.";
    syncCombo("taskInput","input");

    setZeroOption("listOptions", "Select List Action","");
    return true;
}

function insertNewItineraryEntry(newTime, taskString) 
{
    var table = document.getElementById("taskListBody");

    if (table == null) {
        addNewTask(newTime,taskString);
        return true;
    }
    var d = document.getElementById('insertNewItineraryEntrySelection');
    var to = d.options[d.selectedIndex].text;
    
    table.insertBefore(createRow(newTime, taskString, table.rows.length),
                       table.rows[to]);
    updateRows();
    return true;
}

function previewList()
{
    var listElement = document.getElementById("savedItinearies");
    
    var name = listElement.options[listElement.selectedIndex].value;

    var listCookie = Get_Cookie(name);
    var response = "";

    if (listCookie == null)
    {
        response = "No file selected.";
        return false;
    }
    var list = listCookie.split("@@"); 
    var curTime = list[0];
    var totalListTime = 0;
    var seperatorLength = 0;

    for(var i = 1, m = list.length-1; 
        i < m; 
        i = i + 2) 
    {
        var startTimes = new String();
        var endTimes = new String();

        startTimes += curTime;

        var checkTime = parseInt(list[i],10);

        totalListTime += checkTime;

        curTime = upDateTime(curTime, checkTime);

        var s="";

        if (startTimes.length == 4)
            startTimes = "0"+startTimes;

        endTimes = curTime;

        if (endTimes.length == 4)
            endTimes = "0"+endTimes;
        
        s = startTimes+" - "+endTimes+"\t"+parseInt(list[i],10)+"\t"+list[i+1]+"\n";

        response += s;

        if (s.length > seperatorLength)
            seperatorLength = s.length;
    }
    var seperator = "";
    
    for(var i = 0, m = Math.floor(seperatorLength*1.9); i < m; i++)
        seperator += "-";

    var header = "Listname: "+name+
        "   Total time: "+upDateTime("00:00",totalListTime)+
        "\n\nStart - End\tMins\tTask\n"+
        seperator+"\n";

    alert(header+response);
    return true;
}

function updateTaskSelectOption(value, text, action)
{
    var space = "";

    updateListSelect("taskSelect", value, text, "remove");
    
    if (action == "store")
    {
        if (value < 100) 
            space = "_.";
        if (value < 10) 
            space = space+"_";
        
        updateListSelect("taskSelect", 
                         text, 
                         space+value+"  min"+": "+text, 
                         "store");
    }
    return true;
}

function saveThisList()
{
    var listName = document.getElementById("ListName").value;
    
    if (listName == null)
    {
        alert("Please enter a valid list name (one word, no spaces).");
        return;
    }

    if (rowData.length == 0)
    {
        alert("You cannot save an empty Itinerary list!");
        return;
    }
    writeCookie(listName,"I");
    setSaveListButton("ok")
    
    hideListOptions("show");
}

function setSaveListButton(what)
{
    if (what == "tainted")
        document.getElementById("saveList").value = "Save List";
    else
        document.getElementById("saveList").value = "Upto Date";
}

function checkFileSelect()
{
    var d = document.getElementById("savedItinearies");
    
    if (d.selectedIndex > 0)
    {
        hideListOptions("show");
        setZeroOption("listOptions", "Select List Action");
    }
    else
        hideListOptions("hide");
}



function activateListOptions()
{
    var dropdown = document.getElementById("listOptions");
    var selectedAction = dropdown.value;
    var d = document.getElementById("savedItinearies");
    var fileName = d.options[d.selectedIndex].text;

    if (selectedAction == "addItinery")
    {
        if (loadItineraryList(fileName,"add") == true)
            setZeroOption("listOptions", "Itinerary added: "+fileName,"");
        else
            setZeroOption("listOptions","Select List action","");
        setSaveListButton("tainted");
    }
    else if (selectedAction == "replaceItinerary")
    {
        if (loadItineraryList(fileName,"replace") == true)
        {
            setZeroOption("listOptions", "Itinerary replaced: "+fileName,"");
            if (fileName !== "ItineraryBackup")
                document.getElementById("ListName").value = fileName;
        }
        else
            setZeroOption("listOptions","Select List Action","");
        setSaveListButton("tainted");
    }
    else if (selectedAction == "InsertItinerary")
    {
        alert("To be implemented.");
    }
    else if (selectedAction == "previewList")
    {
        previewList();
    }
    else if (selectedAction == "addTasklist")
    {
        if (loadTaskList(fileName,"add") == true)
            setZeroOption("listOptions","Select List Action","");
        else
            setZeroOption("listOptions","Select List Action","");
        document.getElementById("savedItinearies").selectedIndex = 0;
    }
    else if (selectedAction == "replaceTaskList")
    {
        if (loadTaskList(fileName,"replace") == true)
            setZeroOption("listOptions","Select List Action","");
        document.getElementById("savedItinearies").selectedIndex = 0;
    }
    else if (selectedAction == "deleteList")
    {
        var c = Get_Cookie(fileName);
        
        if (c != null) 
        {
            Delete_Cookie(fileName,"/",""); 
            
            updateListSelect("savedItinearies",fileName,fileName,"remove");
            setZeroOption("listOptions", "Select List Action","");
        }
        var listName = document.getElementById("ListName").value;
        if (fileName === listname)
            setSaveListButton("tainted");
    }

    if (selectedAction == "previewList")
        return setZeroOption("listOptions", "Select List Action","");

    hideListOptions("hide");
    setSaveListButton("ok");

    return true;
}

function wineMaking()
{
    var itineraryExample = 
        [
            5, "Assemble: winekit, drill & wine stirrer, jug, syphon, steriliser, bucket, airlock",
            30, "Clean, sterilise & rinse: bucket, lid, airlock, small syphon, wine stirrer, jug",
            2, "Put bucket into sensible space, onto a tray with a rim (the fermentation can overflow!)",
            10, "Syphon the juice into bucket. (don't tip it, unless you want a mess)",
            10, "Measure and add the neccessary amount of cold water, rinse the juicebag",
            10, "Dissolve clay in hot water and stir into bucket with wine stirrer",
            5, "Add woodchips, stir",
            5, "Sprinkle Yeast, close bucket with lid, fit primed airlock",
            30, "Clean and sterilise:  small syphon, wine stirrer",
            5, "Put stuff away",
       ];

    for(var i = 0, j = itineraryExample.length; i < j; i=i+2) 
        addNewTask(itineraryExample[i],itineraryExample[i+1]);
}

function complexCurry()
{
    var itineraryExample = 
        [
            0,"Ingredients 1: Bunch of fresh Coriander/Cilantro, 2cm of ginger, Tumeric.",
            0,"Ingredients 1: 2 cups of 10% fat youghurt, 4 cloves of garlic",
            5,"Set out ingredients 1.",
            2,"Equipment 1: Blender, bowl, paring knife, board, scraper, cup measure, teaspoon.",
            5,"Pick coriander leaves into bowl",
            2,"Wash coriander leaves, squeeze out, put into blender.",
            3,"Peel garlic and add cloves to the blender",
            3,"Peel ginger and cut into 8 chunks then add to blender.",
            1,"Add 1/2 tsp of tumeric to the blender.",
            1,"Add yogurt to the blender.",
            2,"Blend",
            2,"Put grater, knife, cup measure, bowl and board into dishwasher.", 
            0,"Ingredients 2: 1 leg of lamb",
            5,"Equipment 2: 2ltr bowl & lid, boning & chef knife, meat board, scrap tray.",
            5,"Bone the leg",
            5,"Cut the tough skin and other unappetizing bits off",
            10,"Cut 1 inch cubes from the meat, put in bowl.",
            2,"Toss or fridge leftovers, put board and tray into dishwasher.",
            3,"Wash and dry knives.",
            3,"Re-blend the yoghurt mix for 10 seconds, then pour over the meat.",
            3,"Scrape out blender, rinse and pop scraper and empty blender in dishwasher",
            3,"Mix meat, cover and fridge.",
            240,"Marinade for 4 hours",
            0,"Ingredients 3: 3 Tbs ghee, bowl with: 2 black cardamom, 3 bayleaves, 1/2 tsp caraway (not cumin)",
            0,"Equipment: 3ltr thick pot with lid, fish slice",
            3,"Heat pot and add the ghee",
            2,"Add the spices and cook for 2 minutes.",
            5,"Using the fishslice, pick out the marinaded meat leaving behind the marinade",
            10,"Fry the meat gently, but hot enough to boil off the marinade and meat juices",
            5,"When dryish, add rest of marinade, bring to boil",
            0,"Whilst waiting, pop the bowl and blender into the dishwasher.",
            60,"Cover with lid, simmer gently for 1 hour.",
            7,"Uncover lid, raise flame a little to produce a steady simmer.",
            7,"Microwave Broccoli",
            5,"Plate it all up and eat",
       ];

    for(var i = 0, j = itineraryExample.length; i < j; i=i+2) 
        addNewTask(itineraryExample[i],itineraryExample[i+1]);
}

// function activateListOptions()
// {
//     var dropdown = document.getElementById("listOptions");
//     var selectedAction = dropdown.value;
//     var d = document.getElementById("savedItinearies");
//     var fileName = d.options[d.selectedIndex].text;

//     if (selectedAction == "addItinery")
//     {
//         if (loadItineraryList(fileName,"add") == true)
//             setZeroOption("listOptions", "Itinerary added: "+fileName,"");
//         else
//             setZeroOption("listOptions","Select List action","");
//         setSaveListButton("tainted");
//     }
//     else if (selectedAction == "replaceItinerary")
//     {
//         if (loadItineraryList(fileName,"replace") == true)
//         {
//             setZeroOption("listOptions", "Itinerary replaced: "+fileName,"");
//             if (fileName !== "ItineraryBackup")
//                 document.getElementById("ListName").value = fileName;
//         }
//         else
//             setZeroOption("listOptions","Select List Action","");
//         setSaveListButton("tainted");
//     }
//     else if (selectedAction == "InsertItinerary")
//     {
//         alert("To be implemented.");
//     }
//     else if (selectedAction == "previewList")
//     {
//         previewList();
//     }
//     else if (selectedAction == "addTasklist")
//     {
//         if (loadTaskList(fileName,"add") == true)
//             setZeroOption("listOptions","Select List Action","");
//         else
//             setZeroOption("listOptions","Select List Action","");
//         document.getElementById("savedItinearies").selectedIndex = 0;
//     }
//     else if (selectedAction == "replaceTaskList")
//     {
//         if (loadTaskList(fileName,"replace") == true)
//             setZeroOption("listOptions","Select List Action","");
//         document.getElementById("savedItinearies").selectedIndex = 0;
//     }
//     else if (selectedAction == "deleteList")
//     {
//         var c = Get_Cookie(fileName);
        
//         if (c != null) 
//         {
//             Delete_Cookie(fileName,"/",""); 
            
//             updateListSelect("savedItinearies",fileName,fileName,"remove");
//             setZeroOption("listOptions", "Select List Action","");
//         }
//         var listName = document.getElementById("ListName").value;
//         if (fileName === listname)
//             setSaveListButton("tainted");
//     }

//     if (selectedAction == "previewList")
//         return setZeroOption("listOptions", "Select List Action","");

//     hideListOptions("hide");
//     setSaveListButton("ok");

//     return true;
// }

function loadItineraryList(name, addOrReplace)
{
    var listCookie = Get_Cookie(name);
    
    if (listCookie == null)
    {
        alert("You need to select a list first.");
        return false;
    }
    if (addOrReplace == "replace")
        clearItineraryList();
    
    var list = listCookie.split("@@"); 

    document.getElementById("startOfDay").value = list[0]; 

    syncCombo("startOfDay","value");

    setSelectTimeOptionsLong(list[0].split(":"));
    
    for(var i = 1, row = 0, m = list.length-1; 
        i < m; 
        i = i + 2, row++) 
        addNewTask(parseInt(list[i],10), list[i+1], row);

    document.getElementById("savedItinearies").selectedIndex = 0;

    hideListOptions("hide");

    return true;
}

function loadTaskList(name, addOrReplace)
{
    var gc = Get_Cookie(name);

    if (gc == null) 
    {
        alert("The saved list "+name+" could not be loaded.");
        return false;
    }
    var g = gc.split("@@");

    if (addOrReplace == "replace")
        clearTaskList();

    for(var i = 1, m = g.length; i < m; i = i + 2) 
    {
        if (taskList.indexOf(g[i+1]) == -1)
        {
            updateTaskSelectOption(parseInt(g[i],10), g[i+1], "store")
            taskList+="@@"+g[i]+"@@"+g[i+1];
        }
    }
    var p = document.getElementById("taskInput");
    p.value = "";
    if (addOrReplace == "replace")
        p.placeholder = "Loaded Tasklist '"+name+"'";
    else 
        p.placeholder = "Appended Tasklist '"+name+"'";

    syncCombo("taskInput","input");

    hideListOptions("hide");
    return true;
}

////////// UI management function
function showOrHideTitles()
{
    var table = document.getElementById("taskListBody");

    var r, c, s;
    var w = ["Row","Duration","Start","-","End","Activity"];

    r = document.createElement('tr');
    for (var i = 0; i < w.length; i++)
    {
        c = document.createElement('td');
        s = document.createElement("span");
        s.innerHTML = "<b>"+w[i]+"</b>";
        c.appendChild(s);
        r.appendChild(c);
    }
    table.insertBefore(r, table.rows[0]);

}

function updateComboValue(name,what)
{
    document.getElementById(name).value = what;
    document.getElementById(name+"Input").value = what;
}

function syncCombo(name,how)
{
    var value = document.getElementById(name);
    var input = document.getElementById(name+"Input");
    var select = document.getElementById(name+"Select");

    if (how === "value") 
    {
        if (input != null)
        {
            input.value = value.value;
        }
    }
    else if (how === "input") 
    {
        if (input != null && value != null) 
        {
            value.value = input.value;
        }
    }
    else if (how === "select") 
    {
        if (select != null)
        {
            if (select.selectedIndex !== undefined)
            {
                var index = select.selectedIndex;
                var val;
                if (index > 0)  // every combo has a disabled first entry field
                {
                    val =  select.options[index].value; 
                    value.value = val;
                }
                input.value = val;
            }
        }

    }   
}
// If we copy content into the input box of a combo, and there is only
// one option, or, the current selection is also all there is,
// onselect will not be triggerd.  So we cheat by putting in a hidden,
// disabled option that we point selectedIndex to, and set it to zero.
function resetTaskInput()
{
    document.getElementById("taskSelect").selectedIndex = -1;
}

function updateTaskInput(num)
{
    var p = document.getElementById("task"+num).value;
    document.getElementById("task").value = p;

    resetTaskInput();

    syncCombo("task","value");

    document.getElementById("timeOfNewTask").value
        = document.getElementById("duration"+num).value;

    syncCombo("timeOfNewTask","value");

    if (-1 == taskList.indexOf(p)) {
        document.getElementById("storeTaskButton").value = "Add";
        document.getElementById("storeTaskButton").title = 
            "Add this task to the current task list";
    }
    else 
    {
        document.getElementById("storeTaskButton").value = "Remove";
        document.getElementById("storeTaskButton").title = 
            "Remove this task from the current task list";
    }
}

function setZeroOption(name,full,empty)
{
    var d = document.getElementById(name);

    if (d.length > 1) 

        d.options[0].text = full;
    else 
        d.options[0].text = empty;

    d.options[0].selected;

    d.selectedIndex = 0;

    return true;
}

function hideListOptions(what)
{
    var d = document.getElementById("listOptions");

    var hide;

    for (var i = 1; i < d.length; i++)
    {
        if (what == "show")
            d.options[i].disabled = false;
        else 
            d.options[i].disabled = true;
    }
}


function saveItineraryList()
{
    var list = document.getElementById("ItineraryListName").value;

    if (list == null)
    {
        alert("Please enter a valid list name (one word, no spaces).");
        return true;
    }

    if (rowData.length == 0)
    {
        alert("You cannot save an empty list!");
        return true;
    }
    writeCookie(list,"I");

    return true;
}

function showNumberedExampleList()
{
    var itineraryExample = 
        [
            5, "Assemble: winekit, drill & wine stirrer, jug, syphon, steriliser, bucket, airlock",
            30, "Clean, sterilise & rinse: bucket, lid, airlock, small syphon, wine stirrer, jug",
            2, "Put bucket into sensible space, onto a tray with a rim (the fermentation can overflow!)",
            10, "Syphon the juice into bucket. (don't tip it, unless you want a mess)",
            10, "Measure and add the neccessary amount of cold water, rinse the juicebag",
            10, "Dissolve clay in hot water and stir into bucket with wine stirrer",
            5, "Add woodchips, stir",
            5, "Sprinkle Yeast, close bucket with lid, fit primed airlock",
            30, "Clean and sterilise:  small syphon, wine stirrer",
            5, "Put stuff away",
       ];

    for(var i = 0, j = itineraryExample.length; i < j; i=i+2) 
        addNewTask(itineraryExample[i],itineraryExample[i+1]);
}

function updateListSelect(list, value, text, action)
{
    var l = document.getElementById(list);
    var onEmptyInform = 0;

    if (l == null) 
        return;

    if (action === "remove") 
    {
        var o = l.length;
        while (o-- > 1) 
            if (value === l.options[o].value || 
                text === l.options[o].text) {
                l.remove(o); 
            } 
    }
    else if (action === "store") 
    {
        var o = new Option();
        o.text = text;
        o.value = value;

        l.add(o, l.length);
    }

    if (l.length > 1 && l.id != "savedItinearies") 
    {
        l.options[onEmptyInform].style.display = "none";
        l.options[1].selected;
        l.selectedIndex = -1;
    }
    else {
        l.options[onEmptyInform].style.display = "";
        l.selectedIndex = onEmptyInform;
    }
}

//////////  Tutorial functions
function walkthrougDisplayStep(step, title)
{
    var helpTable = document.createElement('table');

    var helpRow = document.createElement('tr');

    clearWalkthroughSpace();

    var nbsp;
    var cell;
    var p;

    // Set up the UI
    cell = document.createElement('td');
    {   // backbutton
        p = document.createElement("button");
        p.value = (step-1);
        p.innerHTML = "Back";
        p.style.top = '12px';
        p.style.position = 'relative';
        p.setAttribute('onclick','walkthrougDisplayStep('+(step-1)+',"'+title+'\")');
        
        if (step == 0)
        {
            p.disabled = true;
        }
    }
    cell.appendChild(p);
    
    nbsp = document.createTextNode("\u00a0 \u00a0");
    cell.appendChild(nbsp);
    helpRow.appendChild(cell);
    
    {  // next button
        cell = document.createElement('td');
        {
            p = document.createElement("button");
            p.value = (step-1);
            p.innerHTML = "Next";
            p.setAttribute('onclick','walkthrougDisplayStep('+(step+1)+',"'+title+'")');
            p.style.top = '12px';
            p.style.position = 'relative';
            
            if (step == walkThroughTable.length-1)
            {
                p.disabled = true;
            }
        }
        cell.appendChild(p);
        
        nbsp = document.createTextNode("\u00a0 \u00a0");
        cell.appendChild(nbsp);
        helpRow.appendChild(cell);
    }
    {
        cell = document.createElement('td');
        nbsp = document.createTextNode("\u00a0 \u00a0");
        cell.appendChild(nbsp);
        nbsp = document.createTextNode("\u00a0 \u00a0");
        cell.appendChild(nbsp);
        nbsp = document.createTextNode("\u00a0 \u00a0");
        cell.appendChild(nbsp);
        helpRow.appendChild(cell);
    }
    { // add the blurb
        cell = document.createElement('td');
        cell.style.width = '100%';
        var ss = document.createElement("span");
        ss.innerHTML = walkThroughTable[step];
        ss.style.position = 'relative';
        ss.setAttribute('overflow','auto');
        ss.setAttribute('display','inline-block');
        cell.appendChild(ss);

        nbsp = document.createTextNode("\u00a0 \u00a0");
        cell.appendChild(nbsp);
        helpRow.appendChild(cell);
    }
    { // add the stop button
        cell = document.createElement('td');
        var s = document.createElement("button");
        {
            s.innerHTML = "Stop ";
            s.setAttribute('onclick',"clearWalkthroughSpace()");
            s.style.top = '12px';
            s.style.position = 'relative';
            helpTable.appendChild(s);
            nbsp = document.createTextNode("\u00a0 \u00a0");
            helpRow.appendChild(nbsp);
        }
        cell.appendChild(s);
        
        nbsp = document.createTextNode("\u00a0 \u00a0");
        cell.appendChild(nbsp);
        helpRow.appendChild(cell);
    }
    
    var helpSpace = document.getElementById("helpInfoSpace");
    while (helpSpace.childNodes.length > 0)
        helpSpace.removeChild(helpSpace.children[0]);

    helpTable.appendChild(helpRow);
    helpSpace.appendChild(helpTable);

    var hr = document.createElement("hr");
    helpSpace.appendChild(hr);
 

    // execute any automatic step that may exists
    var action = walkThroughAnimation.indexOf(step);
    if (action != -1)
        window[walkThroughAnimation[action+1]]();
    
}

function clearWalkthroughSpace()
{
    var textSpace = document.getElementById('helpInfoSpace');

    while (textSpace.childNodes.length > 0)
        textSpace.removeChild(textSpace.children[0]);
}

function showItineraryViewExample()
{
        var itineraryExample = 
            [10, 'Task 1 ',
             20, 'This task is done!',
             30,'Modify the duration time (select or type a new time in minutes).',
             40,'Modify this task',
             50,'Copy this task',
             60,'Last Entry of the Example'
            ];
        
        for(var i = 0, j = itineraryExample.length; i < j; i=i+2) 
            addNewTask(itineraryExample[i],itineraryExample[i+1]);

        // show the column labels which are normally hidden
        document.getElementById("captionRow").style.display = "table-row";
}

function assignWalkthroughTable(which)
{
    
    if (which == "itineraryView")
    {
        walkThroughAnimation = [
            1,"showItineraryViewExample"
        ];

        walkThroughTable = [
            "This tutorial will step you through "+
                "everything you can do with the <b>Itinerary</b>. "+
                "<br>Click <b>Next</b> and <b>Back</b> to move through the tutorial, or "+
                "<b>Stop</b> if you want to end the tutorial session <br>"+
                "This tutorial will take about 15 minutes to complete.",
             
            "<b>The Itinerary:</b> This is the 'plan of the day', where you can arrange and "+
                "edit tasks you've entered.  <br>A sample Itinerary has been loaded below.<br>"+
                "It has 6 tasks of varying length that add up to a <b>Total Time</b> of 3:30 hours.",
            
            "The columns of the Itinerary are labelled '<b>Task</b>', '<b>Duration</b>','"+
                " <b>Start</b>', '<b>End</b>', and '<b>Activity</b>'.<br> "+
                "Every component has a <i>tooltip</i> that gives you more "+
                "information about it. <br> Hover the mouse over the <b>Task</b> menu <b>1</b> to see it. ",
            
            "<b>Task:</b>  Now move Task 3 into the space currently occupied by Task 1 by selecting '1' "+
                "from the Task menu of Activity 3.",
            
            "Task 1 has now been moved to Task 2 and what was Task 3 is now the new Task 1.",
            
            "<b>Duration:</b> Here you can input or select the minutes the task of this Row will take.<br> "+
                "Make some changes to the duration of Task 1.<br>"+
                "Observe the <b>Total time</b> display and the individual <b>Start</b>, <b>End</b> displays "+
                "changing throughout the entire Itinerary as your plan is recalculated.",
            
            "<b>Activity:</b> Click on the Activity in Task 4 and add a word.<br> Now move this row to row 2.<br> "+
                "As you can see, the entry is permanently changed",
            
            "<b>Done:</b> Click the <b>Done</b> button on Task 4, and it will be removed from the Itinerary.",
            
            "<b>Copy:</b> This allows you to duplicate a task.<br><br>  Click on <b>Copy</b> in Task 4 "+
                "and you\'ll see the task is now displayed in the <b>Task</b> input tool "+
                "above this tutorial text.",  
            
            "<b>Using the Task Input:</b>  Click on <b>Append</b>.<br>"+
                "<br>This appends the current contents of the <b>Task</b> input to end of the current Itinerary",
            
            "<b>Using the Minutes Input:</b>  This is located to the left of the Task Input "+
                "and lets you set the duration of the Activity.  <br><br>Adjust the "+
                "number of minutes by either typing directly or using the menu.",

            "<b>Insert as Task:</b> Change the text in the Task input to 'Inserted'. <br>Now "+
                "select <b>5</b> from the <b>Insert as Task</b> menu and insert this "+
                "new task as Task 5.  <br>The current Task 5 becomes Task 6.",

            "<b>Saving your Itinerary:</b> Enter 'Test' into the top left input which currently contains: "+
                "<i>Enter List Name</i>.<br><br>Use the <b>Save List</b> button to the right and save your list. ",

            "The button's caption <b>Save List</b> menu will change to <b>Upto Date</b>.  <br><br> It will change "+
                "back to 'Save List' everytime you modify your Itinerary.",

            "<b>Clear Itinerary:</b>  Press the <b>Clear Itinerary:</b> button to remove the current list.",

            "<b>Create a new Itinerary:</b> Add 3 new tasks: 'one', 'two', and 'three' to the now empty itinerary.",

            "<b>Using the Start Time Input:</b> Select or enter a new time and watch as the Itinerary's "+
                "Start and End times are recalculated throughout.<br><br> "+
                "You can also use the hours and minutes inputs to the right of the <b>Start "+
                "Time</b> input to set the time by selecting or directly entering it.",
            
            "<b>Using the Now button:</b> This sets the start time of the Itinerary to the current "+
                "time.",
            
            "<b>Making a Mistaske: </b>Click <b>Done</b> on task 'two' to delete it.",

            "<b>Undoing Mistakes:</b> Everytime you change the Itinerary, a backup is written to disk.<br><br>  If "+
                "you need to reload the previous state for any reason (the browser may have crashed or you"+
                " cleared the itinerary by mistake), you can recover your old data.",

            "<b>The Itinerary Backup file:</b> Use the <b>Select a List</b> "+
                "menu and select <b>ItineraryBackup</b>.",

            "Use the <b>Select List Action</b> "+
                "menu and select <b>Replace Itinerary</b>.<br><br> "+
                "Your previously list (with 3 tasks) will replace the current Itinerary.",

            "<b>Select List:</b> Select the 'Test' list you've just saved.",

            "<b>Preview:</b> Use the <b>Select List Action</b> and select <b>Preview</b>, this will show "+
                "you a preview of your list, then close the dialogue.",

            "<b>Append to Itinerary:</b> Use the <b>Select List Action</b> "+
                "to select <b>Append to Itinerary</b>.<br><br>"+
                "The list 'test' will be be appended to the current Itinerary.",

            "<b>Using Tasklists:</b> Task lists allow you to quickly set up your Itnerary. <br/><br>"+
                "You can use the inbuilt task lists or use an itinerary you've saved.",

            "<b>Loading a Tasklist:</b> "+
                "From the <b>Inbuilt Tasklists</b> menu, select 'Frequent Chores'.<br/><br>"+
                "You now will see that the Task Input has changed to <i>Appended "+
                "inbuilt Tasklist 'Frequent Chores'</i>",

            "<b>Using the Tasklist:</b> Click on the drop down menu of the Tasklist Input "+
                "and you'll see an assorted list of frequent house chores. <br><br>"+  
                "Select a job that looks appealing and then boldly click on "+
                "<b>Append</b> to add this to the Itinerary.",

            "<b>Adding to the Tasklist:</b> Select the List 'Test' you've saved earlier.<br><br>"+
                "From the <b>'Select List Action'</b> menu, choose the <b>Append to Tasklist</b> "+
                "option.",
            
            " In the Task Input, it will now say: <i>'Appended Tasklist 'Test'</i>. <br><br>"+
                "If you click on the menu, you will see that all the tasks in 'Test' were "+
                "appended at the end of the already loaded Chore list",

            "<b>Replacing the tasklist:  </b> Select the 'Test' list you've saved earlier.<br><br>"+
                "From the <b>'Select List Action'</b> menu, choose the <b>Replace Tasklist</b> "+
                "option.",
            
            " In the Task Input, it will now say: <i>'Loaded Tasklist 'Test'.</i> <br><br>"+
                "If you click on the menu, you will see that all the tasks in 'Test' have "+
                "replaced the previous tasklist.",

            "<b>Emptying the Tasklist:</b> Click on <b>Empty Tasklist</b>.",

            "<b>Delete a List:</b> "+
                "</b> Select the 'Test' list you've saved earlier.<br><br>"+ 
                "From the <b>'Select List Action'</b> menu, choose the <b>Delete List</b> "+
                "option and the list will be deleted.",
            
            "This completes the tutorial, click <b>Stop</b> to remove it.",
        ];
    }
}

function selectCannedTasklist()
{
    var dropdown = document.getElementById("cannedTasklist");
    var selectedAction = dropdown.value;
    var theTaskList = [];

    var p = document.getElementById("taskInput");
    p.value = "";

    if (selectedAction == "housechores")
    {
        theTaskList = [
            30, "Paperwork, Bills and such",
            10, "Bathroom Blitz",
            10, "Kitchen Blitz",
             5, "Fridge Amnesty",
             5, "Take Recycling out",
             5, "Take the Bin out",
            10, "Upstairs Blitz",
            10, "Downstairs Blitz",
            10, "Hoover Downstairs",
            10, "Hoover Upstairs",
            10, "Water Houseplants",
        ];
        p.placeholder = "Appended inbuilt Tasklist 'Frequent Chores'";
        document.getElementById("cannedTasklist").selectedIndex = 0;
    }
    if (selectedAction == "kitchen")
    {
        theTaskList = [
            10, "Set up for cooking",
            15, "Cook easy dinner",
            30, "Cook complex dinner",
            10, "Prepare Breakfast for the morning",
            15, "Boil eggs",
            10, "Cut up meat",
            10, "Pack Lunch",
            10, "Order Food",
             5, "Make coleslaw"
        ];
        p.placeholder = "Appended inbuilt Tasklist 'Kitchen Jobs'";
        document.getElementById("cannedTasklist").selectedIndex = 0;
    }
    if (selectedAction == "periodic")
    {
        theTaskList = [
            20, "Dust the house (lest house dusts you)",
            20, "Check over the houseplants, cull the fuglies",
            30, "Repot Orchids",
            10, "Water the Cephalotus",
            30, "Wipe the banister and the windowsills",
            10, "Clean Microwaves",
            20, "Clean Windows",
            10, "Boil-run the washer with soda crystals",
            10, "Freezer Amnesty",
            10, "Clean the pet feeding space",
            15, "Cupboard Amnesty",
            10, "Descale Kettle and Egg cooker"
        ];
        p.placeholder = "Appended inbuilt Tasklist 'Periodic Chores'";
        document.getElementById("cannedTasklist").selectedIndex = 0;
    }
    if (selectedAction == "garden")
    {
        theTaskList = [
            15, "Prepare plant pots",
            10, "Sow Spring Onions, Chervil, Corinader and Fenugreek",
            10, "Empty spend plant pots",
            15, "Water the garden",
            5,  "Put slugpellets",
            20, "Fertilise plants",
            30, "Mow the lawn",
            60, "Cut the hedge",
            15, "Weed the garden"
        ];

        p.placeholder = "Appended inbuilt Tasklist 'Gardening'";
        document.getElementById("cannedTasklist").selectedIndex = 0;
    }

    for(var i = 0, m = theTaskList.length-1; i < m; i = i + 2) 
    {
        if (taskList.indexOf(theTaskList[i+1]) == -1)
        {
            updateTaskSelectOption(parseInt(theTaskList[i],10), theTaskList[i+1], "store")
            taskList+="@@"+theTaskList[i]+"@@"+theTaskList[i+1];
        }
    }

    syncCombo("taskInput","input");
}



function activateHelpOptions()
{
    var dropdown = document.getElementById("helpOptions");
    var selectedAction = dropdown.value;

    var textSpace = document.getElementById("helpInfoSpace");

    if (selectedAction == "itineraryView")
    {
        assignWalkthroughTable("itineraryView");
        walkthrougDisplayStep(0,"Itinerary View");
    }
    else if (selectedAction == "helpWineMaking")
    {
        wineMaking();
    }
    else if (selectedAction == "introduction")
    {
        showIntroduction()
    }
    else if (selectedAction == "helpCurryExample")
    {
        complexCurry();
    }
    else if (selectedAction == "introduction")
    {
        showIntroduction()
    }

    setZeroOption("helpOptions", "Help","");
}

function showIntroduction()
{
    var s = 
        "This program will assist in you planning your day and give you a running time estimate of your day."+
        "\n\n"+
        "The Help menu has a tutorial that show you how to use the features."+
        "\n\n"+
        "Author:  Gabriela Gibson, Gabriela.Gibson@gmail.com"+
        "\n";


    alert(s);
}

//////////// Itinerary functions
function createRow(newTime, taskStringInp, nodeNum)
{
    var taskString;
    if (taskStringInp.length == 0) {
        taskString = "Enter a task here.";
    }
    else
        taskString = taskStringInp;

    var row = document.createElement('tr');
    var cell;

    var rowSelect = document.createElement("select");
    rowSelect.onchange = function(e) 
    {
        moveRow(e.target.location);
    };

    cell = document.createElement("td");
    rowSelect.id = "rowSelect"+nodeNum;
    cell.appendChild(rowSelect);
    row.appendChild(cell); 

    cell = document.createElement("td");
    var durationSelect = document.createElement("select");
    var l = document.getElementById("timeOfNewTaskSelect");
    
    for (var i = 0, m = l.options.length; i < m; i++) 
    {
        var o = new Option();

        if (i == 0)
            o.style = "display:none;";

        o.text = l.options[i].text;
        o.value = l.options[i].value;
        durationSelect.add(o,i);
    }
    durationSelect.setAttribute('style',
                                "position:absolute;height:auto;width:56px;");

    durationSelect.id="duration"+nodeNum+"Select"; 

    durationSelect.setAttribute('onchange',
                                "syncCombo('duration"+nodeNum+
                                "','select');"+
                                "updateRows();"+
                                "writeCookie('ItineraryBackup','I');");

    cell.appendChild(durationSelect);
    row.appendChild(cell);

    var durationInput = document.createElement("input");
    durationInput.value = newTime;
    
    durationInput.setAttribute('style',
                               "position:relative;width:32px;"+
                               "height:auto;");

    durationInput.id="duration"+nodeNum+"Input";

    var tmp = "syncCombo('duration"+nodeNum+"','input'); updateRows();"
    durationInput.setAttribute('onfocus',"this.select();");
    durationInput.setAttribute('onClick', tmp);
    durationInput.setAttribute('onblur', tmp);
    durationInput.setAttribute('onkeyup', tmp);
    durationInput.setAttribute('type',"text");
    cell.appendChild(durationInput);

    var duration = document.createElement("input");
    duration.value = newTime;
    duration.setAttribute('type',"hidden");
    cell.appendChild(duration);

    var nbsp = document.createTextNode("\u00a0 \u00a0");
    cell.appendChild(nbsp);
    row.appendChild(cell);

    cell = document.createElement("td");
    var startTimes = document.createTextNode("9:15");
    startTimes.id = "startTimes"+nodeNum;
    cell.style.width = "40px";
    cell.style.textAlign = "center";
    cell.appendChild(startTimes);
    row.appendChild(cell); 

    cell = document.createElement("td");
    var spacer = document.createTextNode(" - ");
    cell.appendChild(spacer);
    row.appendChild(cell); 

    cell = document.createElement("td");
    var endTimes = document.createTextNode("9:30");
    cell.style.textAlign = "center";
    cell.style.width = "40px";
    cell.appendChild(endTimes);
    row.appendChild(cell); 

    cell = document.createElement("td");
    cell.style.width = '100%';
    var task = document.createElement("input");
    task.value = taskString;
    task.style.width = '100%';
    task.id = "task"+nodeNum;
    task.setAttribute('onfocus',"this.select();");
    task.setAttribute('onkeyup',
                      "document.getElementById('task"+nodeNum+
                      "').value = this.value; updateRows(); "+
                      "writeCookie('ItineraryBackup','I');"
                     );
    cell.appendChild(task);
    row.appendChild(cell); 

    cell = document.createElement("td");
    var deleteTask = document.createElement('button');
    deleteTask.innerHTML = 'Done';
    deleteTask.onclick = function(e) 
    {
        removeTask(e.target.value);
    };
    cell.appendChild(deleteTask);
    row.appendChild(cell); 

    cell = document.createElement("td");
    
    var copyTask = document.createElement('button');
    copyTask.innerHTML = "Copy";

    cell.appendChild(copyTask);
    row.appendChild(cell); 

    setSaveListButton("tainted");

    return row;
}

function updateAllMoveOptions()
{
    var table = document.getElementById("taskListBody").childNodes.length;
    var select = document.getElementById("insertNewItineraryEntrySelection");

    var o = select.length;
    while (o-- > 0) 
        select.remove(0);

    for (var i = 0, r = table-1; i < r; i++) 
    {
        var opt = new Option(""+(i+1));
        select.add(opt,i);
    }

    for (var i = 0; i < table-1; i++) 
    {
        var s = "select"+(i);
        var select2 = document.getElementById(s);
        
        if (select2 == null) 
            continue;

        var opt = new Option(""+(i+1));

        select2.remove(0);
        select2.innerHTML = select.innerHTML;
        select2.remove(i);
        select2.insertBefore(opt, select2.firstChild);
        select2[0].selected = true;
    }
}

function moveRow(from)
{
    var table = document.getElementById("taskListBody");
    var d = document.getElementById('select'+(from));
    var to = parseInt(d.options[d.selectedIndex].text,10);
    
    if (from > to)
        table.insertBefore(table.rows[from+1],table.rows[to]);
    else
        table.insertBefore(table.rows[from+1],table.rows[to].nextSibling);

    updateRows();
    writeCookie("ItineraryBackup","I");
}

function removeTask(n)
{
    var table = document.getElementById("taskListBody");

    writeCookie("ItineraryBackup","I");

    if (table != null) 
    {
        // we want to also remove the caption at the same time as the only entry
        if (table.childNodes.length == 2)
        {
            var the_table = document.getElementById("taskListEntries");
            the_table.removeChild(table);
        }
        else
            table.removeChild(table.rows[n]);
    }
    updateRows();
}

function updateRows()
{
    var table = document.getElementById("taskListBody");

    if (table == null) 
        return;

    rowData ="";

    var curTime = document.getElementById("startOfDayInput").value;      

    var n = table.rows.length;

    var m = 0;

    // update table row by row
    for (var r = 1, t = 1;  r < n; r++) 
    {
        // I add an extra row for the tutorials after I coded this,
        // but in general, it's not such a bad thing to keep monster
        // loops' counters independent of the code itself.
        var count = r - 1;

        // the 'move to row' select option
        table.rows[r].cells[0].children[0].id = "select"+count; 
        table.rows[r].cells[0].children[0].setAttribute(
            'onchange', 'moveRow('+count+')');
        table.rows[r].cells[0].children[0].setAttribute('tabindex', -1);
        table.rows[r].cells[0].children[0].setAttribute(
            'title', 
            "Move task "+(count+1)+" to the selected slot number");
        
        // time taken, start & end
        var startTimes = new String();
        var endTimes = new String();

        startTimes += curTime;
        var checkTime = table.rows[r].cells[1].children[2].value;

        // duration
        table.rows[r].cells[1].children[0].id = "duration"+count+"Select";
        table.rows[r].cells[1].children[0].setAttribute('onchange',
                                                        "syncCombo('duration"+count+
                                                        "','select');"+
                                                        "updateRows();");

        table.rows[r].cells[1].children[1].id = "duration"+count+"Input";
        table.rows[r].cells[1].children[1].setAttribute(
            'title', 
            "Enter or select new time for this task in minutes");
        var tmp = "syncCombo('duration"+count+"','input'); updateRows();"
        table.rows[r].cells[1].children[1].setAttribute('onClick', tmp);
        table.rows[r].cells[1].children[1].setAttribute('onblur', tmp);
        table.rows[r].cells[1].children[1].setAttribute('onkeyup', tmp);

        table.rows[r].cells[1].children[2].id = "duration"+count;

        if (isNaN(checkTime)) 
        {
            console.log("Something strange has happened...");
            table.rows[r].cells[1].children[0].value = 0;
            checkTime = 0;
        }

        table.rows[r].cells[1].children[0].setAttribute(
            'tabIndex',t++);

        rowData += "@@"+checkTime;
        m += parseInt(checkTime,10);

        curTime = upDateTime(curTime, checkTime);

        endTimes = curTime;

        table.rows[r].cells[2].textContent = startTimes;
        table.rows[r].cells[2].setAttribute('tabindex', -1);
        table.rows[r].cells[4].textContent = endTimes;
        table.rows[r].cells[4].setAttribute('tabindex', -1);

        // the task itself
        table.rows[r].cells[5].children[0].id = "task"+count;         
        table.rows[r].cells[5].children[0].setAttribute("tabIndex",t++);
        table.rows[r].cells[5].children[0].setAttribute(
            'title', 
            "Edit the current task");

        table.rows[r].cells[5].children[0].setAttribute('onkeyup',
                                                        "document.getElementById('task"+count+
                                                        "').value = this.value; updateRows()");

        var taskValue = table.rows[r].cells[5].children[0].value;
        rowData += "@@"+taskValue;

        // the 'done' button
        table.rows[r].cells[6].children[0].id = "deleteTask"+count; 
        table.rows[r].cells[6].children[0].setAttribute('value', (count+1)); 
        table.rows[r].cells[6].children[0].setAttribute('tabindex', -1);
        table.rows[r].cells[6].children[0].setAttribute(
            'title', 
            "Remove this task from the itinerary as 'done'");

        table.rows[r].cells[6].children[0].onClick = function(e) 
        {
            removeTask(e.target.value);
        };

        // the copy button
        table.rows[r].cells[7].children[0].innerHTML = "Copy";
        table.rows[r].cells[7].children[0].id = "copyTask"+count; 
        table.rows[r].cells[7].children[0].setAttribute('tabindex', -1);
        table.rows[r].cells[7].children[0].setAttribute(
            'title', 
            "Copy this task to the Task input'");

        table.rows[r].cells[7].children[0].setAttribute(
            'onclick', 'updateTaskInput('+count+');');

    }

    // recalibrate all the move-to drop downs
    updateAllMoveOptions();

    // update total minutes of itinerary.
    var totalTimeDisplay = document.getElementById("totalTime");
    var mins = upDateTime("00:00", m);
    totalTimeDisplay.innerHTML = mins;

    setSaveListButton("tainted");    
}

function updateTimeOfNewTask(what)
{
    if (taskList.indexOf(what) == -1)
        return;

    var f = taskList.split("@@");

    for (var i = 0, m = f.length-2; i < m; i = i + 2) 
    {
        if (f[i] === what) 
        {
            document.getElementById("timeOfNewTask").value = f[i-1];
            syncCombo("timeOfNewTask","value");
            syncCombo("task",'select');
        }
    }
}

function addNewTask(newTime, taskString) 
{
    var table = document.getElementById("taskListBody");

    if (taskString == null) 
    {
        taskString = document.getElementById("taskInput").value;

        if (taskString == null) 
        {
            taskstring = "Enter a task here.";
            document.getElementById("taskInput").value = taskstring;
        }
        document.getElementById("task").value = taskString;
    }

    if (table == null) 
    {
        // make the table
        var the_table = document.getElementById('taskListEntries');
        table = document.createElement("tbody");
        table.id = "taskListBody";
        the_table.appendChild(table);

        // append a hidden first row with the column captions we want
        // to show for the tutorials
        var r, c, s;
        var w = ["Task","Duration","Start","-","End","Activity"];
        
        r = document.createElement('tr');
        r.id = "captionRow";

        for (var i = 0; i < w.length; i++)
        {
            c = document.createElement('td');
            s = document.createElement("span");
            s.innerHTML = "<b>"+w[i]+"</b>";
            c.appendChild(s);
            r.appendChild(c);
        }
        table.insertBefore(r, table.rows[0]);
    }
    document.getElementById("captionRow").style.display = "table-row";    
    
    var num = table.childNodes.length;
    var r = createRow(newTime, taskString, table.rows.length);
    
    if (r != null) 
    {
        table.insertBefore(r, table.rows[num]);
        updateRows();
    }
}

function writeCookie(name,kind)
{
    var c = Get_Cookie(name);
    var list;
    
    list = "savedItinearies";

    if (c != null)  
    {
        Delete_Cookie(name, "/", "");  
        updateListSelect(list, name, name, "remove");
    }

    if (kind == "T") 
    {
        Set_Cookie(name, taskList,1000000, "/", "", "");
    }
    else 
    {
        var t = upDateTime(document.getElementById("startOfDay").value,0);
        Set_Cookie(name, t + rowData, 1000000, "/", "", "");
    }
    updateListSelect(list, name, name, "store");
}


///////////// Cookie management
function getCookieList() 
{
    var a_all_cookies = document.cookie.split( ';' );

    if (document.cookie === undefined) 
        return null;

    var listOfCookies = new Array();
    var a_temp_cookie = '';
    var cookie_name = '';

    for (var i = 0; i < a_all_cookies.length; i++ )
    {
        a_temp_cookie = a_all_cookies[i].split( '=' );
        cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

        listOfCookies.push(cookie_name);
    }
    return listOfCookies;
}


// Author: Public Domain, with some modifications
// Script Source URI: http://techpatterns.com/downloads/javascript_cookies.php
// Version 1.1.2
// Last Update: 5 November 2009
//
//
// To use, simple do: Get_Cookie('cookie_name'); 
// replace cookie_name with the real cookie name, '' are required
function Get_Cookie( check_name ) {
    // first we'll split this cookie up into name/value pairs
    // note: document.cookie only returns name=value, not the other components
    var a_all_cookies = document.cookie.split( ';' );
    var a_temp_cookie = '';
    var cookie_name = '';
    var cookie_value = '';
    var b_cookie_found = false; // set boolean t/f default f
    var i = '';

    for ( i = 0; i < a_all_cookies.length; i++ )
    {
        // now we'll split apart each name=value pair
        a_temp_cookie = a_all_cookies[i].split( '=' );


        // and trim left/right whitespace while we're at it
        cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

        // if the extracted name matches passed check_name
        if ( cookie_name == check_name )
        {
            b_cookie_found = true;
            // we need to handle case where cookie has no value but exists (no = sign, that is):
            if ( a_temp_cookie.length > 1 )
            {
                cookie_value = unescape( a_temp_cookie[1].replace(/^\s+|\s+$/g, '') );
            }
            // note that in cases where cookie is initialized but no value, null is returned

            return cookie_value;
            break;
        }
        a_temp_cookie = null;
        cookie_name = '';
    }
    if ( !b_cookie_found ) 
    {
        return null;
    }
    return true;
}

/*
  only the first 2 parameters are required, the cookie name, the cookie
  value. Cookie time is in milliseconds, so the below expires will make the 
  number you pass in the Set_Cookie function call the number of days the cookie
  lasts, if you want it to be hours or minutes, just get rid of 24 and 60.

  Generally you don't need to worry about domain, path or secure for most applications
  so unless you need that, leave those parameters blank in the function call.
*/
function Set_Cookie( name, value, expires, path, domain, secure ) {
    // set time, it's in milliseconds
    var today = new Date();
    today.setTime( today.getTime() );
    // if the expires variable is set, make the correct expires time, the
    // current script below will set it for x number of days, to make it
    // for hours, delete * 24, for minutes, delete * 60 * 24
    if ( expires )
    {
        expires = expires * 1000 * 60 * 60 * 24;
    }
    //alert( 'today ' + today.toGMTString() );// this is for testing task only
    var expires_date = new Date( today.getTime() + (expires) );
    //alert('expires ' + expires_date.toGMTString());// this is for testing tasks only

    document.cookie = name + "=" +escape( value ) +
        ( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) + //expires.toGMTString()
        ( ( path ) ? ";path=" + path : "" ) + 
        ( ( domain ) ? ";domain=" + domain : "" ) +
        ( ( secure ) ? ";secure" : "" );
}

// this deletes the cookie when called
function Delete_Cookie( name, path, domain ) {
    if ( Get_Cookie( name ) ) document.cookie = name + "=" +
        ( ( path ) ? ";path=" + path : "") +
        ( ( domain ) ? ";domain=" + domain : "" ) +
        ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}
</script>
