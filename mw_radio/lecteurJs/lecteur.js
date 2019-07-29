
(function (window, _undefined) {

    "use strict";

    var soundManager = null;

    /**
     * The SoundManager constructor.
     *
     * @constructor
     * @param {string} smURL Optional: Path to SWF files
     * @param {string} smID Optional: The ID to use for the SWF container element
     * @this {SoundManager}
     * @return {SoundManager} The new SoundManager instance
     */

    function SoundManager(smURL, smID) {

        /**
         * soundManager configuration options list
         * defines top-level configuration properties to be applied to the soundManager instance (eg. soundManager.flashVersion)
         * to set these properties, use the setup() method - eg., soundManager.setup({url: '/swf/', flashVersion: 9})
         */

        this.setupOptions = {

            'url': (smURL || null),             // path (directory) where SoundManager 2 SWFs exist, eg., /path/to/swfs/
            'flashVersion': 8,                  // flash build to use (8 or 9.) Some API features require 9.
            'debugMode': true,                  // enable debugging output (console.log() with HTML fallback)
            'debugFlash': false,                // enable debugging output inside SWF, troubleshoot Flash/browser issues
            'useConsole': true,                 // use console.log() if available (otherwise, writes to #soundmanager-debug element)
            'consoleOnly': true,                // if console is being used, do not create/write to #soundmanager-debug
            'waitForWindowLoad': false,         // force SM2 to wait for window.onload() before trying to call soundManager.onload()
            'bgColor': '#ffffff',               // SWF background color. N/A when wmode = 'transparent'
            'useHighPerformance': false,        // position:fixed flash movie can help increase js/flash speed, minimize lag
            'flashPollingInterval': null,       // msec affecting whileplaying/loading callback frequency. If null, default of 50 msec is used.
            'html5PollingInterval': null,       // msec affecting whileplaying() for HTML5 audio, excluding mobile devices. If null, native HTML5 update events are used.
            'flashLoadTimeout': 1000,           // msec to wait for flash movie to load before failing (0 = infinity)
            'wmode': null,                      // flash rendering mode - null, 'transparent', or 'opaque' (last two allow z-index to work)
            'allowScriptAccess': 'always',      // for scripting the SWF (object/embed property), 'always' or 'sameDomain'
            'useFlashBlock': false,             // *requires flashblock.css, see demos* - allow recovery from flash blockers. Wait indefinitely and apply timeout CSS to SWF, if applicable.
            'useHTML5Audio': true,              // use HTML5 Audio() where API is supported (most Safari, Chrome versions), Firefox (no MP3/MP4.) Ideally, transparent vs. Flash API where possible.
            'html5Test': /^(probably|maybe)$/i, // HTML5 Audio() format support test. Use /^probably$/i; if you want to be more conservative.
            'preferFlash': true,                // overrides useHTML5audio. if true and flash support present, will try to use flash for MP3/MP4 as needed since HTML5 audio support is still quirky in browsers.
            'noSWFCache': false                 // if true, appends ?ts={date} to break aggressive SWF caching.

        };

        this.defaultOptions = {

            /**
             * the default configuration for sound objects made with createSound() and related methods
             * eg., volume, auto-load behaviour and so forth
             */

            'autoLoad': false,        // enable automatic loading (otherwise .load() will be called on demand with .play(), the latter being nicer on bandwidth - if you want to .load yourself, you also can)
            'autoPlay': false,        // enable playing of file as soon as possible (much faster if "stream" is true)
            'from': null,             // position to start playback within a sound (msec), default = beginning
            'loops': 1,               // how many times to repeat the sound (position will wrap around to 0, setPosition() will break out of loop when >0)
            'onid3': null,            // callback function for "ID3 data is added/available"
            'onload': null,           // callback function for "load finished"
            'whileloading': null,     // callback function for "download progress update" (X of Y bytes received)
            'onplay': null,           // callback for "play" start
            'onpause': null,          // callback for "pause"
            'onresume': null,         // callback for "resume" (pause toggle)
            'whileplaying': null,     // callback during play (position update)
            'onposition': null,       // object containing times and function callbacks for positions of interest
            'onstop': null,           // callback for "user stop"
            'onfailure': null,        // callback function for when playing fails
            'onfinish': null,         // callback function for "sound finished playing"
            'multiShot': true,        // let sounds "restart" or layer on top of each other when played multiple times, rather than one-shot/one at a time
            'multiShotEvents': false, // fire multiple sound events (currently onfinish() only) when multiShot is enabled
            'position': null,         // offset (milliseconds) to seek to within loaded sound data.
            'pan': 0,                 // "pan" settings, left-to-right, -100 to 100
            'stream': true,           // allows playing before entire file has loaded (recommended)
            'to': null,               // position to end playback within a sound (msec), default = end
            'type': null,             // MIME-like hint for file pattern / canPlay() tests, eg. audio/mp3
            'usePolicyFile': false,   // enable crossdomain.xml request for audio on remote domains (for ID3/waveform access)
            'volume': 100             // self-explanatory. 0-100, the latter being the max.

        };

        this.flash9Options = {

            /**
             * flash 9-only options,
             * merged into defaultOptions if flash 9 is being used
             */

            'isMovieStar': null,      // "MovieStar" MPEG4 audio mode. Null (default) = auto detect MP4, AAC etc. based on URL. true = force on, ignore URL
            'usePeakData': false,     // enable left/right channel peak (level) data
            'useWaveformData': false, // enable sound spectrum (raw waveform data) - NOTE: May increase CPU load.
            'useEQData': false,       // enable sound EQ (frequency spectrum data) - NOTE: May increase CPU load.
            'onbufferchange': null,   // callback for "isBuffering" property change
            'ondataerror': null       // callback for waveform/eq data access error (flash playing audio in other tabs/domains)

        };

        this.movieStarOptions = {

            /**
             * flash 9.0r115+ MPEG4 audio options,
             * merged into defaultOptions if flash 9+movieStar mode is enabled
             */

            'bufferTime': 3,          // seconds of data to buffer before playback begins (null = flash default of 0.1 seconds - if AAC playback is gappy, try increasing.)
            'serverURL': null,        // rtmp: FMS or FMIS server to connect to, required when requesting media via RTMP or one of its variants
            'onconnect': null,        // rtmp: callback for connection to flash media server
            'duration': null          // rtmp: song duration (msec)

        };

        this.audioFormats = {

            /**
             * determines HTML5 support + flash requirements.
             * if no support (via flash and/or HTML5) for a "required" format, SM2 will fail to start.
             * flash fallback is used for MP3 or MP4 if HTML5 can't play it (or if preferFlash = true)
             */

            'mp3': {
                'type': ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust'],
                'required': true
            },

            'mp4': {
                'related': ['aac', 'm4a', 'm4b'], // additional formats under the MP4 container
                'type': ['audio/mp4; codecs="mp4a.40.2"', 'audio/aac', 'audio/x-m4a', 'audio/MP4A-LATM', 'audio/mpeg4-generic'],
                'required': false
            },

            'ogg': {
                'type': ['audio/ogg; codecs=vorbis'],
                'required': false
            },

            'wav': {
                'type': ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav'],
                'required': false
            }

        };

        // HTML attributes (id + class names) for the SWF container

        this.movieID = 'sm2-container';
        this.id = (smID || 'sm2movie');

        this.debugID = 'soundmanager-debug';
        this.debugURLParam = /([#?&])debug=1/i;

        // dynamic attributes

        this.versionNumber = 'V2.97a.20130101';
        this.version = null;
        this.movieURL = null;
        this.altURL = null;
        this.swfLoaded = false;
        this.enabled = false;
        this.oMC = null;
        this.sounds = {};
        this.soundIDs = [];
        this.muted = false;
        this.didFlashBlock = false;
        this.filePattern = null;

        this.filePatterns = {

            'flash8': /\.mp3(\?.*)?$/i,
            'flash9': /\.mp3(\?.*)?$/i

        };

        // support indicators, set at init

        this.features = {

            'buffering': false,
            'peakData': false,
            'waveformData': false,
            'eqData': false,
            'movieStar': false

        };

        // flash sandbox info, used primarily in troubleshooting

        this.sandbox = {

            // <d>
            'type': null,
            'types': {
                'remote': 'remote (domain-based) rules',
                'localWithFile': 'local with file access (no internet access)',
                'localWithNetwork': 'local with network (internet access only, no local access)',
                'localTrusted': 'local, trusted (local+internet access)'
            },
            'description': null,
            'noRemote': null,
            'noLocal': null
            // </d>

        };

        /**
         * format support (html5/flash)
         * stores canPlayType() results based on audioFormats.
         * eg. { mp3: boolean, mp4: boolean }
         * treat as read-only.
         */

        this.html5 = {
            'usingFlash': null // set if/when flash fallback is needed
        };

        // file type support hash
        this.flash = {};

        // determined at init time
        this.html5Only = false;

        // used for special cases (eg. iPad/iPhone/palm OS?)
        this.ignoreFlash = false;

        /**
         * a few private internals (OK, a lot. :D)
         */

        var SMSound,
            sm2 = this, globalHTML5Audio = null, flash = null, sm = 'soundManager', smc = sm + ': ', h5 = 'HTML5::', id, ua = navigator.userAgent, wl = window.location.href.toString(), doc = document, doNothing, setProperties, init, fV, on_queue = [], debugOpen = true, debugTS, didAppend = false, appendSuccess = false, didInit = false, disabled = false, windowLoaded = false, _wDS, wdCount = 0, initComplete, mixin, assign, extraOptions, addOnEvent, processOnEvents, initUserOnload, delayWaitForEI, waitForEI, setVersionInfo, handleFocus, strings, initMovie, preInit, domContentLoaded, winOnLoad, didDCLoaded, getDocument, createMovie, catchError, setPolling, initDebug, debugLevels = ['log', 'info', 'warn', 'error'], defaultFlashVersion = 8, disableObject, failSafely, normalizeMovieURL, oRemoved = null, oRemovedHTML = null, str, flashBlockHandler, getSWFCSS, swfCSS, toggleDebug, loopFix, policyFix, complain, idCheck, waitingForEI = false, initPending = false, startTimer, stopTimer, timerExecute, h5TimerCount = 0, h5IntervalTimer = null, parseURL, messages = [],
            needsFlash = null, featureCheck, html5OK, html5CanPlay, html5Ext, html5Unload, domContentLoadedIE, testHTML5, event, slice = Array.prototype.slice, useGlobalHTML5Audio = false, lastGlobalHTML5URL, hasFlash, detectFlash, badSafariFix, html5_events, showSupport, flushMessages,
            is_iDevice = ua.match(/(ipad|iphone|ipod)/i), isAndroid = ua.match(/android/i), isIE = ua.match(/msie/i), isWebkit = ua.match(/webkit/i), isSafari = (ua.match(/safari/i) && !ua.match(/chrome/i)), isOpera = (ua.match(/opera/i)),
            mobileHTML5 = (ua.match(/(mobile|pre\/|xoom)/i) || is_iDevice || isAndroid),
            isBadSafari = (!wl.match(/usehtml5audio/i) && !wl.match(/sm2\-ignorebadua/i) && isSafari && !ua.match(/silk/i) && ua.match(/OS X 10_6_([3-7])/i)), // Safari 4 and 5 (excluding Kindle Fire, "Silk") occasionally fail to load/play HTML5 audio on Snow Leopard 10.6.3 through 10.6.7 due to bug(s) in QuickTime X and/or other underlying frameworks. :/ Confirmed bug. https://bugs.webkit.org/show_bug.cgi?id=32159
            hasConsole = (window.console !== _undefined && console.log !== _undefined), isFocused = (doc.hasFocus !== _undefined ? doc.hasFocus() : null), tryInitOnFocus = (isSafari && (doc.hasFocus === _undefined || !doc.hasFocus())), okToDisable = !tryInitOnFocus, flashMIME = /(mp3|mp4|mpa|m4a|m4b)/i,
            emptyURL = 'about:blank', // safe URL to unload, or load nothing from (flash 8 + most HTML5 UAs)
            overHTTP = (doc.location ? doc.location.protocol.match(/http/i) : null),
            http = (!overHTTP ? 'http:/' + '/' : ''),
            // mp3, mp4, aac etc.
            netStreamMimeTypes = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,
            // Flash v9.0r115+ "moviestar" formats
            netStreamTypes = ['mpeg4', 'aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'm4b', 'mp4v', '3gp', '3g2'],
            netStreamPattern = new RegExp('\\.(' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');

        this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i; // default mp3 set

        // use altURL if not "online"
        this.useAltURL = !overHTTP;

        swfCSS = {

            'swfBox': 'sm2-object-box',
            'swfDefault': 'movieContainer',
            'swfError': 'swf_error', // SWF loaded, but SM2 couldn't start (other error)
            'swfTimedout': 'swf_timedout',
            'swfLoaded': 'swf_loaded',
            'swfUnblocked': 'swf_unblocked', // or loaded OK
            'sm2Debug': 'sm2_debug',
            'highPerf': 'high_performance',
            'flashDebug': 'flash_debug'

        };

        /**
         * basic HTML5 Audio() support test
         * try...catch because of IE 9 "not implemented" nonsense
         * https://github.com/Modernizr/Modernizr/issues/224
         */

        this.hasHTML5 = (function () {
            try {
                // new Audio(null) for stupid Opera 9.64 case, which throws not_enough_arguments exception otherwise.
                return (Audio !== _undefined && (isOpera && opera !== _undefined && opera.version() < 10 ? new Audio(null) : new Audio()).canPlayType !== _undefined);
            } catch (e) {
                return false;
            }
        }());

        /**
         * Public SoundManager API
         * -----------------------
         */

        /**
         * Configures top-level soundManager properties.
         *
         * @param {object} options Option parameters, eg. { flashVersion: 9, url: '/path/to/swfs/' }
         * onready and ontimeout are also accepted parameters. call soundManager.setup() to see the full list.
         */

        this.setup = function (options) {

            var noURL = (!sm2.url);

            // warn if flash options have already been applied

            if (options !== _undefined && didInit && needsFlash && sm2.ok() && (options.flashVersion !== _undefined || options.url !== _undefined || options.html5Test !== _undefined)) {
                complain(str('setupLate'));
            }

            // TODO: defer: true?

            assign(options);

            // special case 1: "Late setup". SM2 loaded normally, but user didn't assign flash URL eg., setup({url:...}) before SM2 init. Treat as delayed init.

            if (noURL && didDCLoaded && options.url !== _undefined) {
                sm2.beginDelayedInit();
            }

            // special case 2: If lazy-loading SM2 (DOMContentLoaded has already happened) and user calls setup() with url: parameter, try to init ASAP.

            if (!didDCLoaded && options.url !== _undefined && doc.readyState === 'complete') {
                setTimeout(domContentLoaded, 1);
            }

            return sm2;

        };

        this.ok = function () {

            return (needsFlash ? (didInit && !disabled) : (sm2.useHTML5Audio && sm2.hasHTML5));

        };

        this.supported = this.ok; // legacy

        this.getMovie = function (smID) {

            // safety net: some old browsers differ on SWF references, possibly related to ExternalInterface / flash version
            return id(smID) || doc[smID] || window[smID];

        };

        /**
         * Creates a SMSound sound object instance.
         *
         * @param {object} oOptions Sound options (at minimum, id and url parameters are required.)
         * @return {object} SMSound The new SMSound object.
         */

        this.createSound = function (oOptions, _url) {

            var cs, cs_string, options, oSound = null;

            // <d>
            cs = sm + '.createSound(): ';
            cs_string = cs + str(!didInit ? 'notReady' : 'notOK');
            // </d>

            if (!didInit || !sm2.ok()) {
                complain(cs_string);
                return false;
            }

            if (_url !== _undefined) {
                // function overloading in JS! :) ..assume simple createSound(id,url) use case
                oOptions = {
                    'id': oOptions,
                    'url': _url
                };
            }

            // inherit from defaultOptions
            options = mixin(oOptions);

            options.url = parseURL(options.url);

            // <d>
            if (options.id.toString().charAt(0).match(/^[0-9]$/)) {
                sm2._wD(cs + str('badID', options.id), 2);
            }

            sm2._wD(cs + options.id + ' (' + options.url + ')', 1);
            // </d>

            if (idCheck(options.id, true)) {
                sm2._wD(cs + options.id + ' exists', 1);
                return sm2.sounds[options.id];
            }

            function make() {

                options = loopFix(options);
                sm2.sounds[options.id] = new SMSound(options);
                sm2.soundIDs.push(options.id);
                return sm2.sounds[options.id];

            }

            if (html5OK(options)) {

                oSound = make();
                sm2._wD(options.id + ': Using HTML5');
                oSound._setup_html5(options);

            } else {

                if (fV > 8) {
                    if (options.isMovieStar === null) {
                        // attempt to detect MPEG-4 formats
                        options.isMovieStar = !!(options.serverURL || (options.type ? options.type.match(netStreamMimeTypes) : false) || options.url.match(netStreamPattern));
                    }
                    // <d>
                    if (options.isMovieStar) {
                        sm2._wD(cs + 'using MovieStar handling');
                        if (options.loops > 1) {
                            _wDS('noNSLoop');
                        }
                    }
                    // </d>
                }

                options = policyFix(options, cs);
                oSound = make();

                if (fV === 8) {
                    flash._createSound(options.id, options.loops || 1, options.usePolicyFile);
                } else {
                    flash._createSound(options.id, options.url, options.usePeakData, options.useWaveformData, options.useEQData, options.isMovieStar, (options.isMovieStar ? options.bufferTime : false), options.loops || 1, options.serverURL, options.duration || null, options.autoPlay, true, options.autoLoad, options.usePolicyFile);
                    if (!options.serverURL) {
                        // We are connected immediately
                        oSound.connected = true;
                        if (options.onconnect) {
                            options.onconnect.apply(oSound);
                        }
                    }
                }

                if (!options.serverURL && (options.autoLoad || options.autoPlay)) {
                    // call load for non-rtmp streams
                    oSound.load(options);
                }

            }

            // rtmp will play in onconnect
            if (!options.serverURL && options.autoPlay) {
                oSound.play();
            }

            return oSound;

        };

        /**
         * Destroys a SMSound sound object instance.
         *
         * @param {string} sID The ID of the sound to destroy
         */

        this.destroySound = function (sID, _bFromSound) {

            // explicitly destroy a sound before normal page unload, etc.

            if (!idCheck(sID)) {
                return false;
            }

            var oS = sm2.sounds[sID], i;

            // Disable all callbacks while the sound is being destroyed
            oS._iO = {};

            oS.stop();
            oS.unload();

            for (i = 0; i < sm2.soundIDs.length; i++) {
                if (sm2.soundIDs[i] === sID) {
                    sm2.soundIDs.splice(i, 1);
                    break;
                }
            }

            if (!_bFromSound) {
                // ignore if being called from SMSound instance
                oS.destruct(true);
            }

            oS = null;
            delete sm2.sounds[sID];

            return true;

        };

        /**
         * Calls the load() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @param {object} oOptions Optional: Sound options
         */

        this.load = function (sID, oOptions) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].load(oOptions);

        };

        /**
         * Calls the unload() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         */

        this.unload = function (sID) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].unload();

        };

        /**
         * Calls the onPosition() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @param {number} nPosition The position to watch for
         * @param {function} oMethod The relevant callback to fire
         * @param {object} oScope Optional: The scope to apply the callback to
         * @return {SMSound} The SMSound object
         */

        this.onPosition = function (sID, nPosition, oMethod, oScope) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].onposition(nPosition, oMethod, oScope);

        };

        // legacy/backwards-compability: lower-case method name
        this.onposition = this.onPosition;

        /**
         * Calls the clearOnPosition() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @param {number} nPosition The position to watch for
         * @param {function} oMethod Optional: The relevant callback to fire
         * @return {SMSound} The SMSound object
         */

        this.clearOnPosition = function (sID, nPosition, oMethod) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].clearOnPosition(nPosition, oMethod);

        };

        /**
         * Calls the play() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @param {object} oOptions Optional: Sound options
         * @return {SMSound} The SMSound object
         */

        this.play = function (sID, oOptions) {

            var result = false;

            if (!didInit || !sm2.ok()) {
                complain(sm + '.play(): ' + str(!didInit ? 'notReady' : 'notOK'));
                return result;
            }

            if (!idCheck(sID)) {
                if (!(oOptions instanceof Object)) {
                    // overloading use case: play('mySound','/path/to/some.mp3');
                    oOptions = {
                        url: oOptions
                    };
                }
                if (oOptions && oOptions.url) {
                    // overloading use case, create+play: .play('someID',{url:'/path/to.mp3'});
                    sm2._wD(sm + '.play(): attempting to create "' + sID + '"', 1);
                    oOptions.id = sID;
                    result = sm2.createSound(oOptions).play();
                }
                return result;
            }

            return sm2.sounds[sID].play(oOptions);

        };

        this.start = this.play; // just for convenience

        /**
         * Calls the setPosition() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @param {number} nMsecOffset Position (milliseconds)
         * @return {SMSound} The SMSound object
         */

        this.setPosition = function (sID, nMsecOffset) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].setPosition(nMsecOffset);

        };

        /**
         * Calls the stop() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @return {SMSound} The SMSound object
         */

        this.stop = function (sID) {

            if (!idCheck(sID)) {
                return false;
            }

            sm2._wD(sm + '.stop(' + sID + ')', 1);
            return sm2.sounds[sID].stop();

        };

        /**
         * Stops all currently-playing sounds.
         */

        this.stopAll = function () {

            var oSound;
            sm2._wD(sm + '.stopAll()', 1);

            for (oSound in sm2.sounds) {
                if (sm2.sounds.hasOwnProperty(oSound)) {
                    // apply only to sound objects
                    sm2.sounds[oSound].stop();
                }
            }

        };

        /**
         * Calls the pause() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @return {SMSound} The SMSound object
         */

        this.pause = function (sID) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].pause();

        };

        /**
         * Pauses all currently-playing sounds.
         */

        this.pauseAll = function () {

            var i;
            for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
                sm2.sounds[sm2.soundIDs[i]].pause();
            }

        };

        /**
         * Calls the resume() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @return {SMSound} The SMSound object
         */

        this.resume = function (sID) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].resume();

        };

        /**
         * Resumes all currently-paused sounds.
         */

        this.resumeAll = function () {

            var i;
            for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
                sm2.sounds[sm2.soundIDs[i]].resume();
            }

        };

        /**
         * Calls the togglePause() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @return {SMSound} The SMSound object
         */

        this.togglePause = function (sID) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].togglePause();

        };

        /**
         * Calls the setPan() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @param {number} nPan The pan value (-100 to 100)
         * @return {SMSound} The SMSound object
         */

        this.setPan = function (sID, nPan) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].setPan(nPan);

        };

        /**
         * Calls the setVolume() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @param {number} nVol The volume value (0 to 100)
         * @return {SMSound} The SMSound object
         */

        this.setVolume = function (sID, nVol) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].setVolume(nVol);

        };

        /**
         * Calls the mute() method of either a single SMSound object by ID, or all sound objects.
         *
         * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
         */

        this.mute = function (sID) {

            var i = 0;

            if (sID instanceof String) {
                sID = null;
            }

            if (!sID) {

                sm2._wD(sm + '.mute(): Muting all sounds');
                for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
                    sm2.sounds[sm2.soundIDs[i]].mute();
                }
                sm2.muted = true;

            } else {

                if (!idCheck(sID)) {
                    return false;
                }
                sm2._wD(sm + '.mute(): Muting "' + sID + '"');
                return sm2.sounds[sID].mute();

            }

            return true;

        };

        /**
         * Mutes all sounds.
         */

        this.muteAll = function () {

            sm2.mute();

        };

        /**
         * Calls the unmute() method of either a single SMSound object by ID, or all sound objects.
         *
         * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
         */

        this.unmute = function (sID) {

            var i;

            if (sID instanceof String) {
                sID = null;
            }

            if (!sID) {

                sm2._wD(sm + '.unmute(): Unmuting all sounds');
                for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
                    sm2.sounds[sm2.soundIDs[i]].unmute();
                }
                sm2.muted = false;

            } else {

                if (!idCheck(sID)) {
                    return false;
                }
                sm2._wD(sm + '.unmute(): Unmuting "' + sID + '"');
                return sm2.sounds[sID].unmute();

            }

            return true;

        };

        /**
         * Unmutes all sounds.
         */

        this.unmuteAll = function () {

            sm2.unmute();

        };

        /**
         * Calls the toggleMute() method of a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @return {SMSound} The SMSound object
         */

        this.toggleMute = function (sID) {

            if (!idCheck(sID)) {
                return false;
            }
            return sm2.sounds[sID].toggleMute();

        };

        /**
         * Retrieves the memory used by the flash plugin.
         *
         * @return {number} The amount of memory in use
         */

        this.getMemoryUse = function () {

            // flash-only
            var ram = 0;

            if (flash && fV !== 8) {
                ram = parseInt(flash._getMemoryUse(), 10);
            }

            return ram;

        };

        /**
         * Undocumented: NOPs soundManager and all SMSound objects.
         */

        this.disable = function (bNoDisable) {

            // destroy all functions
            var i;

            if (bNoDisable === _undefined) {
                bNoDisable = false;
            }

            if (disabled) {
                return false;
            }

            disabled = true;
            _wDS('shutdown', 1);

            for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
                disableObject(sm2.sounds[sm2.soundIDs[i]]);
            }

            // fire "complete", despite fail
            initComplete(bNoDisable);
            event.remove(window, 'load', initUserOnload);

            return true;

        };

        /**
         * Determines playability of a MIME type, eg. 'audio/mp3'.
         */

        this.canPlayMIME = function (sMIME) {

            var result;

            if (sm2.hasHTML5) {
                result = html5CanPlay({ type: sMIME });
            }

            if (!result && needsFlash) {
                // if flash 9, test netStream (movieStar) types as well.
                result = (sMIME && sm2.ok() ? !!((fV > 8 ? sMIME.match(netStreamMimeTypes) : null) || sMIME.match(sm2.mimePattern)) : null);
            }

            return result;

        };

        /**
         * Determines playability of a URL based on audio support.
         *
         * @param {string} sURL The URL to test
         * @return {boolean} URL playability
         */

        this.canPlayURL = function (sURL) {

            var result;

            if (sm2.hasHTML5) {
                result = html5CanPlay({ url: sURL });
            }

            if (!result && needsFlash) {
                result = (sURL && sm2.ok() ? !!(sURL.match(sm2.filePattern)) : null);
            }

            return result;

        };

        /**
         * Determines playability of an HTML DOM &lt;a&gt; object (or similar object literal) based on audio support.
         *
         * @param {object} oLink an HTML DOM &lt;a&gt; object or object literal including href and/or type attributes
         * @return {boolean} URL playability
         */

        this.canPlayLink = function (oLink) {

            if (oLink.type !== _undefined && oLink.type) {
                if (sm2.canPlayMIME(oLink.type)) {
                    return true;
                }
            }

            return sm2.canPlayURL(oLink.href);

        };

        /**
         * Retrieves a SMSound object by ID.
         *
         * @param {string} sID The ID of the sound
         * @return {SMSound} The SMSound object
         */

        this.getSoundById = function (sID, _suppressDebug) {

            if (!sID) {
                throw new Error(sm + '.getSoundById(): sID is null/_undefined');
            }

            var result = sm2.sounds[sID];

            // <d>
            if (!result && !_suppressDebug) {
                sm2._wD('"' + sID + '" is an invalid sound ID.', 2);
            }
            // </d>

            return result;

        };

        /**
         * Queues a callback for execution when SoundManager has successfully initialized.
         *
         * @param {function} oMethod The callback method to fire
         * @param {object} oScope Optional: The scope to apply to the callback
         */

        this.onready = function (oMethod, oScope) {

            var sType = 'onready',
                result = false;

            if (typeof oMethod === 'function') {

                // <d>
                if (didInit) {
                    sm2._wD(str('queue', sType));
                }
                // </d>

                if (!oScope) {
                    oScope = window;
                }

                addOnEvent(sType, oMethod, oScope);
                processOnEvents();

                result = true;

            } else {

                throw str('needFunction', sType);

            }

            return result;

        };

        /**
         * Queues a callback for execution when SoundManager has failed to initialize.
         *
         * @param {function} oMethod The callback method to fire
         * @param {object} oScope Optional: The scope to apply to the callback
         */

        this.ontimeout = function (oMethod, oScope) {

            var sType = 'ontimeout',
                result = false;

            if (typeof oMethod === 'function') {

                // <d>
                if (didInit) {
                    sm2._wD(str('queue', sType));
                }
                // </d>

                if (!oScope) {
                    oScope = window;
                }

                addOnEvent(sType, oMethod, oScope);
                processOnEvents({ type: sType });

                result = true;

            } else {

                throw str('needFunction', sType);

            }

            return result;

        };

        /**
         * Writes console.log()-style debug output to a console or in-browser element.
         * Applies when debugMode = true
         *
         * @param {string} sText The console message
         * @param {object} sType Optional string: Log type of 'info', 'warn' or 'error', or object (to be dumped)
         */

        this._writeDebug = function (sText, sType) {

            // pseudo-private console.log()-style output
            // <d>

            var sDID = 'soundmanager-debug', o, oItem;

            if (!sm2.debugMode) {
                return false;
            }

            if (hasConsole && sm2.useConsole) {
                if (sType && typeof sType === 'object') {
                    // object passed; dump to console.
                    console.log(sText, sType);
                } else if (debugLevels[sType] !== _undefined) {
                    console[debugLevels[sType]](sText);
                } else {
                    console.log(sText);
                }
                if (sm2.consoleOnly) {
                    return true;
                }
            }

            o = id(sDID);

            if (!o) {
                return false;
            }

            oItem = doc.createElement('div');

            if (++wdCount % 2 === 0) {
                oItem.className = 'sm2-alt';
            }

            if (sType === _undefined) {
                sType = 0;
            } else {
                sType = parseInt(sType, 10);
            }

            oItem.appendChild(doc.createTextNode(sText));

            if (sType) {
                if (sType >= 2) {
                    oItem.style.fontWeight = 'bold';
                }
                if (sType === 3) {
                    oItem.style.color = '#ff3333';
                }
            }

            // top-to-bottom
            // o.appendChild(oItem);

            // bottom-to-top
            o.insertBefore(oItem, o.firstChild);

            o = null;
            // </d>

            return true;

        };

        // <d>
        // last-resort debugging option
        if (wl.indexOf('sm2-debug=alert') !== -1) {
            this._writeDebug = function (sText) {
                window.alert(sText);
            };
        }
        // </d>

        // alias
        this._wD = this._writeDebug;

        /**
         * Provides debug / state information on all SMSound objects.
         */

        this._debug = function () {

            // <d>
            var i, j;
            _wDS('currentObj', 1);

            for (i = 0, j = sm2.soundIDs.length; i < j; i++) {
                sm2.sounds[sm2.soundIDs[i]]._debug();
            }
            // </d>

        };

        /**
         * Restarts and re-initializes the SoundManager instance.
         *
         * @param {boolean} resetEvents Optional: When true, removes all registered onready and ontimeout event callbacks.
         * @param {boolean} excludeInit Options: When true, does not call beginDelayedInit() (which would restart SM2).
         * @return {object} soundManager The soundManager instance.
         */

        this.reboot = function (resetEvents, excludeInit) {

            // reset some (or all) state, and re-init unless otherwise specified.

            // <d>
            if (sm2.soundIDs.length) {
                sm2._wD('Destroying ' + sm2.soundIDs.length + ' SMSound objects...');
            }
            // </d>

            var i, j, k;

            for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
                sm2.sounds[sm2.soundIDs[i]].destruct();
            }

            // trash ze flash

            if (flash) {

                try {

                    if (isIE) {
                        oRemovedHTML = flash.innerHTML;
                    }

                    oRemoved = flash.parentNode.removeChild(flash);

                    _wDS('flRemoved');

                } catch (e) {

                    // Remove failed? May be due to flash blockers silently removing the SWF object/embed node from the DOM. Warn and continue.

                    _wDS('badRemove', 2);

                }

            }

            // actually, force recreate of movie.

            oRemovedHTML = oRemoved = needsFlash = flash = null;

            sm2.enabled = didDCLoaded = didInit = waitingForEI = initPending = didAppend = appendSuccess = disabled = useGlobalHTML5Audio = sm2.swfLoaded = false;

            sm2.soundIDs = [];
            sm2.sounds = {};

            if (!resetEvents) {
                // reset callbacks for onready, ontimeout etc. so that they will fire again on re-init
                for (i in on_queue) {
                    if (on_queue.hasOwnProperty(i)) {
                        for (j = 0, k = on_queue[i].length; j < k; j++) {
                            on_queue[i][j].fired = false;
                        }
                    }
                }
            } else {
                // remove all callbacks entirely
                on_queue = [];
            }

            // <d>
            if (!excludeInit) {
                sm2._wD(sm + ': Rebooting...');
            }
            // </d>

            // reset HTML5 and flash canPlay test results

            sm2.html5 = {
                'usingFlash': null
            };

            sm2.flash = {};

            // reset device-specific HTML/flash mode switches

            sm2.html5Only = false;
            sm2.ignoreFlash = false;

            window.setTimeout(function () {

                preInit();

                // by default, re-init

                if (!excludeInit) {
                    sm2.beginDelayedInit();
                }

            }, 20);

            return sm2;

        };

        this.reset = function () {

            /**
             * Shuts down and restores the SoundManager instance to its original loaded state, without an explicit reboot. All onready/ontimeout handlers are removed.
             * After this call, SM2 may be re-initialized via soundManager.beginDelayedInit().
             * @return {object} soundManager The soundManager instance.
             */

            _wDS('reset');
            return sm2.reboot(true, true);

        };

        /**
         * Undocumented: Determines the SM2 flash movie's load progress.
         *
         * @return {number or null} Percent loaded, or if invalid/unsupported, null.
         */

        this.getMoviePercent = function () {

            /**
             * Interesting syntax notes...
             * Flash/ExternalInterface (ActiveX/NPAPI) bridge methods are not typeof "function" nor instanceof Function, but are still valid.
             * Additionally, JSLint dislikes ('PercentLoaded' in flash)-style syntax and recommends hasOwnProperty(), which does not work in this case.
             * Furthermore, using (flash && flash.PercentLoaded) causes IE to throw "object doesn't support this property or method".
             * Thus, 'in' syntax must be used.
             */

            return (flash && 'PercentLoaded' in flash ? flash.PercentLoaded() : null); // Yes, JSLint. See nearby comment in source for explanation.

        };

        /**
         * Additional helper for manually invoking SM2's init process after DOM Ready / window.onload().
         */

        this.beginDelayedInit = function () {

            windowLoaded = true;
            domContentLoaded();

            setTimeout(function () {

                if (initPending) {
                    return false;
                }

                createMovie();
                initMovie();
                initPending = true;

                return true;

            }, 20);

            delayWaitForEI();

        };

        /**
         * Destroys the SoundManager instance and all SMSound instances.
         */

        this.destruct = function () {

            sm2._wD(sm + '.destruct()');
            sm2.disable(true);

        };

        /**
         * SMSound() (sound object) constructor
         * ------------------------------------
         *
         * @param {object} oOptions Sound options (id and url are required attributes)
         * @return {SMSound} The new SMSound object
         */

        SMSound = function (oOptions) {

            var s = this, resetProperties, add_html5_events, remove_html5_events, stop_html5_timer, start_html5_timer, attachOnPosition, onplay_called = false, onPositionItems = [], onPositionFired = 0, detachOnPosition, applyFromTo, lastURL = null, lastHTML5State;

            lastHTML5State = {
                // tracks duration + position (time)
                duration: null,
                time: null
            };

            this.id = oOptions.id;

            // legacy
            this.sID = this.id;

            this.url = oOptions.url;
            this.options = mixin(oOptions);

            // per-play-instance-specific options
            this.instanceOptions = this.options;

            // short alias
            this._iO = this.instanceOptions;

            // assign property defaults
            this.pan = this.options.pan;
            this.volume = this.options.volume;

            // whether or not this object is using HTML5
            this.isHTML5 = false;

            // internal HTML5 Audio() object reference
            this._a = null;

            /**
             * SMSound() public methods
             * ------------------------
             */

            this.id3 = {};

            /**
             * Writes SMSound object parameters to debug console
             */

            this._debug = function () {

                // <d>
                sm2._wD(s.id + ': Merged options:', s.options);
                // </d>

            };

            /**
             * Begins loading a sound per its *url*.
             *
             * @param {object} oOptions Optional: Sound options
             * @return {SMSound} The SMSound object
             */

            this.load = function (oOptions) {

                var oSound = null, instanceOptions;

                if (oOptions !== _undefined) {
                    s._iO = mixin(oOptions, s.options);
                } else {
                    oOptions = s.options;
                    s._iO = oOptions;
                    if (lastURL && lastURL !== s.url) {
                        _wDS('manURL');
                        s._iO.url = s.url;
                        s.url = null;
                    }
                }

                if (!s._iO.url) {
                    s._iO.url = s.url;
                }

                s._iO.url = parseURL(s._iO.url);

                // ensure we're in sync
                s.instanceOptions = s._iO;

                // local shortcut
                instanceOptions = s._iO;

                sm2._wD(s.id + ': load (' + instanceOptions.url + ')');

                if (instanceOptions.url === s.url && s.readyState !== 0 && s.readyState !== 2) {
                    _wDS('onURL', 1);
                    // if loaded and an onload() exists, fire immediately.
                    if (s.readyState === 3 && instanceOptions.onload) {
                        // assume success based on truthy duration.
                        instanceOptions.onload.apply(s, [(!!s.duration)]);
                    }
                    return s;
                }

                // reset a few state properties

                s.loaded = false;
                s.readyState = 1;
                s.playState = 0;
                s.id3 = {};

                // TODO: If switching from HTML5 -> flash (or vice versa), stop currently-playing audio.

                if (html5OK(instanceOptions)) {

                    oSound = s._setup_html5(instanceOptions);

                    if (!oSound._called_load) {

                        s._html5_canplay = false;

                        // TODO: review called_load / html5_canplay logic

                        // if url provided directly to load(), assign it here.

                        if (s.url !== instanceOptions.url) {

                            sm2._wD(_wDS('manURL') + ': ' + instanceOptions.url);

                            s._a.src = instanceOptions.url;

                            // TODO: review / re-apply all relevant options (volume, loop, onposition etc.)

                            // reset position for new URL
                            s.setPosition(0);

                        }

                        // given explicit load call, try to preload.

                        // early HTML5 implementation (non-standard)
                        s._a.autobuffer = 'auto';

                        // standard
                        s._a.preload = 'auto';

                        s._a._called_load = true;

                        if (instanceOptions.autoPlay) {
                            s.play();
                        }

                    } else {

                        sm2._wD(s.id + ': Ignoring request to load again');

                    }

                } else {

                    try {
                        s.isHTML5 = false;
                        s._iO = policyFix(loopFix(instanceOptions));
                        // re-assign local shortcut
                        instanceOptions = s._iO;
                        if (fV === 8) {
                            flash._load(s.id, instanceOptions.url, instanceOptions.stream, instanceOptions.autoPlay, instanceOptions.usePolicyFile);
                        } else {
                            flash._load(s.id, instanceOptions.url, !!(instanceOptions.stream), !!(instanceOptions.autoPlay), instanceOptions.loops || 1, !!(instanceOptions.autoLoad), instanceOptions.usePolicyFile);
                        }
                    } catch (e) {
                        _wDS('smError', 2);
                        debugTS('onload', false);
                        catchError({ type: 'SMSOUND_LOAD_JS_EXCEPTION', fatal: true });
                    }

                }

                // after all of this, ensure sound url is up to date.
                s.url = instanceOptions.url;

                return s;

            };

            /**
             * Unloads a sound, canceling any open HTTP requests.
             *
             * @return {SMSound} The SMSound object
             */

            this.unload = function () {

                // Flash 8/AS2 can't "close" a stream - fake it by loading an empty URL
                // Flash 9/AS3: Close stream, preventing further load
                // HTML5: Most UAs will use empty URL

                if (s.readyState !== 0) {

                    sm2._wD(s.id + ': unload()');

                    if (!s.isHTML5) {

                        if (fV === 8) {
                            flash._unload(s.id, emptyURL);
                        } else {
                            flash._unload(s.id);
                        }

                    } else {

                        stop_html5_timer();

                        if (s._a) {

                            s._a.pause();
                            html5Unload(s._a, emptyURL);

                            // update empty URL, too
                            lastURL = emptyURL;

                        }

                    }

                    // reset load/status flags
                    resetProperties();

                }

                return s;

            };

            /**
             * Unloads and destroys a sound.
             */

            this.destruct = function (_bFromSM) {

                sm2._wD(s.id + ': Destruct');

                if (!s.isHTML5) {

                    // kill sound within Flash
                    // Disable the onfailure handler
                    s._iO.onfailure = null;
                    flash._destroySound(s.id);

                } else {

                    stop_html5_timer();

                    if (s._a) {
                        s._a.pause();
                        html5Unload(s._a);
                        if (!useGlobalHTML5Audio) {
                            remove_html5_events();
                        }
                        // break obvious circular reference
                        s._a._s = null;
                        s._a = null;
                    }

                }

                if (!_bFromSM) {
                    // ensure deletion from controller
                    sm2.destroySound(s.id, true);

                }

            };

            /**
             * Begins playing a sound.
             *
             * @param {object} oOptions Optional: Sound options
             * @return {SMSound} The SMSound object
             */

            this.play = function (oOptions, _updatePlayState) {

                var fN, allowMulti, a, onready, startOK = true,
                    exit = null;

                // <d>
                fN = s.id + ': play(): ';
                // </d>

                // default to true
                _updatePlayState = (_updatePlayState === _undefined ? true : _updatePlayState);

                if (!oOptions) {
                    oOptions = {};
                }

                // first, use local URL (if specified)
                if (s.url) {
                    s._iO.url = s.url;
                }

                // mix in any options defined at createSound()
                s._iO = mixin(s._iO, s.options);

                // mix in any options specific to this method
                s._iO = mixin(oOptions, s._iO);

                s._iO.url = parseURL(s._iO.url);

                s.instanceOptions = s._iO;

                // RTMP-only
                if (s._iO.serverURL && !s.connected) {
                    if (!s.getAutoPlay()) {
                        sm2._wD(fN + ' Netstream not connected yet - setting autoPlay');
                        s.setAutoPlay(true);
                    }
                    // play will be called in onconnect()
                    return s;
                }

                if (html5OK(s._iO)) {
                    s._setup_html5(s._iO);
                    start_html5_timer();
                }

                if (s.playState === 1 && !s.paused) {
                    allowMulti = s._iO.multiShot;
                    if (!allowMulti) {
                        sm2._wD(fN + 'Already playing (one-shot)', 1);
                        exit = s;
                    } else {
                        sm2._wD(fN + 'Already playing (multi-shot)', 1);
                    }
                }

                if (exit !== null) {
                    return exit;
                }

                // edge case: play() with explicit URL parameter
                if (oOptions.url && oOptions.url !== s.url) {
                    // load using merged options
                    s.load(s._iO);
                }

                if (!s.loaded) {

                    if (s.readyState === 0) {

                        sm2._wD(fN + 'Attempting to load');

                        // try to get this sound playing ASAP
                        if (!s.isHTML5) {
                            // assign directly because setAutoPlay() increments the instanceCount
                            s._iO.autoPlay = true;
                            s.load(s._iO);
                        } else {
                            // iOS needs this when recycling sounds, loading a new URL on an existing object.
                            s.load(s._iO);
                        }

                        // HTML5 hack - re-set instanceOptions?
                        s.instanceOptions = s._iO;

                    } else if (s.readyState === 2) {

                        sm2._wD(fN + 'Could not load - exiting', 2);
                        exit = s;

                    } else {

                        sm2._wD(fN + 'Loading - attempting to play...');

                    }

                } else {

                    sm2._wD(fN);

                }

                if (exit !== null) {
                    return exit;
                }

                if (!s.isHTML5 && fV === 9 && s.position > 0 && s.position === s.duration) {
                    // flash 9 needs a position reset if play() is called while at the end of a sound.
                    sm2._wD(fN + 'Sound at end, resetting to position:0');
                    oOptions.position = 0;
                }

                /**
                 * Streams will pause when their buffer is full if they are being loaded.
                 * In this case paused is true, but the song hasn't started playing yet.
                 * If we just call resume() the onplay() callback will never be called.
                 * So only call resume() if the position is > 0.
                 * Another reason is because options like volume won't have been applied yet.
                 * For normal sounds, just resume.
                 */

                if (s.paused && s.position >= 0 && (!s._iO.serverURL || s.position > 0)) {

                    // https://gist.github.com/37b17df75cc4d7a90bf6
                    sm2._wD(fN + 'Resuming from paused state', 1);
                    s.resume();

                } else {

                    s._iO = mixin(oOptions, s._iO);

                    // apply from/to parameters, if they exist (and not using RTMP)
                    if (s._iO.from !== null && s._iO.to !== null && s.instanceCount === 0 && s.playState === 0 && !s._iO.serverURL) {

                        onready = function () {
                            // sound "canplay" or onload()
                            // re-apply from/to to instance options, and start playback
                            s._iO = mixin(oOptions, s._iO);
                            s.play(s._iO);
                        };

                        // HTML5 needs to at least have "canplay" fired before seeking.
                        if (s.isHTML5 && !s._html5_canplay) {

                            // this hasn't been loaded yet. load it first, and then do this again.
                            sm2._wD(fN + 'Beginning load for from/to case');

                            s.load({
                                // TODO: was _oncanplay. Sounds wrong.
                                oncanplay: onready
                            });

                            exit = false;

                        } else if (!s.isHTML5 && !s.loaded && (!s.readyState || s.readyState !== 2)) {

                            // to be safe, preload the whole thing in Flash.

                            sm2._wD(fN + 'Preloading for from/to case');

                            s.load({
                                onload: onready
                            });

                            exit = false;

                        }

                        if (exit !== null) {
                            return exit;
                        }

                        // otherwise, we're ready to go. re-apply local options, and continue

                        s._iO = applyFromTo();

                    }

                    sm2._wD(fN + 'Starting to play');

                    if (!s.instanceCount || s._iO.multiShotEvents || (!s.isHTML5 && fV > 8 && !s.getAutoPlay())) {
                        s.instanceCount++;
                    }

                    // if first play and onposition parameters exist, apply them now
                    if (s._iO.onposition && s.playState === 0) {
                        attachOnPosition(s);
                    }

                    s.playState = 1;
                    s.paused = false;

                    s.position = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position : 0);

                    if (!s.isHTML5) {
                        s._iO = policyFix(loopFix(s._iO));
                    }

                    if (s._iO.onplay && _updatePlayState) {
                        s._iO.onplay.apply(s);
                        onplay_called = true;
                    }

                    s.setVolume(s._iO.volume, true);
                    s.setPan(s._iO.pan, true);

                    if (!s.isHTML5) {

                        startOK = flash._start(s.id, s._iO.loops || 1, (fV === 9 ? s._iO.position : s._iO.position / 1000), s._iO.multiShot);

                        if (fV === 9 && !startOK) {
                            // edge case: no sound hardware, or 32-channel flash ceiling hit.
                            // applies only to Flash 9, non-NetStream/MovieStar sounds.
                            // http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/media/Sound.html#play%28%29
                            sm2._wD(fN + 'No sound hardware, or 32-sound ceiling hit');
                            if (s._iO.onplayerror) {
                                s._iO.onplayerror.apply(s);
                            }

                        }

                    } else {

                        start_html5_timer();

                        a = s._setup_html5();

                        s.setPosition(s._iO.position);

                        a.play();

                    }

                }

                return s;

            };

            // just for convenience
            this.start = this.play;

            /**
             * Stops playing a sound (and optionally, all sounds)
             *
             * @param {boolean} bAll Optional: Whether to stop all sounds
             * @return {SMSound} The SMSound object
             */

            this.stop = function (bAll) {

                var instanceOptions = s._iO,
                    originalPosition;

                if (s.playState === 1) {

                    sm2._wD(s.id + ': stop()');

                    s._onbufferchange(0);
                    s._resetOnPosition(0);
                    s.paused = false;

                    if (!s.isHTML5) {
                        s.playState = 0;
                    }

                    // remove onPosition listeners, if any
                    detachOnPosition();

                    // and "to" position, if set
                    if (instanceOptions.to) {
                        s.clearOnPosition(instanceOptions.to);
                    }

                    if (!s.isHTML5) {

                        flash._stop(s.id, bAll);

                        // hack for netStream: just unload
                        if (instanceOptions.serverURL) {
                            s.unload();
                        }

                    } else {

                        if (s._a) {

                            originalPosition = s.position;

                            // act like Flash, though
                            s.setPosition(0);

                            // hack: reflect old position for onstop() (also like Flash)
                            s.position = originalPosition;

                            // html5 has no stop()
                            // NOTE: pausing means iOS requires interaction to resume.
                            s._a.pause();

                            s.playState = 0;

                            // and update UI
                            s._onTimer();

                            stop_html5_timer();

                        }

                    }

                    s.instanceCount = 0;
                    s._iO = {};

                    if (instanceOptions.onstop) {
                        instanceOptions.onstop.apply(s);
                    }

                }

                return s;

            };

            /**
             * Undocumented/internal: Sets autoPlay for RTMP.
             *
             * @param {boolean} autoPlay state
             */

            this.setAutoPlay = function (autoPlay) {

                sm2._wD(s.id + ': Autoplay turned ' + (autoPlay ? 'on' : 'off'));
                s._iO.autoPlay = autoPlay;

                if (!s.isHTML5) {
                    flash._setAutoPlay(s.id, autoPlay);
                    if (autoPlay) {
                        // only increment the instanceCount if the sound isn't loaded (TODO: verify RTMP)
                        if (!s.instanceCount && s.readyState === 1) {
                            s.instanceCount++;
                            sm2._wD(s.id + ': Incremented instance count to ' + s.instanceCount);
                        }
                    }
                }

            };

            /**
             * Undocumented/internal: Returns the autoPlay boolean.
             *
             * @return {boolean} The current autoPlay value
             */

            this.getAutoPlay = function () {

                return s._iO.autoPlay;

            };

            /**
             * Sets the position of a sound.
             *
             * @param {number} nMsecOffset Position (milliseconds)
             * @return {SMSound} The SMSound object
             */

            this.setPosition = function (nMsecOffset) {

                if (nMsecOffset === _undefined) {
                    nMsecOffset = 0;
                }

                var original_pos,
                    position, position1K,
                    // Use the duration from the instance options, if we don't have a track duration yet.
                    // position >= 0 and <= current available (loaded) duration
                    offset = (s.isHTML5 ? Math.max(nMsecOffset, 0) : Math.min(s.duration || s._iO.duration, Math.max(nMsecOffset, 0)));

                original_pos = s.position;
                s.position = offset;
                position1K = s.position / 1000;
                s._resetOnPosition(s.position);
                s._iO.position = offset;

                if (!s.isHTML5) {

                    position = (fV === 9 ? s.position : position1K);
                    if (s.readyState && s.readyState !== 2) {
                        // if paused or not playing, will not resume (by playing)
                        flash._setPosition(s.id, position, (s.paused || !s.playState), s._iO.multiShot);
                    }

                } else if (s._a) {

                    // Set the position in the canplay handler if the sound is not ready yet
                    if (s._html5_canplay) {
                        if (s._a.currentTime !== position1K) {
                            /**
                             * DOM/JS errors/exceptions to watch out for:
                             * if seek is beyond (loaded?) position, "DOM exception 11"
                             * "INDEX_SIZE_ERR": DOM exception 1
                             */
                            sm2._wD(s.id + ': setPosition(' + position1K + ')');
                            try {
                                s._a.currentTime = position1K;
                                if (s.playState === 0 || s.paused) {
                                    // allow seek without auto-play/resume
                                    s._a.pause();
                                }
                            } catch (e) {
                                sm2._wD(s.id + ': setPosition(' + position1K + ') failed: ' + e.message, 2);
                            }
                        }
                    } else {
                        sm2._wD(s.id + ': setPosition(' + position1K + '): Cannot seek yet, sound not ready');
                    }

                }

                if (s.isHTML5) {
                    if (s.paused) {
                        // if paused, refresh UI right away
                        // force update
                        s._onTimer(true);
                    }
                }

                return s;

            };

            /**
             * Pauses sound playback.
             *
             * @return {SMSound} The SMSound object
             */

            this.pause = function (_bCallFlash) {

                if (s.paused || (s.playState === 0 && s.readyState !== 1)) {
                    return s;
                }

                sm2._wD(s.id + ': pause()');
                s.paused = true;

                if (!s.isHTML5) {
                    if (_bCallFlash || _bCallFlash === _undefined) {
                        flash._pause(s.id, s._iO.multiShot);
                    }
                } else {
                    s._setup_html5().pause();
                    stop_html5_timer();
                }

                if (s._iO.onpause) {
                    s._iO.onpause.apply(s);
                }

                return s;

            };

            /**
             * Resumes sound playback.
             *
             * @return {SMSound} The SMSound object
             */

            /**
             * When auto-loaded streams pause on buffer full they have a playState of 0.
             * We need to make sure that the playState is set to 1 when these streams "resume".
             * When a paused stream is resumed, we need to trigger the onplay() callback if it
             * hasn't been called already. In this case since the sound is being played for the
             * first time, I think it's more appropriate to call onplay() rather than onresume().
             */

            this.resume = function () {

                var instanceOptions = s._iO;

                if (!s.paused) {
                    return s;
                }

                sm2._wD(s.id + ': resume()');
                s.paused = false;
                s.playState = 1;

                if (!s.isHTML5) {
                    if (instanceOptions.isMovieStar && !instanceOptions.serverURL) {
                        // Bizarre Webkit bug (Chrome reported via 8tracks.com dudes): AAC content paused for 30+ seconds(?) will not resume without a reposition.
                        s.setPosition(s.position);
                    }
                    // flash method is toggle-based (pause/resume)
                    flash._pause(s.id, instanceOptions.multiShot);
                } else {
                    s._setup_html5().play();
                    start_html5_timer();
                }

                if (!onplay_called && instanceOptions.onplay) {
                    instanceOptions.onplay.apply(s);
                    onplay_called = true;
                } else if (instanceOptions.onresume) {
                    instanceOptions.onresume.apply(s);
                }

                return s;

            };

            /**
             * Toggles sound playback.
             *
             * @return {SMSound} The SMSound object
             */

            this.togglePause = function () {

                sm2._wD(s.id + ': togglePause()');

                if (s.playState === 0) {
                    s.play({
                        position: (fV === 9 && !s.isHTML5 ? s.position : s.position / 1000)
                    });
                    return s;
                }

                if (s.paused) {
                    s.resume();
                } else {
                    s.pause();
                }

                return s;

            };

            /**
             * Sets the panning (L-R) effect.
             *
             * @param {number} nPan The pan value (-100 to 100)
             * @return {SMSound} The SMSound object
             */

            this.setPan = function (nPan, bInstanceOnly) {

                if (nPan === _undefined) {
                    nPan = 0;
                }

                if (bInstanceOnly === _undefined) {
                    bInstanceOnly = false;
                }

                if (!s.isHTML5) {
                    flash._setPan(s.id, nPan);
                } // else { no HTML5 pan? }

                s._iO.pan = nPan;

                if (!bInstanceOnly) {
                    s.pan = nPan;
                    s.options.pan = nPan;
                }

                return s;

            };

            /**
             * Sets the volume.
             *
             * @param {number} nVol The volume value (0 to 100)
             * @return {SMSound} The SMSound object
             */

            this.setVolume = function (nVol, _bInstanceOnly) {

                /**
                 * Note: Setting volume has no effect on iOS "special snowflake" devices.
                 * Hardware volume control overrides software, and volume
                 * will always return 1 per Apple docs. (iOS 4 + 5.)
                 * https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingSoundtoCanvasAnimations/AddingSoundtoCanvasAnimations.html
                 */

                if (nVol === _undefined) {
                    nVol = 100;
                }

                if (_bInstanceOnly === _undefined) {
                    _bInstanceOnly = false;
                }

                if (!s.isHTML5) {
                    flash._setVolume(s.id, (sm2.muted && !s.muted) || s.muted ? 0 : nVol);
                } else if (s._a) {
                    // valid range: 0-1
                    s._a.volume = Math.max(0, Math.min(1, nVol / 100));
                }

                s._iO.volume = nVol;

                if (!_bInstanceOnly) {
                    s.volume = nVol;
                    s.options.volume = nVol;
                }

                return s;

            };

            /**
             * Mutes the sound.
             *
             * @return {SMSound} The SMSound object
             */

            this.mute = function () {

                s.muted = true;

                if (!s.isHTML5) {
                    flash._setVolume(s.id, 0);
                } else if (s._a) {
                    s._a.muted = true;
                }

                return s;

            };

            /**
             * Unmutes the sound.
             *
             * @return {SMSound} The SMSound object
             */

            this.unmute = function () {

                s.muted = false;
                var hasIO = (s._iO.volume !== _undefined);

                if (!s.isHTML5) {
                    flash._setVolume(s.id, hasIO ? s._iO.volume : s.options.volume);
                } else if (s._a) {
                    s._a.muted = false;
                }

                return s;

            };

            /**
             * Toggles the muted state of a sound.
             *
             * @return {SMSound} The SMSound object
             */

            this.toggleMute = function () {

                return (s.muted ? s.unmute() : s.mute());

            };

            /**
             * Registers a callback to be fired when a sound reaches a given position during playback.
             *
             * @param {number} nPosition The position to watch for
             * @param {function} oMethod The relevant callback to fire
             * @param {object} oScope Optional: The scope to apply the callback to
             * @return {SMSound} The SMSound object
             */

            this.onPosition = function (nPosition, oMethod, oScope) {

                // TODO: basic dupe checking?

                onPositionItems.push({
                    position: parseInt(nPosition, 10),
                    method: oMethod,
                    scope: (oScope !== _undefined ? oScope : s),
                    fired: false
                });

                return s;

            };

            // legacy/backwards-compability: lower-case method name
            this.onposition = this.onPosition;

            /**
             * Removes registered callback(s) from a sound, by position and/or callback.
             *
             * @param {number} nPosition The position to clear callback(s) for
             * @param {function} oMethod Optional: Identify one callback to be removed when multiple listeners exist for one position
             * @return {SMSound} The SMSound object
             */

            this.clearOnPosition = function (nPosition, oMethod) {

                var i;

                nPosition = parseInt(nPosition, 10);

                if (isNaN(nPosition)) {
                    // safety check
                    return false;
                }

                for (i = 0; i < onPositionItems.length; i++) {

                    if (nPosition === onPositionItems[i].position) {
                        // remove this item if no method was specified, or, if the method matches
                        if (!oMethod || (oMethod === onPositionItems[i].method)) {
                            if (onPositionItems[i].fired) {
                                // decrement "fired" counter, too
                                onPositionFired--;
                            }
                            onPositionItems.splice(i, 1);
                        }
                    }

                }

            };

            this._processOnPosition = function () {

                var i, item, j = onPositionItems.length;

                if (!j || !s.playState || onPositionFired >= j) {
                    return false;
                }

                for (i = j - 1; i >= 0; i--) {
                    item = onPositionItems[i];
                    if (!item.fired && s.position >= item.position) {
                        item.fired = true;
                        onPositionFired++;
                        item.method.apply(item.scope, [item.position]);
                    }
                }

                return true;

            };

            this._resetOnPosition = function (nPosition) {

                // reset "fired" for items interested in this position
                var i, item, j = onPositionItems.length;

                if (!j) {
                    return false;
                }

                for (i = j - 1; i >= 0; i--) {
                    item = onPositionItems[i];
                    if (item.fired && nPosition <= item.position) {
                        item.fired = false;
                        onPositionFired--;
                    }
                }

                return true;

            };

            /**
             * SMSound() private internals
             * --------------------------------
             */

            applyFromTo = function () {

                var instanceOptions = s._iO,
                    f = instanceOptions.from,
                    t = instanceOptions.to,
                    start, end;

                end = function () {

                    // end has been reached.
                    sm2._wD(s.id + ': "To" time of ' + t + ' reached.');

                    // detach listener
                    s.clearOnPosition(t, end);

                    // stop should clear this, too
                    s.stop();

                };

                start = function () {

                    sm2._wD(s.id + ': Playing "from" ' + f);

                    // add listener for end
                    if (t !== null && !isNaN(t)) {
                        s.onPosition(t, end);
                    }

                };

                if (f !== null && !isNaN(f)) {

                    // apply to instance options, guaranteeing correct start position.
                    instanceOptions.position = f;

                    // multiShot timing can't be tracked, so prevent that.
                    instanceOptions.multiShot = false;

                    start();

                }

                // return updated instanceOptions including starting position
                return instanceOptions;

            };

            attachOnPosition = function () {

                var item,
                    op = s._iO.onposition;

                // attach onposition things, if any, now.

                if (op) {

                    for (item in op) {
                        if (op.hasOwnProperty(item)) {
                            s.onPosition(parseInt(item, 10), op[item]);
                        }
                    }

                }

            };

            detachOnPosition = function () {

                var item,
                    op = s._iO.onposition;

                // detach any onposition()-style listeners.

                if (op) {

                    for (item in op) {
                        if (op.hasOwnProperty(item)) {
                            s.clearOnPosition(parseInt(item, 10));
                        }
                    }

                }

            };

            start_html5_timer = function () {

                if (s.isHTML5) {
                    startTimer(s);
                }

            };

            stop_html5_timer = function () {

                if (s.isHTML5) {
                    stopTimer(s);
                }

            };

            resetProperties = function (retainPosition) {

                if (!retainPosition) {
                    onPositionItems = [];
                    onPositionFired = 0;
                }

                onplay_called = false;

                s._hasTimer = null;
                s._a = null;
                s._html5_canplay = false;
                s.bytesLoaded = null;
                s.bytesTotal = null;
                s.duration = (s._iO && s._iO.duration ? s._iO.duration : null);
                s.durationEstimate = null;
                s.buffered = [];

                // legacy: 1D array
                s.eqData = [];

                s.eqData.left = [];
                s.eqData.right = [];

                s.failures = 0;
                s.isBuffering = false;
                s.instanceOptions = {};
                s.instanceCount = 0;
                s.loaded = false;
                s.metadata = {};

                // 0 = uninitialised, 1 = loading, 2 = failed/error, 3 = loaded/success
                s.readyState = 0;

                s.muted = false;
                s.paused = false;

                s.peakData = {
                    left: 0,
                    right: 0
                };

                s.waveformData = {
                    left: [],
                    right: []
                };

                s.playState = 0;
                s.position = null;

                s.id3 = {};

            };

            resetProperties();

            /**
             * Pseudo-private SMSound internals
             * --------------------------------
             */

            this._onTimer = function (bForce) {

                /**
                 * HTML5-only _whileplaying() etc.
                 * called from both HTML5 native events, and polling/interval-based timers
                 * mimics flash and fires only when time/duration change, so as to be polling-friendly
                 */

                var duration, isNew = false, time, x = {};

                if (s._hasTimer || bForce) {

                    // TODO: May not need to track readyState (1 = loading)

                    if (s._a && (bForce || ((s.playState > 0 || s.readyState === 1) && !s.paused))) {

                        duration = s._get_html5_duration();

                        if (duration !== lastHTML5State.duration) {

                            lastHTML5State.duration = duration;
                            s.duration = duration;
                            isNew = true;

                        }

                        // TODO: investigate why this goes wack if not set/re-set each time.
                        s.durationEstimate = s.duration;

                        time = (s._a.currentTime * 1000 || 0);

                        if (time !== lastHTML5State.time) {

                            lastHTML5State.time = time;
                            isNew = true;

                        }

                        if (isNew || bForce) {

                            s._whileplaying(time, x, x, x, x);

                        }

                    }/* else {

          // sm2._wD('_onTimer: Warn for "'+s.id+'": '+(!s._a?'Could not find element. ':'')+(s.playState === 0?'playState bad, 0?':'playState = '+s.playState+', OK'));

          return false;

        }*/

                    return isNew;

                }

            };

            this._get_html5_duration = function () {

                var instanceOptions = s._iO,
                    // if audio object exists, use its duration - else, instance option duration (if provided - it's a hack, really, and should be retired) OR null
                    d = (s._a && s._a.duration ? s._a.duration * 1000 : (instanceOptions && instanceOptions.duration ? instanceOptions.duration : null)),
                    result = (d && !isNaN(d) && d !== Infinity ? d : null);

                return result;

            };

            this._apply_loop = function (a, nLoops) {

                /**
                 * boolean instead of "loop", for webkit? - spec says string. http://www.w3.org/TR/html-markup/audio.html#audio.attrs.loop
                 * note that loop is either off or infinite under HTML5, unlike Flash which allows arbitrary loop counts to be specified.
                 */

                // <d>
                if (!a.loop && nLoops > 1) {
                    sm2._wD('Note: Native HTML5 looping is infinite.', 1);
                }
                // </d>

                a.loop = (nLoops > 1 ? 'loop' : '');

            };

            this._setup_html5 = function (oOptions) {

                var instanceOptions = mixin(s._iO, oOptions), d = decodeURI,
                    a = useGlobalHTML5Audio ? globalHTML5Audio : s._a,
                    dURL = d(instanceOptions.url),
                    sameURL;

                /**
                 * "First things first, I, Poppa..." (reset the previous state of the old sound, if playing)
                 * Fixes case with devices that can only play one sound at a time
                 * Otherwise, other sounds in mid-play will be terminated without warning and in a stuck state
                 */

                if (useGlobalHTML5Audio) {

                    if (dURL === lastGlobalHTML5URL) {
                        // global HTML5 audio: re-use of URL
                        sameURL = true;
                    }

                } else if (dURL === lastURL) {

                    // options URL is the same as the "last" URL, and we used (loaded) it
                    sameURL = true;

                }

                if (a) {

                    if (a._s) {

                        if (useGlobalHTML5Audio) {

                            if (a._s && a._s.playState && !sameURL) {

                                // global HTML5 audio case, and loading a new URL. stop the currently-playing one.
                                a._s.stop();

                            }

                        } else if (!useGlobalHTML5Audio && dURL === d(lastURL)) {

                            // non-global HTML5 reuse case: same url, ignore request
                            s._apply_loop(a, instanceOptions.loops);

                            return a;

                        }

                    }

                    if (!sameURL) {

                        // don't retain onPosition() stuff with new URL.

                        resetProperties(false);

                        // assign new HTML5 URL

                        a.src = instanceOptions.url;

                        s.url = instanceOptions.url;

                        lastURL = instanceOptions.url;

                        lastGlobalHTML5URL = instanceOptions.url;

                        a._called_load = false;

                    }

                } else {

                    if (instanceOptions.autoLoad || instanceOptions.autoPlay) {

                        s._a = new Audio(instanceOptions.url);

                    } else {

                        // null for stupid Opera 9.64 case
                        s._a = (isOpera && opera.version() < 10 ? new Audio(null) : new Audio());

                    }

                    // assign local reference
                    a = s._a;

                    a._called_load = false;

                    if (useGlobalHTML5Audio) {

                        globalHTML5Audio = a;

                    }

                }

                s.isHTML5 = true;

                // store a ref on the track
                s._a = a;

                // store a ref on the audio
                a._s = s;

                add_html5_events();

                s._apply_loop(a, instanceOptions.loops);

                if (instanceOptions.autoLoad || instanceOptions.autoPlay) {

                    s.load();

                } else {

                    // early HTML5 implementation (non-standard)
                    a.autobuffer = false;

                    // standard ('none' is also an option.)
                    a.preload = 'auto';

                }

                return a;

            };

            add_html5_events = function () {

                if (s._a._added_events) {
                    return false;
                }

                var f;

                function add(oEvt, oFn, bCapture) {
                    return s._a ? s._a.addEventListener(oEvt, oFn, bCapture || false) : null;
                }

                s._a._added_events = true;

                for (f in html5_events) {
                    if (html5_events.hasOwnProperty(f)) {
                        add(f, html5_events[f]);
                    }
                }

                return true;

            };

            remove_html5_events = function () {

                // Remove event listeners

                var f;

                function remove(oEvt, oFn, bCapture) {
                    return (s._a ? s._a.removeEventListener(oEvt, oFn, bCapture || false) : null);
                }

                sm2._wD(s.id + ': Removing event listeners');
                s._a._added_events = false;

                for (f in html5_events) {
                    if (html5_events.hasOwnProperty(f)) {
                        remove(f, html5_events[f]);
                    }
                }

            };

            /**
             * Pseudo-private event internals
             * ------------------------------
             */

            this._onload = function (nSuccess) {

                var fN,
                    // check for duration to prevent false positives from flash 8 when loading from cache.
                    loadOK = !!nSuccess || (!s.isHTML5 && fV === 8 && s.duration);

                // <d>
                fN = s.id + ': ';
                sm2._wD(fN + (loadOK ? 'onload()' : 'Failed to load? - ' + s.url), (loadOK ? 1 : 2));
                if (!loadOK && !s.isHTML5) {
                    if (sm2.sandbox.noRemote === true) {
                        sm2._wD(fN + str('noNet'), 1);
                    }
                    if (sm2.sandbox.noLocal === true) {
                        sm2._wD(fN + str('noLocal'), 1);
                    }
                }
                // </d>

                s.loaded = loadOK;
                s.readyState = loadOK ? 3 : 2;
                s._onbufferchange(0);

                if (s._iO.onload) {
                    s._iO.onload.apply(s, [loadOK]);
                }

                return true;

            };

            this._onbufferchange = function (nIsBuffering) {

                if (s.playState === 0) {
                    // ignore if not playing
                    return false;
                }

                if ((nIsBuffering && s.isBuffering) || (!nIsBuffering && !s.isBuffering)) {
                    return false;
                }

                s.isBuffering = (nIsBuffering === 1);
                if (s._iO.onbufferchange) {
                    sm2._wD(s.id + ': Buffer state change: ' + nIsBuffering);
                    s._iO.onbufferchange.apply(s);
                }

                return true;

            };

            /**
             * Playback may have stopped due to buffering, or related reason.
             * This state can be encountered on iOS < 6 when auto-play is blocked.
             */

            this._onsuspend = function () {

                if (s._iO.onsuspend) {
                    sm2._wD(s.id + ': Playback suspended');
                    s._iO.onsuspend.apply(s);
                }

                return true;

            };

            /**
             * flash 9/movieStar + RTMP-only method, should fire only once at most
             * at this point we just recreate failed sounds rather than trying to reconnect
             */

            this._onfailure = function (msg, level, code) {

                s.failures++;
                sm2._wD(s.id + ': Failures = ' + s.failures);

                if (s._iO.onfailure && s.failures === 1) {
                    s._iO.onfailure(s, msg, level, code);
                } else {
                    sm2._wD(s.id + ': Ignoring failure');
                }

            };

            this._onfinish = function () {

                // store local copy before it gets trashed...
                var io_onfinish = s._iO.onfinish;

                s._onbufferchange(0);
                s._resetOnPosition(0);

                // reset some state items
                if (s.instanceCount) {

                    s.instanceCount--;

                    if (!s.instanceCount) {

                        // remove onPosition listeners, if any
                        detachOnPosition();

                        // reset instance options
                        s.playState = 0;
                        s.paused = false;
                        s.instanceCount = 0;
                        s.instanceOptions = {};
                        s._iO = {};
                        stop_html5_timer();

                        // reset position, too
                        if (s.isHTML5) {
                            s.position = 0;
                        }

                    }

                    if (!s.instanceCount || s._iO.multiShotEvents) {
                        // fire onfinish for last, or every instance
                        if (io_onfinish) {
                            sm2._wD(s.id + ': onfinish()');
                            io_onfinish.apply(s);
                        }
                    }

                }

            };

            this._whileloading = function (nBytesLoaded, nBytesTotal, nDuration, nBufferLength) {

                var instanceOptions = s._iO;

                s.bytesLoaded = nBytesLoaded;
                s.bytesTotal = nBytesTotal;
                s.duration = Math.floor(nDuration);
                s.bufferLength = nBufferLength;

                if (!s.isHTML5 && !instanceOptions.isMovieStar) {

                    if (instanceOptions.duration) {
                        // use duration from options, if specified and larger. nobody should be specifying duration in options, actually, and it should be retired.
                        s.durationEstimate = (s.duration > instanceOptions.duration) ? s.duration : instanceOptions.duration;
                    } else {
                        s.durationEstimate = parseInt((s.bytesTotal / s.bytesLoaded) * s.duration, 10);
                    }

                } else {

                    s.durationEstimate = s.duration;

                }

                // for flash, reflect sequential-load-style buffering
                if (!s.isHTML5) {
                    s.buffered = [{
                        'start': 0,
                        'end': s.duration
                    }];
                }

                // allow whileloading to fire even if "load" fired under HTML5, due to HTTP range/partials
                if ((s.readyState !== 3 || s.isHTML5) && instanceOptions.whileloading) {
                    instanceOptions.whileloading.apply(s);
                }

            };

            this._whileplaying = function (nPosition, oPeakData, oWaveformDataLeft, oWaveformDataRight, oEQData) {

                var instanceOptions = s._iO,
                    eqLeft;

                if (isNaN(nPosition) || nPosition === null) {
                    // flash safety net
                    return false;
                }

                // Safari HTML5 play() may return small -ve values when starting from position: 0, eg. -50.120396875. Unexpected/invalid per W3, I think. Normalize to 0.
                s.position = Math.max(0, nPosition);

                s._processOnPosition();

                if (!s.isHTML5 && fV > 8) {

                    if (instanceOptions.usePeakData && oPeakData !== _undefined && oPeakData) {
                        s.peakData = {
                            left: oPeakData.leftPeak,
                            right: oPeakData.rightPeak
                        };
                    }

                    if (instanceOptions.useWaveformData && oWaveformDataLeft !== _undefined && oWaveformDataLeft) {
                        s.waveformData = {
                            left: oWaveformDataLeft.split(','),
                            right: oWaveformDataRight.split(',')
                        };
                    }

                    if (instanceOptions.useEQData) {
                        if (oEQData !== _undefined && oEQData && oEQData.leftEQ) {
                            eqLeft = oEQData.leftEQ.split(',');
                            s.eqData = eqLeft;
                            s.eqData.left = eqLeft;
                            if (oEQData.rightEQ !== _undefined && oEQData.rightEQ) {
                                s.eqData.right = oEQData.rightEQ.split(',');
                            }
                        }
                    }

                }

                if (s.playState === 1) {

                    // special case/hack: ensure buffering is false if loading from cache (and not yet started)
                    if (!s.isHTML5 && fV === 8 && !s.position && s.isBuffering) {
                        s._onbufferchange(0);
                    }

                    if (instanceOptions.whileplaying) {
                        // flash may call after actual finish
                        instanceOptions.whileplaying.apply(s);
                    }

                }

                return true;

            };

            this._oncaptiondata = function (oData) {

                /**
                 * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
                 * 
                 * @param {object} oData
                 */

                sm2._wD(s.id + ': Caption data received.');

                s.captiondata = oData;

                if (s._iO.oncaptiondata) {
                    s._iO.oncaptiondata.apply(s, [oData]);
                }

            };

            this._onmetadata = function (oMDProps, oMDData) {

                /**
                 * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
                 * RTMP may include song title, MovieStar content may include encoding info
                 * 
                 * @param {array} oMDProps (names)
                 * @param {array} oMDData (values)
                 */

                sm2._wD(s.id + ': Metadata received.');

                var oData = {}, i, j;

                for (i = 0, j = oMDProps.length; i < j; i++) {
                    oData[oMDProps[i]] = oMDData[i];
                }
                s.metadata = oData;

                if (s._iO.onmetadata) {
                    s._iO.onmetadata.apply(s);
                }

            };

            this._onid3 = function (oID3Props, oID3Data) {

                /**
                 * internal: flash 8 + flash 9 ID3 feature
                 * may include artist, song title etc.
                 * 
                 * @param {array} oID3Props (names)
                 * @param {array} oID3Data (values)
                 */

                sm2._wD(s.id + ': ID3 data received.');

                var oData = [], i, j;

                for (i = 0, j = oID3Props.length; i < j; i++) {
                    oData[oID3Props[i]] = oID3Data[i];
                }
                s.id3 = mixin(s.id3, oData);

                if (s._iO.onid3) {
                    s._iO.onid3.apply(s);
                }

            };

            // flash/RTMP-only

            this._onconnect = function (bSuccess) {

                bSuccess = (bSuccess === 1);
                sm2._wD(s.id + ': ' + (bSuccess ? 'Connected.' : 'Failed to connect? - ' + s.url), (bSuccess ? 1 : 2));
                s.connected = bSuccess;

                if (bSuccess) {

                    s.failures = 0;

                    if (idCheck(s.id)) {
                        if (s.getAutoPlay()) {
                            // only update the play state if auto playing
                            s.play(_undefined, s.getAutoPlay());
                        } else if (s._iO.autoLoad) {
                            s.load();
                        }
                    }

                    if (s._iO.onconnect) {
                        s._iO.onconnect.apply(s, [bSuccess]);
                    }

                }

            };

            this._ondataerror = function (sError) {

                // flash 9 wave/eq data handler
                // hack: called at start, and end from flash at/after onfinish()
                if (s.playState > 0) {
                    sm2._wD(s.id + ': Data error: ' + sError);
                    if (s._iO.ondataerror) {
                        s._iO.ondataerror.apply(s);
                    }
                }

            };

            // <d>
            this._debug();
            // </d>

        }; // SMSound()

        /**
         * Private SoundManager internals
         * ------------------------------
         */

        getDocument = function () {

            return (doc.body || doc._docElement || doc.getElementsByTagName('div')[0]);

        };

        id = function (sID) {

            return doc.getElementById(sID);

        };

        mixin = function (oMain, oAdd) {

            // non-destructive merge
            var o1 = (oMain || {}), o2, o;

            // if unspecified, o2 is the default options object
            o2 = (oAdd === _undefined ? sm2.defaultOptions : oAdd);

            for (o in o2) {

                if (o2.hasOwnProperty(o) && o1[o] === _undefined) {

                    if (typeof o2[o] !== 'object' || o2[o] === null) {

                        // assign directly
                        o1[o] = o2[o];

                    } else {

                        // recurse through o2
                        o1[o] = mixin(o1[o], o2[o]);

                    }

                }

            }

            return o1;

        };

        // additional soundManager properties that soundManager.setup() will accept

        extraOptions = {
            'onready': 1,
            'ontimeout': 1,
            'defaultOptions': 1,
            'flash9Options': 1,
            'movieStarOptions': 1
        };

        assign = function (o, oParent) {

            /**
             * recursive assignment of properties, soundManager.setup() helper
             * allows property assignment based on whitelist
             */

            var i,
                result = true,
                hasParent = (oParent !== _undefined),
                setupOptions = sm2.setupOptions,
                bonusOptions = extraOptions;

            // <d>

            // if soundManager.setup() called, show accepted parameters.

            if (o === _undefined) {

                result = [];

                for (i in setupOptions) {

                    if (setupOptions.hasOwnProperty(i)) {
                        result.push(i);
                    }

                }

                for (i in bonusOptions) {

                    if (bonusOptions.hasOwnProperty(i)) {

                        if (typeof sm2[i] === 'object') {

                            result.push(i + ': {...}');

                        } else if (sm2[i] instanceof Function) {

                            result.push(i + ': function() {...}');

                        } else {

                            result.push(i);

                        }

                    }

                }

                sm2._wD(str('setup', result.join(', ')));

                return false;

            }

            // </d>

            for (i in o) {

                if (o.hasOwnProperty(i)) {

                    // if not an {object} we want to recurse through...

                    if (typeof o[i] !== 'object' || o[i] === null || o[i] instanceof Array || o[i] instanceof RegExp) {

                        // check "allowed" options

                        if (hasParent && bonusOptions[oParent] !== _undefined) {

                            // valid recursive / nested object option, eg., { defaultOptions: { volume: 50 } }
                            sm2[oParent][i] = o[i];

                        } else if (setupOptions[i] !== _undefined) {

                            // special case: assign to setupOptions object, which soundManager property references
                            sm2.setupOptions[i] = o[i];

                            // assign directly to soundManager, too
                            sm2[i] = o[i];

                        } else if (bonusOptions[i] === _undefined) {

                            // invalid or disallowed parameter. complain.
                            complain(str((sm2[i] === _undefined ? 'setupUndef' : 'setupError'), i), 2);

                            result = false;

                        } else {

                            /**
                             * valid extraOptions (bonusOptions) parameter.
                             * is it a method, like onready/ontimeout? call it.
                             * multiple parameters should be in an array, eg. soundManager.setup({onready: [myHandler, myScope]});
                             */

                            if (sm2[i] instanceof Function) {

                                sm2[i].apply(sm2, (o[i] instanceof Array ? o[i] : [o[i]]));

                            } else {

                                // good old-fashioned direct assignment
                                sm2[i] = o[i];

                            }

                        }

                    } else {

                        // recursion case, eg., { defaultOptions: { ... } }

                        if (bonusOptions[i] === _undefined) {

                            // invalid or disallowed parameter. complain.
                            complain(str((sm2[i] === _undefined ? 'setupUndef' : 'setupError'), i), 2);

                            result = false;

                        } else {

                            // recurse through object
                            return assign(o[i], i);

                        }

                    }

                }

            }

            return result;

        };

        function preferFlashCheck(kind) {

            // whether flash should play a given type
            return (sm2.preferFlash && hasFlash && !sm2.ignoreFlash && (sm2.flash[kind] !== _undefined && sm2.flash[kind]));

        }

        /**
         * Internal DOM2-level event helpers
         * ---------------------------------
         */

        event = (function () {

            // normalize event methods
            var old = (window.attachEvent),
                evt = {
                    add: (old ? 'attachEvent' : 'addEventListener'),
                    remove: (old ? 'detachEvent' : 'removeEventListener')
                };

            // normalize "on" event prefix, optional capture argument
            function getArgs(oArgs) {

                var args = slice.call(oArgs),
                    len = args.length;

                if (old) {
                    // prefix
                    args[1] = 'on' + args[1];
                    if (len > 3) {
                        // no capture
                        args.pop();
                    }
                } else if (len === 3) {
                    args.push(false);
                }

                return args;

            }

            function apply(args, sType) {

                // normalize and call the event method, with the proper arguments
                var element = args.shift(),
                    method = [evt[sType]];

                if (old) {
                    // old IE can't do apply().
                    element[method](args[0], args[1]);
                } else {
                    element[method].apply(element, args);
                }

            }

            function add() {

                apply(getArgs(arguments), 'add');

            }

            function remove() {

                apply(getArgs(arguments), 'remove');

            }

            return {
                'add': add,
                'remove': remove
            };

        }());

        /**
         * Internal HTML5 event handling
         * -----------------------------
         */

        function html5_event(oFn) {

            // wrap html5 event handlers so we don't call them on destroyed and/or unloaded sounds

            return function (e) {

                var s = this._s,
                    result;

                if (!s || !s._a) {
                    // <d>
                    if (s && s.id) {
                        sm2._wD(s.id + ': Ignoring ' + e.type);
                    } else {
                        sm2._wD(h5 + 'Ignoring ' + e.type);
                    }
                    // </d>
                    result = null;
                } else {
                    result = oFn.call(this, e);
                }

                return result;

            };

        }

        html5_events = {

            // HTML5 event-name-to-handler map

            abort: html5_event(function () {

                sm2._wD(this._s.id + ': abort');

            }),

            // enough has loaded to play

            canplay: html5_event(function () {

                var s = this._s,
                    position1K;

                if (s._html5_canplay) {
                    // this event has already fired. ignore.
                    return true;
                }

                s._html5_canplay = true;
                sm2._wD(s.id + ': canplay');
                s._onbufferchange(0);

                // position according to instance options
                position1K = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position / 1000 : null);

                // set the position if position was set before the sound loaded
                if (s.position && this.currentTime !== position1K) {
                    sm2._wD(s.id + ': canplay: Setting position to ' + position1K);
                    try {
                        this.currentTime = position1K;
                    } catch (ee) {
                        sm2._wD(s.id + ': canplay: Setting position of ' + position1K + ' failed: ' + ee.message, 2);
                    }
                }

                // hack for HTML5 from/to case
                if (s._iO._oncanplay) {
                    s._iO._oncanplay();
                }

            }),

            canplaythrough: html5_event(function () {

                var s = this._s;

                if (!s.loaded) {
                    s._onbufferchange(0);
                    s._whileloading(s.bytesLoaded, s.bytesTotal, s._get_html5_duration());
                    s._onload(true);
                }

            }),

            // TODO: Reserved for potential use
            /*
            emptied: html5_event(function() {
        
              sm2._wD(this._s.id + ': emptied');
        
            }),
            */

            ended: html5_event(function () {

                var s = this._s;

                sm2._wD(s.id + ': ended');

                s._onfinish();

            }),

            error: html5_event(function () {

                sm2._wD(this._s.id + ': HTML5 error, code ' + this.error.code);
                // call load with error state?
                this._s._onload(false);

            }),

            loadeddata: html5_event(function () {

                var s = this._s;

                sm2._wD(s.id + ': loadeddata');

                // safari seems to nicely report progress events, eventually totalling 100%
                if (!s._loaded && !isSafari) {
                    s.duration = s._get_html5_duration();
                }

            }),

            loadedmetadata: html5_event(function () {

                sm2._wD(this._s.id + ': loadedmetadata');

            }),

            loadstart: html5_event(function () {

                sm2._wD(this._s.id + ': loadstart');
                // assume buffering at first
                this._s._onbufferchange(1);

            }),

            play: html5_event(function () {

                sm2._wD(this._s.id + ': play()');
                // once play starts, no buffering
                this._s._onbufferchange(0);

            }),

            playing: html5_event(function () {

                sm2._wD(this._s.id + ': playing');
                // once play starts, no buffering
                this._s._onbufferchange(0);

            }),

            progress: html5_event(function (e) {

                // note: can fire repeatedly after "loaded" event, due to use of HTTP range/partials

                var s = this._s,
                    i, j, str, buffered = 0,
                    isProgress = (e.type === 'progress'),
                    ranges = e.target.buffered,
                    // firefox 3.6 implements e.loaded/total (bytes)
                    loaded = (e.loaded || 0),
                    total = (e.total || 1),
                    // HTML5 returns msec. SM2 API uses seconds for setPosition() etc., whether Flash or HTML5.
                    scale = 1000;

                // reset the "buffered" (loaded byte ranges) array
                s.buffered = [];

                if (ranges && ranges.length) {

                    // if loaded is 0, try TimeRanges implementation as % of load
                    // https://developer.mozilla.org/en/DOM/TimeRanges

                    // re-build "buffered" array
                    for (i = 0, j = ranges.length; i < j; i++) {
                        s.buffered.push({
                            'start': ranges.start(i) * scale,
                            'end': ranges.end(i) * scale
                        });
                    }

                    // use the last value locally
                    buffered = (ranges.end(0) - ranges.start(0)) * scale;

                    // linear case, buffer sum; does not account for seeking and HTTP partials / byte ranges
                    loaded = buffered / (e.target.duration * scale);

                    // <d>
                    if (isProgress && ranges.length > 1) {
                        str = [];
                        j = ranges.length;
                        for (i = 0; i < j; i++) {
                            str.push(e.target.buffered.start(i) * scale + '-' + e.target.buffered.end(i) * scale);
                        }
                        sm2._wD(this._s.id + ': progress, timeRanges: ' + str.join(', '));
                    }

                    if (isProgress && !isNaN(loaded)) {
                        sm2._wD(this._s.id + ': progress, ' + Math.floor(loaded * 100) + '% loaded');
                    }
                    // </d>

                }

                if (!isNaN(loaded)) {

                    // if progress, likely not buffering
                    s._onbufferchange(0);
                    // TODO: prevent calls with duplicate values.
                    s._whileloading(loaded, total, s._get_html5_duration());
                    if (loaded && total && loaded === total) {
                        // in case "onload" doesn't fire (eg. gecko 1.9.2)
                        html5_events.canplaythrough.call(this, e);
                    }

                }

            }),

            ratechange: html5_event(function () {

                sm2._wD(this._s.id + ': ratechange');

            }),

            suspend: html5_event(function (e) {

                // download paused/stopped, may have finished (eg. onload)
                var s = this._s;

                sm2._wD(this._s.id + ': suspend');
                html5_events.progress.call(this, e);
                s._onsuspend();

            }),

            stalled: html5_event(function () {

                sm2._wD(this._s.id + ': stalled');

            }),

            timeupdate: html5_event(function () {

                this._s._onTimer();

            }),

            waiting: html5_event(function () {

                var s = this._s;

                // see also: seeking
                sm2._wD(this._s.id + ': waiting');

                // playback faster than download rate, etc.
                s._onbufferchange(1);

            })

        };

        html5OK = function (iO) {

            // playability test based on URL or MIME type

            var result;

            if (iO.serverURL || (iO.type && preferFlashCheck(iO.type))) {

                // RTMP, or preferring flash
                result = false;

            } else {

                // Use type, if specified. If HTML5-only mode, no other options, so just give 'er
                result = ((iO.type ? html5CanPlay({ type: iO.type }) : html5CanPlay({ url: iO.url }) || sm2.html5Only));

            }

            return result;

        };

        html5Unload = function (oAudio, url) {

            /**
             * Internal method: Unload media, and cancel any current/pending network requests.
             * Firefox can load an empty URL, which allegedly destroys the decoder and stops the download.
             * https://developer.mozilla.org/En/Using_audio_and_video_in_Firefox#Stopping_the_download_of_media
             * However, Firefox has been seen loading a relative URL from '' and thus requesting the hosting page on unload.
             * Other UA behaviour is unclear, so everyone else gets an about:blank-style URL.
             */

            if (oAudio) {

                // Firefox likes '' for unload (used to work?) - however, may request hosting page URL (bad.) Most other UAs dislike '' and fail to unload.
                oAudio.src = url;

                // reset some state, too
                oAudio._called_load = false;

            }

            if (useGlobalHTML5Audio) {

                // ensure URL state is trashed, also
                lastGlobalHTML5URL = null;

            }

        };

        html5CanPlay = function (o) {

            /**
             * Try to find MIME, test and return truthiness
             * o = {
             *  url: '/path/to/an.mp3',
             *  type: 'audio/mp3'
             * }
             */

            if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
                return false;
            }

            var url = (o.url || null),
                mime = (o.type || null),
                aF = sm2.audioFormats,
                result,
                offset,
                fileExt,
                item;

            // account for known cases like audio/mp3

            if (mime && sm2.html5[mime] !== _undefined) {
                return (sm2.html5[mime] && !preferFlashCheck(mime));
            }

            if (!html5Ext) {
                html5Ext = [];
                for (item in aF) {
                    if (aF.hasOwnProperty(item)) {
                        html5Ext.push(item);
                        if (aF[item].related) {
                            html5Ext = html5Ext.concat(aF[item].related);
                        }
                    }
                }
                html5Ext = new RegExp('\\.(' + html5Ext.join('|') + ')(\\?.*)?$', 'i');
            }

            // TODO: Strip URL queries, etc.
            fileExt = (url ? url.toLowerCase().match(html5Ext) : null);

            if (!fileExt || !fileExt.length) {
                if (!mime) {
                    result = false;
                } else {
                    // audio/mp3 -> mp3, result should be known
                    offset = mime.indexOf(';');
                    // strip "audio/X; codecs..."
                    fileExt = (offset !== -1 ? mime.substr(0, offset) : mime).substr(6);
                }
            } else {
                // match the raw extension name - "mp3", for example
                fileExt = fileExt[1];
            }

            if (fileExt && sm2.html5[fileExt] !== _undefined) {
                // result known
                result = (sm2.html5[fileExt] && !preferFlashCheck(fileExt));
            } else {
                mime = 'audio/' + fileExt;
                result = sm2.html5.canPlayType({ type: mime });
                sm2.html5[fileExt] = result;
                // sm2._wD('canPlayType, found result: ' + result);
                result = (result && sm2.html5[mime] && !preferFlashCheck(mime));
            }

            return result;

        };

        testHTML5 = function () {

            /**
             * Internal: Iterates over audioFormats, determining support eg. audio/mp3, audio/mpeg and so on
             * assigns results to html5[] and flash[].
             */

            if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
                return false;
            }

            // double-whammy: Opera 9.64 throws WRONG_ARGUMENTS_ERR if no parameter passed to Audio(), and Webkit + iOS happily tries to load "null" as a URL. :/
            var a = (Audio !== _undefined ? (isOpera && opera.version() < 10 ? new Audio(null) : new Audio()) : null),
                item, lookup, support = {}, aF, i;

            function cp(m) {

                var canPlay, i, j,
                    result = false,
                    isOK = false;

                if (!a || typeof a.canPlayType !== 'function') {
                    return result;
                }

                if (m instanceof Array) {
                    // iterate through all mime types, return any successes
                    for (i = 0, j = m.length; i < j; i++) {
                        if (sm2.html5[m[i]] || a.canPlayType(m[i]).match(sm2.html5Test)) {
                            isOK = true;
                            sm2.html5[m[i]] = true;
                            // note flash support, too
                            sm2.flash[m[i]] = !!(m[i].match(flashMIME));
                        }
                    }
                    result = isOK;
                } else {
                    canPlay = (a && typeof a.canPlayType === 'function' ? a.canPlayType(m) : false);
                    result = !!(canPlay && (canPlay.match(sm2.html5Test)));
                }

                return result;

            }

            // test all registered formats + codecs

            aF = sm2.audioFormats;

            for (item in aF) {

                if (aF.hasOwnProperty(item)) {

                    lookup = 'audio/' + item;

                    support[item] = cp(aF[item].type);

                    // write back generic type too, eg. audio/mp3
                    support[lookup] = support[item];

                    // assign flash
                    if (item.match(flashMIME)) {

                        sm2.flash[item] = true;
                        sm2.flash[lookup] = true;

                    } else {

                        sm2.flash[item] = false;
                        sm2.flash[lookup] = false;

                    }

                    // assign result to related formats, too

                    if (aF[item] && aF[item].related) {

                        for (i = aF[item].related.length - 1; i >= 0; i--) {

                            // eg. audio/m4a
                            support['audio/' + aF[item].related[i]] = support[item];
                            sm2.html5[aF[item].related[i]] = support[item];
                            sm2.flash[aF[item].related[i]] = support[item];

                        }

                    }

                }

            }

            support.canPlayType = (a ? cp : null);
            sm2.html5 = mixin(sm2.html5, support);

            return true;

        };

        strings = {

            // <d>
            notReady: 'Unavailable - wait until onready() has fired.',
            notOK: 'Audio support is not available.',
            domError: sm + 'exception caught while appending SWF to DOM.',
            spcWmode: 'Removing wmode, preventing known SWF loading issue(s)',
            swf404: smc + 'Verify that %s is a valid path.',
            tryDebug: 'Try ' + sm + '.debugFlash = true for more security details (output goes to SWF.)',
            checkSWF: 'See SWF output for more debug info.',
            localFail: smc + 'Non-HTTP page (' + doc.location.protocol + ' URL?) Review Flash player security settings for this special case:\nhttp://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/',
            waitFocus: smc + 'Special case: Waiting for SWF to load with window focus...',
            waitForever: smc + 'Waiting indefinitely for Flash (will recover if unblocked)...',
            waitSWF: smc + 'Waiting for 100% SWF load...',
            needFunction: smc + 'Function object expected for %s',
            badID: 'Warning: Sound ID "%s" should be a string, starting with a non-numeric character',
            currentObj: smc + '_debug(): Current sound objects',
            waitOnload: smc + 'Waiting for window.onload()',
            docLoaded: smc + 'Document already loaded',
            onload: smc + 'initComplete(): calling soundManager.onload()',
            onloadOK: sm + '.onload() complete',
            didInit: smc + 'init(): Already called?',
            secNote: 'Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html',
            badRemove: smc + 'Failed to remove Flash node.',
            shutdown: sm + '.disable(): Shutting down',
            queue: smc + 'Queueing %s handler',
            smError: 'SMSound.load(): Exception: JS-Flash communication failed, or JS error.',
            fbTimeout: 'No flash response, applying .' + swfCSS.swfTimedout + ' CSS...',
            fbLoaded: 'Flash loaded',
            flRemoved: smc + 'Flash movie removed.',
            fbHandler: smc + 'flashBlockHandler()',
            manURL: 'SMSound.load(): Using manually-assigned URL',
            onURL: sm + '.load(): current URL already assigned.',
            badFV: sm + '.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
            as2loop: 'Note: Setting stream:false so looping can work (flash 8 limitation)',
            noNSLoop: 'Note: Looping not implemented for MovieStar formats',
            needfl9: 'Note: Switching to flash 9, required for MP4 formats.',
            mfTimeout: 'Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case',
            needFlash: smc + 'Fatal error: Flash is needed to play some required formats, but is not available.',
            gotFocus: smc + 'Got window focus.',
            policy: 'Enabling usePolicyFile for data access',
            setup: sm + '.setup(): allowed parameters: %s',
            setupError: sm + '.setup(): "%s" cannot be assigned with this method.',
            setupUndef: sm + '.setup(): Could not find option "%s"',
            setupLate: sm + '.setup(): url, flashVersion and html5Test property changes will not take effect until reboot().',
            noURL: smc + 'Flash URL required. Call soundManager.setup({url:...}) to get started.',
            sm2Loaded: 'SoundManager 2: Ready.',
            reset: sm + '.reset(): Removing event callbacks',
            mobileUA: 'Mobile UA detected, preferring HTML5 by default.',
            globalHTML5: 'Using singleton HTML5 Audio() pattern for this device.'
            // </d>

        };

        str = function () {

            // internal string replace helper.
            // arguments: o [,items to replace]
            // <d>

            // real array, please
            var args = slice.call(arguments),

                // first arg
                o = args.shift(),

                str = (strings && strings[o] ? strings[o] : ''), i, j;
            if (str && args && args.length) {
                for (i = 0, j = args.length; i < j; i++) {
                    str = str.replace('%s', args[i]);
                }
            }

            return str;
            // </d>

        };

        loopFix = function (sOpt) {

            // flash 8 requires stream = false for looping to work
            if (fV === 8 && sOpt.loops > 1 && sOpt.stream) {
                _wDS('as2loop');
                sOpt.stream = false;
            }

            return sOpt;

        };

        policyFix = function (sOpt, sPre) {

            if (sOpt && !sOpt.usePolicyFile && (sOpt.onid3 || sOpt.usePeakData || sOpt.useWaveformData || sOpt.useEQData)) {
                sm2._wD((sPre || '') + str('policy'));
                sOpt.usePolicyFile = true;
            }

            return sOpt;

        };

        complain = function (sMsg) {

            // <d>
            if (console !== _undefined && console.warn !== _undefined) {
                console.warn(sMsg);
            } else {
                sm2._wD(sMsg);
            }
            // </d>

        };

        doNothing = function () {

            return false;

        };

        disableObject = function (o) {

            var oProp;

            for (oProp in o) {
                if (o.hasOwnProperty(oProp) && typeof o[oProp] === 'function') {
                    o[oProp] = doNothing;
                }
            }

            oProp = null;

        };

        failSafely = function (bNoDisable) {

            // general failure exception handler

            if (bNoDisable === _undefined) {
                bNoDisable = false;
            }

            if (disabled || bNoDisable) {
                sm2.disable(bNoDisable);
            }

        };

        normalizeMovieURL = function (smURL) {

            var urlParams = null, url;

            if (smURL) {
                if (smURL.match(/\.swf(\?.*)?$/i)) {
                    urlParams = smURL.substr(smURL.toLowerCase().lastIndexOf('.swf?') + 4);
                    if (urlParams) {
                        // assume user knows what they're doing
                        return smURL;
                    }
                } else if (smURL.lastIndexOf('/') !== smURL.length - 1) {
                    // append trailing slash, if needed
                    smURL += '/';
                }
            }

            url = (smURL && smURL.lastIndexOf('/') !== - 1 ? smURL.substr(0, smURL.lastIndexOf('/') + 1) : './') + sm2.movieURL;

            if (sm2.noSWFCache) {
                url += ('?ts=' + new Date().getTime());
            }

            return url;

        };

        setVersionInfo = function () {

            // short-hand for internal use

            fV = parseInt(sm2.flashVersion, 10);

            if (fV !== 8 && fV !== 9) {
                sm2._wD(str('badFV', fV, defaultFlashVersion));
                sm2.flashVersion = fV = defaultFlashVersion;
            }

            // debug flash movie, if applicable

            var isDebug = (sm2.debugMode || sm2.debugFlash ? '_debug.swf' : '.swf');

            if (sm2.useHTML5Audio && !sm2.html5Only && sm2.audioFormats.mp4.required && fV < 9) {
                sm2._wD(str('needfl9'));
                sm2.flashVersion = fV = 9;
            }

            sm2.version = sm2.versionNumber + (sm2.html5Only ? ' (HTML5-only mode)' : (fV === 9 ? ' (AS3/Flash 9)' : ' (AS2/Flash 8)'));

            // set up default options
            if (fV > 8) {
                // +flash 9 base options
                sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.flash9Options);
                sm2.features.buffering = true;
                // +moviestar support
                sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.movieStarOptions);
                sm2.filePatterns.flash9 = new RegExp('\\.(mp3|' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
                sm2.features.movieStar = true;
            } else {
                sm2.features.movieStar = false;
            }

            // regExp for flash canPlay(), etc.
            sm2.filePattern = sm2.filePatterns[(fV !== 8 ? 'flash9' : 'flash8')];

            // if applicable, use _debug versions of SWFs
            sm2.movieURL = (fV === 8 ? 'soundmanager2.swf' : 'soundmanager2_flash9.swf').replace('.swf', isDebug);

            sm2.features.peakData = sm2.features.waveformData = sm2.features.eqData = (fV > 8);

        };

        setPolling = function (bPolling, bHighPerformance) {

            if (!flash) {
                return false;
            }

            flash._setPolling(bPolling, bHighPerformance);

        };

        initDebug = function () {

            // starts debug mode, creating output <div> for UAs without console object

            // allow force of debug mode via URL
            if (sm2.debugURLParam.test(wl)) {
                sm2.debugMode = true;
            }

            // <d>
            if (id(sm2.debugID)) {
                return false;
            }

            var oD, oDebug, oTarget, oToggle, tmp;

            if (sm2.debugMode && !id(sm2.debugID) && (!hasConsole || !sm2.useConsole || !sm2.consoleOnly)) {

                oD = doc.createElement('div');
                oD.id = sm2.debugID + '-toggle';

                oToggle = {
                    'position': 'fixed',
                    'bottom': '0px',
                    'right': '0px',
                    'width': '1.2em',
                    'height': '1.2em',
                    'lineHeight': '1.2em',
                    'margin': '2px',
                    'textAlign': 'center',
                    'border': '1px solid #999',
                    'cursor': 'pointer',
                    'background': '#fff',
                    'color': '#333',
                    'zIndex': 10001
                };

                oD.appendChild(doc.createTextNode('-'));
                oD.onclick = toggleDebug;
                oD.title = 'Toggle SM2 debug console';

                if (ua.match(/msie 6/i)) {
                    oD.style.position = 'absolute';
                    oD.style.cursor = 'hand';
                }

                for (tmp in oToggle) {
                    if (oToggle.hasOwnProperty(tmp)) {
                        oD.style[tmp] = oToggle[tmp];
                    }
                }

                oDebug = doc.createElement('div');
                oDebug.id = sm2.debugID;
                oDebug.style.display = (sm2.debugMode ? 'block' : 'none');

                if (sm2.debugMode && !id(oD.id)) {
                    try {
                        oTarget = getDocument();
                        oTarget.appendChild(oD);
                    } catch (e2) {
                        throw new Error(str('domError') + ' \n' + e2.toString());
                    }
                    oTarget.appendChild(oDebug);
                }

            }

            oTarget = null;
            // </d>

        };

        idCheck = this.getSoundById;

        // <d>
        _wDS = function (o, errorLevel) {

            return (!o ? '' : sm2._wD(str(o), errorLevel));

        };

        toggleDebug = function () {

            var o = id(sm2.debugID),
                oT = id(sm2.debugID + '-toggle');

            if (!o) {
                return false;
            }

            if (debugOpen) {
                // minimize
                oT.innerHTML = '+';
                o.style.display = 'none';
            } else {
                oT.innerHTML = '-';
                o.style.display = 'block';
            }

            debugOpen = !debugOpen;

        };

        debugTS = function (sEventType, bSuccess, sMessage) {

            // troubleshooter debug hooks

            if (window.sm2Debugger !== _undefined) {
                try {
                    sm2Debugger.handleEvent(sEventType, bSuccess, sMessage);
                } catch (e) {
                    // oh well
                }
            }

            return true;

        };
        // </d>

        getSWFCSS = function () {

            var css = [];

            if (sm2.debugMode) {
                css.push(swfCSS.sm2Debug);
            }

            if (sm2.debugFlash) {
                css.push(swfCSS.flashDebug);
            }

            if (sm2.useHighPerformance) {
                css.push(swfCSS.highPerf);
            }

            return css.join(' ');

        };

        flashBlockHandler = function () {

            // *possible* flash block situation.

            var name = str('fbHandler'),
                p = sm2.getMoviePercent(),
                css = swfCSS,
                error = { type: 'FLASHBLOCK' };

            if (sm2.html5Only) {
                return false;
            }

            if (!sm2.ok()) {

                if (needsFlash) {
                    // make the movie more visible, so user can fix
                    sm2.oMC.className = getSWFCSS() + ' ' + css.swfDefault + ' ' + (p === null ? css.swfTimedout : css.swfError);
                    sm2._wD(name + ': ' + str('fbTimeout') + (p ? ' (' + str('fbLoaded') + ')' : ''));
                }

                sm2.didFlashBlock = true;

                // fire onready(), complain lightly
                processOnEvents({ type: 'ontimeout', ignoreInit: true, error: error });
                catchError(error);

            } else {

                // SM2 loaded OK (or recovered)

                // <d>
                if (sm2.didFlashBlock) {
                    sm2._wD(name + ': Unblocked');
                }
                // </d>

                if (sm2.oMC) {
                    sm2.oMC.className = [getSWFCSS(), css.swfDefault, css.swfLoaded + (sm2.didFlashBlock ? ' ' + css.swfUnblocked : '')].join(' ');
                }

            }

        };

        addOnEvent = function (sType, oMethod, oScope) {

            if (on_queue[sType] === _undefined) {
                on_queue[sType] = [];
            }

            on_queue[sType].push({
                'method': oMethod,
                'scope': (oScope || null),
                'fired': false
            });

        };

        processOnEvents = function (oOptions) {

            // if unspecified, assume OK/error

            if (!oOptions) {
                oOptions = {
                    type: (sm2.ok() ? 'onready' : 'ontimeout')
                };
            }

            if (!didInit && oOptions && !oOptions.ignoreInit) {
                // not ready yet.
                return false;
            }

            if (oOptions.type === 'ontimeout' && (sm2.ok() || (disabled && !oOptions.ignoreInit))) {
                // invalid case
                return false;
            }

            var status = {
                success: (oOptions && oOptions.ignoreInit ? sm2.ok() : !disabled)
            },

                // queue specified by type, or none
                srcQueue = (oOptions && oOptions.type ? on_queue[oOptions.type] || [] : []),

                queue = [], i, j,
                args = [status],
                canRetry = (needsFlash && !sm2.ok());

            if (oOptions.error) {
                args[0].error = oOptions.error;
            }

            for (i = 0, j = srcQueue.length; i < j; i++) {
                if (srcQueue[i].fired !== true) {
                    queue.push(srcQueue[i]);
                }
            }

            if (queue.length) {
                // sm2._wD(sm + ': Firing ' + queue.length + ' ' + oOptions.type + '() item' + (queue.length === 1 ? '' : 's'));
                for (i = 0, j = queue.length; i < j; i++) {
                    if (queue[i].scope) {
                        queue[i].method.apply(queue[i].scope, args);
                    } else {
                        queue[i].method.apply(this, args);
                    }
                    if (!canRetry) {
                        // useFlashBlock and SWF timeout case doesn't count here.
                        queue[i].fired = true;
                    }
                }
            }

            return true;

        };

        initUserOnload = function () {

            window.setTimeout(function () {

                if (sm2.useFlashBlock) {
                    flashBlockHandler();
                }

                processOnEvents();

                // call user-defined "onload", scoped to window

                if (typeof sm2.onload === 'function') {
                    _wDS('onload', 1);
                    sm2.onload.apply(window);
                    _wDS('onloadOK', 1);
                }

                if (sm2.waitForWindowLoad) {
                    event.add(window, 'load', initUserOnload);
                }

            }, 1);

        };

        detectFlash = function () {

            // hat tip: Flash Detect library (BSD, (C) 2007) by Carl "DocYes" S. Yestrau - http://featureblend.com/javascript-flash-detection-library.html / http://featureblend.com/license.txt

            if (hasFlash !== _undefined) {
                // this work has already been done.
                return hasFlash;
            }

            var hasPlugin = false, n = navigator, nP = n.plugins, obj, type, types, AX = window.ActiveXObject;

            if (nP && nP.length) {
                type = 'application/x-shockwave-flash';
                types = n.mimeTypes;
                if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) {
                    hasPlugin = true;
                }
            } else if (AX !== _undefined && !ua.match(/MSAppHost/i)) {
                // Windows 8 Store Apps (MSAppHost) are weird (compatibility?) and won't complain here, but will barf if Flash/ActiveX object is appended to the DOM.
                try {
                    obj = new AX('ShockwaveFlash.ShockwaveFlash');
                } catch (e) {
                    // oh well
                }
                hasPlugin = (!!obj);
                // cleanup, because it is ActiveX after all
                obj = null;
            }

            hasFlash = hasPlugin;

            return hasPlugin;

        };

        featureCheck = function () {

            var needsFlash,
                item,
                result = true,
                formats = sm2.audioFormats,
                // iPhone <= 3.1 has broken HTML5 audio(), but firmware 3.2 (original iPad) + iOS4 works.
                isSpecial = (is_iDevice && !!(ua.match(/os (1|2|3_0|3_1)/i)));

            if (isSpecial) {

                // has Audio(), but is broken; let it load links directly.
                sm2.hasHTML5 = false;

                // ignore flash case, however
                sm2.html5Only = true;

                if (sm2.oMC) {
                    sm2.oMC.style.display = 'none';
                }

                result = false;

            } else {

                if (sm2.useHTML5Audio) {

                    if (!sm2.html5 || !sm2.html5.canPlayType) {
                        sm2._wD('SoundManager: No HTML5 Audio() support detected.');
                        sm2.hasHTML5 = false;
                    }

                    // <d>
                    if (isBadSafari) {
                        sm2._wD(smc + 'Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - ' + (!hasFlash ? ' would use flash fallback for MP3/MP4, but none detected.' : 'will use flash fallback for MP3/MP4, if available'), 1);
                    }
                    // </d>

                }

            }

            if (sm2.useHTML5Audio && sm2.hasHTML5) {

                for (item in formats) {
                    if (formats.hasOwnProperty(item)) {
                        if ((formats[item].required && !sm2.html5.canPlayType(formats[item].type)) || (sm2.preferFlash && (sm2.flash[item] || sm2.flash[formats[item].type]))) {
                            // flash may be required, or preferred for this format
                            needsFlash = true;
                        }
                    }
                }

            }

            // sanity check...
            if (sm2.ignoreFlash) {
                needsFlash = false;
            }

            sm2.html5Only = (sm2.hasHTML5 && sm2.useHTML5Audio && !needsFlash);

            return (!sm2.html5Only);

        };

        parseURL = function (url) {

            /**
             * Internal: Finds and returns the first playable URL (or failing that, the first URL.)
             * @param {string or array} url A single URL string, OR, an array of URL strings or {url:'/path/to/resource', type:'audio/mp3'} objects.
             */

            var i, j, urlResult = 0, result;

            if (url instanceof Array) {

                // find the first good one
                for (i = 0, j = url.length; i < j; i++) {

                    if (url[i] instanceof Object) {
                        // MIME check
                        if (sm2.canPlayMIME(url[i].type)) {
                            urlResult = i;
                            break;
                        }

                    } else if (sm2.canPlayURL(url[i])) {
                        // URL string check
                        urlResult = i;
                        break;
                    }

                }

                // normalize to string
                if (url[urlResult].url) {
                    url[urlResult] = url[urlResult].url;
                }

                result = url[urlResult];

            } else {

                // single URL case
                result = url;

            }

            return result;

        };


        startTimer = function (oSound) {

            /**
             * attach a timer to this sound, and start an interval if needed
             */

            if (!oSound._hasTimer) {

                oSound._hasTimer = true;

                if (!mobileHTML5 && sm2.html5PollingInterval) {

                    if (h5IntervalTimer === null && h5TimerCount === 0) {

                        h5IntervalTimer = window.setInterval(timerExecute, sm2.html5PollingInterval);

                    }

                    h5TimerCount++;

                }

            }

        };

        stopTimer = function (oSound) {

            /**
             * detach a timer
             */

            if (oSound._hasTimer) {

                oSound._hasTimer = false;

                if (!mobileHTML5 && sm2.html5PollingInterval) {

                    // interval will stop itself at next execution.

                    h5TimerCount--;

                }

            }

        };

        timerExecute = function () {

            /**
             * manual polling for HTML5 progress events, ie., whileplaying() (can achieve greater precision than conservative default HTML5 interval)
             */

            var i;

            if (h5IntervalTimer !== null && !h5TimerCount) {

                // no active timers, stop polling interval.

                window.clearInterval(h5IntervalTimer);

                h5IntervalTimer = null;

                return false;

            }

            // check all HTML5 sounds with timers

            for (i = sm2.soundIDs.length - 1; i >= 0; i--) {

                if (sm2.sounds[sm2.soundIDs[i]].isHTML5 && sm2.sounds[sm2.soundIDs[i]]._hasTimer) {

                    sm2.sounds[sm2.soundIDs[i]]._onTimer();

                }

            }

        };

        catchError = function (options) {

            options = (options !== _undefined ? options : {});

            if (typeof sm2.onerror === 'function') {
                sm2.onerror.apply(window, [{ type: (options.type !== _undefined ? options.type : null) }]);
            }

            if (options.fatal !== _undefined && options.fatal) {
                sm2.disable();
            }

        };

        badSafariFix = function () {

            // special case: "bad" Safari (OS X 10.3 - 10.7) must fall back to flash for MP3/MP4
            if (!isBadSafari || !detectFlash()) {
                // doesn't apply
                return false;
            }

            var aF = sm2.audioFormats, i, item;

            for (item in aF) {
                if (aF.hasOwnProperty(item)) {
                    if (item === 'mp3' || item === 'mp4') {
                        sm2._wD(sm + ': Using flash fallback for ' + item + ' format');
                        sm2.html5[item] = false;
                        // assign result to related formats, too
                        if (aF[item] && aF[item].related) {
                            for (i = aF[item].related.length - 1; i >= 0; i--) {
                                sm2.html5[aF[item].related[i]] = false;
                            }
                        }
                    }
                }
            }

        };

        /**
         * Pseudo-private flash/ExternalInterface methods
         * ----------------------------------------------
         */

        this._setSandboxType = function (sandboxType) {

            // <d>
            var sb = sm2.sandbox;

            sb.type = sandboxType;
            sb.description = sb.types[(sb.types[sandboxType] !== _undefined ? sandboxType : 'unknown')];

            if (sb.type === 'localWithFile') {

                sb.noRemote = true;
                sb.noLocal = false;
                _wDS('secNote', 2);

            } else if (sb.type === 'localWithNetwork') {

                sb.noRemote = false;
                sb.noLocal = true;

            } else if (sb.type === 'localTrusted') {

                sb.noRemote = false;
                sb.noLocal = false;

            }
            // </d>

        };

        this._externalInterfaceOK = function (flashDate, swfVersion) {

            // flash callback confirming flash loaded, EI working etc.
            // flashDate = approx. timing/delay info for JS/flash bridge
            // swfVersion: SWF build string

            if (sm2.swfLoaded) {
                return false;
            }

            var e;

            debugTS('swf', true);
            debugTS('flashtojs', true);
            sm2.swfLoaded = true;
            tryInitOnFocus = false;

            if (isBadSafari) {
                badSafariFix();
            }

            // complain if JS + SWF build/version strings don't match, excluding +DEV builds
            // <d>
            if (!swfVersion || swfVersion.replace(/\+dev/i, '') !== sm2.versionNumber.replace(/\+dev/i, '')) {

                e = sm + ': Fatal: JavaScript file build "' + sm2.versionNumber + '" does not match Flash SWF build "' + swfVersion + '" at ' + sm2.url + '. Ensure both are up-to-date.';

                // escape flash -> JS stack so this error fires in window.
                setTimeout(function versionMismatch() {
                    throw new Error(e);
                }, 0);

                // exit, init will fail with timeout
                return false;

            }
            // </d>

            // slight delay before init
            setTimeout(init, isIE ? 100 : 1);

        };

        /**
         * Private initialization helpers
         * ------------------------------
         */

        createMovie = function (smID, smURL) {

            if (didAppend && appendSuccess) {
                // ignore if already succeeded
                return false;
            }

            function initMsg() {

                // <d>

                var options = [], title, str = [], delimiter = ' + ';

                title = 'SoundManager ' + sm2.version + (!sm2.html5Only && sm2.useHTML5Audio ? (sm2.hasHTML5 ? ' + HTML5 audio' : ', no HTML5 audio support') : '');

                if (!sm2.html5Only) {

                    if (sm2.preferFlash) {
                        options.push('preferFlash');
                    }

                    if (sm2.useHighPerformance) {
                        options.push('useHighPerformance');
                    }

                    if (sm2.flashPollingInterval) {
                        options.push('flashPollingInterval (' + sm2.flashPollingInterval + 'ms)');
                    }

                    if (sm2.html5PollingInterval) {
                        options.push('html5PollingInterval (' + sm2.html5PollingInterval + 'ms)');
                    }

                    if (sm2.wmode) {
                        options.push('wmode (' + sm2.wmode + ')');
                    }

                    if (sm2.debugFlash) {
                        options.push('debugFlash');
                    }

                    if (sm2.useFlashBlock) {
                        options.push('flashBlock');
                    }

                } else {

                    if (sm2.html5PollingInterval) {
                        options.push('html5PollingInterval (' + sm2.html5PollingInterval + 'ms)');
                    }

                }

                if (options.length) {
                    str = str.concat([options.join(delimiter)]);
                }

                sm2._wD(title + (str.length ? delimiter + str.join(', ') : ''), 1);

                showSupport();

                // </d>

            }

            if (sm2.html5Only) {

                // 100% HTML5 mode
                setVersionInfo();

                initMsg();
                sm2.oMC = id(sm2.movieID);
                init();

                // prevent multiple init attempts
                didAppend = true;

                appendSuccess = true;

                return false;

            }

            // flash path
            var remoteURL = (smURL || sm2.url),
                localURL = (sm2.altURL || remoteURL),
                swfTitle = 'JS/Flash audio component (SoundManager 2)',
                oTarget = getDocument(),
                extraClass = getSWFCSS(),
                isRTL = null,
                html = doc.getElementsByTagName('html')[0],
                oEmbed, oMovie, tmp, movieHTML, oEl, s, x, sClass;

            isRTL = (html && html.dir && html.dir.match(/rtl/i));
            smID = (smID === _undefined ? sm2.id : smID);

            function param(name, value) {
                return '<param name="' + name + '" value="' + value + '" />';
            }

            // safety check for legacy (change to Flash 9 URL)
            setVersionInfo();
            sm2.url = normalizeMovieURL(overHTTP ? remoteURL : localURL);
            smURL = sm2.url;

            sm2.wmode = (!sm2.wmode && sm2.useHighPerformance ? 'transparent' : sm2.wmode);

            if (sm2.wmode !== null && (ua.match(/msie 8/i) || (!isIE && !sm2.useHighPerformance)) && navigator.platform.match(/win32|win64/i)) {
                /**
                 * extra-special case: movie doesn't load until scrolled into view when using wmode = anything but 'window' here
                 * does not apply when using high performance (position:fixed means on-screen), OR infinite flash load timeout
                 * wmode breaks IE 8 on Vista + Win7 too in some cases, as of January 2011 (?)
                 */
                messages.push(strings.spcWmode);
                sm2.wmode = null;
            }

            oEmbed = {
                'name': smID,
                'id': smID,
                'src': smURL,
                'quality': 'high',
                'allowScriptAccess': sm2.allowScriptAccess,
                'bgcolor': sm2.bgColor,
                'pluginspage': http + 'www.macromedia.com/go/getflashplayer',
                'title': swfTitle,
                'type': 'application/x-shockwave-flash',
                'wmode': sm2.wmode,
                // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
                'hasPriority': 'true'
            };

            if (sm2.debugFlash) {
                oEmbed.FlashVars = 'debug=1';
            }

            if (!sm2.wmode) {
                // don't write empty attribute
                delete oEmbed.wmode;
            }

            if (isIE) {

                // IE is "special".
                oMovie = doc.createElement('div');
                movieHTML = [
                    '<object id="' + smID + '" data="' + smURL + '" type="' + oEmbed.type + '" title="' + oEmbed.title + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="' + http + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">',
                    param('movie', smURL),
                    param('AllowScriptAccess', sm2.allowScriptAccess),
                    param('quality', oEmbed.quality),
                    (sm2.wmode ? param('wmode', sm2.wmode) : ''),
                    param('bgcolor', sm2.bgColor),
                    param('hasPriority', 'true'),
                    (sm2.debugFlash ? param('FlashVars', oEmbed.FlashVars) : ''),
                    '</object>'
                ].join('');

            } else {

                oMovie = doc.createElement('embed');
                for (tmp in oEmbed) {
                    if (oEmbed.hasOwnProperty(tmp)) {
                        oMovie.setAttribute(tmp, oEmbed[tmp]);
                    }
                }

            }

            initDebug();
            extraClass = getSWFCSS();
            oTarget = getDocument();

            if (oTarget) {

                sm2.oMC = (id(sm2.movieID) || doc.createElement('div'));

                if (!sm2.oMC.id) {

                    sm2.oMC.id = sm2.movieID;
                    sm2.oMC.className = swfCSS.swfDefault + ' ' + extraClass;
                    s = null;
                    oEl = null;

                    if (!sm2.useFlashBlock) {
                        if (sm2.useHighPerformance) {
                            // on-screen at all times
                            s = {
                                'position': 'fixed',
                                'width': '8px',
                                'height': '8px',
                                // >= 6px for flash to run fast, >= 8px to start up under Firefox/win32 in some cases. odd? yes.
                                'bottom': '0px',
                                'left': '0px',
                                'overflow': 'hidden'
                            };
                        } else {
                            // hide off-screen, lower priority
                            s = {
                                'position': 'absolute',
                                'width': '6px',
                                'height': '6px',
                                'top': '-9999px',
                                'left': '-9999px'
                            };
                            if (isRTL) {
                                s.left = Math.abs(parseInt(s.left, 10)) + 'px';
                            }
                        }
                    }

                    if (isWebkit) {
                        // soundcloud-reported render/crash fix, safari 5
                        sm2.oMC.style.zIndex = 10000;
                    }

                    if (!sm2.debugFlash) {
                        for (x in s) {
                            if (s.hasOwnProperty(x)) {
                                sm2.oMC.style[x] = s[x];
                            }
                        }
                    }

                    try {
                        if (!isIE) {
                            sm2.oMC.appendChild(oMovie);
                        }
                        oTarget.appendChild(sm2.oMC);
                        if (isIE) {
                            oEl = sm2.oMC.appendChild(doc.createElement('div'));
                            oEl.className = swfCSS.swfBox;
                            oEl.innerHTML = movieHTML;
                        }
                        appendSuccess = true;
                    } catch (e) {
                        throw new Error(str('domError') + ' \n' + e.toString());
                    }

                } else {

                    // SM2 container is already in the document (eg. flashblock use case)
                    sClass = sm2.oMC.className;
                    sm2.oMC.className = (sClass ? sClass + ' ' : swfCSS.swfDefault) + (extraClass ? ' ' + extraClass : '');
                    sm2.oMC.appendChild(oMovie);
                    if (isIE) {
                        oEl = sm2.oMC.appendChild(doc.createElement('div'));
                        oEl.className = swfCSS.swfBox;
                        oEl.innerHTML = movieHTML;
                    }
                    appendSuccess = true;

                }

            }

            didAppend = true;
            initMsg();
            // sm2._wD(sm + ': Trying to load ' + smURL + (!overHTTP && sm2.altURL ? ' (alternate URL)' : ''), 1);

            return true;

        };

        initMovie = function () {

            if (sm2.html5Only) {
                createMovie();
                return false;
            }

            // attempt to get, or create, movie (may already exist)
            if (flash) {
                return false;
            }

            if (!sm2.url) {

                /**
                 * Something isn't right - we've reached init, but the soundManager url property has not been set.
                 * User has not called setup({url: ...}), or has not set soundManager.url (legacy use case) directly before init time.
                 * Notify and exit. If user calls setup() with a url: property, init will be restarted as in the deferred loading case.
                 */

                _wDS('noURL');
                return false;

            }

            // inline markup case
            flash = sm2.getMovie(sm2.id);

            if (!flash) {
                if (!oRemoved) {
                    // try to create
                    createMovie(sm2.id, sm2.url);
                } else {
                    // try to re-append removed movie after reboot()
                    if (!isIE) {
                        sm2.oMC.appendChild(oRemoved);
                    } else {
                        sm2.oMC.innerHTML = oRemovedHTML;
                    }
                    oRemoved = null;
                    didAppend = true;
                }
                flash = sm2.getMovie(sm2.id);
            }

            if (typeof sm2.oninitmovie === 'function') {
                setTimeout(sm2.oninitmovie, 1);
            }

            // <d>
            flushMessages();
            // </d>

            return true;

        };

        delayWaitForEI = function () {

            setTimeout(waitForEI, 1000);

        };

        waitForEI = function () {

            var p,
                loadIncomplete = false;

            if (!sm2.url) {
                // No SWF url to load (noURL case) - exit for now. Will be retried when url is set.
                return false;
            }

            if (waitingForEI) {
                return false;
            }

            waitingForEI = true;
            event.remove(window, 'load', delayWaitForEI);

            if (tryInitOnFocus && !isFocused) {
                // Safari won't load flash in background tabs, only when focused.
                _wDS('waitFocus');
                return false;
            }

            if (!didInit) {
                p = sm2.getMoviePercent();
                if (p > 0 && p < 100) {
                    loadIncomplete = true;
                }
            }

            setTimeout(function () {

                p = sm2.getMoviePercent();

                if (loadIncomplete) {
                    // special case: if movie *partially* loaded, retry until it's 100% before assuming failure.
                    waitingForEI = false;
                    sm2._wD(str('waitSWF'));
                    window.setTimeout(delayWaitForEI, 1);
                    return false;
                }

                // <d>
                if (!didInit) {
                    sm2._wD(sm + ': No Flash response within expected time. Likely causes: ' + (p === 0 ? 'SWF load failed, ' : '') + 'Flash blocked or JS-Flash security error.' + (sm2.debugFlash ? ' ' + str('checkSWF') : ''), 2);
                    if (!overHTTP && p) {
                        _wDS('localFail', 2);
                        if (!sm2.debugFlash) {
                            _wDS('tryDebug', 2);
                        }
                    }
                    if (p === 0) {
                        // if 0 (not null), probably a 404.
                        sm2._wD(str('swf404', sm2.url), 1);
                    }
                    debugTS('flashtojs', false, ': Timed out' + overHTTP ? ' (Check flash security or flash blockers)' : ' (No plugin/missing SWF?)');
                }
                // </d>

                // give up / time-out, depending

                if (!didInit && okToDisable) {
                    if (p === null) {
                        // SWF failed. Maybe blocked.
                        if (sm2.useFlashBlock || sm2.flashLoadTimeout === 0) {
                            if (sm2.useFlashBlock) {
                                flashBlockHandler();
                            }
                            _wDS('waitForever');
                        } else {
                            // no custom flash block handling, but SWF has timed out. Will recover if user unblocks / allows SWF load.
                            _wDS('waitForever');
                            // fire any regular registered ontimeout() listeners.
                            processOnEvents({ type: 'ontimeout', ignoreInit: true });
                        }
                    } else {
                        // flash loaded? Shouldn't be a blocking issue, then.
                        if (sm2.flashLoadTimeout === 0) {
                            _wDS('waitForever');
                        } else {
                            failSafely(true);
                        }
                    }
                }

            }, sm2.flashLoadTimeout);

        };

        handleFocus = function () {

            function cleanup() {
                event.remove(window, 'focus', handleFocus);
            }

            if (isFocused || !tryInitOnFocus) {
                // already focused, or not special Safari background tab case
                cleanup();
                return true;
            }

            okToDisable = true;
            isFocused = true;
            _wDS('gotFocus');

            // allow init to restart
            waitingForEI = false;

            // kick off ExternalInterface timeout, now that the SWF has started
            delayWaitForEI();

            cleanup();
            return true;

        };

        flushMessages = function () {

            // <d>

            // SM2 pre-init debug messages
            if (messages.length) {
                sm2._wD('SoundManager 2: ' + messages.join(' '), 1);
                messages = [];
            }

            // </d>

        };

        showSupport = function () {

            // <d>

            flushMessages();

            var item, tests = [];

            if (sm2.useHTML5Audio && sm2.hasHTML5) {
                for (item in sm2.audioFormats) {
                    if (sm2.audioFormats.hasOwnProperty(item)) {
                        tests.push(item + ' = ' + sm2.html5[item] + (!sm2.html5[item] && hasFlash && sm2.flash[item] ? ' (using flash)' : (sm2.preferFlash && sm2.flash[item] && hasFlash ? ' (preferring flash)' : (!sm2.html5[item] ? ' (' + (sm2.audioFormats[item].required ? 'required, ' : '') + 'and no flash support)' : ''))));
                    }
                }
                sm2._wD('SoundManager 2 HTML5 support: ' + tests.join(', '), 1);
            }

            // </d>

        };

        initComplete = function (bNoDisable) {

            if (didInit) {
                return false;
            }

            if (sm2.html5Only) {
                // all good.
                _wDS('sm2Loaded');
                didInit = true;
                initUserOnload();
                debugTS('onload', true);
                return true;
            }

            var wasTimeout = (sm2.useFlashBlock && sm2.flashLoadTimeout && !sm2.getMoviePercent()),
                result = true,
                error;

            if (!wasTimeout) {
                didInit = true;
                if (disabled) {
                    error = { type: (!hasFlash && needsFlash ? 'NO_FLASH' : 'INIT_TIMEOUT') };
                }
            }

            sm2._wD('SoundManager 2 ' + (disabled ? 'failed to load' : 'loaded') + ' (' + (disabled ? 'Flash security/load error' : 'OK') + ')', disabled ? 2 : 1);

            if (disabled || bNoDisable) {
                if (sm2.useFlashBlock && sm2.oMC) {
                    sm2.oMC.className = getSWFCSS() + ' ' + (sm2.getMoviePercent() === null ? swfCSS.swfTimedout : swfCSS.swfError);
                }
                processOnEvents({ type: 'ontimeout', error: error, ignoreInit: true });
                debugTS('onload', false);
                catchError(error);
                result = false;
            } else {
                debugTS('onload', true);
            }

            if (!disabled) {
                if (sm2.waitForWindowLoad && !windowLoaded) {
                    _wDS('waitOnload');
                    event.add(window, 'load', initUserOnload);
                } else {
                    // <d>
                    if (sm2.waitForWindowLoad && windowLoaded) {
                        _wDS('docLoaded');
                    }
                    // </d>
                    initUserOnload();
                }
            }

            return result;

        };

        /**
         * apply top-level setupOptions object as local properties, eg., this.setupOptions.flashVersion -> this.flashVersion (soundManager.flashVersion)
         * this maintains backward compatibility, and allows properties to be defined separately for use by soundManager.setup().
         */

        setProperties = function () {

            var i,
                o = sm2.setupOptions;

            for (i in o) {

                if (o.hasOwnProperty(i)) {

                    // assign local property if not already defined

                    if (sm2[i] === _undefined) {

                        sm2[i] = o[i];

                    } else if (sm2[i] !== o[i]) {

                        // legacy support: write manually-assigned property (eg., soundManager.url) back to setupOptions to keep things in sync
                        sm2.setupOptions[i] = sm2[i];

                    }

                }

            }

        };


        init = function () {

            // called after onload()

            if (didInit) {
                _wDS('didInit');
                return false;
            }

            function cleanup() {
                event.remove(window, 'load', sm2.beginDelayedInit);
            }

            if (sm2.html5Only) {
                if (!didInit) {
                    // we don't need no steenking flash!
                    cleanup();
                    sm2.enabled = true;
                    initComplete();
                }
                return true;
            }

            // flash path
            initMovie();

            try {

                // attempt to talk to Flash
                flash._externalInterfaceTest(false);

                // apply user-specified polling interval, OR, if "high performance" set, faster vs. default polling
                // (determines frequency of whileloading/whileplaying callbacks, effectively driving UI framerates)
                setPolling(true, (sm2.flashPollingInterval || (sm2.useHighPerformance ? 10 : 50)));

                if (!sm2.debugMode) {
                    // stop the SWF from making debug output calls to JS
                    flash._disableDebug();
                }

                sm2.enabled = true;
                debugTS('jstoflash', true);

                if (!sm2.html5Only) {
                    // prevent browser from showing cached page state (or rather, restoring "suspended" page state) via back button, because flash may be dead
                    // http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
                    event.add(window, 'unload', doNothing);
                }

            } catch (e) {

                sm2._wD('js/flash exception: ' + e.toString());
                debugTS('jstoflash', false);
                catchError({ type: 'JS_TO_FLASH_EXCEPTION', fatal: true });
                // don't disable, for reboot()
                failSafely(true);
                initComplete();

                return false;

            }

            initComplete();

            // disconnect events
            cleanup();

            return true;

        };

        domContentLoaded = function () {

            if (didDCLoaded) {
                return false;
            }

            didDCLoaded = true;

            // assign top-level soundManager properties eg. soundManager.url
            setProperties();

            initDebug();

            /**
             * Temporary feature: allow force of HTML5 via URL params: sm2-usehtml5audio=0 or 1
             * Ditto for sm2-preferFlash, too.
             */
            // <d>
            (function () {

                var a = 'sm2-usehtml5audio=',
                    a2 = 'sm2-preferflash=',
                    b = null,
                    b2 = null,
                    hasCon = (window.console !== _undefined && typeof console.log === 'function'),
                    l = wl.toLowerCase();

                if (l.indexOf(a) !== -1) {
                    b = (l.charAt(l.indexOf(a) + a.length) === '1');
                    if (hasCon) {
                        console.log((b ? 'Enabling ' : 'Disabling ') + 'useHTML5Audio via URL parameter');
                    }
                    sm2.setup({
                        'useHTML5Audio': b
                    });
                }

                if (l.indexOf(a2) !== -1) {
                    b2 = (l.charAt(l.indexOf(a2) + a2.length) === '1');
                    if (hasCon) {
                        console.log((b2 ? 'Enabling ' : 'Disabling ') + 'preferFlash via URL parameter');
                    }
                    sm2.setup({
                        'preferFlash': b2
                    });
                }

            }());
            // </d>

            if (!hasFlash && sm2.hasHTML5) {
                sm2._wD('SoundManager: No Flash detected' + (!sm2.useHTML5Audio ? ', enabling HTML5.' : '. Trying HTML5-only mode.'), 1);
                sm2.setup({
                    'useHTML5Audio': true,
                    // make sure we aren't preferring flash, either
                    // TODO: preferFlash should not matter if flash is not installed. Currently, stuff breaks without the below tweak.
                    'preferFlash': false
                });
            }

            testHTML5();
            sm2.html5.usingFlash = featureCheck();
            needsFlash = sm2.html5.usingFlash;

            if (!hasFlash && needsFlash) {
                messages.push(strings.needFlash);
                // TODO: Fatal here vs. timeout approach, etc.
                // hack: fail sooner.
                sm2.setup({
                    'flashLoadTimeout': 1
                });
            }

            if (doc.removeEventListener) {
                doc.removeEventListener('DOMContentLoaded', domContentLoaded, false);
            }

            initMovie();

            return true;

        };

        domContentLoadedIE = function () {

            if (doc.readyState === 'complete') {
                domContentLoaded();
                doc.detachEvent('onreadystatechange', domContentLoadedIE);
            }

            return true;

        };

        winOnLoad = function () {

            // catch edge case of initComplete() firing after window.load()
            windowLoaded = true;
            event.remove(window, 'load', winOnLoad);

        };

        /**
         * miscellaneous run-time, pre-init stuff
         */

        preInit = function () {

            if (mobileHTML5) {

                // prefer HTML5 for mobile + tablet-like devices, probably more reliable vs. flash at this point.

                // <d>
                if (!sm2.setupOptions.useHTML5Audio || sm2.setupOptions.preferFlash) {
                    // notify that defaults are being changed.
                    messages.push(strings.mobileUA);
                }
                // </d>

                sm2.setupOptions.useHTML5Audio = true;
                sm2.setupOptions.preferFlash = false;

                if (is_iDevice || (isAndroid && !ua.match(/android\s2\.3/i))) {
                    // iOS and Android devices tend to work better with a single audio instance, specifically for chained playback of sounds in sequence.
                    // common use case: exiting sound onfinish() -> createSound() -> play()
                    // <d>
                    messages.push(strings.globalHTML5);
                    // </d>
                    if (is_iDevice) {
                        sm2.ignoreFlash = true;
                    }
                    useGlobalHTML5Audio = true;
                }

            }

        };

        preInit();

        // sniff up-front
        detectFlash();

        // focus and window load, init (primarily flash-driven)
        event.add(window, 'focus', handleFocus);
        event.add(window, 'load', delayWaitForEI);
        event.add(window, 'load', winOnLoad);

        if (doc.addEventListener) {

            doc.addEventListener('DOMContentLoaded', domContentLoaded, false);

        } else if (doc.attachEvent) {

            doc.attachEvent('onreadystatechange', domContentLoadedIE);

        } else {

            // no add/attachevent support - safe to assume no JS -> Flash either
            debugTS('onload', false);
            catchError({ type: 'NO_DOM2_EVENTS', fatal: true });

        }

    } // SoundManager()

    // SM2_DEFER details: http://www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading

    if (window.SM2_DEFER === undefined || !SM2_DEFER) {
        soundManager = new SoundManager();
    }

    /**
     * SoundManager public interfaces
     * ------------------------------
     */

    window.SoundManager = SoundManager; // constructor
    window.soundManager = soundManager; // public API, flash callbacks etc.

}(window));

