var webdriver = require('selenium-webdriver');
var browser = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();

function automate() {
    browser.get('https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=848771569420C');

    var count = 0;
    browser.findElements(webdriver.By.className("s2")).then(function (elements) {
        count = elements.length;
    }).then(function () {
            console.log("\n**********************\n" + (count - 1) + " DROPPED SHIFTS FOUND \n**********************\n");

            console.log("------------------------------------------------");

            for (var i = 1; i < 2; i++) {

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

                                    browser.findElement(webdriver.By.className("btn-danger")).then(function (confirmSureElement) {
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
            //setTimeout(automate, 3500);
        }
    );

    /*

     browser.findElement(webdriver.By.xpath(xpath)).getText().then(function (text) {
     console.log(" ---- " + text);
     });*!/


     console.log(browser.getPageSource());
     });
     });*/
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
//setInterval(automate, 2000);