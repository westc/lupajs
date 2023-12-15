let mountedApp;

const DEFAULT_PER_PAGE = 25;
const DEFAULT_PAGINATION_LENGTH = 5;
const DEFAULT_SEARCH_TERMS_LABEL = 'Search for';
const DEFAULT_SEARCH_TERMS_PLACEHOLDER = 'Enter your search terms here\u2026';
const DEFAULT_SHOW_BOTTOM_SEARCH = true;
const DEFAULT_ANCHOR_TARGET = '_blank';
const DEFAULT_NO_RESULTS_MESSAGE = 'Sorry, no results were found.';
const DEFAULT_MATCH_WORD_START = true;
const DEFAULT_MATCH_WORD_END = false;

function init() {
  const vueApp = document.querySelector('#vueApp');

  mountedApp = Vue.createApp({
    data() {
      return {
        records: [],
        settings: {},
        errorMessage: '',
        pageNumber: 1,
        loadingMessage: 'All searchable records are being loaded\u2026',
        searchTerms: '',
        height: 0,
      };
    },
    watch: {
      searchTerms(newValue) {
        this.pageNumber = 1;

        setTimeout(() => {
          if (this.searchTerms === newValue && this.settings.searchTermsParam) {
            callParent('updateSearchTermsParam', newValue);
          }
        }, 1e3);
      },
      height(newHeight) {
        callParent('updateHeight', newHeight);
      },
      settings(newSettings) {
        document.body.classList[newSettings?.invertedMode ? 'add' : 'remove']('inverted-mode');
      }
    },
    computed: {
      noResultsMessage() {
        return this.settings.noResultsMessage ?? DEFAULT_NO_RESULTS_MESSAGE;
      },
      anchorTarget() {
        return this.settings.anchorTarget ?? DEFAULT_ANCHOR_TARGET;
      },
      showBottomSearch() {
        return this.settings.showBottomSearch ?? DEFAULT_SHOW_BOTTOM_SEARCH;
      },
      searchTermsLabel() {
        return this.settings.searchTermsLabel ?? DEFAULT_SEARCH_TERMS_LABEL;
      },
      searchTermsPlaceholder() {
        return this.settings.searchTermsPlaceholder ?? DEFAULT_SEARCH_TERMS_PLACEHOLDER;
      },
      matchWordStart() {
        return this.settings.matchWordStart ?? DEFAULT_MATCH_WORD_START;
      },
      matchWordEnd() {
        return this.settings.matchWordEnd ?? DEFAULT_MATCH_WORD_END;
      },
      searcher() {
        return new Searcher(this.searchTerms, {
          matchWordStart: this.matchWordStart,
          matchWordEnd: this.matchWordEnd,
        });
      },
      filteredRecords() {
        /** @type {{searcher: Searcher}} */
        const {searcher} = this;

        const results = this.records
          .reduce(
            (records, r, index) => {
              const matches = searcher.matchAll(
                `${r.url ?? ''}\n${r.title ?? ''}\n${r.description ?? ''}\n${r.keywords ?? ''}`
              );
              if (matches.length) {
                records.push({
                  record: r,
                  index,
                  score: [...new Set(matches.map(m => m[0].toUpperCase()))].reduce((score, s) => score + s.length + 1, 0),
                  score2: matches.reduce((score, m) => score + m[0].length, 0),
                });
              }
              return records;
            },
            []
          )
          .sort(
            (a, b) => a.score === b.score
              ? a.score2 === a.score2
                ? a.index - b.index
                : (b.score2 - a.score2)
              : (b.score - a.score)
          )
          .map(({record}) => (record));
        return results;
      },
      isLoading() {
        return !!this.loadingMessage;
      },
      perPage() {
        return this.settings.perPage ?? DEFAULT_PER_PAGE;
      },
      paginationLength() {
        return this.settings.paginationLength ?? DEFAULT_PAGINATION_LENGTH;
      },
      pageRecords() {
        const startIndex = this.pageRecordsStartIndex;
        return this.filteredRecords.slice(startIndex, startIndex + this.perPage);
      },
      pageRecordsStartIndex() {
        return (this.pageNumber - 1) * this.perPage;
      },
      pageCount() {
        return Math.ceil(this.filteredRecords.length / this.perPage);
      },
      pagination() {
        return paginate(this.pageNumber, this.pageCount, this.paginationLength);
      },
      title() {
        if (this.settings.title) {
          document.title = `${this.settings.title} \u2013 \u{1F50D} Lupa`;
          return this.settings.title;
        }
        return document.title;
      },
      description() {
        return this.settings.description
          ?? document.querySelector('meta[name="description"]')?.getAttribute('content');
      }
    },
    methods: {
      updateHeight() {
        const style = window.getComputedStyle(vueApp);
        this.height = parseFloat(style.height)
          + parseFloat(style.marginTop)
          + parseFloat(style.marginBottom);
      }
    },
    mounted() {
      this.updateHeight();
      ['orientationchange', 'resize'].forEach(n => addEventListener(n, this.updateHeight));
    },
    updated() {
      this.updateHeight();
    }
  }).mount(vueApp);
}

function updateSearchTerms(searchTerms) {
  mountedApp.searchTerms = searchTerms;
}

/**
 * @param {number} page
 *   Selected page number.
 * @param {number} pageCount
 *   Number of total pages.
 * @param {number} paginationLength
 *   Number of page numbers to show in the pagination container.
 * @returns {{number: number, isSelected: boolean, isBoundary: boolean}[]}
 *   An array of the pagination numbers to show.
 */
