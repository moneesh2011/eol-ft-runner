const { By, WebElement, until, Condition, Key, error } = require('selenium-webdriver');
const { getPlatformName, getBrowserName } = require('./utility');
const command = require('selenium-webdriver/lib/command');
const errorHandler = require('./error-handler');
const by = (strategy, locator) => By[strategy](locator);
const rejectWithError = err => Promise.reject(err);
const moment = require('moment');

/**
 * this.driver class methods
 */
class Driver {
  constructor(driver) {
    this.driver = driver;
    this.platform = getPlatformName(driver);
    this.browser = getBrowserName(driver);
    this.timeout = 30000;
  }

  /**
   * Navigate to a particular URL, with optional verification of navigated URL
   * @param {string} url - URL to navigate
   * @param {boolean} checkUrl - Optional verification to check if navigation was successful within timeout
   */
  async navigateTo(url, checkUrl = true) {
    if (process.env.BRANCH_NAME) {
      await this.driver.get(process.env.URL + 'fake-route'); // Load a fake route to allow adding of cookie
      await this.driver.manage().addCookie({
        name: 'branch',
        value: process.env.BRANCH_NAME
      });
    }
    await this.driver.get(url);
    if (checkUrl) {
      await this.waitUntilUrlIs(url);
    }
    await this.waitForPageLoadComplete();
  }

  /**
   * Refresh current page
   */
  async refreshCurrentPage() {
    await this.driver.navigate().refresh();
    await this.waitForPageLoadComplete();
  }

  /**
   * Quit or close the current driver session
   */
  close() {
    return this.driver.close();
  }

  /**
   * Wait for specified element(s) to appear and returns them as an array
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @returns {*} Returns the array of WebElementPromises if found;
   */
  // TODO: check if needed
  async waitForElements(strategy, locator, timeout = this.timeout) {
    try {
      return await this.driver.wait(until.elementsLocated(by(strategy, locator)), timeout);
    } catch (error) {
      if (error.name === 'StaleElementReferenceError') {
        await this.waitForElements(strategy, locator, timeout);
      } else {
        error.message = `Error occurred in driver.waitForElements("${strategy}", "${locator}")\n` + error.message;
        await this.processAndThrowError(error, new Error().stack);
      }
    }
  }

  /**
   * Wait for A SINGLE specified element to appear and returns them as an array
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @returns {WebElementPromise} Returns a WebElementPromise if found;
   */
  // TODO: check if needed
  async waitForElement(strategy, locator) {
    const msg = `Timed out waiting for '${locator}' by '${strategy}' to be located`;
    return await this.driver.wait(until.elementLocated(by(strategy, locator)), this.timeout, msg);
  }

  /**
   * Click on an element in the webpage
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @param {Function} caller - Optional parameter to indicate the function name that called this method
   */
  async click(strategy, locator, caller) {
    try {
      const elements = await this.waitForElements(strategy, locator);
      const firstElement = elements[0];
      await firstElement.isEnabled();
      await this.driver.wait(until.elementIsVisible(firstElement), this.timeout, `Timed out waiting for '${locator}' by '${strategy} to be visible'`);
      const elementType = await firstElement.getTagName();

      if ((elementType === 'button') | (elementType === 'a')) {
        const newElement = await this.waitForElement(strategy, locator);
        await this.driver.executeScript(`arguments[0].click();`, newElement);
      } else {
        await firstElement.click();
      }
    } catch (error) {
      if (error.name === 'StaleElementReferenceError') {
        this.click(strategy, locator);
      } else {
        error.message = `Error occurred in driver.click("${strategy}", "${locator}")\n` + error.message;
        error.message = `Caller: ${caller}\n` + error.message;
        await this.processAndThrowError(error, new Error().stack);
      }
    }
  }

  /**
   * Type value into the specified input field element in the webpage
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of input field element to search, corresponding to locator strategy
   * @param {string} value - Value to be entered in the input field
   */
  async type(strategy, locator, value) {
    try {
      const element = await this.waitForElements(strategy, locator);
      await element[0].sendKeys(value);
    } catch (error) {
      error.message = error.message + ` occurred in driver.type("${strategy}", "${locator}", "${value}")`;
      await this.processAndThrowError(error, new Error().stack);
    }
  }

