<a name="Driver"></a>

# Driver

this.driver class methods

- [.navigateTo(url, checkUrl)](#Driver+navigateTo)
- [.refreshCurrentPage()](#Driver+refreshCurrentPage)
- [.close()](#Driver+close)
- [.waitForElements(strategy, locator)](#Driver+waitForElements) ⇒ <code>\*</code>
- [.waitForElement(strategy, locator)](#Driver+waitForElement) ⇒ <code>WebElementPromise</code>
- [.click(strategy, locator, caller)](#Driver+click)
- [.type(strategy, locator, value)](#Driver+type)
- [.fillInDate(baseId)](#Driver+fillInDate)
- [.clear(strategy, locator)](#Driver+clear)
- [.getText(strategy, locator, waitForText)](#Driver+getText)
- [.getTexts(strategy, locator)](#Driver+getTexts)
- [.checkTextsAre(strategy, locator, stringArr)](#Driver+checkTextsAre)
- [.waitUntilTextIs(strategy, locator, value, timeout)](#Driver+waitUntilTextIs)
- [.waitUntilInputIs(strategy, locator, value)](#Driver+waitUntilInputIs)
- [.waitUntilNumberOfElementsFound(strategy, locator, count)](#Driver+waitUntilNumberOfElementsFound)
- [.waitUntilTextContains(strategy, locator, value, timeout)](#Driver+waitUntilTextContains)
- [.findElements(strategy, locator)](#Driver+findElements) ⇒ <code>\*</code>
- [.scrollToElement(element)](#Driver+scrollToElement) ⇒ <code>Promise.&lt;void&gt;</code>
- [.isElementVisible(element)](#Driver+isElementVisible) ⇒ <code>boolean</code>
- [.selectRadioButtonById(id)](#Driver+selectRadioButtonById)
- [.selectCheckboxById(id)](#Driver+selectCheckboxById)
- [.waitForCheckboxToBeSelected(id)](#Driver+waitForCheckboxToBeSelected)
- [.waitForCheckboxToBeDisabled(id)](#Driver+waitForCheckboxToBeDisabled)
- [.selectDropdownItem(parentId, itemIndex)](#Driver+selectDropdownItem)
- [.waitForPageLoadComplete()](#Driver+waitForPageLoadComplete) ⇒ <code>Promise.&lt;void&gt;</code>
- [.waitUntilUrlContains(prefix)](#Driver+waitUntilUrlContains)
- [.waitUntilUrlIs(url)](#Driver+waitUntilUrlIs)
- [.openNewTab(url)](#Driver+openNewTab)
- [.validateInNewTabAndClose(callback)](#Driver+validateInNewTabAndClose)
- [.waitForElementToBeNotVisible(strategy, locator)](#Driver+waitForElementToBeNotVisible)
- [.waitForElementToBeVisible(strategy, locator)](#Driver+waitForElementToBeVisible)
- [.getBrowserConsoleLogs()](#Driver+getBrowserConsoleLogs) ⇒ <code>string</code>
- [.uploadFile(strategy, locator, filepath)](#Driver+uploadFile)
- [.throwErrorWithDetailsIfNotStale(strategy, locator, fxName, error, callback)](#Driver+throwErrorWithDetailsIfNotStale)
- [.waitForCookie(title)](#Driver+waitForCookie)
- [.getCookie(title)](#Driver+getCookie)
- [.waitForCookieToClear(title)](#Driver+waitForCookieToClear)
- [.waitForCookieToEqual(title, value)](#Driver+waitForCookieToEqual)
- [.processAndThrowError(error, errorStack)](#Driver+processAndThrowError)

<a name="Driver+navigateTo"></a>

## navigateTo(url, checkUrl)

Navigate to a particular URL, with optional verification of navigated URL

| Param    | Type                 | Default           | Description                                                                |
| -------- | -------------------- | ----------------- | -------------------------------------------------------------------------- |
| url      | <code>string</code>  |                   | URL to navigate                                                            |
| checkUrl | <code>boolean</code> | <code>true</code> | Optional verification to check if navigation was successful within timeout |

<a name="Driver+refreshCurrentPage"></a>

## refreshCurrentPage()

Refresh current page

<a name="Driver+close"></a>

## close()

Quit or close the current driver session

<a name="Driver+waitForElements"></a>

## waitForElements(strategy, locator) ⇒ <code>\*</code>

Wait for specified element(s) to appear and returns them as an array

**Returns**: <code>\*</code> - Returns the array of WebElementPromises if found;

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |

<a name="Driver+waitForElement"></a>

## waitForElement(strategy, locator) ⇒ <code>WebElementPromise</code>

Wait for A SINGLE specified element to appear and returns them as an array

**Returns**: <code>WebElementPromise</code> - Returns a WebElementPromise if found;

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |

<a name="Driver+click"></a>

## click(strategy, locator, caller)

Click on an element in the webpage

| Param    | Type                  | Description                                                                                            |
| -------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code>   | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code>   | value of element to search, corresponding to locator strategy                                          |
| caller   | <code>function</code> | Optional parameter to indicate the function name that called this method                               |

<a name="Driver+type"></a>

## type(strategy, locator, value)

Type value into the specified input field element in the webpage

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of input field element to search, corresponding to locator strategy                              |
| value    | <code>string</code> | Value to be entered in the input field                                                                 |

<a name="Driver+fillInDate"></a>

## fillInDate(baseId)

Custom function to enter date, month and year value in a 3-split dd-mm-YYYY date field

| Param  | Type                | Description                                            |
| ------ | ------------------- | ------------------------------------------------------ |
| baseId | <code>string</code> | Id value of the element based on 'id' locator strategy |

<a name="Driver+clear"></a>

## clear(strategy, locator)

Clear value present in an input field element in the webpage

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of input field element to search, corresponding to locator strategy                              |

<a name="Driver+getText"></a>

## getText(strategy, locator, waitForText)

Waits for elements as specified, and returns the `text` attribute of the first element

| Param       | Type                 | Default            | Description                                                                                            |
| ----------- | -------------------- | ------------------ | ------------------------------------------------------------------------------------------------------ |
| strategy    | <code>string</code>  |                    | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator     | <code>string</code>  |                    | value of element to search, corresponding to locator strategy                                          |
| waitForText | <code>boolean</code> | <code>false</code> | set to true, if function should wait until element text is not empty                                   |

<a name="Driver+getTexts"></a>

## getTexts(strategy, locator)

Waits for elements as specified, and returns the `text` attribute of the all the elements

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |

<a name="Driver+checkTextsAre"></a>

## checkTextsAre(strategy, locator, stringArr)

Custom function to verify multiple text values in multiple elements discovered using a common locator strategy

| Param     | Type                | Description                                                                                            |
| --------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy  | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator   | <code>string</code> | value of element to search, corresponding to locator strategy                                          |
| stringArr | <code>Array</code>  | Array of text values to be verified in the discovered elements                                         |

<a name="Driver+waitUntilTextIs"></a>

## waitUntilTextIs(strategy, locator, value, timeout)

Waits until the element's innertext value is equal to expected text, within timeout

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |
| value    | <code>string</code> | expected text value for verification                                                                   |
| timeout  | <code>number</code> | optional timeout that overrides the default webdriver timeout                                          |

<a name="Driver+waitUntilInputIs"></a>

## waitUntilInputIs(strategy, locator, value)

Waits until the element's input value is equal to expected text, within timeout

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |
| value    | <code>string</code> | expected input text value for verification                                                             |

<a name="Driver+waitUntilNumberOfElementsFound"></a>

## waitUntilNumberOfElementsFound(strategy, locator, count)

Waits until a certain number of elements for the specified locator strategy is found, until timeout

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |
| count    | <code>number</code> | expected number of elements                                                                            |

<a name="Driver+waitUntilTextContains"></a>

## waitUntilTextContains(strategy, locator, value, timeout)

Waits until the element's innertext value contains the expected text, within timeout

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |
| value    | <code>string</code> | expected text value                                                                                    |
| timeout  | <code>number</code> | optional timeout, overriding the global driver timeout                                                 |

<a name="Driver+findElements"></a>

## findElements(strategy, locator) ⇒ <code>\*</code>

Finds all elements with provided locator strategy and returns them as an WebElement array

**Returns**: <code>\*</code> - Returns the array of WebElementPromises if found;

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |

<a name="Driver+scrollToElement"></a>

## scrollToElement(element) ⇒ <code>Promise.&lt;void&gt;</code>

Function to scroll to the position of a specific element on the browser

**Returns**: <code>Promise.&lt;void&gt;</code> - An empty promise

| Param   | Type                    | Description                             |
| ------- | ----------------------- | --------------------------------------- |
| element | <code>WebElement</code> | Element to search on the target browser |

<a name="Driver+isElementVisible"></a>

## isElementVisible(element) ⇒ <code>boolean</code>

Function to validate whether an element is visible on the browser viewport (works on desktop/ios/android)

**Returns**: <code>boolean</code> - Return true if found; or else, false

| Param   | Type                    | Description                             |
| ------- | ----------------------- | --------------------------------------- |
| element | <code>WebElement</code> | Element to search on the target browser |

<a name="Driver+selectRadioButtonById"></a>

## selectRadioButtonById(id)

Select radio button identified by id locator strategy

| Param | Type                | Description                                            |
| ----- | ------------------- | ------------------------------------------------------ |
| id    | <code>string</code> | Id value of the element based on 'id' locator strategy |

<a name="Driver+selectCheckboxById"></a>

## selectCheckboxById(id)

Select checkbox element identified by id locator strategy

| Param | Type                | Description                                            |
| ----- | ------------------- | ------------------------------------------------------ |
| id    | <code>string</code> | Id value of the element based on 'id' locator strategy |

<a name="Driver+waitForCheckboxToBeSelected"></a>

## waitForCheckboxToBeSelected(id)

Waits for checkbox element to become visible and selectable, identified by id locator strategy

| Param | Type                | Description                                            |
| ----- | ------------------- | ------------------------------------------------------ |
| id    | <code>string</code> | Id value of the element based on 'id' locator strategy |

<a name="Driver+waitForCheckboxToBeDisabled"></a>

## waitForCheckboxToBeDisabled(id)

Waits for checkbox element to become disabled, identified by id locator strategy

| Param | Type                | Description                                            |
| ----- | ------------------- | ------------------------------------------------------ |
| id    | <code>string</code> | Id value of the element based on 'id' locator strategy |

<a name="Driver+selectDropdownItem"></a>

## selectDropdownItem(parentId, itemIndex)

Select an item in the dropbox element, identified by id locator strategy

| Param     | Type                | Description                                            |
| --------- | ------------------- | ------------------------------------------------------ |
| parentId  | <code>string</code> | Id value of the element based on 'id' locator strategy |
| itemIndex | <code>number</code> | index value of the dropdown values                     |

<a name="Driver+waitForPageLoadComplete"></a>

## waitForPageLoadComplete() ⇒ <code>Promise.&lt;void&gt;</code>

Waits for the page to complete loading/refreshing

**Returns**: <code>Promise.&lt;void&gt;</code> - Returns true if page has successfully loaded  
**Throws**:

- <code>Promise.&lt;msg&gt;</code> Returns an error if timed out

<a name="Driver+waitUntilUrlContains"></a>

## waitUntilUrlContains(prefix)

Waits until the URL contains the specified prefix

| Param  | Type                | Description                      |
| ------ | ------------------- | -------------------------------- |
| prefix | <code>string</code> | part of the url for verification |

<a name="Driver+waitUntilUrlIs"></a>

## waitUntilUrlIs(url)

Waits until the URL of the webpage matches the expected url value

| Param | Type                | Description                       |
| ----- | ------------------- | --------------------------------- |
| url   | <code>string</code> | entire URL string to be verifieds |

<a name="Driver+openNewTab"></a>

## openNewTab(url)

Opens a new tab with specified URL

| Param | Type                | Description      |
| ----- | ------------------- | ---------------- |
| url   | <code>string</code> | URL to be opened |

<a name="Driver+validateInNewTabAndClose"></a>

## validateInNewTabAndClose(callback)

Waits for new tab to open and callback is called on success

| Param    | Type                  | Description                                                          |
| -------- | --------------------- | -------------------------------------------------------------------- |
| callback | <code>function</code> | callback function to be called after new tab is opened and validated |

<a name="Driver+waitForElementToBeNotVisible"></a>

## waitForElementToBeNotVisible(strategy, locator)

Waits for element to become stale, until timeout

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |

<a name="Driver+waitForElementToBeVisible"></a>

## waitForElementToBeVisible(strategy, locator)

Waits for element to be attached to the webpage and become visible, until timeout

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |

<a name="Driver+getBrowserConsoleLogs"></a>

## getBrowserConsoleLogs() ⇒ <code>string</code>

Get browser console logs

**Returns**: <code>string</code> - - Entire browser logs in preserved state  
<a name="Driver+uploadFile"></a>

## uploadFile(strategy, locator, filepath)

Custome function to upload a file using an element, identified by specified locator strategy

| Param    | Type                | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code> | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code> | value of element to search, corresponding to locator strategy                                          |
| filepath | <code>string</code> | path of the file to be uploaded                                                                        |

<a name="Driver+throwErrorWithDetailsIfNotStale"></a>

## throwErrorWithDetailsIfNotStale(strategy, locator, fxName, error, callback)

Custom function to verify if element is stale and execute callback if yes; if not, fail with message

| Param    | Type                  | Description                                                                                            |
| -------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| strategy | <code>string</code>   | 'id', 'name', 'className', 'xpath', 'css', 'tagName', 'linkText', 'partialLinkText', 'accessibilityId' |
| locator  | <code>string</code>   | value of element to search, corresponding to locator strategy                                          |
| fxName   | <code>string</code>   | name of function                                                                                       |
| error    | <code>Object</code>   | error object with name parameter and message                                                           |
| callback | <code>function</code> | callback function to be called if error.name is StaleElementReferenceError                             |

<a name="Driver+waitForCookie"></a>

## waitForCookie(title)

Waits for cookie to be expected value

| Param | Type                | Description                   |
| ----- | ------------------- | ----------------------------- |
| title | <code>string</code> | key name of cookie in browser |

<a name="Driver+getCookie"></a>

## getCookie(title)

Returns cookie value

| Param | Type                | Description                   |
| ----- | ------------------- | ----------------------------- |
| title | <code>string</code> | key name of cookie in browser |

<a name="Driver+waitForCookieToClear"></a>

## waitForCookieToClear(title)

Waits for expected cookie to be cleared, until timeout

| Param | Type                | Description                   |
| ----- | ------------------- | ----------------------------- |
| title | <code>string</code> | key name of cookie in browser |

<a name="Driver+waitForCookieToEqual"></a>

## waitForCookieToEqual(title, value)

Waits for cookie to be expected value, until timeout

| Param | Type                | Description                   |
| ----- | ------------------- | ----------------------------- |
| title | <code>string</code> | key name of cookie in browser |
| value | <code>string</code> | expected value of cookie key  |

<a name="Driver+processAndThrowError"></a>

## processAndThrowError(error, errorStack)

Error Processor and throws error back up to the runner

| Param      | Type                | Description                                                    |
| ---------- | ------------------- | -------------------------------------------------------------- |
| error      | <code>Object</code> | Must be an object so that the method can add additional fields |
| errorStack | <code>any</code>    | Must be an object so that the method can add additional fields |
