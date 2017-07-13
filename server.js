var timeout,args, webdriver, browser, confirmClass, baseURL;
args = process.argv.slice(2);

console.log("\x1b[33m%s\x1b[0m", "\n----------------------------\nWhenToWork Shift Picking Bot\n----------------------------");
console.log("Version 1.1 Dev");

if (args[3] == "-timeout"){
    timeout = args[4];

}else {
    timeout = 5000;
}

if (args[2] == "-live") {
    console.log("\x1b[35m%s\x1b[0m", "*** Running in LIVE mode. ***");
    confirmClass = "btn-success";
    baseURL = "https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=1697883600420C&Date=07/09/2017";
} else {
    console.log("\x1b[36m%s\x1b[0m", "*** Running in DEBUG mode. ***");
    confirmClass = "btn-danger";
    baseURL = "https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=1535014173420C&Date=08/13/2017";
}

if (args[0] == "-url") {
    if (args[1] != "default")
        baseURL = args[1];
    console.log("\x1b[33m%s\x1b[0m", "URL: " + baseURL);

    webdriver = require('selenium-webdriver');
    browser = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();
} else {
    console.log('\x1b[31m%s\x1b[0m', "\nERROR: Must specify base URL\n");
    process.exit()
}

console.reset = function () {
    return process.stdout.write('\033c');
};

//PRINT TIMEOUT
console.log("\x1b[33m%s\x1b[0m", "TIMEOUT: ", (timeout/1000) + ".000s");

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
        console.log("\x1b[31m%s\x1b[0m", "EXITED\n");
    }
}

process.on('exit', exitHandler.bind(null, {cleanUp: false}));
process.on('SIGINT', exitHandler.bind(null, {cleanUp: true}));
process.on('uncaughtException', exitHandler.bind(null, {cleanUp: false, error: true}));

var start = new Date();

function automate() {

    browser.get(baseURL);
    var count = 0;
    var refresh = setTimeout(automate, timeout);

    browser.findElements(webdriver.By.css(".s2, .s3")).then(function (elements) {
        count = elements.length;
    })
        .then(function () {
            console.log("\x1b[36m", ("\nTime elapsed: " + ((new Date().getTime() - start.getTime()) / 1000) + "s"));
            console.log("\x1b[32m%s\x1b[0m", ("**********************\n" + (count - 2) + " DROPPED SHIFTS FOUND \n**********************"));

            if (count > 2) {
                console.log("------------------------------------------------");
                //for (var i = 2; i < count; i++) {
                getElement(browser, 2, function (myIndex, myElement) {
                    //console.log(myElement);
                    myElement.getText().then(function (text) {
                        console.log(" " + (myIndex - 1) + ". " + text);
                    });

                    myElement.click();

                    browser.getAllWindowHandles().then(function (handles) {
                        browser.switchTo().window(handles[1]).then(function () {
                            browser.findElement(webdriver.By.className("titlebox")).getText().then(function (text) {
                                console.log("\x1b[32m", "   " + text, "\x1b[0m");
                                console.log("------------------------------------------------");

                                var xpath = "/html/body/div[1]/table[2]/tbody/tr[2]/td/b/a";

                                browser.findElement(webdriver.By.xpath(xpath)).then(function (confirmElement) {
                                    confirmElement.click();

                                    browser.findElement(webdriver.By.className(confirmClass)).then(function (confirmSureElement) {
                                        //TODO: IF DON'T WANT SHIFT CANCEL AND CLOSE
                                        confirmSureElement.click().then(function () {
                                            browser.getAllWindowHandles().then(function (handles) {
                                                //console.log(handles);
                                                browser.switchTo().window(handles[0]);
                                                //if (args[2] == "-live") {
                                                clearTimeout(refresh);
                                                console.log("\n\nStopping wtw-shift-picker...");
                                                browser.quit().then(function () {
                                                    console.log("\x1b[31m%s\x1b[0m", "EXITED\n");
                                                    setTimeout(function () {
                                                        process.exit()
                                                    }, 5000);
                                                });
                                                //}
                                            });
                                        });
                                    });
                                });
                            });
                        })
                    });

                });
                //}
            }

            if(count == 0){
                clearTimeout(refresh);
                console.log("\x1b[31m%s\x1b[0m", "RATE LIMITED.");
                console.log("\n\nRestarting in 15 seconds...");
                setTimeout(function () {
                    process.exit()
                }, 15000);
            }
        });
}

function getElement(browser, sourceIndex, callback) {
    browser.findElements(webdriver.By.css(".s2, .s3")).then(function (elements) {
        elements.forEach(function (value, index) {
            if (index == sourceIndex)
                return callback(sourceIndex, value);
        });
    })
}

automate();