/** @license
	Animator.js 1.1.9
	
	This library is released under the BSD license:

	Copyright (c) 2006, Bernard Sumption. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:
	
	Redistributions of source code must retain the above copyright notice, this
	list of conditions and the following disclaimer. Redistributions in binary
	form must reproduce the above copyright notice, this list of conditions and
	the following disclaimer in the documentation and/or other materials
	provided with the distribution. Neither the name BernieCode nor
	the names of its contributors may be used to endorse or promote products
	derived from this software without specific prior written permission. 
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
	DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
	CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
	LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
	OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
	DAMAGE.

*/

// http://www.berniecode.com/writing/animator.html

// Applies a sequence of numbers between 0 and 1 to a number of subjects
// construct - see setOptions for parameters
function Animator(options) {
    this.setOptions(options);
    var _this = this;
    this.timerDelegate = function () { _this.onTimerEvent() };
    this.subjects = [];
    this.subjectScopes = [];
    this.target = 0;
    this.state = 0;
    this.lastTime = null;
};
Animator.prototype = {
    // apply defaults
    setOptions: function (options) {
        this.options = Animator.applyDefaults({
            interval: 20,  // time between animation frames
            duration: 400, // length of animation
            onComplete: function () { },
            onStep: function () { },
            transition: Animator.tx.easeInOut
        }, options);
    },
    // animate from the current state to provided value
    seekTo: function (to) {
        this.seekFromTo(this.state, to);
    },
    // animate from the current state to provided value
    seekFromTo: function (from, to) {
        this.target = Math.max(0, Math.min(1, to));
        this.state = Math.max(0, Math.min(1, from));
        this.lastTime = new Date().getTime();
        if (!this.intervalId) {
            this.intervalId = window.setInterval(this.timerDelegate, this.options.interval);
        }
    },
    // animate from the current state to provided value
    jumpTo: function (to) {
        this.target = this.state = Math.max(0, Math.min(1, to));
        this.propagate();
    },
    // seek to the opposite of the current target
    toggle: function () {
        this.seekTo(1 - this.target);
    },
    // add a function or an object with a method setState(state) that will be called with a number
    // between 0 and 1 on each frame of the animation
    addSubject: function (subject, scope) {
        this.subjects[this.subjects.length] = subject;
        this.subjectScopes[this.subjectScopes.length] = scope;
        return this;
    },
    // remove all subjects
    clearSubjects: function () {
        this.subjects = [];
        this.subjectScopes = [];
    },
    // forward the current state to the animation subjects
    propagate: function () {
        var value = this.options.transition(this.state);
        for (var i = 0; i < this.subjects.length; i++) {
            if (this.subjects[i].setState) {
                this.subjects[i].setState(value);
            } else {
                this.subjects[i].apply(this.subjectScopes[i], [value]);
            }
        }
    },
    // called once per frame to update the current state
    onTimerEvent: function () {
        var now = new Date().getTime();
        var timePassed = now - this.lastTime;
        this.lastTime = now;
        var movement = (timePassed / this.options.duration) * (this.state < this.target ? 1 : -1);
        if (Math.abs(movement) >= Math.abs(this.state - this.target)) {
            this.state = this.target;
        } else {
            this.state += movement;
        }

        try {
            this.propagate();
        } finally {
            this.options.onStep.call(this);
            if (this.target == this.state) {
                window.clearInterval(this.intervalId);
                this.intervalId = null;
                this.options.onComplete.call(this);
            }
        }
    },
    // shortcuts
    play: function () { this.seekFromTo(0, 1) },
    reverse: function () { this.seekFromTo(1, 0) },
    // return a string describing this Animator, for debugging
    inspect: function () {
        var str = "#<Animator:\n";
        for (var i = 0; i < this.subjects.length; i++) {
            str += this.subjects[i].inspect();
        }
        str += ">";
        return str;
    }
}
// merge the properties of two objects
Animator.applyDefaults = function (defaults, prefs) {
    prefs = prefs || {};
    var prop, result = {};
    for (prop in defaults) result[prop] = prefs[prop] !== undefined ? prefs[prop] : defaults[prop];
    return result;
}
// make an array from any object
Animator.makeArray = function (o) {
    if (o == null) return [];
    if (!o.length) return [o];
    var result = [];
    for (var i = 0; i < o.length; i++) result[i] = o[i];
    return result;
}
// convert a dash-delimited-property to a camelCaseProperty (c/o Prototype, thanks Sam!)
Animator.camelize = function (string) {
    var oStringList = string.split('-');
    if (oStringList.length == 1) return oStringList[0];

    var camelizedString = string.indexOf('-') == 0
        ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
        : oStringList[0];

    for (var i = 1, len = oStringList.length; i < len; i++) {
        var s = oStringList[i];
        camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
    }
    return camelizedString;
}
// syntactic sugar for creating CSSStyleSubjects
Animator.apply = function (el, style, options) {
    if (style instanceof Array) {
        return new Animator(options).addSubject(new CSSStyleSubject(el, style[0], style[1]));
    }
    return new Animator(options).addSubject(new CSSStyleSubject(el, style));
}
// make a transition function that gradually accelerates. pass a=1 for smooth
// gravitational acceleration, higher values for an exaggerated effect
Animator.makeEaseIn = function (a) {
    return function (state) {
        return Math.pow(state, a * 2);
    }
}
// as makeEaseIn but for deceleration
Animator.makeEaseOut = function (a) {
    return function (state) {
        return 1 - Math.pow(1 - state, a * 2);
    }
}
// make a transition function that, like an object with momentum being attracted to a point,
// goes past the target then returns
Animator.makeElastic = function (bounces) {
    return function (state) {
        state = Animator.tx.easeInOut(state);
        return ((1 - Math.cos(state * Math.PI * bounces)) * (1 - state)) + state;
    }
}
// make an Attack Decay Sustain Release envelope that starts and finishes on the same level
// 
Animator.makeADSR = function (attackEnd, decayEnd, sustainEnd, sustainLevel) {
    if (sustainLevel == null) sustainLevel = 0.5;
    return function (state) {
        if (state < attackEnd) {
            return state / attackEnd;
        }
        if (state < decayEnd) {
            return 1 - ((state - attackEnd) / (decayEnd - attackEnd) * (1 - sustainLevel));
        }
        if (state < sustainEnd) {
            return sustainLevel;
        }
        return sustainLevel * (1 - ((state - sustainEnd) / (1 - sustainEnd)));
    }
}
// make a transition function that, like a ball falling to floor, reaches the target and/
// bounces back again
Animator.makeBounce = function (bounces) {
    var fn = Animator.makeElastic(bounces);
    return function (state) {
        state = fn(state);
        return state <= 1 ? state : 2 - state;
    }
}

