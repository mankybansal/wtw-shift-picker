var webdriver, browser, confirmClass,
    //baseURL = "https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=1697883600420C&Date=07/09/2017";
    baseURL = "https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=1535014173420C&Date=08/13/2017";
var args = process.argv.slice(2);

console.log("\x1b[33m%s\x1b[0m", "\n----------------------------\nWhenToWork Shift Picking Bot\n----------------------------");
console.log("Version 1.1 Beta");

if (args[2] == "-live") {
    console.log("\x1b[35m%s\x1b[0m", "*** Running in LIVE mode. ***");
    confirmClass = "btn-success";
} else {
    console.log("\x1b[36m%s\x1b[0m", "*** Running in DEBUG mode. ***");
    confirmClass = "btn-danger";
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

process.on('SIGINT', function() {
    console.log( "\nStopping wtw-shift-picker" );
    browser.close();

    console.log( "Browser Closed. Exiting..." );
    // some other closing procedures go here
    process.exit( );
});

function automate() {

    browser.get(baseURL);
    var count = 0;

    browser.findElements(webdriver.By.css(".s2, .s3")).then(function (elements) {
        count = elements.length;
    }).then(function () {
        console.log("\x1b[32m","\n**********************\n" + (count-2) + " DROPPED SHIFTS FOUND \n**********************");
        console.log("\x1b[0m");

        if (count >2) {
            console.log("------------------------------------------------");
            for (var i = 2; i < count; i++) {
                getElement(browser, i, function (myIndex, myElement) {
                    //console.log(myElement);
                    myElement.getText().then(function (text) {
                        console.log((myIndex-1) + ". " + text);
                    });

                    myElement.click();

                    browser.getAllWindowHandles().then(function (handles) {
                        browser.switchTo().window(handles[1]).then(function () {
                            browser.findElement(webdriver.By.className("titlebox")).getText().then(function (text) {
                                console.log("\x1b[32m","   " + text,"\x1b[0m");
                                console.log("------------------------------------------------");

                                var xpath = "/html/body/div[1]/table[2]/tbody/tr[2]/td/b/a";

                                browser.findElement(webdriver.By.xpath(xpath)).then(function (confirmElement) {
                                    confirmElement.click();
                                    browser.findElement(webdriver.By.className(confirmClass)).then(function (confirmSureElement) {
                                        //TODO: IF DON'T WANT SHIFT CANCEL AND CLOSE

                                        confirmSureElement.click();
                                        browser.getAllWindowHandles().then(function (handles) {
                                            //console.log(handles);
                                            browser.switchTo().window(handles[0]);
                                        });
                                    });
                                });
                            });
                        });
                    });

                });
            }
        }

        setTimeout(automate, 10000);
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