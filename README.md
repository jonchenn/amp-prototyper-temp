# amp-prototyper

This Node.js-based script aims to automate the process of converting a HTML page
to a [Accelerated Mobile Page (AMP)](https://www.ampproject.org). It follows
[the general guideline of converting HTML to AMP](https://www.ampproject.org/docs/fundamentals/converting).

### TL;DR

* It automatically converts a HTML page to AMP with pre-defined steps.
* It generates a converted AMP, a screenshot, and AMP validation errors for each step.
* You can customize steps for specific scenarios.

### What is amp-prototyper

The main goal is to minimize the effort of converting HTML to AMP, including
adding AMP boilerplate, removing custom Javascript, making all CSS inline, etc.
The outcome of this tool includes converted AMP, the screenshot, and AMP
validation errors for each conversion step.

However, as there are many edge cases when converting a HTML to AMP, this
project doesn't aim for an ultimate tool that perfectly converts any
HTML page to AMP.

This script uses [puppeteer](https://github.com/GoogleChrome/puppeteer) to load
and render pages.

## Getting started

Run the following to run the script locally.

```
git clone https://github.com/jonchenn/amp-prototyper.git
cd amp-prototyper
yarn install
```

### Usage

```
./amp-prototyper --url=[URL]
```

Required arguments:
*  `--url=URL` - URL to the page to convert.

### Options

*  `--steps=FILE` - Path to the custom steps JS file.
*  `--output=FILE` - Path to the output file.
*  `--device=DEVICE_NAME` - Use specific device name for screenshots.
*  `--headless=(true|false)` - Whether to show browser.
*  `--verbose` - Display AMP validation errors.

### Examples:

```
# Amplify a page and generate results in /output folder.
./amp-prototyper --url=http://127.0.0.1:8080

# Amplify a page and generate results in /output/test folder.
./amp-prototyper --url=http://127.0.0.1:8080 --output=test

# Amplify a page with customized steps.
./amp-prototyper --url=http://127.0.0.1:8080 --steps=custom/mysteps.js

# Amplify a page and display AMP validation details.
./amp-prototyper --url=http://127.0.0.1:8080 --verbose

# Amplify a page and generate screenshots with specific Device.
./amp-prototyper --url=http://127.0.0.1:8080 --device='Pixel 2'

# Amplify a page and display browser.
./amp-prototyper --url=http://127.0.0.1:8080 --headless=false
```

### Test with a sample HTML.

You can also run a sample HTML with following:

```
# Run a localhost web server using http-server.
yarn sample
```

This opens up a localhost web server at http://127.0.0.1:8080 by default that
serves [test/index.html](https://github.com/jonchenn/amp-prototyper/blob/master/test/index.html).
This is a quick and simple HTML page to test amp-prototyper. You can run the following to see how amp-prototyper works.

```
# Amplify the page at localhost and output in sample/ folder.
./amp-prototyper --url=http://127.0.0.1:8080 --output=sample
```

Then, check out the `./output/sample`, and you will see a list of output files.

## Output of each step

When you run the script, it follows predefined steps, either default steps
at [src/default-steps.js](https://github.com/jonchenn/amp-prototyper/blob/master/src/default-steps.js), or customized steps.

You can amplify a HTML page with default steps:

```
# Amplify a page with default steps.
./amp-prototyper --url=http://127.0.0.1:8080
```

Or run amplify a page with customized steps:

```
# Amplify a page with customized steps.
./amp-prototyper --url=http://127.0.0.1:8080 --steps=custom/mysteps.js
```

At each step, it executes a set of actions and writes the files below to the
output/ folder:
* `output-step-[STEP_ID].html` - the modified HTML.
* `output-step-[STEP_ID].png` - the screenshot after this step.
* `output-step-[STEP_ID]-log.txt` (only with --verbose) - AMP validation errors from console output.

If you don't specify --output, it uses the domain from the given URL as the
name of the output folder.

## Customize steps

### Structure of steps

You can check out the default steps at [src/default-steps.js](https://github.com/jonchenn/amp-prototyper/blob/master/src/default-steps.js).

Each step follows the structure below.

```
{
  name: 'Name of the step',
  actions: [{
    skip: false,
    log: 'Log output for this action',
    actionType: 'replace',
    selector: 'html',
    regex: '<div(.*)>(.*)</div>',
    replace: '<span$1>$2</span>',
  }, {
    ...
  }],
},

```

Step properties:

* `name` <string> - Step name.
* `actions`<Array<[Action]()>> - actions to execute.
* `skip` <boolean> - Whether to skip this step.

Common properties of an action:

* `actionType` <string> - Action type.
* `log` <string> - Message output of this action.
* `waitAfterLoaded` <int> - Wait for a specific milliseconds after the page loaded.

### Environment Variables

You can also use the following EnvVars in the steps configuration.

* `$URL` <string> - The URL from the --url parameter.
* `$HOST` <string> - The host derived from the URL.
* `$DOMAIN` <string> - The domain derived from the URL.

For example, you have a step like below:

```
{
  name: 'Name of the step',
  actions: [{
    log: 'Log output for this action',
    actionType: 'replace',
    selector: 'html',
    regex: '<div(.*)>(.*)</div>',
    replace: '<span$1>$HOST</span>',
  }],
},

```

While running the script with `https://example.com`, it replaces """$HOST"""
with "https://example.com".

### Supported actions:

#### setAttribute

Set an attribute to a specific element.

* `log` <string> - Message output of this action.
* `waitAfterLoaded` <int> - Wait for a specific milliseconds after the page loaded.

#### replace

Use Regex to find and replace in the DOM.

* `selector` <string> - target element.
* `regex` <string> - Regex string to match.
* `replace` <string> - Replace matches with this string.

#### replaceBasedOnAmpErrors

Use Regex to find and replace in the DOM based on AMP validation errors.

* `selector` <string> - target element.
* `ampErrorRegex` <string> - Regex string to match for AMP validation errors.
* `regex` <string> - Regex string to match.
* `replace` <string> - Replace matches with this string.

For example, in a specific step it has the following AMP validation errors.

```
line 61, col 4: The attribute 'onclick' may not appear in tag 'button'.
line 70, col 4: The tag 'custom-tag' is disallowed.
```

To replace the <custom-tag> in the body based on the AMP validation result, you
can have the following step:

```
{
  name: 'Convert disallowed tags to <div> based on AMP validation result.',
  actions: [{
    log: 'Change tags to <div>',
    actionType: 'replaceBasedOnAmpErrors',
    selector: 'body',
    ampErrorRegex: 'The tag \'([^\']*)\' is disallowed',
    regex: '<($1)((.|[\\r\\n])*)</$1>',
    replace: '<div data-original-tag="$1" $2</div>',
  }],
}
```

This step matches the AMP validation result with `ampErrorRegex`. Then it
replace the `regex` with the capturing group #1 from `ampErrorRegex`. In this
case, the `regex` becomes:

```
<(custom-tag)((.|[\\r\\n])*)</custom-tag>
```

Finally, it uses the revised `regex` to replace the content with `replace` value.

#### replaceOrInsert

Use Regex to find and replace in the DOM. If not found, insert to the destination element.

* `selector` <string> - target element.
* `regex` <string> - Regex string to match.
* `replace` <string> - Replace matches with this string.

#### insert

Insert a string to the bottom of the destination element. E.g. adding a string
to the bottom of the <head>.

* `selector` <string> - target element.
* `value` <string> - the string to insert.
* `destSelector` <string> - destination element.

#### move

Move elements to the bottom of the destination element. E.g. moving all <link>
to the bottom of the <head>.

* `selector` <string> - target element.
* `destSelector` <string> - destination element.

#### appendAfter

Append a string right after a specific element.

* `selector` <string> - target element.
* `value` <string> - the string to append.

#### inlineExternalStyles

Collect all external CSS and append a <style> tag with inline CSS.

* `selector` <string> - target element to append the CSS.
* `value` <string> - the string to append.
* `excludeDomains` <Array<string>> - the array of excluded domains. E.g. `['examples.com']` excludes all CSS loaded from `examples.com`.
* `minify` <boolean> - whether to minify CSS.
* `attributes` <Array<string>> - add attributes when appending <style> tag.

#### removeUnusedStyles

Remove unused CSS using [clean-css](https://github.com/jakubpawlowicz/clean-css) and [purifycss](https://github.com/purifycss/purifycss).

* `selector` <string> - target element.
* `value` <string> - the string to append.

#### customFunc

Run the action with a custom function. Example:

```
  # An action object.
  {
    log: 'Click a button',
    actionType: 'customFunc',
    customFunc: async (action, sourceDom, page) => {
      await page.click('button#summit');
    },
  }],
},

```

In the custom function, there are three arguments:

* `action` <ActionObject> - the action object itself.
* `sourceDom` <DOM document> - the raw DOM document object before rendering, as in the View Source in Chrome.
* `page` <puppeteer Page object> - The page object in puppeteer.

### Customize steps

To customize your own steps for specific scenarios, create a .js file like below:

```
module.exports = [
  {
    name: 'Remove unwanted styles',
    actions: [{
      log: 'Remove inline styles in body',
      actionType: 'replace',
      selector: 'body',
      regex: '(<!--)?.*<style[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>.*(-->)?',
      replace: '',
    }, {
      log: 'Remove noscript in body',
      actionType: 'replace',
      selector: 'body',
      regex: '(<!--)?.*<noscript[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>.*(-->)?',
      replace: '',
    }],
  }, {
    ...
  }
];
```

Next, run the script with `--steps=/path/to/mysteps.js`:

```
# Amplify a page with customized steps.
./amp-prototyper --url=http://127.0.0.1:8080 --steps=/path/to/mysteps.js
```

## Reference

* [puppeteer](https://github.com/GoogleChrome/puppeteer)
* [clean-css](https://github.com/jakubpawlowicz/clean-css)
* [purifycss](https://github.com/purifycss/purifycss)