// pre-made transition functions to use with the 'transition' option
Animator.tx = {
    easeInOut: function (pos) {
        return ((-Math.cos(pos * Math.PI) / 2) + 0.5);
    },
    linear: function (x) {
        return x;
    },
    easeIn: Animator.makeEaseIn(1.5),
    easeOut: Animator.makeEaseOut(1.5),
    strongEaseIn: Animator.makeEaseIn(2.5),
    strongEaseOut: Animator.makeEaseOut(2.5),
    elastic: Animator.makeElastic(1),
    veryElastic: Animator.makeElastic(3),
    bouncy: Animator.makeBounce(1),
    veryBouncy: Animator.makeBounce(3)
}

// animates a pixel-based style property between two integer values
function NumericalStyleSubject(els, property, from, to, units) {
    this.els = Animator.makeArray(els);
    if (property == 'opacity' && window.ActiveXObject) {
        this.property = 'filter';
    } else {
        this.property = Animator.camelize(property);
    }
    this.from = parseFloat(from);
    this.to = parseFloat(to);
    this.units = units != null ? units : 'px';
}
NumericalStyleSubject.prototype = {
    setState: function (state) {
        var style = this.getStyle(state);
        var visibility = (this.property == 'opacity' && state == 0) ? 'hidden' : '';
        var j = 0;
        for (var i = 0; i < this.els.length; i++) {
            try {
                this.els[i].style[this.property] = style;
            } catch (e) {
                // ignore fontWeight - intermediate numerical values cause exeptions in firefox
                if (this.property != 'fontWeight') throw e;
            }
            if (j++ > 20) return;
        }
    },
    getStyle: function (state) {
        state = this.from + ((this.to - this.from) * state);
        if (this.property == 'filter') return "alpha(opacity=" + Math.round(state * 100) + ")";
        if (this.property == 'opacity') return state;
        return Math.round(state) + this.units;
    },
    inspect: function () {
        return "\t" + this.property + "(" + this.from + this.units + " to " + this.to + this.units + ")\n";
    }
}