function paginate(page, pageCount, paginationLength) {
  var minPage = Math.max(1, Math.min(Math.floor(page), pageCount));
  var maxPage = minPage;
  var pagination = [{
    number: minPage,
    isSelected: true,
    isBoundary: minPage === 1 || maxPage === pageCount
  }];
  var maxIter = paginationLength * 2;
  for (var iter = 2; pagination.length < paginationLength && iter++ < maxIter; ) {
    if (iter % 2 === 0 && 1 < minPage) {
      --minPage;
      pagination.unshift({
        number: minPage,
        isSelected: false,
        isBoundary: minPage === 1
      });
    }
    if (iter % 2 === 1 && maxPage < pageCount) {
      ++maxPage;
      pagination.push({
        number: maxPage,
        isSelected: false,
        isBoundary: maxPage === pageCount
      });
    }
  }
  return pagination;
}

class Searcher {
  /** @type {string} */
  #terms;
  /** @type {boolean} */
  #matchWordStart;
  /** @type {boolean} */
  #matchWordEnd;
  /** @type {RegExp} */
  #rgxFullNeg;
  /** @type {RegExp} */
  #rgxFullPos;
  /** @type {RegExp} */
  #rgxPartial;

  /**
   * @param {string} terms
   * @param {object} options
   * @param {?boolean=} options.matchWordStart
   *   Optional.  Defaults to `true`.
   * @param {?boolean=} options.matchWordEnd
   *   Optional.  Defaults to `false`.
   */
  constructor(terms, options) {
    this.#terms = terms ?? '';
    options = Object(options);
    this.#matchWordStart = options.matchWordStart !== false;
    this.#matchWordEnd = !!options.matchWordEnd;
    this.#updateRegExps();
  }

  #updateRegExps() {
    this.#rgxFullNeg = null;
    this.#rgxFullPos = null;
    this.#rgxPartial = null;

    let nonModdedTargets = [];
    let plusTargets = [];
    let minusTargets = [];

    for (let match, rgx = /([-+])?("([^"]*)"|\S+)/g; match = rgx.exec(this.#terms.trim()); ) {
      let target = (match[3] == null ? match[2] : match[3]).replace(
        /^(?=([\p{L}\p{N}]))|(?<=([\p{L}\p{N}]))$|\\(.)|(\s?\*\s?)|(\s+)|[.+?^$\[\]\\{}()|]/gu,
        (m, startWithWord, endsWithWord, escapedChar, asterisk, whitespace, index, target) => {
          if (startWithWord) {
            return this.#matchWordStart ? '(?<!\\p{L}|\\p{N})' : '';
          }
          if (endsWithWord) {
            return this.#matchWordEnd ? '(?!\\p{L}|\\p{N})' : '';
          }
          if (whitespace) {
            return '\\s+';
          }
          if (!asterisk) {
            return '\\' + (escapedChar || m);
          }
          let multipleMod = match[3] ? '(\\s+\\S+)*' : '';
          let isStarter = index == 0 || asterisk.charAt(0) !== '*';
          let isFinisher = index + 1 === target.length || asterisk.slice(-1) !== '*';
          return isStarter
            ? '(?:\\s|)\\S+' + multipleMod + (isFinisher ? '' : '(?:\\s|$)')
            : '\\S*';
        }
      );
      let mod = match[1];
      (mod !== '+' ? mod === '-' ? minusTargets : nonModdedTargets : plusTargets).push(target);
    }

    if (plusTargets.length + nonModdedTargets.length === 0) {
      nonModdedTargets.push('^');
    }

    if (minusTargets.length) {
      this.#rgxFullNeg = new RegExp(minusTargets.join('|'), 'iu');
    }

    if (plusTargets.length) {
      this.#rgxFullPos = new RegExp(plusTargets.map(t => `(?=^[^]*${t})`).join(''), 'iu');
    }

    this.#rgxPartial = new RegExp([...nonModdedTargets, ...plusTargets].join('|'), 'giu');
  }

  set matchWordStart(matchWordStart) {
    this.#matchWordStart = matchWordStart;
    this.#updateRegExps();
  }
  get matchWordStart() {
    return this.#matchWordStart;
  }

  set matchWordEnd(matchWordEnd) {
    this.#matchWordEnd = matchWordEnd;
    this.#updateRegExps();
  }
  get matchWordEnd() {
    return this.#matchWordEnd;
  }

  set terms(terms) {
    this.#terms = terms ?? '';
    this.#updateRegExps();
  }
  get terms() {
    return this.#terms;
  }

  /**
   * @param {string} value
   * @returns {boolean}
   */
  test(value) {
    return this.#rgxFullNeg?.test(value)
      ? false
      : this.#rgxFullPos?.test(value) === false
        ? false
        : this.#rgxPartial.test(value);
  }

  /**
   * @param {string} value
   * @returns {RegExpMatchArray[]}
   */
  matchAll(value) {
    return (!this.#rgxFullNeg?.test(value) && this.#rgxFullPos?.test(value) !== false)
      ? [...value.matchAll(this.#rgxPartial)]
      : [];
  }
}

function setData({records, settings}) {
  mountedApp.records = records;
  mountedApp.settings = settings;
  mountedApp.loadingMessage = '';
}
