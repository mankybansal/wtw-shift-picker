var start, refresh, count, args, argIndex, webDriver, browser;

var params = {
    url: "https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=1535014173420C&Date=08/23/2017",
    timeout: 5000,
    delay: 0,
    live: null,
    confirmClass: "btn-danger",
    xPaths: {
        pickUpShift: "/html/body/div[1]/table[2]/tbody/tr[2]/td/b/a"
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

function color(color, text) {
    return (color + text + colors.Reset);
}

function init() {

    // SET EXIT HANDLERS
    process.on('exit', exitHandler.bind(null, {cleanUp: false}));
    process.on('SIGINT', exitHandler.bind(null, {cleanUp: true}));
    process.on('uncaughtException', exitHandler.bind(null, {cleanUp: false, restart: false, error: true}));

    start = new Date();
    args = process.argv.slice(2);

    console.log(color(colors.FgYellow, "\n----------------------------\nWhenToWork Shift Picking Bot"));
    console.log("Version 1.3 Beta");

    // URL
    if ((argIndex = args.indexOf("-url")) !== -1)
        params.url = args[argIndex + 1];

    // TIMEOUT
    if ((argIndex = args.indexOf("-timeout")) !== -1)
        params.timeout = args[argIndex + 1];

    // DELAY
    if ((argIndex = args.indexOf("-delay")) !== -1)
        params.delay = args[argIndex + 1];

    // LIVE
    if (args.indexOf("-live") !== -1) {
        console.log(color(colors.FgMagenta, "Running in LIVE mode"));
        params.confirmClass = "btn-success";
        params.url = "https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=1697883600420C&Date=07/16/2017";
    } else
        console.log(color(colors.FgCyan, "Running in DEBUG mode"));

    // INIT DRIVER
    webDriver = require('selenium-webDriver');
    browser = new webDriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();

    // PRINT URL
    console.log(color(colors.FgYellow, "-URL:      "), params.url);

    // PRINT TIMEOUT
    console.log(color(colors.FgYellow, "-TIMEOUT:  "), (params.timeout / 1000) + ".000s");

    // PRINT DELAY
    console.log(color(colors.FgYellow, "-DELAY:    "), (params.delay / 1000) + ".000s");

    console.log(color(colors.FgYellow, "----------------------------"));

    // START AUTOMATION
    setTimeout(automate, params.delay);
}

function exitHandler(options, err) {
    if (err && options.error) {
        console.log("\n*** ERROR ***");
        console.log(err.stack);
        var exec = require('child_process').exec;
        var cmd = 'forever stopall';
        exec(cmd, function (error, stdout, stderr) {
            console.log("\n\nStopping forever...");
        });

        process.exit(0);
    }

    if (options.cleanUp) {
        console.log("\n\nStopping wtw-shift-picker...");
        browser.quit();
        console.log(color(colors.FgRed, "EXITED"));
    }
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
                            browser.findElement(webDriver.By.className("titlebox")).getText().then(function (text) {

                                console.log(color(colors.FgGreen, ("   " + text)));
                                console.log("------------------------------------------------");

                                browser.findElement(webDriver.By.xpath(params.xPaths.pickUpShift)).then(function (confirmElement) {
                                    confirmElement.click();

                                    browser.findElement(webDriver.By.className(params.confirmClass)).then(function (confirmSureElement) {

                                        console.log("\nAttempting Shift Pickup...");

                                        confirmSureElement.click().then(function () {
                                            browser.getAllWindowHandles().then(function (handles) {

                                                console.log(color(colors.FgGreen, "PICKED UP SHIFT"));

                                                browser.switchTo().window(handles[0]);
                                                clearTimeout(refresh);

                                                console.log("\nStopping wtw-shift-picker...");
                                                browser.quit().then(function () {
                                                    console.log(color(colors.FgRed, "EXITED"));
                                                    console.log("\nRestarting wtw-shift-picker...");
                                                    setTimeout(function () {
                                                        console.log(color(colors.FgGreen, "RESTARTED\n"));
                                                        process.exit();
                                                    }, 5000);
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
// TODO: LOGIN & DATE