// animates a colour based style property between two hex values
function ColorStyleSubject(els, property, from, to) {
    this.els = Animator.makeArray(els);
    this.property = Animator.camelize(property);
    this.to = this.expandColor(to);
    this.from = this.expandColor(from);
    this.origFrom = from;
    this.origTo = to;
}

ColorStyleSubject.prototype = {
    // parse "#FFFF00" to [256, 256, 0]
    expandColor: function (color) {
        var hexColor, red, green, blue;
        hexColor = ColorStyleSubject.parseColor(color);
        if (hexColor) {
            red = parseInt(hexColor.slice(1, 3), 16);
            green = parseInt(hexColor.slice(3, 5), 16);
            blue = parseInt(hexColor.slice(5, 7), 16);
            return [red, green, blue]
        }
        if (window.DEBUG) {
            alert("Invalid colour: '" + color + "'");
        }
    },
    getValueForState: function (color, state) {
        return Math.round(this.from[color] + ((this.to[color] - this.from[color]) * state));
    },
    setState: function (state) {
        var color = '#'
            + ColorStyleSubject.toColorPart(this.getValueForState(0, state))
            + ColorStyleSubject.toColorPart(this.getValueForState(1, state))
            + ColorStyleSubject.toColorPart(this.getValueForState(2, state));
        for (var i = 0; i < this.els.length; i++) {
            this.els[i].style[this.property] = color;
        }
    },
    inspect: function () {
        return "\t" + this.property + "(" + this.origFrom + " to " + this.origTo + ")\n";
    }
}