  /**
   * Custom function to enter date, month and year value in a 3-split dd-mm-YYYY date field
   * @param {string} baseId - Id value of the element based on 'id' locator strategy
   */
  async fillInDate(baseId) {
    try {
      const day = await this.waitForElements('id', baseId + '-day');
      const month = await this.waitForElements('id', baseId + '-month');
      const year = await this.waitForElements('id', baseId + '-year');
      await day[0].sendKeys('10');
      await month[0].sendKeys('10');
      await year[0].sendKeys('2018');
    } catch (error) {
      error.message = error.message + ` occurred in driver.fillInDate("${baseId}")`;
      await this.processAndThrowError(error, new Error().stack);
    }
  }

  /**
   * Clear value present in an input field element in the webpage
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of input field element to search, corresponding to locator strategy
   */
  async clear(strategy, locator) {
    let textFieldValue = '';
    try {
      const elements = await this.waitForElements(strategy, locator);
      await this.driver.executeScript(`arguments[0].select();`, elements[0]);
      await elements[0].sendKeys(Key.BACK_SPACE);
      // TODO: why do i need this wait?
      await this.driver.wait(
        new Condition('for text clear to complete', async () => {
          textFieldValue = await elements[0].getAttribute('value');
          return textFieldValue === '';
        }),
        this.timeout
      );
    } catch (error) {
      error.message += ` occurred in clear("${strategy}", "${locator}")`;
      error.message += `\nLast value of textfield is "${textFieldValue}"`;
      await this.processAndThrowError(error, new Error().stack);
    }
  }

  /**
   * Waits for elements as specified, and returns the `text` attribute of the first element
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @param {boolean} waitForText - set to true, if function should wait until element text is not empty
   */
  // TODO: check if needed
  async getText(strategy, locator, waitForText = false) {
    try {
      const elements = await this.waitForElements(strategy, locator);
      if (waitForText) {
        await this.driver.wait(
          new Condition(`for element text to be not empty`, async () => {
            return (await elements[0].getText()) != '';
          }),
          this.timeout
        );
      }
      return await elements[0].getText();
    } catch (error) {
      if (error.name === 'StaleElementReferenceError') {
        await this.getText(strategy, locator, waitForText);
      } else {
        error.message = `Error occurred in getText("${strategy}", "${locator}", "${waitForText}")\n` + error.message;
        await this.processAndThrowError(error, new Error().stack);
      }
    }
  }

