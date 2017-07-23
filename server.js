var start, refresh, count, args, argIndex, webDriver, browser;

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
        scheduleTable: "/html/body/div[4]/table[2]/tbody/tr[2]/td/table"
    },
    user: {
        username: null,
        password: null,
        sessionID: null
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

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

    // SET EXIT HANDLERS
    process.on('exit', exitHandler.bind(null, {cleanUp: false}));
    process.on('SIGINT', exitHandler.bind(null, {cleanUp: true}));
    process.on('uncaughtException', exitHandler.bind(null, {cleanUp: false, error: true}));

    start = new Date();
    args = process.argv.slice(2);

    console.log(color(colors.FgYellow, "\n----------------------------\nWhenToWork Shift Picking Bot"));
    console.log("Version 1.7 Beta");

    // TIMEOUT
    if ((argIndex = args.indexOf("-timeout")) !== -1)
        params.timeout = args[argIndex + 1];

    // DELAY
    if ((argIndex = args.indexOf("-delay")) !== -1)
        params.delay = args[argIndex + 1];

    // LIVE
    if (args.indexOf("-live") !== -1) {
        console.log(color(colors.FgMagenta, "Running in LIVE mode"));
        params.classes.confirmPickup = "btn-success";
    } else {
        console.log(color(colors.FgCyan, "Running in DEBUG mode"));
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
    webDriver = require('selenium-webDriver');
    browser = new webDriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();

    // PRINT USERNAME
    console.log(color(colors.FgYellow, "-USER:     "), params.user.username);

    // PRINT DEBUG
    console.log(color(colors.FgYellow, "-DEBUG:    "), params.debugging);

    // PRINT DATE
    console.log(color(colors.FgYellow, "-DATE:     "), ((!params.tradeboard.date) ? "NOT SET" : params.tradeboard.date));

    // PRINT AFTER
    console.log(color(colors.FgYellow, "-AFTER:    "), params.after + " hour(s)");

    // PRINT TIMEOUT
    console.log(color(colors.FgYellow, "-TIMEOUT:  "), (params.timeout / 1000) + ".000s");

    // PRINT DELAY
    console.log(color(colors.FgYellow, "-DELAY:    "), (params.delay / 1000) + ".000s");

    console.log(color(colors.FgYellow, "----------------------------"));

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

function processTime(time) {
    time = time.split(" ");
    var shiftStart = time[1];
    //var shiftStop = time[3];

    if (shiftStart.search("am") > 0) {
        shiftStart = shiftStart.replace("am", "");
        var offset = shiftStart * 3600000;
    } else {
        shiftStart = shiftStart.replace("pm", "");
        var offset = (parseInt(shiftStart) + 12) * 3600000;
    }

    var myDate = time[0].split("/");
    var newDate = new Date(myDate[0] + "," + myDate[1] + "," + myDate[2]);

    var currentTime = (new Date()).getTime();
    var newShiftTime = new Date((newDate.getTime() + offset));

    console.log("      * Current Date: " + new Date(currentTime));
    console.log("      * Shift Date:   " + new Date((newDate.getTime() + offset)));

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
    browser.get("https://whentowork.com/logins.htm");
    browser.findElement(webDriver.By.xpath(params.xPaths.usernameInput)).sendKeys(params.user.username).then(function () {
        browser.findElement(webDriver.By.xpath(params.xPaths.passwordInput)).sendKeys(params.user.password).then(function () {
            browser.findElement(webDriver.By.xpath(params.xPaths.loginSubmit)).then(function (loginSubmit) {
                loginSubmit.click().then(function () {

                    getSchedule();

                    /*browser.findElement(webDriver.By.xpath(params.xPaths.tradesTab)).then(function (tradesTab) {
                     tradesTab.click().then(function () {
                     getParameterByName("SID", function (sessionID) {
                     params.user.sessionID = sessionID;
                     params.url = "https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=" + params.user.sessionID;
                     if (params.tradeboard.date)
                     params.url += "&Date=" + params.tradeboard.date;
                     automate();
                     });
                     });
                     });*/
                });
            });
        });
    })
}

function getSchedule() {
    browser.findElement(webDriver.By.xpath(params.xPaths.scheduleTab)).then(function (scheduleTab) {
        scheduleTab.click().then(function () {
            //TODO: ADD URL PARAM DATE TO CHECK SCHEDULE FOR FUTURE DATE
            browser.findElement(webDriver.By.xpath(params.xPaths.scheduleTable)).then(function (scheduleTable) {
                console.log(color(colors.FgMagenta, "\n\n    ********** MY SCHEDULE **********"));
                scheduleTable.findElements(webDriver.By.css("tr")).then(function (elements) {
                    elements[1].findElements(webDriver.By.css("td")).then(function (elements2) {
                        for (var i = 0; i < elements2.length; i++) {
                            i = function (i) {
                                elements2[i].findElements(webDriver.By.css("a")).then(function (elements3) {
                                    console.log(color(colors.FgMagenta, "\n    " + days[i]));
                                    if (!elements3.length)
                                        console.log(color(colors.FgRed, "    NO SHIFTS"));

                                    for (var j = 0; j < elements3.length; j++)
                                        elements3[j].findElement(webDriver.By.css("font")).getText().then(function (text) {
                                            text = text.split("\n");
                                            var spaces = new Array(14 - text[1].length).join(" ");
                                            console.log("    " + color(colors.FgBlue, text[1]) + spaces + "|  " + text[0]);
                                        });
                                });
                                return i;
                            }(i);
                        }
                    });
                }).then(function () {
                    console.log(color(colors.FgMagenta, "\n    *********************************\n"));
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