// return a properly formatted 6-digit hex colour spec, or false
ColorStyleSubject.parseColor = function (string) {
    var color = '#', match;
    if (match = ColorStyleSubject.parseColor.rgbRe.exec(string)) {
        var part;
        for (var i = 1; i <= 3; i++) {
            part = Math.max(0, Math.min(255, parseInt(match[i])));
            color += ColorStyleSubject.toColorPart(part);
        }
        return color;
    }
    if (match = ColorStyleSubject.parseColor.hexRe.exec(string)) {
        if (match[1].length == 3) {
            for (var i = 0; i < 3; i++) {
                color += match[1].charAt(i) + match[1].charAt(i);
            }
            return color;
        }
        return '#' + match[1];
    }
    return false;
}
// convert a number to a 2 digit hex string
ColorStyleSubject.toColorPart = function (number) {
    if (number > 255) number = 255;
    var digits = number.toString(16);
    if (number < 16) return '0' + digits;
    return digits;
}
ColorStyleSubject.parseColor.rgbRe = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
ColorStyleSubject.parseColor.hexRe = /^\#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Animates discrete styles, i.e. ones that do not scale but have discrete values
// that can't be interpolated
function DiscreteStyleSubject(els, property, from, to, threshold) {
    this.els = Animator.makeArray(els);
    this.property = Animator.camelize(property);
    this.from = from;
    this.to = to;
    this.threshold = threshold || 0.5;
}