  /**
   * Waits for elements as specified, and returns the `text` attribute of the all the elements
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   */
  async getTexts(strategy, locator) {
    let startTime;
    let endTime;
    let numOfTimes;
    try {
      const elements = await this.waitForElements(strategy, locator);
      startTime = moment().format('YYYY-MM-DD hh:mm:sssss');
      let texts = [];
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        endTime = moment().format('YYYY-MM-DD hh:mm:sssss');
        numOfTimes = i;
        const text = await element.getText();
        texts.push(text);
      }
      return texts;
    } catch (error) {
      error.message =
        `Error occurred in getTexts("${strategy}", "${locator}"), iteration: "${numOfTimes}", startTime: ${startTime}, endTime: ${endTime}\n` +
        error.message;
      await this.processAndThrowError(error, new Error().stack);
    }
  }

  /**
   * Custom function to verify multiple text values in multiple elements discovered using a common locator strategy
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @param {Array} stringArr - Array of text values to be verified in the discovered elements
   */
  async checkTextsAre(strategy, locator, stringArr) {
    try {
      const elements = await this.waitForElements(strategy, locator);
      if (elements.length !== stringArr.length) {
        throw new error.WebDriverError(`Element ${strategy}: ${locator} 's count \nExpect: \'${stringArr.length}\'.\nActual: \'${elements.length}\'`);
      }

      for (let i = 0; i < elements.length; i++) {
        const elementText = await elements[i].getText();
        const expectedText = stringArr[i];

        if (elementText !== expectedText) {
          throw new error.WebDriverError(`Element ${strategy}: ${locator}[${i}]\'s text \nExpect: \'${expectedText}\'.\nActual: \'${elementText}\'`);
        }
      }
    } catch (error) {
      if (error.name === 'StaleElementReferenceError') {
        await this.checkTextsAre(strategy, locator, stringArr);
      } else {
        error.message = `Error occurred in checkTextsAre("${strategy}", "${locator}", "${stringArr}")\n` + error.message;
        await this.processAndThrowError(error, new Error().stack);
      }
    }
  }

  /**
   * Waits until the element's innertext value is equal to expected text, within timeout
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @param {string} value - expected text value for verification
   * @param {number} timeout - optional timeout that overrides the default webdriver timeout
   */
  waitUntilTextIs(strategy, locator, value, timeout = this.timeout) {
    return this.waitForElements(strategy, locator, timeout)
      .then(async element => {
        return await this.driver
          .wait(
            new Condition(`Wait till element text equal asserted text value`, async () => {
              return (await element[0].getText()) === value;
            }),
            timeout,
            `element ${strategy}: ${locator} text should be \'${value}\'`
          )
          .catch(async reason => {
            const text = await element[0].getText();
            reason.message = reason.message + `\nActual text for ${strategy}: ${locator} is \'${text}\'`;
            throw reason;
          });
      })
      .catch(async error => {
        if (error.name === 'StaleElementReferenceError') {
          await this.waitUntilTextIs(strategy, locator, value, timeout);
        } else {
          error.message = `Error occurred in waitUntilTextIs("${strategy}", "${locator}", "${value}")\n` + error.message;
          await this.processAndThrowError(error, new Error().stack);
        }
      });
  }

  /**
   * Waits until the element's input value is equal to expected text, within timeout
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @param {string} value - expected input text value for verification
   */
  waitUntilInputIs(strategy, locator, value) {
    return this.waitForElements(strategy, locator)
      .then(async element => {
        return await this.driver
          .wait(
            new Condition(`Wait till element text equal asserted text value`, async () => {
              return (await element[0].getAttribute('value')) === value;
            }),
            this.timeout,
            `element ${strategy}: ${locator} text should be \'${value}\'`
          )
          .catch(async reason => {
            const text = await element[0].getAttribute('value');
            reason.message = reason.message + `\nActual value for ${strategy}: ${locator} is \'${text}\'`;
            throw reason;
          });
      })
      .catch(async error => {
        if (error.name === 'StaleElementReferenceError') {
          await this.waitUntilInputIs(strategy, locator, value);
        } else {
          error.message = `Error occurred in waitUntilTextIs("${strategy}", "${locator}", "${value}")\n` + error.message;
          await this.processAndThrowError(error, new Error().stack);
        }
      });
  }

  /**
   * Waits until a certain number of elements for the specified locator strategy is found, until timeout
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @param {number} count - expected number of elements
   */
  async waitUntilNumberOfElementsFound(strategy, locator, count) {
    return await this.driver
      .wait(
        new Condition(`Wait till element count to equal ${count}`, async () => {
          return (await this.waitForElements(strategy, locator)).length === count;
        }),
        this.timeout,
        `element ${strategy}: ${locator} count should be \'${count}\'`
      )
      .catch(async reason => {
        const count = (await this.waitForElements(strategy, locator)).length;
        reason.message = reason.message + `\nActual number of element for ${strategy}: ${locator} is \'${count}\'`;
        throw reason;
      });
  }

  /**
   * Waits until the element's innertext value contains the expected text, within timeout
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @param {string} value - expected text value
   * @param {number} timeout - optional timeout, overriding the global driver timeout
   */
  waitUntilTextContains(strategy, locator, value, timeout = this.timeout) {
    return this.waitForElements(strategy, locator, timeout)
      .then(async element => {
        return await this.driver
          .wait(
            new Condition(`Wait till element text contain asserted text value`, async () => {
              return (await element[0].getText()).includes(value);
            }),
            timeout,
            `${strategy}: ${locator} text should contain ${value}`
          )
          .catch(async reason => {
            const text = await element[0].getText();
            reason.message = reason.message + `\nActual text for ${strategy}: ${locator} is \'${text}\'`;
            throw reason;
          });
      })
      .catch(async error => {
        if (error.name === 'StaleElementReferenceError') {
          await this.waitUntilTextContains(strategy, locator, value, timeout);
        } else {
          error.message = `Error occurred in waitUntilTextContains("${strategy}", "${locator}", "${value}")\n` + error.message;
          await this.processAndThrowError(error, new Error().stack);
        }
      });
  }

  /***
   * Makes the session sleep for specific milliseconds
   * @param {number} t - sleep time in milliseconds
   */
  sleep(t) {
    return this.driver.sleep(t);
  }

  /**
   * Finds all elements with provided locator strategy and returns them as an WebElement array
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @returns {*} Returns the array of WebElementPromises if found;
   */
  findElements(strategy, locator) {
    return this.driver.findElements(by(strategy, locator));
  }

  /** Function to scroll to the position of a specific element on the browser
   * @param {WebElement} element - Element to search on the target browser
   * @returns {Promise<void>} An empty promise
   */
  scrollToElement(element) {
    return this.driver.executeScript('arguments[0].scrollIntoView();', element);
  }

  /**
   * Function to validate whether an element is visible on the browser viewport (works on desktop/ios/android)
   * @param {WebElement} element - Element to search on the target browser
   * @returns {boolean} Return true if found; or else, false
   */
  isElementVisible(element) {
    return this.driver.executeScript(
      ' var elem = arguments[0],             \
        box = elem.getBoundingClientRect();   \
        if (box.top > -1 && box.top < window.innerHeight) { return true } \
        return false;',
      element
    );
  }

  /**
   * Select radio button identified by id locator strategy
   * @param {string} id - Id value of the element based on 'id' locator strategy
   */
  selectRadioButtonById(id) {
    return this.waitForElements('id', id)
      .then(() => {
        this.driver.executeScript(`document.getElementById('${id}').click();`);
      })
      .catch(rejectWithError);
  }

  /**
   * Select checkbox element identified by id locator strategy
   * @param {string} id - Id value of the element based on 'id' locator strategy
   */
  selectCheckboxById(id) {
    return this.waitForElements('id', id)
      .then(() => {
        this.driver.executeScript(`document.getElementById('${id}').click();`);
      })
      .catch(rejectWithError);
  }

  /**
   * Waits for checkbox element to become visible and selectable, identified by id locator strategy
   * @param {string} id - Id value of the element based on 'id' locator strategy
   */
  waitForCheckboxToBeSelected(id) {
    return this.waitForElementToBeVisible('css', `.checked.checkbox > #${id}`).catch(rejectWithError);
  }

  /**
   * Waits for checkbox element to become disabled, identified by id locator strategy
   * @param {string} id - Id value of the element based on 'id' locator strategy
   */
  waitForCheckboxToBeDisabled(id) {
    return this.waitForElementToBeVisible('css', `.disabled.checkbox > #${id}`).catch(rejectWithError);
  }

  /**
   * Select an item in the dropbox element, identified by id locator strategy
   * @param {string} parentId - Id value of the element based on 'id' locator strategy
   * @param {number} itemIndex - index value of the dropdown values
   */
  selectDropdownItem(parentId, itemIndex) {
    return this.click('id', parentId)
      .then(async () => {
        this.driver.executeScript(`document.getElementsByClassName('visible menu')[0].children[${itemIndex}].click();`);
      })
      .catch(rejectWithError);
  }

  /**
   * Waits for the page to complete loading/refreshing
   * @returns {Promise<void>} Returns true if page has successfully loaded
   * @throws {Promise<msg>} Returns an error if timed out
   */
  waitForPageLoadComplete() {
    return this.driver.wait(
      () => {
        return this.driver.executeScript(`return document.readyState`).then(state => {
          return state === 'complete';
        });
      },
      this.timeout,
      `Issue loading the page`
    );
  }

  /**
   * Waits until the URL contains the specified prefix
   * @param {string} prefix - part of the url for verification
   */
  waitUntilUrlContains(prefix) {
    let currentUrl = '';
    return this.driver
      .wait(() => {
        return this.driver.executeScript(`return window.location.toString()`).then(actualUrl => {
          currentUrl = actualUrl;
          return actualUrl.includes(prefix);
        });
      }, this.timeout)
      .catch(async reason => {
        reason.message = `Expect Url to contain: \'${prefix}\' \nActual Url: \'${currentUrl}\'\n` + reason.message;
        await this.processAndThrowError(reason, new Error().stack);
      });
  }

  /**
   * Waits until the URL of the webpage matches the expected url value
   * @param {string} url - entire URL string to be verifieds
   */
  async waitUntilUrlIs(url) {
    let currentUrl = '';
    return this.driver
      .wait(() => {
        return this.driver.executeScript(`return window.location.toString()`).then(actualUrl => {
          currentUrl = actualUrl;
          return actualUrl === url;
        });
      }, this.timeout)
      .catch(async reason => {
        reason.message = `Expect Url: \'${url}\' \nLast checked Url: \'${currentUrl}\'\n` + reason.message;
        await this.processAndThrowError(reason, new Error().stack);
      });
  }

  /**
   * Opens a new tab with specified URL
   * @param {string} url - URL to be opened
   */
  openNewTab(url) {
    return this.driver.executeScript(`window.open("${url}");`);
  }

  /**
   * Waits for new tab to open and callback is called on success
   * @param {Function} callback - callback function to be called after new tab is opened and validated
   */
  async validateInNewTabAndClose(callback) {
    await this.sleep(500);
    const pageHandles = await this.driver.getAllWindowHandles();
    await this.driver.switchTo().window(pageHandles[1]);
    let hasError = true;
    let inExecutionTime = true;
    setTimeout(() => {
      inExecutionTime = false;
    }, this.timeout);
    while (hasError) {
      try {
        if (inExecutionTime === false) {
          throw new Error('Test scenario took too long and timed out');
        }
        await callback();
        hasError = false;
        break;
      } catch (e) {
        if (e.name !== 'WebDriverError' || inExecutionTime === false) {
          throw e;
        }
      }
    }
    await this.driver.close();
    await this.driver.switchTo().window(pageHandles[0]);
  }

  /**
   * Waits for element to become stale, until timeout
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   */
  async waitForElementToBeNotVisible(strategy, locator) {
    return await this.driver.wait(
      new Condition(`Wait till element is no longer visible`, async () => {
        return (await this.findElements(strategy, locator)).length === 0;
      }),
      this.timeout,
      `element ${locator} is still visible`
    );
  }

  /**
   * Waits for element to be attached to the webpage and become visible, until timeout
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   */
  async waitForElementToBeVisible(strategy, locator) {
    return await this.driver.wait(
      new Condition(`Wait till element to be visible`, async () => {
        return (await this.findElements(strategy, locator)).length > 0;
      }),
      this.timeout,
      `element ${locator} is not visible`
    );
  }

  /**
   * Get browser console logs
   * @returns {string} - Entire browser logs in preserved state
   */
  async getBrowserConsoleLogs() {
    let logString = '';
    try {
      const logs = await this.driver
        .manage()
        .logs()
        .get('browser');
      if (logs !== undefined || logs.length != 0) {
        logs.forEach(log => {
          logString = logString + `\n[${log.level}] ${log.message}`;
        });
      }
    } finally {
      return logString;
    }
  }

  /**
   * Custome function to upload a file using an element, identified by specified locator strategy
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @param {string} filepath - path of the file to be uploaded
   */
  uploadFile(strategy, locator, filepath) {
    return this.waitForElements(strategy, locator)
      .then(async elements => {
        await elements[0].sendKeys(filepath);
      })
      .catch(rejectWithError);
  }

  /**
   * Custom function to verify if element is stale and execute callback if yes; if not, fail with message
   * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
   * @param {string} locator - value of element to search, corresponding to locator strategy
   * @param {string} fxName - name of function
   * @param {Object} error - error object with name parameter and message
   * @param {Function} callback - callback function to be called if error.name is StaleElementReferenceError
   */
  async throwErrorWithDetailsIfNotStale(strategy, locator, fxName, error, callback) {
    if (error.name === 'StaleElementReferenceError') {
      callback();
    } else {
      let errorToThrow = {};
      errorToThrow.Error = `Error in ${fxName} for ${strategy}: ${locator}`;
      errorToThrow.Data = error;
      errorToThrow.userSessionID = await this.getCookie('sessionID');
      throw errorToThrow;
    }
  }

  /**
   * Waits for cookie to be expected value
   * @param {string} title - key name of cookie in browser
   */
  async waitForCookie(title) {
    let logCookie = '';
    let numberOfTimesChecked = 0;

    return await this.driver
      .wait(() => {
        return this.driver.executeScript(`return document.cookie`).then(cookies => {
          logCookie = cookies;
          numberOfTimesChecked++;
          // cookies will look something like "name=Burnice; onboard=false; expiry=1561539844698"
          const cookieStrArr = cookies.split('; ');
          for (const cookieStr of cookieStrArr) {
            const cookieKeyValueArr = cookieStr.split('=');
            const cookieName = cookieKeyValueArr[0];
            if (cookieName === title) {
              return cookieKeyValueArr[1].substring(0, cookieKeyValueArr[1].length);
            }
          }
          return false;
        });
      }, this.timeout)
      .catch(async error => {
        error.message = `Error occurred in driver.waitForCookie("${title}")\n` + error.message;
        error.message = error.message + `\nLast checked cookies are: "${logCookie}"`;
        error.message = error.message + `\nNumber of times checked: "${numberOfTimesChecked}"`;
        await this.processAndThrowError(error, new Error().stack);
      });

    return cookieValue;
  }

  /**
   * Returns cookie value
   * @param {string} title - key name of cookie in browser
   */
  async getCookie(title) {
    const cookie = await this.driver.manage().getCookie(title);
    if (cookie !== null) {
      return cookie.value;
    } else {
      return null;
    }
  }

  /**
   * Waits for expected cookie to be cleared, until timeout
   * @param {string} title - key name of cookie in browser
   */
  async waitForCookieToClear(title) {
    return this.driver
      .wait(
        new Condition(`Wait till cookie is no longer there`, async () => {
          try {
            const cookie = await this.driver.manage().getCookie(title);
            return cookie === null;
          } catch (e) {
            if (e.name === 'NoSuchCookieError') {
              return true;
            }
            await this.processAndThrowError(e, new Error().stack);
          }
        }),
        this.timeout
      )
      .catch(async error => {
        error.message = `Error occurred in driver.waitForCookieToClear("${title}")\n` + error.message;
        await this.processAndThrowError(error, new Error().stack);
      });
  }

  /**
   * Waits for cookie to be expected value, until timeout
   * @param {string} title - key name of cookie in browser
   * @param {string} value - expected value of cookie key
   */
  async waitForCookieToEqual(title, value) {
    let logCookie = '';

    await this.driver
      .wait(async () => {
        const cookieValue = await this.waitForCookie(title);
        logCookie = cookieValue;
        return cookieValue === value;
      }, this.timeout)
      .catch(async error => {
        error.message = `Error occurred in driver.waitForCookieToBeEqual("${title}", "${value}")\n` + error.message;
        error.message = error.message + `\nLast checked cookie value: "${logCookie}"`;
        await this.processAndThrowError(error, new Error().stack);
      });
    // throw new error.WebDriverError(`Cookie '${title}' value \nExpect: '${value}'\nActual: '${cookieValue}'`);
  }

  // From https://stackoverflow.com/a/51639051/6433053
  async enableHeadlessFileDownload() {
    const session = await this.driver.getSession();
    const cmd = new command.Command('SEND_COMMAND').setParameter('cmd', 'Page.setDownloadBehavior').setParameter('params', {
      behavior: 'allow',
      downloadPath: process.cwd() + '/downloads'
    });
    await this.driver.getExecutor().defineCommand('SEND_COMMAND', 'POST', `/session/${session.getId()}/chromium/send_command`);
    await this.driver.execute(cmd);
  }

  // =============================================================================
  // Private methods. Do not expose in d.ts
  // =============================================================================

  /**
   * Error Processor and throws error back up to the runner
   * @param {Object} error Must be an object so that the method can add additional fields
   * @param {any} errorStack Must be an object so that the method can add additional fields
   */
  async processAndThrowError(error, errorStack) {
    if (!error.message.includes('Cookies')) {
      try {
        const cookiesFromDriver = await this.driver.manage().getCookies();
        error.message += `\nCookies from 'this.driver.manage().getCookies()' cmd: ${JSON.stringify(cookiesFromDriver)}`;
      } catch (error) {
        error.message += `\nCookies: error getting cookies: ${error}`;
      }
    }
    if (!error.message.includes('Current URL')) {
      const currentUrl = await this.driver.getCurrentUrl();
      error.message += `\nCurrent URL : ${currentUrl}`;

      // check if js url is the same as the one retrieved by driver
      const jsUrl = await this.driver.executeScript(`return window.location.toString()`);
      if (currentUrl !== jsUrl) {
        error.message += `\nJS URL : ${jsUrl}`;
      }
      const time = moment().format('YYYY-MM-DD hh:mm:sssss');
      error.message += `\nCurrent Time: ${time}`;

      try {
        error.screenshot = await errorHandler.takeScreenshot(this.driver);
      } catch (error) {
        error.message += `\nError taking ss : ${error}`;
      }

      const urlAfterSS = await this.driver.getCurrentUrl();
      if (currentUrl !== jsUrl) {
        error.message += `\nJS URL : ${jsUrl}`;
      }
      if (urlAfterSS !== currentUrl) {
        error.message += `\nURL after ss: ${urlAfterSS}`;
      }
    }

    error.stack += errorStack;
    throw error;
  }
}

module.exports = {
  Driver
};