const wd = require('wd');
const { SPECIAL_KEYS } = require('wd');
const errorHandler = require('./error-handler');

const rejectWithError = err => Promise.reject(err);
const moment = require('moment');
const asserters = wd.asserters;

const getPlatformName = async (wd) => {
	let caps = await wd.sessionCapabilities();
	return caps.platformName;
};

const getBrowserName = async (wd) => {
	let caps = await wd.sessionCapabilities();
	return caps.browserName;
};

const strategyMapping = function(strategy) {
  let mappedStrategy = "";
  switch (strategy) {
    case "css":
      mappedStrategy = "css selector";
      break;
    
    case "className":
      mappedStrategy = "class name";
      break;

    case "tagName":
      mappedStrategy = "tag name";
      break;

    case "linkText":
      mappedStrategy = "link text";
      break;

    case "partiallinkText":
      mappedStrategy = "partial link text";
      break;

    case "accessibilityId":
      mappedStrategy = "accessibility id";
      break;
  
    default:
      mappedStrategy = strategy;
      break;
  }
  return mappedStrategy;
}

/**
 * this.driver class methods for mobile using wd
 */
class MobileDriver {
	constructor(driver) {
		this.driver = driver;
		this.driver.setImplicitWaitTimeout(5000);
		this.platform = getPlatformName(driver);
		this.browser = getBrowserName(driver);
		this.timeout = 5000;
	}