DiscreteStyleSubject.prototype = {
    setState: function (state) {
        var j = 0;
        for (var i = 0; i < this.els.length; i++) {
            this.els[i].style[this.property] = state <= this.threshold ? this.from : this.to;
        }
    },
    inspect: function () {
        return "\t" + this.property + "(" + this.from + " to " + this.to + " @ " + this.threshold + ")\n";
    }
}

// animates between two styles defined using CSS.
// if style1 and style2 are present, animate between them, if only style1
// is present, animate between the element's current style and style1
function CSSStyleSubject(els, style1, style2) {
    els = Animator.makeArray(els);
    this.subjects = [];
    if (els.length == 0) return;
    var prop, toStyle, fromStyle;
    if (style2) {
        fromStyle = this.parseStyle(style1, els[0]);
        toStyle = this.parseStyle(style2, els[0]);
    } else {
        toStyle = this.parseStyle(style1, els[0]);
        fromStyle = {};
        for (prop in toStyle) {
            fromStyle[prop] = CSSStyleSubject.getStyle(els[0], prop);
        }
    }
    // remove unchanging properties
    var prop;
    for (prop in fromStyle) {
        if (fromStyle[prop] == toStyle[prop]) {
            delete fromStyle[prop];
            delete toStyle[prop];
        }
    }
    // discover the type (numerical or colour) of each style
    var prop, units, match, type, from, to;
    for (prop in fromStyle) {
        var fromProp = String(fromStyle[prop]);
        var toProp = String(toStyle[prop]);
        if (toStyle[prop] == null) {
            if (window.DEBUG) alert("No to style provided for '" + prop + '"');
            continue;
        }

        if (from = ColorStyleSubject.parseColor(fromProp)) {
            to = ColorStyleSubject.parseColor(toProp);
            type = ColorStyleSubject;
        } else if (fromProp.match(CSSStyleSubject.numericalRe)
            && toProp.match(CSSStyleSubject.numericalRe)) {
            from = parseFloat(fromProp);
            to = parseFloat(toProp);
            type = NumericalStyleSubject;
            match = CSSStyleSubject.numericalRe.exec(fromProp);
            var reResult = CSSStyleSubject.numericalRe.exec(toProp);
            if (match[1] != null) {
                units = match[1];
            } else if (reResult[1] != null) {
                units = reResult[1];
            } else {
                units = reResult;
            }
        } else if (fromProp.match(CSSStyleSubject.discreteRe)
            && toProp.match(CSSStyleSubject.discreteRe)) {
            from = fromProp;
            to = toProp;
            type = DiscreteStyleSubject;
            units = 0;   // hack - how to get an animator option down to here
        } else {
            if (window.DEBUG) {
                alert("Unrecognised format for value of "
                    + prop + ": '" + fromStyle[prop] + "'");
            }
            continue;
        }
        this.subjects[this.subjects.length] = new type(els, prop, from, to, units);
    }
}

CSSStyleSubject.prototype = {
    // parses "width: 400px; color: #FFBB2E" to {width: "400px", color: "#FFBB2E"}
    parseStyle: function (style, el) {
        var rtn = {};
        // if style is a rule set
        if (style.indexOf(":") != -1) {
            var styles = style.split(";");
            for (var i = 0; i < styles.length; i++) {
                var parts = CSSStyleSubject.ruleRe.exec(styles[i]);
                if (parts) {
                    rtn[parts[1]] = parts[2];
                }
            }
        }
        // else assume style is a class name
        else {
            var prop, value, oldClass;
            oldClass = el.className;
            el.className = style;
            for (var i = 0; i < CSSStyleSubject.cssProperties.length; i++) {
                prop = CSSStyleSubject.cssProperties[i];
                value = CSSStyleSubject.getStyle(el, prop);
                if (value != null) {
                    rtn[prop] = value;
                }
            }
            el.className = oldClass;
        }
        return rtn;

    },
    setState: function (state) {
        for (var i = 0; i < this.subjects.length; i++) {
            this.subjects[i].setState(state);
        }
    },
    inspect: function () {
        var str = "";
        for (var i = 0; i < this.subjects.length; i++) {
            str += this.subjects[i].inspect();
        }
        return str;
    }
}
// get the current value of a css property, 
CSSStyleSubject.getStyle = function (el, property) {
    var style;
    if (document.defaultView && document.defaultView.getComputedStyle) {
        style = document.defaultView.getComputedStyle(el, "").getPropertyValue(property);
        if (style) {
            return style;
        }
    }
    property = Animator.camelize(property);
    if (el.currentStyle) {
        style = el.currentStyle[property];
    }
    return style || el.style[property]
}


CSSStyleSubject.ruleRe = /^\s*([a-zA-Z\-]+)\s*:\s*(\S(.+\S)?)\s*$/;
CSSStyleSubject.numericalRe = /^-?\d+(?:\.\d+)?(%|[a-zA-Z]{2})?$/;
CSSStyleSubject.discreteRe = /^\w+$/;

// required because the style object of elements isn't enumerable in Safari
/*
CSSStyleSubject.cssProperties = ['background-color','border','border-color','border-spacing',
'border-style','border-top','border-right','border-bottom','border-left','border-top-color',
'border-right-color','border-bottom-color','border-left-color','border-top-width','border-right-width',
'border-bottom-width','border-left-width','border-width','bottom','color','font-size','font-size-adjust',
'font-stretch','font-style','height','left','letter-spacing','line-height','margin','margin-top',
'margin-right','margin-bottom','margin-left','marker-offset','max-height','max-width','min-height',
'min-width','orphans','outline','outline-color','outline-style','outline-width','overflow','padding',
'padding-top','padding-right','padding-bottom','padding-left','quotes','right','size','text-indent',
'top','width','word-spacing','z-index','opacity','outline-offset'];*/


CSSStyleSubject.cssProperties = ['azimuth', 'background', 'background-attachment', 'background-color', 'background-image', 'background-position', 'background-repeat', 'border-collapse', 'border-color', 'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-width', 'bottom', 'clear', 'clip', 'color', 'content', 'cursor', 'direction', 'display', 'elevation', 'empty-cells', 'css-float', 'font', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'height', 'left', 'letter-spacing', 'line-height', 'list-style', 'list-style-image', 'list-style-position', 'list-style-type', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'max-height', 'max-width', 'min-height', 'min-width', 'orphans', 'outline', 'outline-color', 'outline-style', 'outline-width', 'overflow', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'pause', 'position', 'right', 'size', 'table-layout', 'text-align', 'text-decoration', 'text-indent', 'text-shadow', 'text-transform', 'top', 'vertical-align', 'visibility', 'white-space', 'width', 'word-spacing', 'z-index', 'opacity', 'outline-offset', 'overflow-x', 'overflow-y'];


// chains several Animator objects together
function AnimatorChain(animators, options) {
    this.animators = animators;
    this.setOptions(options);
    for (var i = 0; i < this.animators.length; i++) {
        this.listenTo(this.animators[i]);
    }
    this.forwards = false;
    this.current = 0;
}

AnimatorChain.prototype = {
    // apply defaults
    setOptions: function (options) {
        this.options = Animator.applyDefaults({
            // by default, each call to AnimatorChain.play() calls jumpTo(0) of each animator
            // before playing, which can cause flickering if you have multiple animators all
            // targeting the same element. Set this to false to avoid this.
            resetOnPlay: true
        }, options);
    },
    // play each animator in turn
    play: function () {
        this.forwards = true;
        this.current = -1;
        if (this.options.resetOnPlay) {
            for (var i = 0; i < this.animators.length; i++) {
                this.animators[i].jumpTo(0);
            }
        }
        this.advance();
    },
    // play all animators backwards
    reverse: function () {
        this.forwards = false;
        this.current = this.animators.length;
        if (this.options.resetOnPlay) {
            for (var i = 0; i < this.animators.length; i++) {
                this.animators[i].jumpTo(1);
            }
        }
        this.advance();
    },
    // if we have just play()'d, then call reverse(), and vice versa
    toggle: function () {
        if (this.forwards) {
            this.seekTo(0);
        } else {
            this.seekTo(1);
        }
    },
    // internal: install an event listener on an animator's onComplete option
    // to trigger the next animator
    listenTo: function (animator) {
        var oldOnComplete = animator.options.onComplete;
        var _this = this;
        animator.options.onComplete = function () {
            if (oldOnComplete) oldOnComplete.call(animator);
            _this.advance();
        }
    },
    // play the next animator
    advance: function () {
        if (this.forwards) {
            if (this.animators[this.current + 1] == null) return;
            this.current++;
            this.animators[this.current].play();
        } else {
            if (this.animators[this.current - 1] == null) return;
            this.current--;
            this.animators[this.current].reverse();
        }
    },
    // this function is provided for drop-in compatibility with Animator objects,
    // but only accepts 0 and 1 as target values
    seekTo: function (target) {
        if (target <= 0) {
            this.forwards = false;
            this.animators[this.current].seekTo(0);
        } else {
            this.forwards = true;
            this.animators[this.current].seekTo(1);
        }
    }
}

// an Accordion is a class that creates and controls a number of Animators. An array of elements is passed in,
// and for each element an Animator and a activator button is created. When an Animator's activator button is
// clicked, the Animator and all before it seek to 0, and all Animators after it seek to 1. This can be used to
// create the classic Accordion effect, hence the name.
// see setOptions for arguments
function Accordion(options) {
    this.setOptions(options);
    var selected = this.options.initialSection, current;
    if (this.options.rememberance) {
        current = document.location.hash.substring(1);
    }
    this.rememberanceTexts = [];
    this.ans = [];
    var _this = this;
    for (var i = 0; i < this.options.sections.length; i++) {
        var el = this.options.sections[i];
        var an = new Animator(this.options.animatorOptions);
        var from = this.options.from + (this.options.shift * i);
        var to = this.options.to + (this.options.shift * i);
        an.addSubject(new NumericalStyleSubject(el, this.options.property, from, to, this.options.units));
        an.jumpTo(0);
        var activator = this.options.getActivator(el);
        activator.index = i;
        activator.onclick = function () { _this.show(this.index) };
        this.ans[this.ans.length] = an;
        this.rememberanceTexts[i] = activator.innerHTML.replace(/\s/g, "");
        if (this.rememberanceTexts[i] === current) {
            selected = i;
        }
    }
    this.show(selected);
}

Accordion.prototype = {
    // apply defaults
    setOptions: function (options) {
        this.options = Object.extend({
            // REQUIRED: an array of elements to use as the accordion sections
            sections: null,
            // a function that locates an activator button element given a section element.
            // by default it takes a button id from the section's "activator" attibute
            getActivator: function (el) { return document.getElementById(el.getAttribute("activator")) },
            // shifts each animator's range, for example with options {from:0,to:100,shift:20}
            // the animators' ranges will be 0-100, 20-120, 40-140 etc.
            shift: 0,
            // the first page to show
            initialSection: 0,
            // if set to true, document.location.hash will be used to preserve the open section across page reloads 
            rememberance: true,
            // constructor arguments to the Animator objects
            animatorOptions: {}
        }, options || {});
    },
    show: function (section) {
        for (var i = 0; i < this.ans.length; i++) {
            this.ans[i].seekTo(i > section ? 1 : 0);
        }
        if (this.options.rememberance) {
            document.location.hash = this.rememberanceTexts[section];
        }
    }
}


/**
 *
 * SoundManager 2 Demo: 360-degree / "donut player"
 * ------------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * An inline player with a circular UI.
 * Based on the original SM2 inline player.
 * Inspired by Apple's preview feature in the
 * iTunes music store (iPhone), among others.
 *
 * Requires SoundManager 2 Javascript API.
 * Also uses Bernie's Better Animation Class (BSD):
 * http://www.berniecode.com/writing/animator.html
 *
*/

/*jslint white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: false, bitwise: true, regexp: false, newcap: true, immed: true */
/*global document, window, soundManager, navigator */

var threeSixtyPlayer, // instance
    ThreeSixtyPlayer; // constructor

