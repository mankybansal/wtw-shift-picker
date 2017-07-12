var webdriver = require('selenium-webdriver');
var browser = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();

var confirmClass;
var args = process.argv.slice(2);

if (args[0] == "-live") {
    console.log("\n*** Running in LIVE mode. ***\n");
    confirmClass = "btn-success";
} else {
    console.log("\n*** Running in DEBUG mode. ***\n");
    confirmClass = "btn-danger";
}

console.reset = function () {
    return process.stdout.write('\033c');
};

function automate() {

    browser.get('https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=1697883600420C');
    var count = 0;

    browser.findElements(webdriver.By.className("s2")).then(function (elements) {
        count = elements.length;
    }).then(function () {
        console.log("\n**********************\n" + (count - 1) + " DROPPED SHIFTS FOUND \n**********************\n");

        if (count > 1) {
            console.log("------------------------------------------------");
            for (var i = 1; i < count; i++) {
                getElement(i, function (myIndex, myElement) {
                    //console.log(myElement);
                    myElement.getText().then(function (text) {
                        console.log(myIndex + ". " + text);
                    });

                    myElement.click();

                    browser.getAllWindowHandles().then(function (handles) {
                        browser.switchTo().window(handles[1]).then(function () {
                            browser.findElement(webdriver.By.className("titlebox")).getText().then(function (text) {
                                console.log("   " + text);
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

        setTimeout(automate, 3500);
    });
}

function getElement(sourceIndex, callback) {
    browser.findElements(webdriver.By.className("s2")).then(function (elements) {
        elements.forEach(function (value, index) {
            if (index == sourceIndex)
                return callback(sourceIndex, value);
        });
    })
}

automate();