	async navigateTo(url, checkUrl = true) {
		if (process.env.BRANCH_NAME) {
			await this.driver.get(process.env.URL + 'fake-route'); // Load a fake route to allow adding of cookie
			await this.driver.setCookie({
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

	async refreshCurrentPage() {
		await this.driver.refresh();
		await this.waitForPageLoadComplete();
	}

	async close() {
		return this.driver.quit();
	}

	async waitForElements(strategy, locator, timeout = this.timeout) {
		strategy = strategyMapping(strategy);

		return await this.driver
			.waitForElements(strategy, locator, asserters.isDisplayed, timeout)
			.catch(async (error) => {
				if (error.name === 'StaleElementReferenceError') {
					await this.waitForElements(strategy, locator, timeout);
				} else {
					error.message = `Error occurred in driver.waitForElements("${strategy}", "${locator}")\n` + error.message;
					await this.processAndThrowError(error, new Error().stack);
				}
			});
	}

	async waitForElement(strategy, locator, timeout = this.timeout) {
		strategy = strategyMapping(strategy);

		try {
			return await this.driver.waitForElement(strategy, locator, asserters.isDisplayed, timeout);
		} catch (error) {
			if (error.name === 'StaleElementReferenceError') {
				await this.waitForElement(strategy, locator, timeout);
			} else {
				error.message = `Error occurred in driver.waitForElement("${strategy}", "${locator}")\n` + error.message;
				await this.processAndThrowError(error, new Error().stack);
			}
		}
	}

	async click(strategy, locator, caller) {
		strategy = strategyMapping(strategy);
		try {
			const elements = await this.waitForElements(strategy, locator);
			const firstElement = elements[0];
			await firstElement.isEnabled();

			const elementType = await firstElement.getTagName();

			if ((elementType === 'button') | (elementType === 'a')) {
				const newElement = await this.waitForElement(strategy, locator);
				await this.driver.execute(`arguments[0].click();`, [newElement]);
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

	async type(strategy, locator, value) {
		strategy = strategyMapping(strategy);
		try {
			const element = await this.waitForElements(strategy, locator);
			await element[0].sendKeys(value);
		} catch (error) {
			error.message = error.message + ` occurred in driver.type("${strategy}", "${locator}", "${value}")`;
			await this.processAndThrowError(error, new Error().stack);
		}
	}

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

	async clear(strategy, locator) {
		strategy = strategyMapping(strategy);
		let textFieldValue = '';
		try {
			const elements = await this.waitForElements(strategy, locator);
			await this.driver.execute(`arguments[0].select();`, [elements[0]]);
			await elements[0].sendKeys(SPECIAL_KEYS["Back space"]);
		} catch (error) {
			error.message += ` occurred in clear("${strategy}", "${locator}")`;
			error.message += `\nLast value of textfield is "${textFieldValue}"`;
			await this.processAndThrowError(error, new Error().stack);
		}
	}

	async getText(strategy, locator, waitForText = false) {
		strategy = strategyMapping(strategy);
		try {
			const elements = await this.waitForElements(strategy, locator);
			if (waitForText) {
				const elemText = async function (elem) {
					let text = await elem.text();
					return text.toString();
				}

				await this.driver.waitFor(
					asserters.jsCondition(await elemText(elements[0]) !== ''), this.timeout);
			}
			return await elements[0].text();
		} catch (error) {
			if (error.name === 'StaleElementReferenceError') {
				await this.getText(strategy, locator, waitForText);
			} else {
				error.message = `Error occurred in getText("${strategy}", "${locator}", "${waitForText}")\n` + error.message;
				await this.processAndThrowError(error, new Error().stack);
			}
		}
	}

	async getTexts(strategy, locator) {
		strategy = strategyMapping(strategy);

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
				const text = await element.text();
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

	async checkTextsAre(strategy, locator, stringArr) {
		strategy = strategyMapping(strategy);
		try {
			const elements = await this.waitForElements(strategy, locator);
			if (elements.length !== stringArr.length) {
				throw new Error(`Element ${strategy}: ${locator} 's count \nExpect: \'${stringArr.length}\'.\nActual: \'${elements.length}\'`);
			}

			for (let i = 0; i < elements.length; i++) {
				const elementText = await elements[i].text();
				const expectedText = stringArr[i];

				if (elementText !== expectedText) {
					throw new Error(`Element ${strategy}: ${locator}[${i}]\'s text \nExpect: \'${expectedText}\'.\nActual: \'${elementText}\'`);
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

	async waitUntilTextIs(strategy, locator, value, timeout = this.timeout) {
		await this.waitForPageLoadComplete();

		strategy = strategyMapping(strategy);
		return this.waitForElements(strategy, locator, timeout)
			.then(async element => {
				return await this.driver.waitFor(
						asserters.jsCondition(await element[0].text() === value), this.timeout)
					.catch(async reason => {
						const text = await element[0].text();
						reason.message = reason.message + `\nActual text for ${strategy}: ${locator} is \'${text}\'`;
						throw reason;
					});
			}).catch(async error => {
				if (error.name === 'StaleElementReferenceError') {
					await this.waitUntilTextIs(strategy, locator, value, timeout);
				} else {
					error.message = `Error occurred in waitUntilTextIs("${strategy}", "${locator}", "${value}")\n` + error.message;
					await this.processAndThrowError(error, new Error().stack);
				}
			});
	}

	async waitUntilInputIs(strategy, locator, value) {
		strategy = strategyMapping(strategy);
		return this.waitForElements(strategy, locator)
			.then(async element => {
				const getAttrValue = async function (elem) {
					let value = elem.getAttribute('value');
					return value.toString();
				}

				return await this.driver.waitFor(
						asserters.jsCondition(await getAttrValue(element[0]) === value), this.timeout)
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

	async waitUntilNumberOfElementsFound(strategy, locator, count) {
		strategy = strategyMapping(strategy);
		const getElemLength = (async function () {
			let elements = await this.waitForElements(strategy, locator);
			return elements.length;
		}).bind(this);

		return await this.driver.waitFor(
				asserters.jsCondition(await getElemLength() === count), this.timeout)
			.catch(async reason => {
				const count = (await this.waitForElements(strategy, locator)).length;
				reason.message = reason.message + `\nActual number of element for ${strategy}: ${locator} is \'${count}\'`;
				throw reason;
			});;
	}

	async waitUntilTextContains(strategy, locator, value, timeout = this.timeout) {
		strategy = strategyMapping(strategy);
		return this.waitForElements(strategy, locator, timeout)
			.then(async element => {
				return await this.driver.waitFor(
						asserters.jsCondition((await element[0].text()).toString().includes(value)), timeout)
					.catch(async reason => {
						const text = await element[0].text();
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

	async sleep(t) {
		return await this.driver.sleep(t);
	}

	async findElements(strategy, locator) {
		strategy = strategyMapping(strategy);
		return await this.driver.elements(strategy, locator);
	}

	scrollToElement(element) {
		return this.driver.executeScript('arguments[0].scrollIntoView();', element);
		//TODO: Pending improvement
	}

	async isElementVisible(element) {
		return await this.driver.execute(
			' var elem = arguments[0],             \
            box = elem.getBoundingClientRect();   \
            if (box.top > -1 && box.top < window.innerHeight) { return true } \
            return false;',
			[element]
		);
	}

	async selectRadioButtonById(id) {
		return this.waitForElements('id', id)
			.then(() => {
				this.driver.execute(`document.getElementById('${id}').click();`);
			})
			.catch(rejectWithError);
	}

	async selectCheckboxById(id) {
		return this.waitForElements('id', id)
			.then(() => {
				this.driver.execute(`document.getElementById('${id}').click();`);
			})
			.catch(rejectWithError);
	}

	async waitForCheckboxToBeSelected(id) {
		return this.waitForElementToBeVisible('css', `.checked.checkbox > #${id}`).catch(rejectWithError);
	}

	async waitForCheckboxToBeDisabled(id) {
		return this.waitForElementToBeVisible('css', `.disabled.checkbox > #${id}`).catch(rejectWithError);
	}

	async selectDropdownItem(parentId, itemIndex) {
		return this.click('id', parentId)
			.then(async () => {
				this.driver.execute(`document.getElementsByClassName('visible menu')[0].children[${itemIndex}].click();`);
			})
			.catch(rejectWithError);
	}

	async waitForPageLoadComplete() {
		return this.driver.waitFor(
			asserters.jsCondition(`document.readyState === "complete"`), this.timeout).catch(async (reason) => {
			let status = await this.driver.execute(`return document.readyState`);
			throw new Error(`Issue loading the page: ${reason.message}. Page status: ${status}`);
		});
	}

	async waitUntilUrlContains(breadcrumb) {
		await this.waitForPageLoadComplete();

		return this.driver.waitFor(
			asserters.jsCondition(`window.location.toString().includes("${breadcrumb}")`), this.timeout).catch(async (reason) => {
			let currentUrl = await this.driver.url();
			throw new Error(`URL breadcrumb missing!\nExpected:${breadcrumb}\nActual: ${currentUrl}\n${reason.message}`);
		});
	}

	async waitUntilUrlIs(url) {
		await this.waitForPageLoadComplete();

		return this.driver.waitFor(
			asserters.jsCondition(`window.location.toString() === "${url}"`), this.timeout).catch(async (reason) => {
			let currentUrl = await this.driver.url();
			throw new Error(`URL mismatch!\nExpected: ${url}\nActual: ${currentUrl}\n${reason.message}`);
		});
	}

	/**
	 * Waits until the image element 'complete' attribute value becomes true, within timeout
	 * @param {string} strategy - 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText'
	 * @param {string} locator - value of element to search, corresponding to locator strategy
	 * @param {number} timeout - optional timeout, overriding the global driver timeout
	 */
	waitUntilImageLoaded(strategy, locator, timeout = this.timeout) {
		return this.waitForElements(strategy, locator, timeout)
			.then(async (elements) => {
				return this.driver.waitFor(
						asserters.jsCondition((await elements[0].getAttribute('complete')).includes(true)), timeout)
					.catch((reason) => {
						reason.message = reason.message + `\nFailed waiting for image to complete loading ${strategy}: ${locator}`;
						throw reason;
					});
			})
			.catch(async error => {
				if (error.name === 'StaleElementReferenceError') {
					await this.waitUntilImageLoaded(strategy, locator, timeout);
				} else {
					error.message = `Error occurred in waitUntilImageLoaded("${strategy}", "${locator}")\n` + error.message;
					await this.processAndThrowError(error, new Error().stack);
				}
			});
	}

	async openNewTab(url) {
		return await this.driver.execute(`window.open("${url}");`);
	}

	//TODO: Find how to switch window handle properly using wd
	async validateInNewTabAndClose(callback) {
		await this.sleep(500);
		const pageHandles = await this.driver.windowHandles();
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

	async waitForElementToBeNotVisible(strategy, locator) {
		strategy = strategyMapping(strategy);

		let consoleCmd = "";
		if (strategy === "id") consoleCmd = `document.getElementById("${locator}") === null`;
		else if (strategy === "css selector") consoleCmd = `document.querySelectorAll("${locator}").length === 0`;
		else if (strategy === "class name") consoleCmd = `document.getElementsByClassName("${locator}").length === 0`;
		else if (strategy === "tag name") consoleCmd = `document.getElementsByTagName("${locator}").length === 0`;
		else if (strategy === "xpath") consoleCmd = `$x("${locator}").length === 0`;

		return this.driver.waitFor(
			asserters.jsCondition(consoleCmd), this.timeout).catch(reason => {
			throw new Error(`Element ${locator} is still visible!\n${reason.message}`);
		});
	}

	async waitForElementToBeVisible(strategy, locator) {
		strategy = strategyMapping(strategy);
		return await this.driver.waitForElement(strategy, locator, asserters.isDisplayed, this.timeout)
			.catch(reason => {
				throw new Error(`Element ${locator} not visible!\n${reason.message}`);
			});
	}

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

	//TODO: Refactor to work for mobile
	uploadFile(strategy, locator, filepath) {
		strategy = strategyMapping(strategy);
		return this.waitForElements(strategy, locator)
			.then(async elements => {
				await elements[0].sendKeys(filepath);
			})
			.catch(rejectWithError);
	}

	async throwErrorWithDetailsIfNotStale(strategy, locator, fxName, error, callback) {
		strategy = strategyMapping(strategy);
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

	async waitForCookie(title) {
		let logCookie = '';
		return this.driver.allCookies().then((cookies) => {
			let isCookiePresent = false;
			logCookie = JSON.stringify(cookies);
			let targetCookieValue = "";

			cookies.forEach((cookie) => {
				if (cookie.name === title) {
					isCookiePresent = true;
					targetCookieValue = cookie.value;
				}
			});
			//check if cookie exists; If yes, return the cookie value
			if (isCookiePresent) {
				return targetCookieValue;
			} else {
				throw new Error(`Cookie ${title} not found`);
			}
		}).catch(async (error) => {
			error.message = `Error occurred in driver.waitForCookie("${title}")\n` + error.message;
			error.message = error.message + `\nLast checked cookies are: "${logCookie}"`;
			await this.processAndThrowError(error, new Error().stack);
		});
	}

	async getCookie(title) {
		const cookies = await this.driver.allCookies();
		const cookie = cookies[title];
		if (cookie !== null) {
			return cookie.value;
		} else {
			return null;
		}
	}

	async waitForCookieToClear(title) {
		const isCookiePresent = (async function (title) {
			const cookies = await this.driver.allCookies();
			if (cookies[title]) {
				return false;
			} else {
				return true;
			}
		}).bind(this);

		return await this.driver.waitFor(asserters.jsCondition(await isCookiePresent(title)), this.timeout)
			.catch(async error => {
				error.message = `Error occurred in driver.waitForCookieToClear("${title}")\n` + error.message;
				await this.processAndThrowError(error, new Error().stack);
			});
	}

	async waitForCookieToEqual(title, value) {
		let logCookie = '';
		const getCookieValue = (async function (title) {
			const cookieValue = await this.waitForCookie(title);
			logCookie = cookieValue;
			return logCookie;
		}).bind(this);

		await this.driver
			.waitFor(asserters.jsCondition((await getCookieValue(title)) === value), this.timeout)
			.catch(async error => {
				error.message = `Error occurred in driver.waitForCookieToBeEqual("${title}", "${value}")\n` + error.message;
				error.message = error.message + `\nLast checked cookie value: "${logCookie}"`;
				await this.processAndThrowError(error, new Error().stack);
			});
	}

	async getContexts() {
		return await this.driver.contexts();
	}

	async setContext(context) {
		await this.driver.context(context);
	}

	async getElementCoordinates(strategy, locator) {
		strategy = strategyMapping(strategy);
		let element = await this.driver.waitForElements(strategy, locator, this.timeout);
		return await this.driver.getLocation(element[0]);
	}

	async swipeByCoordinates(startX, startY, endX, endY) {
		let action = new wd.TouchAction();
		await action.press({
				x: startX,
				y: startY
			})
			.wait(500)
			.moveTo({
				x: endX,
				y: endY
			})
			.release();
		await this.driver.performTouchAction(action);
	}

	async tapByCoordinates(x, y) {
		await this.driver.execute("mobile:tap", {
			x: x,
			y: y
		});
	}

	// =============================================================================
	// Private methods. Do not expose in d.ts
	// =============================================================================

	async processAndThrowError(error, errorStack) {
		if (!error.message.includes('Cookies')) {
			try {
				const cookiesFromDriver = await this.driver.allCookies();
				error.message += `\nCookies from 'this.driver.allCookies()' cmd: ${JSON.stringify(cookiesFromDriver)}`;
			} catch (error) {
				error.message += `\nCookies: error getting cookies: ${error}`;
			}
		}
		if (!error.message.includes('Current URL')) {
			const currentUrl = await this.driver.url();
			error.message += `\nCurrent URL : ${currentUrl}`;

			// check if js url is the same as the one retrieved by driver
			const jsUrl = await this.driver.execute(`return window.location.toString();`);
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

			const urlAfterSS = await this.driver.url();
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
	MobileDriver
};