(function (window) {

    function ThreeSixtyPlayer() {

        var self = this,
            pl = this,
            sm = soundManager, // soundManager instance
            uA = navigator.userAgent,
            isIE = (uA.match(/msie/i)),
            isOpera = (uA.match(/opera/i)),
            isSafari = (uA.match(/safari/i)),
            isChrome = (uA.match(/chrome/i)),
            isFirefox = (uA.match(/firefox/i)),
            isTouchDevice = (uA.match(/ipad|iphone/i)),
            hasRealCanvas = (typeof window.G_vmlCanvasManager === 'undefined' && typeof document.createElement('canvas').getContext('2d') !== 'undefined'),
            // I dunno what Opera doesn't like about this. I'm probably doing it wrong.
            fullCircle = (isOpera || isChrome ? 359.9 : 360);

        // CSS class for ignoring MP3 links
        this.excludeClass = 'threesixty-exclude';
        this.links = [];
        this.sounds = [];
        this.soundsByURL = [];
        this.indexByURL = [];
        this.lastSound = null;
        this.lastTouchedSound = null;
        this.soundCount = 0;
        this.oUITemplate = null;
        this.oUIImageMap = null;
        this.vuMeter = null;
        this.callbackCount = 0;
        this.peakDataHistory = [];

        // 360player configuration options
        this.config = {

            playNext: false,   // stop after one sound, or play through list until end
            autoPlay: false,   // start playing the first sound right away
            allowMultiple: false,  // let many sounds play at once (false = only one sound playing at a time)
            loadRingColor: '#ccc', // how much has loaded
            playRingColor: '#000', // how much has played
            backgroundRingColor: '#eee', // color shown underneath load + play ("not yet loaded" color)

            // optional segment/annotation (metadata) stuff..
            segmentRingColor: 'rgba(255,255,255,0.33)', // metadata/annotation (segment) colors
            segmentRingColorAlt: 'rgba(0,0,0,0.1)',
            loadRingColorMetadata: '#ddd', // "annotations" load color
            playRingColorMetadata: 'rgba(128,192,256,0.9)', // how much has played when metadata is present

            circleDiameter: null, // set dynamically according to values from CSS
            circleRadius: null,
            animDuration: 500,
            animTransition: window.Animator.tx.bouncy, // http://www.berniecode.com/writing/animator.html
            showHMSTime: false, // hours:minutes:seconds vs. seconds-only
            scaleFont: true,  // also set the font size (if possible) while animating the circle

            // optional: spectrum or EQ graph in canvas (not supported in IE <9, too slow via ExCanvas)
            useWaveformData: false,
            waveformDataColor: '#0099ff',
            waveformDataDownsample: 3, // use only one in X (of a set of 256 values) - 1 means all 256
            waveformDataOutside: false,
            waveformDataConstrain: false, // if true, +ve values only - keep within inside circle
            waveformDataLineRatio: 0.64,

            // "spectrum frequency" option
            useEQData: false,
            eqDataColor: '#339933',
            eqDataDownsample: 4, // use only one in X (of 256 values)
            eqDataOutside: true,
            eqDataLineRatio: 0.54,

            // enable "amplifier" (canvas pulses like a speaker) effect
            usePeakData: true,
            peakDataColor: '#ff33ff',
            peakDataOutside: true,
            peakDataLineRatio: 0.5,

            useAmplifier: true, // "pulse" like a speaker

            fontSizeMax: null, // set according to CSS

            scaleArcWidth: 1,  // thickness factor of playback progress ring

            useFavIcon: false // Experimental (also requires usePeakData: true).. Try to draw a "VU Meter" in the favicon area, if browser supports it (Firefox + Opera as of 2009)

        };

        this.css = {

            // CSS class names appended to link during various states
            sDefault: 'sm2_link', // default state
            sBuffering: 'sm2_buffering',
            sPlaying: 'sm2_playing',
            sPaused: 'sm2_paused'

        };

        this.addEventHandler = (typeof window.addEventListener !== 'undefined' ? function (o, evtName, evtHandler) {
            return o.addEventListener(evtName, evtHandler, false);
        } : function (o, evtName, evtHandler) {
            o.attachEvent('on' + evtName, evtHandler);
        });

        this.removeEventHandler = (typeof window.removeEventListener !== 'undefined' ? function (o, evtName, evtHandler) {
            return o.removeEventListener(evtName, evtHandler, false);
        } : function (o, evtName, evtHandler) {
            return o.detachEvent('on' + evtName, evtHandler);
        });

        this.hasClass = function (o, cStr) {
            return typeof (o.className) !== 'undefined' ? o.className.match(new RegExp('(\\s|^)' + cStr + '(\\s|$)')) : false;
        };

        this.addClass = function (o, cStr) {

            if (!o || !cStr || self.hasClass(o, cStr)) {
                return false;
            }
            o.className = (o.className ? o.className + ' ' : '') + cStr;

        };

        this.removeClass = function (o, cStr) {

            if (!o || !cStr || !self.hasClass(o, cStr)) {
                return false;
            }
            o.className = o.className.replace(new RegExp('( ' + cStr + ')|(' + cStr + ')', 'g'), '');

        };

        this.getElementsByClassName = function (className, tagNames, oParent) {

            var doc = (oParent || document),
                matches = [], i, j, nodes = [];
            if (typeof tagNames !== 'undefined' && typeof tagNames !== 'string') {
                for (i = tagNames.length; i--;) {
                    if (!nodes || !nodes[tagNames[i]]) {
                        nodes[tagNames[i]] = doc.getElementsByTagName(tagNames[i]);
                    }
                }
            } else if (tagNames) {
                nodes = doc.getElementsByTagName(tagNames);
            } else {
                nodes = doc.all || doc.getElementsByTagName('*');
            }
            if (typeof (tagNames) !== 'string') {
                for (i = tagNames.length; i--;) {
                    for (j = nodes[tagNames[i]].length; j--;) {
                        if (self.hasClass(nodes[tagNames[i]][j], className)) {
                            matches.push(nodes[tagNames[i]][j]);
                        }
                    }
                }
            } else {
                for (i = 0; i < nodes.length; i++) {
                    if (self.hasClass(nodes[i], className)) {
                        matches.push(nodes[i]);
                    }
                }
            }
            return matches;

        };

        this.getParentByNodeName = function (oChild, sParentNodeName) {

            if (!oChild || !sParentNodeName) {
                return false;
            }
            sParentNodeName = sParentNodeName.toLowerCase();
            while (oChild.parentNode && sParentNodeName !== oChild.parentNode.nodeName.toLowerCase()) {
                oChild = oChild.parentNode;
            }
            return (oChild.parentNode && sParentNodeName === oChild.parentNode.nodeName.toLowerCase() ? oChild.parentNode : null);

        };

        this.getParentByClassName = function (oChild, sParentClassName) {

            if (!oChild || !sParentClassName) {
                return false;
            }
            while (oChild.parentNode && !self.hasClass(oChild.parentNode, sParentClassName)) {
                oChild = oChild.parentNode;
            }
            return (oChild.parentNode && self.hasClass(oChild.parentNode, sParentClassName) ? oChild.parentNode : null);

        };

        this.getSoundByURL = function (sURL) {
            return (typeof self.soundsByURL[sURL] !== 'undefined' ? self.soundsByURL[sURL] : null);
        };

        this.isChildOfNode = function (o, sNodeName) {

            if (!o || !o.parentNode) {
                return false;
            }
            sNodeName = sNodeName.toLowerCase();
            do {
                o = o.parentNode;
            } while (o && o.parentNode && o.nodeName.toLowerCase() !== sNodeName);
            return (o && o.nodeName.toLowerCase() === sNodeName ? o : null);

        };

        this.isChildOfClass = function (oChild, oClass) {

            if (!oChild || !oClass) {
                return false;
            }
            while (oChild.parentNode && !self.hasClass(oChild, oClass)) {
                oChild = self.findParent(oChild);
            }
            return (self.hasClass(oChild, oClass));

        };

        this.findParent = function (o) {

            if (!o || !o.parentNode) {
                return false;
            }
            o = o.parentNode;
            if (o.nodeType === 2) {
                while (o && o.parentNode && o.parentNode.nodeType === 2) {
                    o = o.parentNode;
                }
            }
            return o;

        };

        this.getStyle = function (o, sProp) {

            // https://www.quirksmode.org/dom/getstyles.html
            try {
                if (o.currentStyle) {
                    return o.currentStyle[sProp];
                } else if (window.getComputedStyle) {
                    return document.defaultView.getComputedStyle(o, null).getPropertyValue(sProp);
                }
            } catch (e) {
                // oh well
            }
            return null;

        };

        this.findXY = function (obj) {

            var curleft = 0, curtop = 0;
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (!!(obj = obj.offsetParent));
            return [curleft, curtop];

        };

        this.getMouseXY = function (e) {

            // https://www.quirksmode.org/js/events_properties.html
            e = e ? e : window.event;
            if (isTouchDevice && e.touches) {
                e = e.touches[0];
            }
            if (e.pageX || e.pageY) {
                return [e.pageX, e.pageY];
            } else if (e.clientX || e.clientY) {
                return [e.clientX + self.getScrollLeft(), e.clientY + self.getScrollTop()];
            }

        };

        this.getScrollLeft = function () {
            return (document.body.scrollLeft + document.documentElement.scrollLeft);
        };

        this.getScrollTop = function () {
            return (document.body.scrollTop + document.documentElement.scrollTop);
        };

        this.events = {

            // handlers for sound events as they're started/stopped/played

            play: function () {
                pl.removeClass(this._360data.oUIBox, this._360data.className);
                this._360data.className = pl.css.sPlaying;
                pl.addClass(this._360data.oUIBox, this._360data.className);
                self.fanOut(this);
            },

            stop: function () {
                pl.removeClass(this._360data.oUIBox, this._360data.className);
                this._360data.className = '';
                self.fanIn(this);
            },

            pause: function () {
                pl.removeClass(this._360data.oUIBox, this._360data.className);
                this._360data.className = pl.css.sPaused;
                pl.addClass(this._360data.oUIBox, this._360data.className);
            },

            resume: function () {
                pl.removeClass(this._360data.oUIBox, this._360data.className);
                this._360data.className = pl.css.sPlaying;
                pl.addClass(this._360data.oUIBox, this._360data.className);
            },

            finish: function () {
                var nextLink;
                pl.removeClass(this._360data.oUIBox, this._360data.className);
                this._360data.className = '';
                // self.clearCanvas(this._360data.oCanvas);
                this._360data.didFinish = true; // so fan draws full circle
                self.fanIn(this);
                if (pl.config.playNext) {
                    nextLink = (pl.indexByURL[this._360data.oLink.href] + 1);
                    if (nextLink < pl.links.length) {
                        pl.handleClick({ 'target': pl.links[nextLink] });
                    }
                }
            },

            whileloading: function () {
                if (this.paused) {
                    self.updatePlaying.apply(this);
                }
            },

            whileplaying: function () {
                self.updatePlaying.apply(this);
                this._360data.fps++;
            },

            bufferchange: function () {
                if (this.isBuffering) {
                    pl.addClass(this._360data.oUIBox, pl.css.sBuffering);
                } else {
                    pl.removeClass(this._360data.oUIBox, pl.css.sBuffering);
                }
            }

        };

        this.stopEvent = function (e) {

            if (typeof e !== 'undefined' && typeof e.preventDefault !== 'undefined') {
                e.preventDefault();
            } else if (typeof window.event !== 'undefined' && typeof window.event.returnValue !== 'undefined') {
                window.event.returnValue = false;
            }
            return false;

        };

        this.getTheDamnLink = (isIE) ? function (e) {
            // I really didn't want to have to do this.
            return (e && e.target ? e.target : window.event.srcElement);
        } : function (e) {
            return e.target;
        };

        this.handleClick = function (e) {

            // a sound link was clicked
            if (e.button > 1) {
                // only catch left-clicks
                return true;
            }

            var o = self.getTheDamnLink(e),
                sURL, soundURL, thisSound, oContainer, has_vis, diameter;

            if (o.nodeName.toLowerCase() !== 'a') {
                o = self.isChildOfNode(o, 'a');
                if (!o) {
                    return true;
                }
            }

            if (!self.isChildOfClass(o, 'ui360')) {
                // not a link we're interested in
                return true;
            }

            sURL = o.getAttribute('href');

            if (!o.href || !sm.canPlayLink(o) || self.hasClass(o, self.excludeClass)) {
                return true; // pass-thru for non-MP3/non-links
            }

            sm._writeDebug('handleClick()');
            soundURL = (o.href);
            thisSound = self.getSoundByURL(soundURL);

            if (thisSound) {

                // already exists
                if (thisSound === self.lastSound) {
                    // and was playing (or paused)
                    thisSound.togglePause();
                } else {
                    // different sound
                    thisSound.togglePause(); // start playing current
                    sm._writeDebug('sound different than last sound: ' + self.lastSound.id);
                    if (!self.config.allowMultiple && self.lastSound) {
                        self.stopSound(self.lastSound);
                    }
                }

            } else {

                // append some dom shiz, make noise

                oContainer = o.parentNode;
                has_vis = (self.getElementsByClassName('ui360-vis', 'div', oContainer.parentNode).length);

                // create sound
                thisSound = sm.createSound({
                    id: 'ui360Sound' + (self.soundCount++),
                    url: soundURL,
                    onplay: self.events.play,
                    onstop: self.events.stop,
                    onpause: self.events.pause,
                    onresume: self.events.resume,
                    onfinish: self.events.finish,
                    onbufferchange: self.events.bufferchange,
                    type: (o.type || null),
                    whileloading: self.events.whileloading,
                    whileplaying: self.events.whileplaying,
                    useWaveformData: (has_vis && self.config.useWaveformData),
                    useEQData: (has_vis && self.config.useEQData),
                    usePeakData: (has_vis && self.config.usePeakData)
                });

                // tack on some custom data

                diameter = parseInt(self.getElementsByClassName('sm2-360ui', 'div', oContainer)[0].offsetWidth, 10);

                thisSound._360data = {
                    oUI360: self.getParentByClassName(o, 'ui360'), // the (whole) entire container
                    oLink: o, // DOM node for reference within SM2 object event handlers
                    className: self.css.sPlaying,
                    oUIBox: self.getElementsByClassName('sm2-360ui', 'div', oContainer)[0],
                    oCanvas: self.getElementsByClassName('sm2-canvas', 'canvas', oContainer)[0],
                    oButton: self.getElementsByClassName('sm2-360btn', 'span', oContainer)[0],
                    oTiming: self.getElementsByClassName('sm2-timing', 'div', oContainer)[0],
                    oCover: self.getElementsByClassName('sm2-cover', 'div', oContainer)[0],
                    circleDiameter: diameter,
                    circleRadius: diameter / 2,
                    lastTime: null,
                    didFinish: null,
                    pauseCount: 0,
                    radius: 0,
                    fontSize: 1,
                    fontSizeMax: self.config.fontSizeMax,
                    scaleFont: (has_vis && self.config.scaleFont),
                    showHMSTime: has_vis,
                    amplifier: (has_vis && self.config.usePeakData ? 0.9 : 1), // TODO: x1 if not being used, else use dynamic "how much to amplify by" value
                    radiusMax: diameter * 0.175, // circle radius
                    width: 0,
                    widthMax: diameter * 0.4, // width of the outer ring
                    lastValues: {
                        bytesLoaded: 0,
                        bytesTotal: 0,
                        position: 0,
                        durationEstimate: 0
                    }, // used to track "last good known" values before sound finish/reset for anim
                    animating: false,
                    oAnim: new window.Animator({
                        duration: self.config.animDuration,
                        transition: self.config.animTransition,
                        onComplete: function () {
                            // var thisSound = this;
                            // thisSound._360data.didFinish = false; // reset full circle
                        }
                    }),
                    oAnimProgress: function (nProgress) {
                        var thisSound = this;
                        thisSound._360data.radius = parseInt(thisSound._360data.radiusMax * thisSound._360data.amplifier * nProgress, 10);
                        thisSound._360data.width = parseInt(thisSound._360data.widthMax * thisSound._360data.amplifier * nProgress, 10);
                        if (thisSound._360data.scaleFont && thisSound._360data.fontSizeMax !== null) {
                            thisSound._360data.oTiming.style.fontSize = parseInt(Math.max(1, thisSound._360data.fontSizeMax * nProgress), 10) + 'px';
                            thisSound._360data.oTiming.style.opacity = nProgress;
                        }
                        if (thisSound.paused || thisSound.playState === 0 || thisSound._360data.lastValues.bytesLoaded === 0 || thisSound._360data.lastValues.position === 0) {
                            self.updatePlaying.apply(thisSound);
                        }
                    },
                    fps: 0
                };

                // "Metadata" (annotations)
                if (typeof self.Metadata !== 'undefined' && self.getElementsByClassName('metadata', 'div', thisSound._360data.oUI360).length) {
                    thisSound._360data.metadata = new self.Metadata(thisSound, self);
                }

                // minimize ze font
                if (thisSound._360data.scaleFont && thisSound._360data.fontSizeMax !== null) {
                    thisSound._360data.oTiming.style.fontSize = '1px';
                }

                // set up ze animation
                thisSound._360data.oAnim.addSubject(thisSound._360data.oAnimProgress, thisSound);

                // animate the radius out nice
                self.refreshCoords(thisSound);

                self.updatePlaying.apply(thisSound);

                self.soundsByURL[soundURL] = thisSound;
                self.sounds.push(thisSound);
                if (!self.config.allowMultiple && self.lastSound) {
                    self.stopSound(self.lastSound);
                }
                thisSound.play();

            }

            self.lastSound = thisSound; // reference for next call

            if (typeof e !== 'undefined' && typeof e.preventDefault !== 'undefined') {
                e.preventDefault();
            } else if (typeof window.event !== 'undefined') {
                window.event.returnValue = false;
            }
            return false;

        };

        this.fanOut = function (oSound) {

            var thisSound = oSound;
            if (thisSound._360data.animating === 1) {
                return false;
            }
            thisSound._360data.animating = 0;
            soundManager._writeDebug('fanOut: ' + thisSound.id + ': ' + thisSound._360data.oLink.href);
            thisSound._360data.oAnim.seekTo(1); // play to end
            window.setTimeout(function () {
                // oncomplete hack
                thisSound._360data.animating = 0;
            }, self.config.animDuration + 20);

        };

        this.fanIn = function (oSound) {

            var thisSound = oSound;
            if (thisSound._360data.animating === -1) {
                return false;
            }
            thisSound._360data.animating = -1;
            soundManager._writeDebug('fanIn: ' + thisSound.id + ': ' + thisSound._360data.oLink.href);
            // massive hack
            thisSound._360data.oAnim.seekTo(0); // play to end
            window.setTimeout(function () {
                // reset full 360 fill after animation has completed (oncomplete hack)
                thisSound._360data.didFinish = false;
                thisSound._360data.animating = 0;
                self.resetLastValues(thisSound);
            }, self.config.animDuration + 20);

        };

        this.resetLastValues = function (oSound) {
            oSound._360data.lastValues.position = 0;
        };

        this.refreshCoords = function (thisSound) {

            thisSound._360data.canvasXY = self.findXY(thisSound._360data.oCanvas);
            thisSound._360data.canvasMid = [thisSound._360data.circleRadius, thisSound._360data.circleRadius];
            thisSound._360data.canvasMidXY = [thisSound._360data.canvasXY[0] + thisSound._360data.canvasMid[0], thisSound._360data.canvasXY[1] + thisSound._360data.canvasMid[1]];

        };

        this.stopSound = function (oSound) {

            soundManager._writeDebug('stopSound: ' + oSound.id);
            soundManager.stop(oSound.id);
            if (!isTouchDevice) { // iOS 4.2+ security blocks onfinish() -> playNext() if we set a .src in-between(?)
                soundManager.unload(oSound.id);
            }

        };

        this.buttonClick = function (e) {

            var o = e ? (e.target ? e.target : e.srcElement) : window.event.srcElement;
            self.handleClick({ target: self.getParentByClassName(o, 'sm2-360ui').nextSibling }); // link next to the nodes we inserted
            return false;

        };

        this.buttonMouseDown = function (e) {

            // user might decide to drag from here
            // watch for mouse move
            if (!isTouchDevice) {
                document.onmousemove = function (e) {
                    // should be boundary-checked, really (eg. move 3px first?)
                    self.mouseDown(e);
                };
            } else {
                self.addEventHandler(document, 'touchmove', self.mouseDown);
            }
            self.stopEvent(e);
            return false;

        };

        this.mouseDown = function (e) {

            if (!isTouchDevice && e.button > 1) {
                return true; // ignore non-left-click
            }

            if (!self.lastSound) {
                self.stopEvent(e);
                return false;
            }

            var evt = e ? e : window.event,
                target, thisSound, oData;

            if (isTouchDevice && evt.touches) {
                evt = evt.touches[0];
            }
            target = (evt.target || evt.srcElement);

            thisSound = self.getSoundByURL(self.getElementsByClassName('sm2_link', 'a', self.getParentByClassName(target, 'ui360'))[0].href); // self.lastSound; // TODO: In multiple sound case, figure out which sound is involved etc.
            // just in case, update coordinates (maybe the element moved since last time.)
            self.lastTouchedSound = thisSound;
            self.refreshCoords(thisSound);
            oData = thisSound._360data;
            self.addClass(oData.oUIBox, 'sm2_dragging');
            oData.pauseCount = (self.lastTouchedSound.paused ? 1 : 0);
            // self.lastSound.pause();
            self.mmh(e ? e : window.event);

            if (isTouchDevice) {
                self.removeEventHandler(document, 'touchmove', self.mouseDown);
                self.addEventHandler(document, 'touchmove', self.mmh);
                self.addEventHandler(document, 'touchend', self.mouseUp);
            } else {
                // incredibly old-skool. TODO: Modernize.
                document.onmousemove = self.mmh;
                document.onmouseup = self.mouseUp;
            }

            self.stopEvent(e);
            return false;

        };

        this.mouseUp = function (e) {

            var oData = self.lastTouchedSound._360data;
            self.removeClass(oData.oUIBox, 'sm2_dragging');
            if (oData.pauseCount === 0) {
                self.lastTouchedSound.resume();
            }
            if (!isTouchDevice) {
                document.onmousemove = null;
                document.onmouseup = null;
            } else {
                self.removeEventHandler(document, 'touchmove', self.mmh);
                self.removeEventHandler(document, 'touchend', self.mouseUP);
            }

        };

        this.mmh = function (e) {

            if (typeof e === 'undefined') {
                e = window.event;
            }
            var oSound = self.lastTouchedSound,
                coords = self.getMouseXY(e),
                x = coords[0],
                y = coords[1],
                deltaX = x - oSound._360data.canvasMidXY[0],
                deltaY = y - oSound._360data.canvasMidXY[1],
                angle = Math.floor(fullCircle - (self.rad2deg(Math.atan2(deltaX, deltaY)) + 180));

            oSound.setPosition(oSound.durationEstimate * (angle / fullCircle));
            self.stopEvent(e);
            return false;

        };

        // assignMouseDown();

        this.drawSolidArc = function (oCanvas, color, radius, width, radians, startAngle, noClear) {

            // thank you, https://www.snipersystems.co.nz/community/polarclock/tutorial.html

            var x = radius,
                y = radius,
                canvas = oCanvas,
                ctx, innerRadius, doesntLikeZero, endPoint;

            if (canvas.getContext) {
                // use getContext to use the canvas for drawing
                ctx = canvas.getContext('2d');
            }

            // re-assign canvas as the actual context
            oCanvas = ctx;

            if (!noClear) {
                self.clearCanvas(canvas);
            }
            // ctx.restore();

            if (color) {
                ctx.fillStyle = color;
            }

            oCanvas.beginPath();

            if (isNaN(radians)) {
                radians = 0;
            }

            innerRadius = radius - width;
            doesntLikeZero = (isOpera || isSafari); // safari 4 doesn't actually seem to mind.

            if (!doesntLikeZero || (doesntLikeZero && radius > 0)) {
                oCanvas.arc(0, 0, radius, startAngle, radians, false);
                endPoint = self.getArcEndpointCoords(innerRadius, radians);
                oCanvas.lineTo(endPoint.x, endPoint.y);
                oCanvas.arc(0, 0, innerRadius, radians, startAngle, true);
                oCanvas.closePath();
                oCanvas.fill();
            }

        };

        this.getArcEndpointCoords = function (radius, radians) {

            return {
                x: radius * Math.cos(radians),
                y: radius * Math.sin(radians)
            };

        };

        this.deg2rad = function (nDeg) {
            return (nDeg * Math.PI / 180);
        };

        this.rad2deg = function (nRad) {
            return (nRad * 180 / Math.PI);
        };

        this.getTime = function (nMSec, bAsString) {

            // convert milliseconds to mm:ss, return as object literal or string
            var nSec = Math.floor(nMSec / 1000),
                min = Math.floor(nSec / 60),
                sec = nSec - (min * 60);
            // if (min === 0 && sec === 0) return null; // return 0:00 as null
            return (bAsString ? (min + ':' + (sec < 10 ? '0' + sec : sec)) : { 'min': min, 'sec': sec });

        };

        this.clearCanvas = function (oCanvas) {

            var canvas = oCanvas,
                ctx = null,
                width, height;
            if (canvas.getContext) {
                // use getContext to use the canvas for drawing
                ctx = canvas.getContext('2d');
            }
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            ctx.clearRect(-(width / 2), -(height / 2), width, height);

        };

        this.updatePlaying = function () {

            var timeNow = (this._360data.showHMSTime ? self.getTime(this.position, true) : parseInt(this.position / 1000, 10));
            var ringScaleFactor = self.config.scaleArcWidth;

            if (this.bytesLoaded) {
                this._360data.lastValues.bytesLoaded = this.bytesLoaded;
                this._360data.lastValues.bytesTotal = this.bytesTotal;
            }

            if (this.position) {
                this._360data.lastValues.position = this.position;
            }

            if (this.durationEstimate) {
                this._360data.lastValues.durationEstimate = this.durationEstimate;
            }

            // background ring
            self.drawSolidArc(this._360data.oCanvas, self.config.backgroundRingColor, this._360data.width, this._360data.radius * ringScaleFactor, self.deg2rad(fullCircle), false);

            // loaded ring
            self.drawSolidArc(this._360data.oCanvas, (this._360data.metadata ? self.config.loadRingColorMetadata : self.config.loadRingColor), this._360data.width, this._360data.radius * ringScaleFactor, self.deg2rad(fullCircle * (this._360data.lastValues.bytesLoaded / this._360data.lastValues.bytesTotal)), 0, true);

            // don't draw if 0 (full black circle in Opera)
            if (this._360data.lastValues.position !== 0) {
                self.drawSolidArc(this._360data.oCanvas, (this._360data.metadata ? self.config.playRingColorMetadata : self.config.playRingColor), this._360data.width, this._360data.radius * ringScaleFactor, self.deg2rad((this._360data.didFinish === 1 ? fullCircle : fullCircle * (this._360data.lastValues.position / this._360data.lastValues.durationEstimate))), 0, true);
            }

            // metadata goes here
            if (this._360data.metadata) {
                this._360data.metadata.events.whileplaying();
            }

            if (timeNow !== this._360data.lastTime) {
                this._360data.lastTime = timeNow;
                this._360data.oTiming.innerHTML = timeNow;
            }

            // draw spectrum, if applicable
            if ((this.instanceOptions.useWaveformData || this.instanceOptions.useEQData) && hasRealCanvas) { // IE <9 can render maybe 3 or 4 FPS when including the wave/EQ, so don't bother.
                self.updateWaveform(this);
            }

            if (self.config.useFavIcon && self.vuMeter) {
                self.vuMeter.updateVU(this);
            }

        };

        this.updateWaveform = function (oSound) {

            if ((!self.config.useWaveformData && !self.config.useEQData) || (!sm.features.waveformData && !sm.features.eqData)) {
                // feature not enabled..
                return false;
            }

            if (!oSound.waveformData.left.length && !oSound.eqData.length && !oSound.peakData.left) {
                // no data (or errored out/paused/unavailable?)
                return false;
            }

            /* use for testing the data */
            /*
             for (i=0; i<256; i++) {
               oSound.eqData[i] = 1-(i/256);
             }
            */

            var oCanvas = oSound._360data.oCanvas.getContext('2d'),
                offX = 0,
                offY = parseInt(oSound._360data.circleDiameter / 2, 10),
                scale = offY / 2, // Y axis (+/- this distance from 0)
                // lineWidth = Math.floor(oSound._360data.circleDiameter-(oSound._360data.circleDiameter*0.175)/(oSound._360data.circleDiameter/255)); // width for each line
                lineWidth = 1,
                lineHeight = 1,
                thisY = 0,
                offset = offY,
                i, j, direction, downSample, dataLength, sampleCount, startAngle, endAngle, waveData, innerRadius, perItemAngle, yDiff, eqSamples, playedAngle, iAvg, nPeak;

            if (self.config.useWaveformData) {
                // raw waveform
                downSample = self.config.waveformDataDownsample; // only sample X in 256 (greater number = less sample points)
                downSample = Math.max(1, downSample); // make sure it's at least 1
                dataLength = 256;
                sampleCount = (dataLength / downSample);
                startAngle = 0;
                endAngle = 0;
                waveData = null;
                innerRadius = (self.config.waveformDataOutside ? 1 : (self.config.waveformDataConstrain ? 0.5 : 0.565));
                scale = (self.config.waveformDataOutside ? 0.7 : 0.75);
                perItemAngle = self.deg2rad((360 / sampleCount) * self.config.waveformDataLineRatio); // 0.85 = clean pixel lines at 150? // self.deg2rad(360*(Math.max(1,downSample-1))/sampleCount);
                for (i = 0; i < dataLength; i += downSample) {
                    startAngle = self.deg2rad(360 * (i / (sampleCount) * 1 / downSample)); // +0.67 - counter for spacing
                    endAngle = startAngle + perItemAngle;
                    waveData = oSound.waveformData.left[i];
                    if (waveData < 0 && self.config.waveformDataConstrain) {
                        waveData = Math.abs(waveData);
                    }
                    self.drawSolidArc(oSound._360data.oCanvas, self.config.waveformDataColor, oSound._360data.width * innerRadius * (2 - self.config.scaleArcWidth), oSound._360data.radius * scale * 1.25 * waveData, endAngle, startAngle, true);
                }
            }

            if (self.config.useEQData) {
                // EQ spectrum
                downSample = self.config.eqDataDownsample; // only sample N in 256
                yDiff = 0;
                downSample = Math.max(1, downSample); // make sure it's at least 1
                eqSamples = 192; // drop the last 25% of the spectrum (>16500 Hz), most stuff won't actually use it.
                sampleCount = (eqSamples / downSample);
                innerRadius = (self.config.eqDataOutside ? 1 : 0.565);
                direction = (self.config.eqDataOutside ? -1 : 1);
                scale = (self.config.eqDataOutside ? 0.5 : 0.75);
                startAngle = 0;
                endAngle = 0;
                perItemAngle = self.deg2rad((360 / sampleCount) * self.config.eqDataLineRatio); // self.deg2rad(360/(sampleCount+1));
                playedAngle = self.deg2rad((oSound._360data.didFinish === 1 ? 360 : 360 * (oSound._360data.lastValues.position / oSound._360data.lastValues.durationEstimate)));
                j = 0;
                iAvg = 0;
                for (i = 0; i < eqSamples; i += downSample) {
                    startAngle = self.deg2rad(360 * (i / eqSamples));
                    endAngle = startAngle + perItemAngle;
                    self.drawSolidArc(oSound._360data.oCanvas, (endAngle > playedAngle ? self.config.eqDataColor : self.config.playRingColor), oSound._360data.width * innerRadius, oSound._360data.radius * scale * (oSound.eqData.left[i] * direction), endAngle, startAngle, true);
                }
            }

            if (self.config.usePeakData) {
                if (!oSound._360data.animating) {
                    nPeak = (oSound.peakData.left || oSound.peakData.right);
                    // GIANT HACK: use EQ spectrum data for bass frequencies
                    eqSamples = 3;
                    for (i = 0; i < eqSamples; i++) {
                        nPeak = (nPeak || oSound.eqData[i]);
                    }
                    oSound._360data.amplifier = (self.config.useAmplifier ? (0.9 + (nPeak * 0.1)) : 1);
                    oSound._360data.radiusMax = oSound._360data.circleDiameter * 0.175 * oSound._360data.amplifier;
                    oSound._360data.widthMax = oSound._360data.circleDiameter * 0.4 * oSound._360data.amplifier;
                    oSound._360data.radius = parseInt(oSound._360data.radiusMax * oSound._360data.amplifier, 10);
                    oSound._360data.width = parseInt(oSound._360data.widthMax * oSound._360data.amplifier, 10);
                }
            }

        };

        this.getUIHTML = function (diameter) {

            return [
                '<canvas class="sm2-canvas" width="' + diameter + '" height="' + diameter + '"></canvas>',
                ' <span class="sm2-360btn sm2-360btn-default"></span>', // note use of imageMap, edit or remove if you use a different-size image.
                ' <div class="sm2-timing' + (navigator.userAgent.match(/safari/i) ? ' alignTweak' : '') + '"></div>', // + Ever-so-slight Safari horizontal alignment tweak
                ' <div class="sm2-cover"></div>'
            ];

        };

        this.uiTest = function (sClass) {

            // fake a 360 UI so we can get some numbers from CSS, etc.

            var oTemplate = document.createElement('div'),
                oFakeUI, oFakeUIBox, oTemp, fakeDiameter, uiHTML, circleDiameter, circleRadius, fontSizeMax, oTiming;

            oTemplate.className = 'sm2-360ui';

            oFakeUI = document.createElement('div');
            oFakeUI.className = 'ui360' + (sClass ? ' ' + sClass : ''); // ui360 ui360-vis

            oFakeUIBox = oFakeUI.appendChild(oTemplate.cloneNode(true));

            oFakeUI.style.position = 'absolute';
            oFakeUI.style.left = '-9999px';

            oTemp = document.body.appendChild(oFakeUI);

            fakeDiameter = oFakeUIBox.offsetWidth;

            uiHTML = self.getUIHTML(fakeDiameter);

            oFakeUIBox.innerHTML = uiHTML[1] + uiHTML[2] + uiHTML[3];

            circleDiameter = parseInt(oFakeUIBox.offsetWidth, 10);
            circleRadius = parseInt(circleDiameter / 2, 10);

            oTiming = self.getElementsByClassName('sm2-timing', 'div', oTemp)[0];
            fontSizeMax = parseInt(self.getStyle(oTiming, 'font-size'), 10);
            if (isNaN(fontSizeMax)) {
                // getStyle() etc. didn't work.
                fontSizeMax = null;
            }

            // soundManager._writeDebug('diameter, font size: '+circleDiameter+','+fontSizeMax);

            oFakeUI.parentNode.removeChild(oFakeUI);

            uiHTML = oFakeUI = oFakeUIBox = oTemp = null;

            return {
                circleDiameter: circleDiameter,
                circleRadius: circleRadius,
                fontSizeMax: fontSizeMax
            };

        };

        this.init = function () {

            sm._writeDebug('threeSixtyPlayer.init()');

            var oItems = self.getElementsByClassName('ui360', 'div'),
                i, j, oLinks = [], is_vis = false, foundItems = 0, oCanvas, oCanvasCTX, oCover, diameter, radius, uiData, uiDataVis, oUI, oBtn, o, o2, oID;

            for (i = 0, j = oItems.length; i < j; i++) {
                oLinks.push(oItems[i].getElementsByTagName('a')[0]);
                // remove "fake" play button (unsupported case)
                oItems[i].style.backgroundImage = 'none';
            }
            // grab all links, look for .mp3

            self.oUITemplate = document.createElement('div');
            self.oUITemplate.className = 'sm2-360ui';

            self.oUITemplateVis = document.createElement('div');
            self.oUITemplateVis.className = 'sm2-360ui';

            uiData = self.uiTest();

            self.config.circleDiameter = uiData.circleDiameter;
            self.config.circleRadius = uiData.circleRadius;
            // self.config.fontSizeMax = uiData.fontSizeMax;

            uiDataVis = self.uiTest('ui360-vis');

            self.config.fontSizeMax = uiDataVis.fontSizeMax;

            // canvas needs inline width and height, doesn't quite work otherwise
            self.oUITemplate.innerHTML = self.getUIHTML(self.config.circleDiameter).join('');

            self.oUITemplateVis.innerHTML = self.getUIHTML(uiDataVis.circleDiameter).join('');

            for (i = 0, j = oLinks.length; i < j; i++) {
                if (sm.canPlayLink(oLinks[i]) && !self.hasClass(oLinks[i], self.excludeClass) && !self.hasClass(oLinks[i], self.css.sDefault)) {
                    self.addClass(oLinks[i], self.css.sDefault); // add default CSS decoration
                    self.links[foundItems] = (oLinks[i]);
                    self.indexByURL[oLinks[i].href] = foundItems; // hack for indexing
                    foundItems++;

                    is_vis = self.hasClass(oLinks[i].parentNode, 'ui360-vis');

                    diameter = (is_vis ? uiDataVis : uiData).circleDiameter;
                    radius = (is_vis ? uiDataVis : uiData).circleRadius;

                    // add canvas shiz
                    oUI = oLinks[i].parentNode.insertBefore((is_vis ? self.oUITemplateVis : self.oUITemplate).cloneNode(true), oLinks[i]);

                    if (isIE && typeof window.G_vmlCanvasManager !== 'undefined') { // IE only
                        o = oLinks[i].parentNode;
                        o2 = document.createElement('canvas');
                        o2.className = 'sm2-canvas';
                        oID = 'sm2_canvas_' + parseInt(Math.random() * 1048576, 10);
                        o2.id = oID;
                        o2.width = diameter;
                        o2.height = diameter;
                        oUI.appendChild(o2);
                        window.G_vmlCanvasManager.initElement(o2); // Apply ExCanvas compatibility magic
                        oCanvas = document.getElementById(oID);
                    } else {
                        // add a handler for the button
                        oCanvas = oLinks[i].parentNode.getElementsByTagName('canvas')[0];
                    }
                    oCover = self.getElementsByClassName('sm2-cover', 'div', oLinks[i].parentNode)[0];
                    oBtn = oLinks[i].parentNode.getElementsByTagName('span')[0];
                    self.addEventHandler(oBtn, 'click', self.buttonClick);
                    if (!isTouchDevice) {
                        self.addEventHandler(oCover, 'mousedown', self.mouseDown);
                    } else {
                        self.addEventHandler(oCover, 'touchstart', self.mouseDown);
                    }
                    oCanvasCTX = oCanvas.getContext('2d');
                    oCanvasCTX.translate(radius, radius);
                    oCanvasCTX.rotate(self.deg2rad(-90)); // compensate for arc starting at EAST // http://stackoverflow.com/questions/319267/tutorial-for-html-canvass-arc-function
                }
            }
            if (foundItems > 0) {
                self.addEventHandler(document, 'click', self.handleClick);
                if (self.config.autoPlay) {
                    self.handleClick({ target: self.links[0], preventDefault: function () { } });
                }
            }
            sm._writeDebug('threeSixtyPlayer.init(): Found ' + foundItems + ' relevant items.');

            if (self.config.useFavIcon && typeof this.VUMeter !== 'undefined') {
                this.vuMeter = new this.VUMeter(this);
            }

        };

    }

    // Optional: VU Meter component

    ThreeSixtyPlayer.prototype.VUMeter = function (oParent) {

        var self = oParent,
            me = this,
            _head = document.getElementsByTagName('head')[0],
            isOpera = (navigator.userAgent.match(/opera/i)),
            isFirefox = (navigator.userAgent.match(/firefox/i));

        this.vuMeterData = [];
        this.vuDataCanvas = null;

        this.setPageIcon = function (sDataURL) {

            if (!self.config.useFavIcon || !self.config.usePeakData || !sDataURL) {
                return false;
            }

            var link = document.getElementById('sm2-favicon');
            if (link) {
                _head.removeChild(link);
                link = null;
            }
            if (!link) {
                link = document.createElement('link');
                link.id = 'sm2-favicon';
                link.rel = 'shortcut icon';
                link.type = 'image/png';
                link.href = sDataURL;
                document.getElementsByTagName('head')[0].appendChild(link);
            }

        };

        this.resetPageIcon = function () {

            if (!self.config.useFavIcon) {
                return false;
            }
            var link = document.getElementById('favicon');
            if (link) {
                link.href = '/favicon.ico';
            }

        };

        this.updateVU = function (oSound) {

            if (soundManager.flashVersion >= 9 && self.config.useFavIcon && self.config.usePeakData) {
                me.setPageIcon(me.vuMeterData[parseInt(16 * oSound.peakData.left, 10)][parseInt(16 * oSound.peakData.right, 10)]);
            }

        };

        this.createVUData = function () {

            var i = 0, j = 0,
                canvas = me.vuDataCanvas.getContext('2d'),
                vuGrad = canvas.createLinearGradient(0, 16, 0, 0),
                bgGrad = canvas.createLinearGradient(0, 16, 0, 0),
                outline = 'rgba(0,0,0,0.2)';

            vuGrad.addColorStop(0, 'rgb(0,192,0)');
            vuGrad.addColorStop(0.30, 'rgb(0,255,0)');
            vuGrad.addColorStop(0.625, 'rgb(255,255,0)');
            vuGrad.addColorStop(0.85, 'rgb(255,0,0)');
            bgGrad.addColorStop(0, outline);
            bgGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
            for (i = 0; i < 16; i++) {
                me.vuMeterData[i] = [];
            }
            for (i = 0; i < 16; i++) {
                for (j = 0; j < 16; j++) {
                    // reset/erase canvas
                    me.vuDataCanvas.setAttribute('width', 16);
                    me.vuDataCanvas.setAttribute('height', 16);
                    // draw new stuffs
                    canvas.fillStyle = bgGrad;
                    canvas.fillRect(0, 0, 7, 15);
                    canvas.fillRect(8, 0, 7, 15);
                    /*
                    // shadow
                    canvas.fillStyle = 'rgba(0,0,0,0.1)';
                    canvas.fillRect(1,15-i,7,17-(17-i));
                    canvas.fillRect(9,15-j,7,17-(17-j));
                    */
                    canvas.fillStyle = vuGrad;
                    canvas.fillRect(0, 15 - i, 7, 16 - (16 - i));
                    canvas.fillRect(8, 15 - j, 7, 16 - (16 - j));
                    // and now, clear out some bits.
                    canvas.clearRect(0, 3, 16, 1);
                    canvas.clearRect(0, 7, 16, 1);
                    canvas.clearRect(0, 11, 16, 1);
                    me.vuMeterData[i][j] = me.vuDataCanvas.toDataURL('image/png');
                    // for debugging VU images
                    /*
                    var o = document.createElement('img');
                    o.style.marginRight = '5px'; 
                    o.src = vuMeterData[i][j];
                    document.documentElement.appendChild(o);
                    */
                }
            }

        };

        this.testCanvas = function () {

            // canvas + toDataURL();
            var c = document.createElement('canvas'),
                ctx = null, ok;
            if (!c || typeof c.getContext === 'undefined') {
                return null;
            }
            ctx = c.getContext('2d');
            if (!ctx || typeof c.toDataURL !== 'function') {
                return null;
            }
            // just in case..
            try {
                ok = c.toDataURL('image/png');
            } catch (e) {
                // no canvas or no toDataURL()
                return null;
            }
            // assume we're all good.
            return c;

        };

        this.init = function () {

            if (self.config.useFavIcon) {
                me.vuDataCanvas = me.testCanvas();
                if (me.vuDataCanvas && (isFirefox || isOpera)) {
                    // these browsers support dynamically-updating the favicon
                    me.createVUData();
                } else {
                    // browser doesn't support doing this
                    self.config.useFavIcon = false;
                }
            }

        };

        this.init();

    };

    // completely optional: Metadata/annotations/segments code

    ThreeSixtyPlayer.prototype.Metadata = function (oSound, oParent) {

        soundManager._wD('Metadata()');

        var me = this,
            oBox = oSound._360data.oUI360,
            o = oBox.getElementsByTagName('ul')[0],
            oItems = o.getElementsByTagName('li'),
            isFirefox = (navigator.userAgent.match(/firefox/i)),
            isAlt = false, i, oDuration;

        this.lastWPExec = 0;
        this.refreshInterval = 250;
        this.totalTime = 0;

        this.events = {

            whileplaying: function () {

                var width = oSound._360data.width,
                    radius = oSound._360data.radius,
                    fullDuration = (oSound.durationEstimate || (me.totalTime * 1000)),
                    isAlt = null, i, j, d;

                for (i = 0, j = me.data.length; i < j; i++) {
                    isAlt = (i % 2 === 0);
                    oParent.drawSolidArc(oSound._360data.oCanvas, (isAlt ? oParent.config.segmentRingColorAlt : oParent.config.segmentRingColor), isAlt ? width : width, isAlt ? radius / 2 : radius / 2, oParent.deg2rad(360 * (me.data[i].endTimeMS / fullDuration)), oParent.deg2rad(360 * ((me.data[i].startTimeMS || 1) / fullDuration)), true);
                }
                d = new Date();
                if (d - me.lastWPExec > me.refreshInterval) {
                    me.refresh();
                    me.lastWPExec = d;
                }

            }

        };

        this.refresh = function () {

            // Display info as appropriate
            var i, j, index = null,
                now = oSound.position,
                metadata = oSound._360data.metadata.data;

            for (i = 0, j = metadata.length; i < j; i++) {
                if (now >= metadata[i].startTimeMS && now <= metadata[i].endTimeMS) {
                    index = i;
                    break;
                }
            }
            if (index !== metadata.currentItem && index < metadata.length) {
                // update
                oSound._360data.oLink.innerHTML = metadata.mainTitle + ' <span class="metadata"><span class="sm2_divider"> | </span><span class="sm2_metadata">' + metadata[index].title + '</span></span>';
                // self.setPageTitle(metadata[index].title+' | '+metadata.mainTitle);
                metadata.currentItem = index;
            }

        };

        this.strToTime = function (sTime) {
            var segments = sTime.split(':'),
                seconds = 0, i;
            for (i = segments.length; i--;) {
                seconds += parseInt(segments[i], 10) * Math.pow(60, segments.length - 1 - i); // hours, minutes
            }
            return seconds;
        };

        this.data = [];
        this.data.givenDuration = null;
        this.data.currentItem = null;
        this.data.mainTitle = oSound._360data.oLink.innerHTML;

        for (i = 0; i < oItems.length; i++) {
            this.data[i] = {
                o: null,
                title: oItems[i].getElementsByTagName('p')[0].innerHTML,
                startTime: oItems[i].getElementsByTagName('span')[0].innerHTML,
                startSeconds: me.strToTime(oItems[i].getElementsByTagName('span')[0].innerHTML.replace(/[()]/g, '')),
                duration: 0,
                durationMS: null,
                startTimeMS: null,
                endTimeMS: null,
                oNote: null
            };
        }
        oDuration = oParent.getElementsByClassName('duration', 'div', oBox);
        this.data.givenDuration = (oDuration.length ? me.strToTime(oDuration[0].innerHTML) * 1000 : 0);
        for (i = 0; i < this.data.length; i++) {
            this.data[i].duration = parseInt(this.data[i + 1] ? this.data[i + 1].startSeconds : (me.data.givenDuration ? me.data.givenDuration : oSound.durationEstimate) / 1000, 10) - this.data[i].startSeconds;
            this.data[i].startTimeMS = this.data[i].startSeconds * 1000;
            this.data[i].durationMS = this.data[i].duration * 1000;
            this.data[i].endTimeMS = this.data[i].startTimeMS + this.data[i].durationMS;
            this.totalTime += this.data[i].duration;
        }

    };

    if (navigator.userAgent.match(/webkit/i) && navigator.userAgent.match(/mobile/i)) {
        // iPad, iPhone etc.
        soundManager.setup({
            useHTML5Audio: true
        });
    }

    soundManager.setup({
        html5PollingInterval: 50, // increased framerate for whileplaying() etc.
        debugMode: (window.location.href.match(/debug=1/i)), // disable or enable debug output
        consoleOnly: true,
        flashVersion: 9,
        useHighPerformance: true,
        useFlashBlock: true
    });

    // FPS data, testing/debug only
    if (soundManager.debugMode) {
        window.setInterval(function () {
            var p = window.threeSixtyPlayer;
            if (p && p.lastSound && p.lastSound._360data.fps && typeof window.isHome === 'undefined') {
                soundManager._writeDebug('fps: ~' + p.lastSound._360data.fps);
                p.lastSound._360data.fps = 0;
            }
        }, 1000);
    }

    window.ThreeSixtyPlayer = ThreeSixtyPlayer; // constructor

}(window));

