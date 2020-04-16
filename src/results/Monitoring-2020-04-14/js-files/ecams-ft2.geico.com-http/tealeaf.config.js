/**
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corp. 2016
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

// Default configuration
(function() {
  'use strict';

  // TLT is expected to be defined in the global scope i.e. window.TLT
  var TLT = window.TLT,
    changeTarget;

  /**
   * Due to issue with lack of change event propagation on legacy IE (W3C version of UIC)
   * its mandatory to provide more specific configuration on IE6, IE7, IE8 and IE9 in legacy
   * compatibility mode. For other browsers changeTarget can remain undefined as it is
   * sufficient to listen to the change event at the document level.
   */
  if (TLT.getFlavor() === 'w3c' && TLT.utils.isLegacyIE) {
    changeTarget = 'input, select, textarea, button';
  }

  var privacyConfig = [
    {
      targets: ['input[type=password]', '.pxi'],
      maskType: 2 // maskType 2: The value gets replaced with the fixed string 'XXXXX'
    },
    {
      targets: ['.pxi-hint'],
      maskType: 3 // maskType 3: 'HelloWorld123-' becomes 'XxxxxXxxxx999@'
    }
  ];

  var tltConfig = {
    core: {
      /**
       * Links that should not trigger the before unload event, which destroys the UI Capture library.
       * This addresses a known issue with Internet Explorer.
       * TODO: Grabbed this from sales application, validate its usefulness for our application
       */
      ieExcludedLinks: ['a[href*="javascript:void"]', 'input[onclick*="javascript:"]'],
      modules: {
        performance: {
          enabled: true,
          events: [{ name: 'load', target: window }, { name: 'unload', target: window }]
        },
        replay: {
          events: [
            { name: 'change', target: changeTarget, recurseFrames: true },
            { name: 'click', recurseFrames: true },
            { name: 'hashchange', target: window },
            { name: 'focus', target: 'input, select, textarea, button', recurseFrames: true },
            { name: 'blur', target: 'input, select, textarea, button', recurseFrames: true },
            { name: 'load', target: window },
            { name: 'unload', target: window },
            { name: 'resize', target: window },
            { name: 'scroll', target: window },
            { name: 'orientationchange', target: window },
            { name: 'touchend' },
            { name: 'touchstart' }
          ]
        },
        TLCookie: {
          enabled: false
        }
      },

      // Set the sessionDataEnabled flag to true only if it's OK to expose Tealeaf session data to 3rd party scripts.
      sessionDataEnabled: false,
      sessionData: {
        // Set this flag if the session value needs to be hashed to derive the Tealeaf session ID
        sessionValueNeedsHashing: true,

        // sessionQueryName, if specified, takes precedence over sessionCookieName.
        sessionCookieName: '.AspNet.Session'
      },

      // list of ignored frames pointed by css selector (top level only)
      framesBlacklist: ['#iframe1']
    },
    services: {
      queue: {
        asyncReqOnUnload: false, // WARNING: Enabling asynchronous request on unload may result in incomplete or missing data
        queues: [
          {
            qid: 'DEFAULT',
            endpoint: 'tealeaf',
            maxEvents: 25,
            timerInterval: 0,
            maxSize: 350000,
            checkEndpoint: false,
            endpointCheckTimeout: 5000,
            encoder: 'gzip'
          }
        ]
      },
      message: {
        privacy: privacyConfig
      },
      serializer: {
        json: {
          defaultToBuiltin: true,
          parsers: ['JSON.parse'],
          stringifiers: ['JSON.stringify']
        }
      },
      encoder: {
        gzip: {
          encode: 'window.pako.gzip',
          defaultEncoding: 'gzip'
        }
      },
      domCapture: {
        diffEnabled: true,
        options: {
          maxMutations: 100, // If this threshold is met or exceeded, a full DOM is captured instead of a diff.
          maxLength: 1000000, // If this threshold is exceeded, the snapshot will not be sent
          captureFrames: false, // Should child frames/iFrames be captured
          removeScripts: true // Should script tags be removed from the captured snapshot
        }
      },
      browser: {
        useCapture: true,
        sizzleObject: 'window.Sizzle',
        jQueryObject: 'window.jQuery'
      }
    },
    modules: {
      overstat: {
        hoverThreshold: 1000
      },
      performance: {
        calculateRenderTime: true,
        renderTimeThreshold: 600000,
        filter: {
          navigationStart: true,
          unloadEventStart: true,
          unloadEventEnd: true,
          redirectStart: true,
          redirectEnd: true,
          fetchStart: true,
          domainLookupStart: true,
          domainLookupEnd: true,
          connectStart: true,
          connectEnd: true,
          secureConnectionStart: true,
          requestStart: true,
          responseStart: true,
          responseEnd: true,
          domLoading: true,
          domInteractive: true,
          domContentLoadedEventStart: true,
          domContentLoadedEventEnd: true,
          domComplete: true,
          loadEventStart: true,
          loadEventEnd: true
        }
      },
      replay: {
        geolocation: {
          enabled: false,
          triggers: [
            {
              event: 'load'
            }
          ]
        },
        domCapture: {
          enabled: true,
          triggers: [
            {
              event: 'load',
              delay: 1000
            },
            {
              event: 'unload'
            },
            {
              event: 'click',
              targets: ['.btn']
            },
            {
              event: 'change'
            }
          ]
        }
      },
      TLCookie: {
        enabled: 'false',
        tlAppKey: '',
        sessionizationCookieName: 'TLTSID'
      }
    }
  };

  TLT.init(tltConfig);
})();
