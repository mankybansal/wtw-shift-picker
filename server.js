var dateFormat, start, refresh, count, args, argIndex, webDriver, browser;

var params = {
    url: null,
    debugging: false,
    timeout: 5000,
    delay: 0,
    live: null,
    after: null,
    classes: {
        confirmPickup: "btn-danger",
        shiftTitle: "titlebox"
    },
    xPaths: {
        pickUpShift: "/html/body/div[1]/table[2]/tbody/tr[2]/td/b/a",
        usernameInput: "/html/body/form/div[2]/div[1]/input[1]",
        passwordInput: "/html/body/form/div[2]/div[1]/input[2]",
        loginSubmit: "/html/body/form/div[2]/div[2]/input",
        tradesTab: "//*[@id=\"emptop\"]/tbody/tr/td[5]",
        scheduleTab: "//*[@id=\"emptop\"]/tbody/tr/td[2]",
        scheduleTable: "/html/body/div[4]/table[2]/tbody/tr[2]/td/table",
        scheduleWeekOf: "//*[@id=\"calbtn\"]/nobr/a[2]"
    },
    user: {
        username: null,
        password: null,
        sessionID: null,
        schedule: []
    },
    tradeboard: {
        date: null
    }
};

var colors = {
    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
};

var calender = {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    addDays: function (date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
};

function getParameterByName(name, callback) {
    browser.getCurrentUrl().then(function (currentUrl) {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(currentUrl);
        if (!results) return null;
        if (!results[2]) return '';
        callback(decodeURIComponent(results[2].replace(/\+/g, " ")));
    });
}

function color(color, text) {
    return (color + text + colors.Reset);
}

function init() {

    // LOAD MODULES
    dateFormat = require('dateformat');
    webDriver = require('selenium-webDriver');


    // SET EXIT HANDLERS
    process.on('exit', exitHandler.bind(null, {cleanUp: false}));
    process.on('SIGINT', exitHandler.bind(null, {cleanUp: true}));
    process.on('uncaughtException', exitHandler.bind(null, {cleanUp: false, error: true}));

    start = new Date();
    args = process.argv.slice(2);

    console.log(color(colors.FgYellow, "\n------------------------------\n  WhenToWork Shift Assistant"));
    console.log("  Version 1.7 Beta");

    // TIMEOUT
    if ((argIndex = args.indexOf("-timeout")) !== -1)
        params.timeout = args[argIndex + 1];

    // DELAY
    if ((argIndex = args.indexOf("-delay")) !== -1)
        params.delay = args[argIndex + 1];

    // LIVE
    if (args.indexOf("-live") !== -1) {
        console.log(color(colors.FgMagenta, "  Running in LIVE mode"));
        params.classes.confirmPickup = "btn-success";
    } else {
        console.log(color(colors.FgCyan, "  Running in DEBUG mode"));
        params.tradeboard.date = "08/13/2017"
    }

    // DATE
    if ((argIndex = args.indexOf("-date")) !== -1) {
        params.tradeboard.date = args[argIndex + 1];
    }

    // DEBUGGING
    if (args.indexOf("-debug") !== -1)
        params.debugging = true;

    // DEBUGGING
    if ((argIndex = args.indexOf("-after")) !== -1)
        params.after = args[argIndex + 1];

    // USERNAME
    if ((argIndex = args.indexOf("-u")) !== -1)
        params.user.username = args[argIndex + 1];

    // PASSWORD
    if ((argIndex = args.indexOf("-p")) !== -1)
        params.user.password = args[argIndex + 1];

    // INIT DRIVER
    browser = new webDriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();

    // PRINT USERNAME
    console.log(color(colors.FgYellow, "  -USER:     "), params.user.username);

    // PRINT DEBUG
    console.log(color(colors.FgYellow, "  -DEBUG:    "), params.debugging);

    // PRINT DATE
    console.log(color(colors.FgYellow, "  -DATE:     "), ((!params.tradeboard.date) ? "NOT SET" : params.tradeboard.date));

    // PRINT AFTER
    console.log(color(colors.FgYellow, "  -AFTER:    "), params.after + " hour(s)");

    // PRINT TIMEOUT
    console.log(color(colors.FgYellow, "  -TIMEOUT:  "), (params.timeout / 1000) + ".000s");

    // PRINT DELAY
    console.log(color(colors.FgYellow, "  -DELAY:    "), (params.delay / 1000) + ".000s");

    console.log(color(colors.FgYellow, "------------------------------"));

    // START AUTOMATION
    setTimeout(login, params.delay);
}

function exitHandler(options, err) {
    if (err && options.error && params.debugging) {
        console.log("\n*** ERROR ***");
        console.log(color(colors.FgRed, err.stack));
        console.log("\nStopping forever...\n");
        var exec = require('child_process').exec;
        var cmd = 'forever stopall';
        exec(cmd);
    }

    if (options.cleanUp) {
        console.log("\n\nStopping wtw-shift-picker...");
        browser.quit();
        console.log(color(colors.FgRed, "EXITED"));
    }
}

function parseTime(time) {
    time = time.split(" ");
    var shiftStart = time[1];
    var shiftStop = time[3];

    if (shiftStart.search("am") > 0) {
        shiftStart = shiftStart.replace("am", "");
        var startOffset = parseInt(shiftStart) % 12;

        if (shiftStop.search("am") > 0) {
            shiftStop = shiftStop.replace("am", "");
            var stopOffset = shiftStop;
        } else {
            shiftStop = shiftStop.replace("pm", "");
            var stopOffset = shiftStop;
        }

    } else {
        shiftStart = shiftStart.replace("pm", "");
        var startOffset = parseInt(shiftStart) % 12;

        if (shiftStop.search("am") > 0) {
            shiftStop = shiftStop.replace("am", "");
            var stopOffset = shiftStop;
        } else {
            shiftStop = shiftStop.replace("pm", "");
            var stopOffset = shiftStop;
        }

    }


    //var myDate = time[0].split("/");
    //var newDate = new Date(myDate[0] + "," + myDate[1] + "," + myDate[2]);

    return (stopOffset - startOffset);
}

function checkSchedule(time){

    // TODO: Implement Schedule Checker



    return false;
}

function processTime(time) {
    time = time.split(" ");
    var shiftStart = time[1];
    var shiftStop = time[3];

    if (shiftStart.search("am") > 0) {
        shiftStart = shiftStart.replace("am", "");
        var startOffset = shiftStart * 3600000;

        if (shiftStop.search("am") > 0) {
            shiftStop = shiftStop.replace("am", "");
            var stopOffset = shiftStop * 3600000;
        }

    } else {
        shiftStart = shiftStart.replace("pm", "");
        var startOffset = (parseInt(shiftStart) + 12) * 3600000;

        if (shiftStop.search("am") > 0) {
            shiftStop = shiftStop.replace("am", "");
            var stopOffset = (parseInt(shiftStop) + 24) * 3600000;
        }
    }

    if (shiftStop.search("pm") > 0) {
        shiftStop = shiftStop.replace("pm", "");
        var stopOffset = (parseInt(shiftStop) + 12) * 3600000;
    }

    var myDate = time[0].split("/");
    var newDate = new Date(myDate[0] + "," + myDate[1] + "," + myDate[2]);

    var currentTime = (new Date()).getTime();
    var newShiftTime = new Date((newDate.getTime() + startOffset));

    console.log("      * Current Date: " + new Date(currentTime));
    console.log("      * Shift Date:   " + new Date((newDate.getTime() + startOffset)));

    var x = (newShiftTime - currentTime) / 1000;
    var seconds = Math.ceil(x % 60);
    x = x / 60;
    var minutes = Math.floor(x % 60);
    x = x / 60;
    var hours = Math.floor(x % 24);
    x = x / 24;
    var days = Math.floor(x);

    console.log("      * Difference:   " + days + " days " + hours + " hours " + minutes + " minutes " + seconds + " seconds.");

    return (newShiftTime - currentTime);
}

function login() {

    console.log("\nLogging In...");

    browser.get("https://whentowork.com/logins.htm");
    browser.findElement(webDriver.By.xpath(params.xPaths.usernameInput)).sendKeys(params.user.username).then(function () {
        browser.findElement(webDriver.By.xpath(params.xPaths.passwordInput)).sendKeys(params.user.password).then(function () {
            browser.findElement(webDriver.By.xpath(params.xPaths.loginSubmit)).then(function (loginSubmit) {
                loginSubmit.click().then(function () {
                    browser.findElement(webDriver.By.xpath(params.xPaths.tradesTab)).then(function (tradesTab) {
                        tradesTab.click().then(function () {
                            getParameterByName("SID", function (sessionID) {

                                params.user.sessionID = sessionID;

                                if (params.user.sessionID) {
                                    console.log(color(colors.FgGreen, ("LOGGED IN AS " + params.user.username)));
                                    params.url = "https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=" + params.user.sessionID;
                                    if (params.tradeboard.date)
                                        params.url += "&Date=" + params.tradeboard.date;

                                    getSchedule();
                                    automate();
                                } else
                                    console.log(color(colors.FgRed, "LOGIN FAILED"));
                            });
                        });
                    });
                });
            });
        });
    })
}

function addToSchedule(weekOf, shiftTime, shiftLocation) {

    var scheduleObject = {
        weekOf: null,
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: []
    };

    var shiftObject = {
        date: shiftTime,
        location: shiftLocation.replace("CDA - ", "")
    };

    scheduleObject.weekOf = weekOf;
    var myDate = shiftTime.split(" ")[0].split("/");
    var scheduleDay = calender.days[(new Date(myDate[0] + "," + myDate[1] + "," + myDate[2])).getDay()].toLowerCase();

    var scheduleIndex = -1;

    for (var i = 0; i < params.user.schedule.length; i++)
        if (weekOf === params.user.schedule[i].weekOf)
            scheduleIndex = i;

    if (scheduleIndex >= 0)
        params.user.schedule[scheduleIndex][scheduleDay].push(shiftObject);
    else {
        scheduleObject[scheduleDay].push(shiftObject);
        params.user.schedule.push(scheduleObject);
    }
}

function printSchedule() {
    //TODO: ADDS ONLY FOR FIRST SCHEDULE ADD DATE PARAM TO ALLOW TO CHECK WHICH ONE TO PRINT
    console.log(color(colors.FgMagenta, "\n*********** MY SCHEDULE ************"));
    console.log("\n  Week of: " + dateFormat(new Date(params.user.schedule[0].weekOf), "dS mmmm, yyyy"));

    var totalHourCount = 0;

    function printDay(numDay) {
        var obj = params.user.schedule[0][calender.days[numDay].toLowerCase()];

        var hourCount = 0;
        var spaces0 = dateFormat(calender.addDays(new Date(dateFormat(new Date(params.user.schedule[0].weekOf))), numDay), "dS mmmm, yyyy").toString().length;
        var spaces1 = dateFormat(calender.addDays(new Date(dateFormat(new Date(new Date(params.user.schedule[0].weekOf)))), numDay), "dddd").toString().length;
        var spaces2 = new Array(33 - spaces0 - spaces1).join(" ");

        console.log("\n  " + dateFormat(calender.addDays(new Date(dateFormat(new Date(new Date(params.user.schedule[0].weekOf)))), numDay), "dddd") + spaces2 + color(colors.FgMagenta, dateFormat(calender.addDays(new Date(dateFormat(new Date(params.user.schedule[0].weekOf))), numDay), "dS mmmm, yyyy")));
        console.log(color(colors.FgMagenta, "  --------------------------------"));
        for (var j = 0; j < obj.length; j++) {
            hourCount += parseTime(obj[j].date);
            var text = obj[j].date.split(" ");
            var spaces3 = new Array(14 - (text[1] + " - " + text[3]).length).join(" ");
            var spaces4 = new Array(13 - obj[j].location.length).join(" ");
            console.log(color(colors.FgMagenta, "  |  ") + text[1] + " - " + text[3] + spaces3 + color(colors.FgMagenta, ("|  " + obj[j].location) + spaces4 + "|"));
        }
        console.log(color(colors.FgMagenta, "  --------------------------------"));
        console.log(color(colors.FgYellow, ("  HOURS: " + hourCount)));
        totalHourCount += hourCount;
    }

    for (var i = 0; i < 7; i++) printDay(i);

    console.log("\n  TOTAL HOURS: " + totalHourCount);
    console.log(color(colors.FgMagenta, "\n************************************\n"));
}

function getSchedule() {
    browser.findElement(webDriver.By.xpath(params.xPaths.scheduleTab)).then(function (scheduleTab) {
        scheduleTab.click().then(function () {
            //TODO: ADD URL PARAM DATE TO CHECK SCHEDULE FOR FUTURE DATE
            browser.findElement(webDriver.By.xpath(params.xPaths.scheduleWeekOf)).getText().then(function (scheduleWeek) {
                var scheduleWeek = (scheduleWeek.replace("Week of ", "").replace(",", ""));
                browser.findElement(webDriver.By.xpath(params.xPaths.scheduleTable)).then(function (scheduleTable) {
                    scheduleTable.findElements(webDriver.By.css("tr")).then(function (elements) {
                        elements[1].findElements(webDriver.By.css("td")).then(function (elements2) {
                            for (var i = 0; i < elements2.length; i++)
                                i = function (i) {
                                    elements2[i].findElements(webDriver.By.css("a")).then(function (elements3) {
                                        if (elements3.length)
                                            for (var j = 0; j < elements3.length; j++)
                                                elements3[j].findElement(webDriver.By.css("font")).getText().then(function (text) {
                                                    text = text.split("\n");
                                                    addToSchedule(scheduleWeek, (dateFormat(calender.addDays(new Date(scheduleWeek), i), "mm/dd/yy") + " " + text[1]), text[0]);
                                                });
                                    });
                                    return i;
                                }(i);
                        });
                    }).then(function () {
                        printSchedule();
                    });
                });
            });
        });
    });
}

function automate() {

    browser.get(params.url);
    count = 0;
    refresh = setTimeout(automate, params.timeout);

    browser.findElements(webDriver.By.css(".s2, .s3")).then(function (elements) {
        count = elements.length;
    })
        .then(function () {
            console.log(color(colors.FgCyan, ("\nTime elapsed: " + ((new Date().getTime() - start.getTime()) / 1000) + "s")));
            console.log(color(colors.FgGreen, ("**********************\n" + (count - 2) + " DROPPED SHIFTS FOUND \n**********************")));

            if (count > 2) {
                console.log("------------------------------------------------");
                getElement(browser, 2, function (myIndex, myElement) {

                    myElement.getText().then(function (text) {
                        console.log(" " + (myIndex - 1) + ". " + text);
                    });

                    myElement.click();

                    browser.getAllWindowHandles().then(function (handles) {
                        browser.switchTo().window(handles[1]).then(function () {
                            browser.findElement(webDriver.By.className(params.classes.shiftTitle)).getText().then(function (text) {

                                console.log(color(colors.FgGreen, ("    " + text)));
                                console.log("------------------------------------------------");

                                var offsetDiff = 0;

                                if (params.after) {
                                    console.log("\n    " + color(colors.FgYellow, "AFTER") + " param set. Offset is: " + color(colors.FgYellow, (params.after + " hours")));
                                    if ((offsetDiff = (processTime(text) - params.after * 3600000)) < 0) {
                                        console.log(color(colors.FgRed, "    UNDER OFFSET TIME"));
                                        params.classes.confirmPickup = "btn-danger"
                                    } else
                                        console.log(color(colors.FgGreen, "    OVER OFFSET TIME"));
                                }

                                browser.findElement(webDriver.By.xpath(params.xPaths.pickUpShift)).then(function (confirmElement) {
                                    confirmElement.click();

                                    browser.findElement(webDriver.By.className(params.classes.confirmPickup)).then(function (confirmSureElement) {

                                        if (offsetDiff >= 0)
                                            console.log("\nAttempting Shift Pickup...");
                                        else
                                            console.log("\nAborting Shift Pickup...");

                                        confirmSureElement.click().then(function () {
                                            browser.getAllWindowHandles().then(function (handles) {

                                                if (offsetDiff >= 0)
                                                    console.log(color(colors.FgGreen, "PICKED UP SHIFT"));
                                                else
                                                    console.log(color(colors.FgRed, "ABORTED SHIFT PICKUP"));

                                                browser.switchTo().window(handles[0]);
                                                clearTimeout(refresh);

                                                console.log("\nStopping wtw-shift-picker...");
                                                browser.quit().then(function () {
                                                    console.log(color(colors.FgRed, "EXITED"));
                                                    console.log("\nRestarting wtw-shift-picker...");
                                                    setTimeout(function () {
                                                        console.log(color(colors.FgGreen, "RESTARTED\n"));
                                                        process.exit();
                                                    }, 1000);
                                                });

                                            });
                                        });
                                    });
                                });
                            });
                        })
                    });
                });
            }

            if (count == 0) {
                clearTimeout(refresh);
                console.log(color(colors.FgRed, "RATE LIMITED."));
                console.log("\n\nRestarting in 15 seconds...");
                setTimeout(function () {
                    console.log(color(colors.FgGreen, "RESTARTED\n"));
                    process.exit()
                }, 15000);
            }
        });
}

function getElement(browser, sourceIndex, callback) {
    browser.findElements(webDriver.By.css(".s2, .s3")).then(function (elements) {
        elements.forEach(function (value, index) {
            if (index == sourceIndex)
                return callback(sourceIndex, value);
        });
    })
}

init();

// TODO: FIX IF SHIFT ALREADY EXISTS, ADD TO STACK AND TRY NEXT ONE
// TODO: IF DON'T WANT SHIFT CANCEL AND CLOSE
// TODO: COPY SCHEDULE TO MYIIT AND SUBMIT TIMESHEET