threeSixtyPlayer = new ThreeSixtyPlayer();

// hook into SM2 init
soundManager.onready(threeSixtyPlayer.init);


/**
 * SoundManager 2 Demo: Play MP3 links via button
 * ----------------------------------------------
 *
 * http://schillmania.com/projects/soundmanager2/
 *
 * A simple demo making MP3s playable "inline"
 * and easily styled/customizable via CSS.
 *
 * A variation of the "play mp3 links" demo.
 *
 * Requires SoundManager 2 Javascript API.
 */

/*jslint white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: false, bitwise: true, regexp: false, newcap: true, immed: true */
/*global document, window, soundManager, navigator */

function BasicMP3Player() {
    var self = this,
        pl = this,
        sm = soundManager, // soundManager instance
        isTouchDevice = (navigator.userAgent.match(/ipad|iphone/i)),
        isIE = (navigator.userAgent.match(/msie/i));
    this.excludeClass = 'button-exclude'; // CSS class for ignoring MP3 links
    this.links = [];
    this.sounds = [];
    this.soundsByURL = {};
    this.indexByURL = {};
    this.lastSound = null;
    this.soundCount = 0;

    this.config = {
        // configuration options
        playNext: false, // stop after one sound, or play through list until end
        autoPlay: false  // start playing the first sound right away
    };

    this.css = {
        // CSS class names appended to link during various states
        sDefault: 'sm2_button', // default state
        sLoading: 'sm2_loading',
        sPlaying: 'sm2_playing',
        sPaused: 'sm2_paused'
    };

    // event + DOM utils

    this.includeClass = this.css.sDefault;

    this.addEventHandler = (typeof window.addEventListener !== 'undefined' ? function (o, evtName, evtHandler) {
        return o.addEventListener(evtName, evtHandler, false);
    } : function (o, evtName, evtHandler) {
        o.attachEvent('on' + evtName, evtHandler);
    });

    this.removeEventHandler = (typeof window.removeEventListener !== 'undefined' ? function (o, evtName, evtHandler) {
        return o.removeEventListener(evtName, evtHandler, false);
    } : function (o, evtName, evtHandler) {
        return o.detachEvent('on' + evtName, evtHandler);
    });

    this.classContains = function (o, cStr) {
        return (typeof (o.className) !== 'undefined' ? o.className.match(new RegExp('(\\s|^)' + cStr + '(\\s|$)')) : false);
    };

    this.addClass = function (o, cStr) {
        if (!o || !cStr || self.classContains(o, cStr)) {
            return false;
        }
        o.className = (o.className ? o.className + ' ' : '') + cStr;
    };

    this.removeClass = function (o, cStr) {
        if (!o || !cStr || !self.classContains(o, cStr)) {
            return false;
        }
        o.className = o.className.replace(new RegExp('( ' + cStr + ')|(' + cStr + ')', 'g'), '');
    };

    this.getSoundByURL = function (sURL) {
        return (typeof self.soundsByURL[sURL] !== 'undefined' ? self.soundsByURL[sURL] : null);
    };

    this.isChildOfNode = function (o, sNodeName) {
        if (!o || !o.parentNode) {
            return false;
        }
        sNodeName = sNodeName.toLowerCase();
        do {
            o = o.parentNode;
        } while (o && o.parentNode && o.nodeName.toLowerCase() !== sNodeName);
        return (o.nodeName.toLowerCase() === sNodeName ? o : null);
    };

    this.events = {

        // handlers for sound events as they're started/stopped/played

        play: function () {
            pl.removeClass(this._data.oLink, this._data.className);
            this._data.className = pl.css.sPlaying;
            pl.addClass(this._data.oLink, this._data.className);
        },

        stop: function () {
            pl.removeClass(this._data.oLink, this._data.className);
            this._data.className = '';
        },

        pause: function () {
            pl.removeClass(this._data.oLink, this._data.className);
            this._data.className = pl.css.sPaused;
            pl.addClass(this._data.oLink, this._data.className);
        },

        resume: function () {
            pl.removeClass(this._data.oLink, this._data.className);
            this._data.className = pl.css.sPlaying;
            pl.addClass(this._data.oLink, this._data.className);
        },

        finish: function () {
            pl.removeClass(this._data.oLink, this._data.className);
            this._data.className = '';
            if (pl.config.playNext) {
                var nextLink = (pl.indexByURL[this._data.oLink.href] + 1);
                if (nextLink < pl.links.length) {
                    pl.handleClick({ 'target': pl.links[nextLink] });
                }
            }
        }

    };

    this.stopEvent = function (e) {
        if (typeof e !== 'undefined' && typeof e.preventDefault !== 'undefined') {
            e.preventDefault();
        } else if (typeof window.event !== 'undefined') {
            window.event.returnValue = false;
        }
        return false;
    };

    this.getTheDamnLink = (isIE) ? function (e) {
        // I really didn't want to have to do this.
        return (e && e.target ? e.target : window.event.srcElement);
    } : function (e) {
        return e.target;
    };

    this.handleClick = function (e) {
        // a sound link was clicked
        if (typeof e.button !== 'undefined' && e.button > 1) {
            // ignore right-click
            return true;
        }
        var o = self.getTheDamnLink(e),
            sURL,
            soundURL,
            thisSound;
        if (o.nodeName.toLowerCase() !== 'a') {
            o = self.isChildOfNode(o, 'a');
            if (!o) {
                return true;
            }
        }
        sURL = o.getAttribute('href');
        if (!o.href || !soundManager.canPlayLink(o) || self.classContains(o, self.excludeClass)) {
            return true; // pass-thru for non-MP3/non-links
        }
        if (!self.classContains(o, self.includeClass)) {
            return true;
        }
        sm._writeDebug('handleClick()');
        soundURL = (o.href);
        thisSound = self.getSoundByURL(soundURL);
        if (thisSound) {
            // already exists
            if (thisSound === self.lastSound) {
                // and was playing (or paused)
                thisSound.togglePause();
            } else {
                // different sound
                thisSound.togglePause(); // start playing current
                sm._writeDebug('sound different than last sound: ' + self.lastSound.id);
                if (self.lastSound) {
                    self.stopSound(self.lastSound);
                }
            }
        } else {
            // create sound
            thisSound = sm.createSound({
                id: 'basicMP3Sound' + (self.soundCount++),
                url: soundURL,
                onplay: self.events.play,
                onstop: self.events.stop,
                onpause: self.events.pause,
                onresume: self.events.resume,
                onfinish: self.events.finish,
                type: (o.type || null)
            });
            // tack on some custom data
            thisSound._data = {
                oLink: o, // DOM node for reference within SM2 object event handlers
                className: self.css.sPlaying
            };
            self.soundsByURL[soundURL] = thisSound;
            self.sounds.push(thisSound);
            if (self.lastSound) {
                // stop last sound
                self.stopSound(self.lastSound);
            }
            thisSound.play();
        }
        self.lastSound = thisSound; // reference for next call
        return self.stopEvent(e);
    };

    this.stopSound = function (oSound) {
        soundManager.stop(oSound.id);
        if (!isTouchDevice) { // iOS 4.2+ security blocks onfinish() -> playNext() if we set a .src in-between(?)
            soundManager.unload(oSound.id);
        }
    };

    this.init = function () {
        sm._writeDebug('basicMP3Player.init()');
        var i, j,
            foundItems = 0,
            oLinks = document.getElementsByTagName('a');
        // grab all links, look for .mp3
        for (i = 0, j = oLinks.length; i < j; i++) {
            if (self.classContains(oLinks[i], self.css.sDefault) && !self.classContains(oLinks[i], self.excludeClass)) {
                // self.addClass(oLinks[i],self.css.sDefault); // add default CSS decoration - good if you're lazy and want ALL MP3/playable links to do this
                self.links[foundItems] = (oLinks[i]);
                self.indexByURL[oLinks[i].href] = foundItems; // hack for indexing
                foundItems++;
            }
        }
        if (foundItems > 0) {
            self.addEventHandler(document, 'click', self.handleClick);
            if (self.config.autoPlay) {
                self.handleClick({ target: self.links[0], preventDefault: function () { } });
            }
        }
        sm._writeDebug('basicMP3Player.init(): Found ' + foundItems + ' relevant items.');
    };

    this.init();

}

var basicMP3Player = null;

// use HTML5 audio for MP3/MP4, if available
soundManager.preferFlash = false;

soundManager.onready(function () {
    // soundManager.createSound() etc. may now be called
    basicMP3Player = new BasicMP3Player();
});



// custom page player configuration
var PP_CONFIG = {
    autoStart: false,      // begin playing first sound when page loads
    playNext: false,        // stop after one sound, or play through list until end
    useThrottling: false,  // try to rate-limit potentially-expensive calls (eg. dragging position around)</span>
    usePeakData: false,     // [Flash 9 only] whether or not to show peak data (left/right channel values) - nor noticable on CPU
    useWaveformData: false,// [Flash 9 only] show raw waveform data - WARNING: LIKELY VERY CPU-HEAVY
    useEQData: false,      // [Flash 9 only] show EQ (frequency spectrum) data
    useFavIcon: false     // try to apply peakData to address bar (Firefox + Opera) - performance note: appears to make Firefox 3 do some temporary, heavy disk access/swapping/garbage collection at first(?) - may be too heavy on CPU
}

soundManager.setup({
    url: 'http://techhouse.org/~dmorris/misc/soundmanager/xdomain/'
});

