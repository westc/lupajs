(() => {
  const LUPA_CSS = "[v-cloak]{display:none}body{margin:0;overflow:hidden;padding:0}body.inverted-mode{background-color:#111;filter:invert(1) hue-rotate(180deg)}body,body.inverted-mode input,body.inverted-mode textarea{background-color:#eee}body.inverted-mode .btn{filter:invert(1) hue-rotate(180deg)}";
  const LUPA_HTML = "<div id=\"vueApp\" class=\"m-1\"><div v-if=\"isLoading\" class=\"alert alert-secondary text-center\"><table class=\"mx-auto\"><tr><td class=\"align-middle\">{{ loadingMessage }}</td><td><div class=\"spinner-border\" role=\"status\"><span class=\"sr-only\"></span></div></td></tr></table></div><template v-if=\"!isLoading\"><div v-for=\"repeat in [false, true]\"><template v-if=\"!repeat || showBottomSearch &amp;&amp; pageRecords.length\"><div style=\"display: flex; flex-direction: row; gap: 1em; flex-wrap: wrap; justify-content: center; align-items: center;\"><div style=\"flex-grow: 1;\"><label class=\"input-group m-0\"><span class=\"input-group-text\">{{ searchTermsLabel }}</span> <input type=\"text\" class=\"form-control\" v-model=\"searchTerms\" v-bind:placeholder=\"searchTermsPlaceholder\"></label></div><div v-if=\"pageCount &gt; 1\"><nav style=\"user-select: none;\"><ul class=\"pagination justify-content-center m-0\"><li v-for=\"page in pagination\" v-bind:class=\"'page-item' + (pageNumber === page.number ? ' active' : '')\"><a class=\"page-link\" href=\"javascript:;\" v-on:click=\"pageNumber = page.number\">{{ page.number }}</a></li></ul></nav></div></div></template><div v-if=\"!repeat\" class=\"my-3\"><div v-if=\"pageCount === 0\" class=\"alert alert-warning text-center\">{{ noResultsMessage }}</div><ol v-bind:start=\"pageRecordsStartIndex + 1\"><li v-for=\"record in pageRecords\"><b><a v-bind:href=\"record.url\" v-bind:target=\"anchorTarget\">{{ record.title }}</a></b><template v-if=\"record.description\"><br>{{ record.description }}</template><div style=\"color: #0006; font-family: monospace; font-size: 0.8em; font-style: italic;\">{{ record.url }}</div></li></ol></div></div></template></div>";

  /**
   * Function executed when the script is included in a document.
   * @param {HTMLScriptElement} script
   *   This is the current script but also the placeholder for where lupa will
   *   be inserted into the DOM.
   */
  async function main(script) {
    let settings = {};
    
    const callableFrame = createCallableFrame({
      jsCode() {
        let mountedApp;const DEFAULT_PER_PAGE=25,DEFAULT_PAGINATION_LENGTH=5,DEFAULT_SEARCH_TERMS_LABEL="Search for",DEFAULT_SEARCH_TERMS_PLACEHOLDER="Enter your search terms here…",DEFAULT_SHOW_BOTTOM_SEARCH=!0,DEFAULT_ANCHOR_TARGET="_blank",DEFAULT_NO_RESULTS_MESSAGE="Sorry, no results were found.",DEFAULT_MATCH_WORD_START=!0,DEFAULT_MATCH_WORD_END=!1;function init(){const t=document.querySelector("#vueApp");mountedApp=Vue.createApp({data:()=>({records:[],settings:{},errorMessage:"",pageNumber:1,loadingMessage:"All searchable records are being loaded…",searchTerms:"",height:0}),watch:{searchTerms(t){this.pageNumber=1,setTimeout((()=>{this.searchTerms===t&&this.settings.searchTermsParam&&callParent("updateSearchTermsParam",t)}),1e3)},height(t){callParent("updateHeight",t)},settings(t){document.body.classList[t?.invertedMode?"add":"remove"]("inverted-mode")}},computed:{noResultsMessage(){return this.settings.noResultsMessage??DEFAULT_NO_RESULTS_MESSAGE},anchorTarget(){return this.settings.anchorTarget??"_blank"},showBottomSearch(){return this.settings.showBottomSearch??true},searchTermsLabel(){return this.settings.searchTermsLabel??"Search for"},searchTermsPlaceholder(){return this.settings.searchTermsPlaceholder??"Enter your search terms here…"},matchWordStart(){return this.settings.matchWordStart??true},matchWordEnd(){return this.settings.matchWordEnd??false},searcher(){return new Searcher(this.searchTerms,{matchWordStart:this.matchWordStart,matchWordEnd:this.matchWordEnd})},filteredRecords(){const{searcher:t}=this;return this.records.reduce(((e,r,s)=>{const a=t.matchAll(`${r.url??""}\n${r.title??""}\n${r.description??""}\n${r.keywords??""}`);return a.length&&e.push({record:r,index:s,score:[...new Set(a.map((t=>t[0].toUpperCase())))].reduce(((t,e)=>t+e.length+1),0),score2:a.reduce(((t,e)=>t+e[0].length),0)}),e}),[]).sort(((t,e)=>t.score===e.score?t.score2==t.score2?t.index-e.index:e.score2-t.score2:e.score-t.score)).map((({record:t})=>t))},isLoading(){return!!this.loadingMessage},perPage(){return this.settings.perPage??25},paginationLength(){return this.settings.paginationLength??5},pageRecords(){const t=this.pageRecordsStartIndex;return this.filteredRecords.slice(t,t+this.perPage)},pageRecordsStartIndex(){return(this.pageNumber-1)*this.perPage},pageCount(){return Math.ceil(this.filteredRecords.length/this.perPage)},pagination(){return paginate(this.pageNumber,this.pageCount,this.paginationLength)},title(){return this.settings.title?(document.title=`${this.settings.title} – 🔍 Lupa`,this.settings.title):document.title},description(){return this.settings.description??document.querySelector('meta[name="description"]')?.getAttribute("content")}},methods:{updateHeight(){const e=window.getComputedStyle(t);this.height=parseFloat(e.height)+parseFloat(e.marginTop)+parseFloat(e.marginBottom)}},mounted(){this.updateHeight(),["orientationchange","resize"].forEach((t=>addEventListener(t,this.updateHeight)))},updated(){this.updateHeight()}}).mount(t)}function updateSearchTerms(t){mountedApp.searchTerms=t}function paginate(t,e,r){for(var s=Math.max(1,Math.min(Math.floor(t),e)),a=s,n=[{number:s,isSelected:!0,isBoundary:1===s||a===e}],i=2*r,h=2;n.length<r&&h++<i;)h%2==0&&1<s&&(--s,n.unshift({number:s,isSelected:!1,isBoundary:1===s})),h%2==1&&a<e&&(++a,n.push({number:a,isSelected:!1,isBoundary:a===e}));return n}class Searcher{#t;#e;#r;#s;#a;#n;constructor(t,e){this.#t=t??"",e=Object(e),this.#e=!1!==e.matchWordStart,this.#r=!!e.matchWordEnd,this.#i()}#i(){this.#s=null,this.#a=null,this.#n=null;let t=[],e=[],r=[];for(let s,a=/([-+])?("([^"]*)"|\S+)/g;s=a.exec(this.#t.trim());){let a=(null==s[3]?s[2]:s[3]).replace(/^(?=([\p{L}\p{N}]))|(?<=([\p{L}\p{N}]))$|\\(.)|(\s?\*\s?)|(\s+)|[.+?^$\[\]\\{}()|]/gu,((t,e,r,a,n,i,h,o)=>{if(e)return this.#e?"(?<!\\p{L}|\\p{N})":"";if(r)return this.#r?"(?!\\p{L}|\\p{N})":"";if(i)return"\\s+";if(!n)return"\\"+(a||t);let c=s[3]?"(\\s+\\S+)*":"",d=0==h||"*"!==n.charAt(0),u=h+1===o.length||"*"!==n.slice(-1);return d?"(?:\\s|)\\S+"+c+(u?"":"(?:\\s|$)"):"\\S*"})),n=s[1];("+"!==n?"-"===n?r:t:e).push(a)}e.length+t.length===0&&t.push("^"),r.length&&(this.#s=new RegExp(r.join("|"),"iu")),e.length&&(this.#a=new RegExp(e.map((t=>`(?=^[^]*${t})`)).join(""),"iu")),this.#n=new RegExp([...t,...e].join("|"),"giu")}set matchWordStart(t){this.#e=t,this.#i()}get matchWordStart(){return this.#e}set matchWordEnd(t){this.#r=t,this.#i()}get matchWordEnd(){return this.#r}set terms(t){this.#t=t??"",this.#i()}get terms(){return this.#t}test(t){return!this.#s?.test(t)&&(!1!==this.#a?.test(t)&&this.#n.test(t))}matchAll(t){return this.#s?.test(t)||!1===this.#a?.test(t)?[]:[...t.matchAll(this.#n)]}}function setData({records:t,settings:e}){mountedApp.records=t,mountedApp.settings=e,mountedApp.loadingMessage=""}
      },
      jsUrls: [
        'https://unpkg.com/vue@3/dist/vue.global.prod.js',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
      ],
      cssUrls: [
        'data:text/css,' + encodeURIComponent(LUPA_CSS),
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'
      ],
      functions: {
        updateSearchTermsParam(searchTerms) {
          const url = new URL(location.href);
          const {searchTermsParam, persistSearchTermsParam} = settings;
          const urlSearchTerms = url.searchParams.get(searchTermsParam) ?? '';
          if (urlSearchTerms !== searchTerms) {
            if (searchTerms || persistSearchTermsParam !== false) {
              url.searchParams.set(searchTermsParam, searchTerms);
            }
            else {
              url.searchParams.delete(searchTermsParam);
            }
            history.pushState({source: 'lupajs', searchTerms}, document.title, url.href);
          }
        },
        updateHeight(newHeight) {
          this.iframe.style.height = `${newHeight}px`;
        }
      },
      onMessage() {
        console.log('Got message from IFRAME:', arguments);
      },
      async onReady() {
        this.call('init');

        // Gets all of the values passed as `data-` fields on the <script> tag.
        const scriptDataset = script.dataset;

        // Get the normal records and the settings as records.
        let [records, settingsRecords] = await Promise.all([
          getRecords(scriptDataset, 'records', true),
          getRecords(scriptDataset, 'settings', false),
        ]);

        // Fill in the extra settings that were set explicitly as
        // `data-settings-` attributes.
        for (const [key, value] of Object.entries(scriptDataset)) {
          key.replace(/^settings([A-Z])(.*$)/, (_, first, rest) => {
            settingsRecords.push({
              name: first.toLowerCase() + rest,
              value: infer(value),
            });
          });
        }

        // Turn the settings into a record.
        settings = settingsRecords.reduce(
          (settings, record) => {
            record = Object.entries(record).reduce(
              (record, [key, value]) => {
                record[/^(?:name|value)$/i.test(key) ? key.toLowerCase() : key] = value;
                return record;
              },
              {}
            );
            if (record.name !== undefined && record.value !== undefined) {
              settings[record.name] = record.value;
            }
            return settings;
          },
          {}
        );

        // If the searchTerms param name is given set it up.
        if (settings.searchTermsParam) {
          const onPopState = () => {
            this.call(
              'updateSearchTerms',
              (new URL(location.href).searchParams.get(settings.searchTermsParam)) ?? ''
            );
          };
          addEventListener('popstate', onPopState);
          onPopState();
        }

        this.call('setData', {
          // Normalize the title, description, keywords, and url properties.
          records: records.reduce(
            (records, record) => {
              record = Object.entries(record).reduce(
                (record, [key, value]) => {
                  record[/^(?:title|description|keywords|url)$/i.test(key) ? key.toLowerCase() : key] = value;
                  return record;
                },
                {}
              );
              if (record.title && record.url) records.push(record);
              return records;
            },
            []
          ),
          settings,
        });
      },
      body: LUPA_HTML,
      style: {
        width: '100%',
        height: '0px',
        border: 0
      },
      // Use a blob source unless testing using local file system.
      useBlobSrc: !(u=>(URL.revokeObjectURL(u),u.startsWith('blob:null/')))(URL.createObjectURL(new Blob())),
    });

    script.parentNode.insertBefore(callableFrame.iframe, script);
  }

  /**
   * @param {DOMStringMap} dataset
   * @param {string} baseName
   * @param {boolean} isRequired
   * @returns {Promise<Record<string,any>[]>}
   */
  async function getRecords(dataset, baseName, isRequired) {
    const gsheetName = 'gsheet' + baseName.charAt(0).toUpperCase() + baseName.slice(1);
    const gsheetInput = dataset[gsheetName];
    const input = dataset[baseName];
    let records;
    if (gsheetInput) {
      records = await readGSheetValues(gsheetInput);
    }
    else if (input) {
      records = await (new ((async()=>{}).constructor)('return ' + input))();
      if ('function' === typeof records || records instanceof Promise) {
        records = await records();
      }
    }

    if (!Array.isArray(records)) {
      // If `records` is actually an object representing records return an array
      // of name/value records.
      if (!isPrimitive(records)) {
        return Object.entries(records).reduce(
          (records, [name, value]) => records.concat([{name, value}]),
          []
        );
      }
      // If not required and not an array or object just return an empty array.
      if (!isRequired) return [];
      // If required and not an array or a record throw an error.
      console.log('Unexpected records:', records);
      const baseDashName = baseName.replace(/[A-Z]/g, '-$&').toLowerCase();
      const gsheetDashName = gsheetName.replace(/[A-Z]/g, '-$&').toLowerCase();
      throw new Error(`Unable to get valid records from data-${baseDashName} or data-${gsheetDashName}.`);
    }

    const firstRecord = records[0];
    if (Array.isArray(firstRecord)) {
      return records.slice(1).map(
        record => firstRecord.reduce(
          (newRecord, key, colIndex) => {
            newRecord[key] = record[colIndex];
            return newRecord;
          },
          {}
        )
      );
    }

    return records;
  }

  /**
   * Reads the row values of the specified Google Sheet that was published to the
   * web without needing an API key.
   * @param {string} publishedURL
   *   The URL of the sheet that you want to read from as copied from the "Publish
   *   to the Web" modal in Google Sheets.  To get the contents of a sheet other
   *   than the first one you must use the URL of that sheet when selecting it in
   *   the "Publish to the Web" modal in Google Sheets.
   * @returns {Promise<(boolean|null|number|string)[][]>}
   */
  async function readGSheetValues(publishedURL) {
    // Attempt to parse the published URL.
    let parsedURL = /^(https:\/\/(?=.*\b(?:spread)sheets\b).*google\.com\/.+\/[^/]{40,}\/).+?(?:[?&]gid=([^&]+).*)?$/.exec(publishedURL);

    // Throw an error if the given URL was not able to be parsed.
    if (!parsedURL) {
      throw new Error(`The given "Publish to the Web" URL is not recognized:\n${publishedURL}`);
    }

    // Get the CSV content from Google.
    let urlToFetch = `${parsedURL[1]}pub?output=csv&gid=${parsedURL[2] ?? 0}`;
    const csvContent = await(await fetch(urlToFetch)).text();

    // Turn the CSV content into an array of arrays and return it.
    return[...csvContent.matchAll(/("(?:""|[^"]+)*"|[^,\r\n]*)(,|\r?\n|$)/g)].reduce(
      (rows, [_, content, sep]) => {
        if (sep || content) {
          const currentRow = rows[rows.length - 1];
          // If the next separator was given and is not a comma that means that
          // the next value should go onto a new row.
          if (sep && sep !== ',') rows.push([]);
          // Turn the content into the property type and then add it to the
          // current row.
          if (content === 'TRUE') content = true;
          else if (content === 'FALSE') content = false;
          else if (content === '') content = null;
          else if (content.charAt(0) === '"') content = content.slice(1, -1).replace(/""/g, '"');
          else if (/^-?\d+(?:\.\d+(?:E[-+]\d+)?)?$/.test(content)) {
            const numContent = parseFloat(content);
            if (numContent === numContent && isFinite(numContent)) content = numContent;
          }
          currentRow.push(content);
        }
        return rows;
      },
      [[]]
    );
  }

  /**
   * Determines if `input` is a primitive value or not.
   * @param {any} input
   *   The input value to test.
   * @returns {boolean}
   *   Returns `true if `input` is a primitive, otherwise `false` is returned.
   */
  function isPrimitive(input) {
    if (input == null) {
      // This is here to correctly handle document.all.
      return input === null || input === undefined;
    }
    const type = typeof input;
    return type !== "object" && type !== "function";
  }

  /**
   * Tries to turn a string value that looks like a boolean, number, null,
   * undefined or BigInt into one of those types.
   * @template {string} T
   * @param {T} input
   * @param {boolean} parseUrlBools
   * @return {T|boolean|number|null|undefined|BigInt}
   */
  function infer(input, parseUrlBools) {
    if (input && 'string' === typeof input) {
        if (input === 'true' || (parseUrlBools && /^yes$|^on$/.test(input))) return true;
        if (input === 'false' || (parseUrlBools && /^no$|^off$/.test(input))) return false;
        if (input === 'null') return null;
        if (input === 'undefined') return undefined;
        if (/^-?(?:0|[1-9]\d*)?(?:\.\d+)?(?:e[-+]?[1-9]\d*)?$/.test(input)) return +input;
        if (/^-?(?:0|[1-9]\d*)n$/.test(input)) return BigInt(input.slice(0, -1));
    }
    return input;
  }

  // NOTE:  This solution was intentionally written without using newer JS
  // features to make the minified version even smaller.
  var createCallableFrame = (function () {
    var IFRAME_SCRIPT_MESSAGE_CODE = parseFunction(function() {
      // NOTE:  Referencing with window to ensure that local namespace will not
      // interfere.
      window.addEventListener('message', function(e) {
        if (e.data.funcName && e.data.args) {
          var func = eval(e.data.funcName);
          if ('function' === typeof func) func.apply(e, e.data.args || []);
        }
      });

      function messageParent(message) {
        window.parent.postMessage(message, '*');
      }
    }).body;

    /**
     * Creates an IFRAME which allows for easier 2-way communication.
     * @template {createCallableFrame_Return} R
     * @param {Object} options
     * @param {(string|Function)=} options.jsCode
     *   The JavaScript code that will be encapsulated and run within the IFRAME.
     *   The code can call `messageParent(message)` to send a message to
     *   `options.onMessage()`.  The code can call `callParent(funcName, ...args)`
     *   to execute `options.functions[funcName](...args)`.  The code can call
     *   `applyParent(funcName, args)` to execute
     *   `options.functions[funcName](...args)`.
     * @param {{[funcName: string]: (this: R, ...args) => void}=} options.functions
     *   Functions that can be called by the IFRAME code to execute code on the
     *   parent level.
     * @param {string[]=} options.jsUrls
     * @param {string[]=} options.cssUrls
     * @param {string=} options.head
     * @param {string=} options.body
     * @param {(CSSStyleDeclaration|string)=} options.style
     *   The HTML code that will be used to instantiate the page.
     * @param {boolean=} options.useBlobSrc
     *   If specified a `Blob` will be used to construct the URL of the IFRAME
     *   instead of using a data URL.
     * @param {((this: R, event: MessageEvent) => void)=} options.onMessage
     * @param {((this: R, event: MessageEvent) => void)=} options.onReady
     * @returns {R}
     */
    function createCallableFrame(options) {
      // Break some of the options out into their own variables.
      var jsCode = options.jsCode;
      var onMessage = options.onMessage;
      var onReady = options.onReady;
      var style = options.style;

      function getUrl(content, type) {
        return (options.useBlobSrc && window.URL && 'function' === typeof URL.createObjectURL && 'function' === typeof Blob)
          ? URL.createObjectURL(new Blob([content], {type: type}))
          : toDataURL(content, {type: type, charset: 'utf8'});
      }

      // isReady indicates if the IFRAME is ready to have messages sent to it
      // while READY_ID is used internally to confirm if the IFRAME is actually
      // ready to receive function calls.
      var isReady, READY_ID = Math.random() + '' + Math.random();

      // Turns the script code for the IFRAME into a data URL.
      var IFRAME_SCRIPT_SRC = getUrl(
        [
          '(function(){',
          IFRAME_SCRIPT_MESSAGE_CODE,
          'var applyParent, callParent;',
          '(function(READY_ID){',
          parseFunction(function() {
            applyParent = function(funcName, args) {
              window.parent.postMessage({funcName: funcName, args: args, id: READY_ID}, '*');
            };

            callParent = function(funcName) {
              window.parent.postMessage(
                {funcName: funcName, args: Array.prototype.slice.call(arguments, 1), id: READY_ID},
                '*'
              );
            };

            var interval = setInterval(function() {
              if (/^(complete|interactive)$/.test(document.readyState)) {
                clearInterval(interval);
                messageParent(READY_ID);
              }
            }, 100);
          }).body,
          '})(' + JSON.stringify(READY_ID) + ');',
          'function' !== typeof jsCode ? jsCode || '' : parseFunction(jsCode).body,
          '})();',
        ].join('\n'),
        'text/javascript'
      );

      // Creates the IFRAME and sets its source by leveraging data URLs.
      var IFRAME = document.createElement('iframe');
      var HTML_CODE = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        options.head || '',
        (options.cssUrls || []).map(function(cssUrl) {
          return '<link href="' + cssUrl + '" rel="stylesheet">';
        }).join('\n'),
        (options.jsUrls || []).map(function(jsUrl) {
          return '<script src="' + jsUrl + '"><\x2fscript>';
        }).join('\n'),
        '</head>',
        '<body>',
        options.body || '',
        '<script src="' + IFRAME_SCRIPT_SRC + '"><\x2fscript>',
        '</body>',
        '</html>'
      ].join('\n');
      IFRAME.src = getUrl(HTML_CODE, 'text/html');

      // Set the style of the iframe.
      if (style) {
        if ('string' === typeof style) {
          IFRAME.style.cssText = style;
        }
        else {
          for (var styleKey in style) {
            if (hasOwn(style, styleKey)) {
              IFRAME.style[styleKey] = style[styleKey];
            }
          }
        }
      }

      // Adds an event listener so that messages from the IFRAME will be captured.
      addEventListener('message', function(e) {
        if (e.source === IFRAME.contentWindow) {
          var data = e.data;
          var dataIsReadyId = READY_ID === data;
          if (isReady && !dataIsReadyId) {
            if (options.functions && data.id === READY_ID && hasOwn(options.functions, data.funcName)) {
              options.functions[data.funcName].apply(callableFrame, data.args);
            }
            else if ('function' === typeof onMessage) {
              onMessage.call(callableFrame, e);
            }
            else {
              console.warn('Message sent from callable frame but no listener was set up.', e);
            }
          }
          else if (dataIsReadyId) {
            isReady = true;
            if ('function' === typeof onReady) onReady.call(callableFrame, e);
          }
          else { // !isReady
            console.warn('Message sent from callable frame prematurely:', e);
          }
        }
      });

      // Returns an object which makes it possible to call functions and get
      // access to the IFRAME.
      var callableFrame = {
        apply: function(funcName, args) {
          IFRAME.contentWindow.postMessage({funcName: funcName, args: args}, '*');
        },
        call: function(funcName) {
          IFRAME.contentWindow.postMessage({funcName: funcName, args: Array.prototype.slice.call(arguments, 1)}, '*');
        },
        iframe: IFRAME
      };
      return callableFrame;
    };
    /**
     * @typedef {Object} createCallableFrame_Return
     * @property {(funcName: string, args: any[]) => void} apply
     * @property {(funcName: string, ...args: any[]) => void} call
     * @property {HTMLIFrameElement} iframe
     */

    /**
     * Turns a string that can represent a text document and returns the
     * corresponding data URL (AKA data URI).
     * @param {string} text
     *   The text to turn into a data URL.
     * @param {Object} options
     *   Optional.  An object containing the different options to set.
     * @param {boolean=} options.base64
     *   Optional, defaults to the `false`.  Indicates if the returned data URL
     *   should be base64 encoded.
     * @param {string=} options.charset
     *   Optional.  Indicates the character set of the content.  Examples are
     *   "US-ASCII", "UTF-8", etc.
     * @param {string=} options.type
     *   Optional, defaults to the empty string.  The content type of `text` (eg.
     *   `"text/html"`).
     * @returns {string}
     *   A data URL which represents `text` as the given `type`.
     */
    function toDataURL(text, options) {
      options = Object(options);
      var base64 = options.base64;
      var charset = options.charset;
      return ('data:'
          + (options.type ?? '')
          + ';'
          + (charset ? 'charset=' + charset + ';' : '')
          + (base64 ? 'base64;' : '')
        ).replace(/;$/, '')
        + ','
        + (base64
          // unescape() and encodeURIComponent() used based on this solution:
          // https://stackoverflow.com/a/26603875/657132
          ? window.btoa(unescape(encodeURIComponent(text)))
          : encodeURIComponent(text)
        );
    }

    /**
     * Determines if `obj` has its own property named `prop`.
     * @type {(obj: any, prop: string|symbol) => boolean}
     */
    var hasOwn = atob.call.bind({}.hasOwnProperty);

    /**
     * Parses a user-defined function to determine if it is an arrow function, an
     * async function a generator function and also gets the parameters as a string
     * and the function body as a string.
     * @param {Function} input
     * @returns {{
     *   isArrow: boolean;
     *   isAsync: boolean;
     *   isGenerator: boolean;
     *   parameters: string;
     *   body: string;
     * }}
     */
    function parseFunction(input) {
      // Get rid of all comments encountered before the function body.
      var strFunc = input + '';
      /** @type {RegExpExecArray?} */
      var m;
      while (m = /\/\*[^]*?\*\/|\/\/.*/g.exec(strFunc)) {
        var STR_BEFORE = strFunc.slice(0, m.index);
        if (/[\{"'`]/.test(STR_BEFORE)) break;
        strFunc = STR_BEFORE + ' ' + strFunc.slice(m.index + m[0].length);
      }

      // Determines if the function is an async function.
      var IS_ASYNC = /^\s*async\b/.test(strFunc);
      if (IS_ASYNC) strFunc = strFunc.replace('async', '');
      
      // Determines if the function is a generator function.
      var IS_GENERATOR = /^\s*(?:function\s*)?\*/.test(strFunc);
      if (IS_GENERATOR) strFunc = strFunc.replace(/(?:\bfunction\s*)?\*/, '');

      // Determines if the function is an arrow function.
      var ARROW_MATCH = /\s*=>\s*/.exec(strFunc);
      var INDEX_OF_FUNC_START = strFunc.search(/\)\s*\{/);
      var IS_ARROW = ARROW_MATCH && (ARROW_MATCH.index < INDEX_OF_FUNC_START || INDEX_OF_FUNC_START < 0);

      // Parses out the parameters and body as strings.
      var parameters, body;
      if (IS_ARROW) {
        var STR_BEFORE = strFunc.slice(0, ARROW_MATCH.index);
        var STR_AFTER = strFunc.slice(ARROW_MATCH.index + ARROW_MATCH[0].length);
        parameters = (/\S+(?:\s*,\s*\S+)*/.exec(STR_BEFORE.replace(/[()]/g, ' ')) ?? [])[0];
        body = !/^\{/.test(STR_AFTER)
          ? 'return ' + STR_AFTER
          : STR_AFTER.replace(/^\{|\}\s*$/g, '');
      }
      else {
        parameters = (/\(([^\)]*)\)/.exec(strFunc) ?? [])[1];
        body = (/\{([^]*)\}/.exec(strFunc) ?? [])[1];
      }

      // Returns the parsed function.
      return {
        isAsync: IS_ASYNC,
        isGenerator: IS_GENERATOR,
        isArrow: IS_ARROW,
        parameters,
        body,
      };
    }

    // Make toDataURL() and parseFunction() available.
    createCallableFrame.toDataURL = toDataURL;
    createCallableFrame.parseFunction = parseFunction;

    return createCallableFrame;
  })();

  main(document.currentScript);
})();