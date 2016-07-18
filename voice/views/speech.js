

      // These will be initialized later
      var recognizer, recorder, callbackManager, audioContext, outputContainer;
      // Only when both recorder and recognizer do we have a ready application
      var isRecorderReady = isRecognizerReady = false;

      // A convenience function to post a message to the recognizer and associate
      // a callback to its response
      function postRecognizerJob(message, callback) {
        var msg = message || {};
        if (callbackManager) msg.callbackId = callbackManager.add(callback);
        if (recognizer) recognizer.postMessage(msg);
      };

      // This function initializes an instance of the recorder
      // it posts a message right away and calls onReady when it
      // is ready so that onmessage can be properly set
      function spawnWorker(workerURL, onReady) {
          recognizer = new Worker(workerURL);
          recognizer.onmessage = function(event) {
            onReady(recognizer);
          };
          // Notice that we pass the name of the pocketsphinx.js file to load
          // as we need the file packaged with the Chinese acoustic model
          recognizer.postMessage('pocketsphinx_zh.js');
      };

      // To display the hypothesis sent by the recognizer
      function updateHyp(hyp) {
        if (outputContainer) outputContainer.innerHTML = hyp;
      };

      // This updates the UI when the app might get ready
      // Only when both recorder and recognizer are ready do we enable the buttons
      function updateUI() {
        if (isRecorderReady && isRecognizerReady) startBtn.disabled = stopBtn.disabled = false;
      };

      // This is just a logging window where we display the status
      function updateStatus(newStatus) {
        document.getElementById('current-status').innerHTML += "<br/>" + newStatus;
      };

      // A not-so-great recording indicator
      function displayRecording(display) {
        if (display) document.getElementById('recording-indicator').innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        else document.getElementById('recording-indicator').innerHTML = "";
      };

      // Callback function once the user authorises access to the microphone
      // in it, we instanciate the recorder
      function startUserMedia(stream) { 
        var input = audioContext.createMediaStreamSource(stream);
        // Firefox hack https://support.mozilla.org/en-US/questions/984179
        window.firefox_audio_hack = input;
        // Notice that for this Chinese acoustic model, audio must be at 8kHz, so we should
        // request it from the recorder
        var audioRecorderConfig = {
               errorCallback: function(x) {},
               outputSampleRate: 8000
        };
        recorder = new AudioRecorder(input, audioRecorderConfig);
        // If a recognizer is ready, we pass it to the recorder
        if (recognizer) recorder.consumers = [recognizer];
        isRecorderReady = true;
        updateUI();
        //updateStatus("Audio recorder ready");
      };

      // This starts recording. We first need to get the id of the grammar to use
      function startRecording() {
        var id = 0;
        /*if (recorder && recorder.start(id)) displayRecording(true);*/
	newHypChinese="";
	updateHyp(newHypChinese);
      };

      // Stops recording
      function stopRecording () {
	
        recorder && recorder.stop();	
       // displayRecording(false);
	
	updateHyp(newHypChinese);
      };

      // Called once the recognizer is ready
      // We then add the grammars to the input select tag and update the UI
      var recognizerReady = function() {
           updateGrammars();
           isRecognizerReady = true;
           updateUI();
          // updateStatus("Recognizer ready");
      };

      // We get the grammars defined below and fill in the input select tag
      var updateGrammars = function() {
        var selectTag = document.getElementById('grammars');
        for (var i = 0 ; i < grammarIds.length ; i++) {
            var newElt = document.createElement('option');
            newElt.value=grammarIds[i].id;
            newElt.innerHTML = grammarIds[i].title;
            selectTag.appendChild(newElt);
        }                          
      };

      // This adds a grammar from the grammars array
      // We add them one by one and call it again as
      // a callback.
      // Once we are done adding all grammars, we can call
      // recognizerReady()
      var feedGrammar = function(g, index, id) {
        if (id && (grammarIds.length > 0)) grammarIds[0].id = id.id;
        if (index < g.length) {
          grammarIds.unshift({title: g[index].title})
	  postRecognizerJob({command: 'addGrammar', data: g[index].g},
                             function(id) {feedGrammar(grammars, index + 1, {id:id});});
        } else {
          recognizerReady();
        }
      };

      // This adds words to the recognizer. When it calls back, we add grammars
      var feedWords = function(words) {
           postRecognizerJob({command: 'addWords', data: words},
                        function() {feedGrammar(grammars, 0);});
      };

      // This initializes the recognizer. When it calls back, we add words
      var initRecognizer = function() {
          // You can pass parameters to the recognizer, such as : {command: 'initialize', data: [["-hmm", "my_model"], ["-fwdflat", "no"]]}
          // Pay attention here to state the sample rate as the default value is 16kHz and this Chinese acoustic model uses 8kHz
          postRecognizerJob({command: 'initialize', data:[["-samprate", "8000"]]},
                            function() {
                                        if (recorder) recorder.consumers = [recognizer];
                                        feedWords(wordList);});
      };

      // When the page is loaded, we spawn a new recognizer worker and call getUserMedia to
      // request access to the microphone
      window.onload = function() {
        outputContainer = document.getElementById("output");
     //   updateStatus("Initializing web audio and speech recognizer, waiting for approval to access the microphone");
        callbackManager = new CallbackManager();
        spawnWorker("js/recognizer.js", function(worker) {
            // This is the onmessage function, once the worker is fully loaded
            worker.onmessage = function(e) {
                // This is the case when we have a callback id to be called
                if (e.data.hasOwnProperty('id')) {
                  var clb = callbackManager.get(e.data['id']);
                  var data = {};
                  if ( e.data.hasOwnProperty('data')) data = e.data.data;
                  if(clb) clb(data);
                }
                // This is a case when the recognizer has a new hypothesis
                // Notice that pocketsphinx.js does not yet recognize words
                // encoded in UTF8, so we map them to ASCII strings. Here we
                // display both ASCII and Chinese strings
                if (e.data.hasOwnProperty('hyp')) {
                  //var newHyp = e.data.hyp;
                   newHypChinese = e.data.hyp.split(' ').map(function(x) {return wordListChinese[x];}).join(' ');
                  if (e.data.hasOwnProperty('final') &&  e.data.final) {
                      //newHyp = "Final: " + newHyp;
                      //newHypChinese = "Final: " + newHypChinese;
                  }
                  
                }
                // This is the case when we have an error
                if (e.data.hasOwnProperty('status') && (e.data.status == "error")) {
               //   updateStatus("Error in " + e.data.command + " with code " + e.data.code);
                }
            };
            // Once the worker is fully loaded, we can call the initialize function
            initRecognizer();
        });

        // The following is to initialize Web Audio
        try {
          window.AudioContext = window.AudioContext || window.webkitAudioContext;
          navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
          window.URL = window.URL || window.webkitURL;
          audioContext = new AudioContext();
        } catch (e) {
          //updateStatus("Error initializing Web Audio browser");
        }
        if (navigator.getUserMedia) navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
                                        updateStatus("No live audio input in this browser");
                                    });
        else //updateStatus("No web audio support in this browser");

      // Wiring JavaScript to the UI
      var startBtn = document.getElementById('startBtn');
      var stopBtn = document.getElementById('stopBtn');

     
      };

      // This is the list of words that need to be added to the recognizer
      // This follows the CMU dictionary format and the phone set of the Chinese model
      // These words were taken from model/lm/zh_CN/mandarin_notone.dic
      var wordList = [["ni_hao","n i h ao"], ["ni_hao_ma", "n i h ao m a"], ["zai_jian", "z ai j ian"], ["huan_ying", "h uan y ing"], ["xie_xie", "x ie x ie"], ["ming_tian_jian", "m ing t ian j ian"]];
      var wordListChinese = {"ni_hao": "你好", "ni_hao_ma": "你好吗", "zai_jian": "再见", "huan_ying": "欢迎", "xie_xie": "谢谢", "ming_tian_jian": "明天见"};
      var grammarChineseGreetings = {numStates: 1, start: 0, end: 0, transitions: [{from: 0, to: 0, word: "ni_hao"},{from: 0, to: 0, word: "ni_hao_ma"},{from: 0, to: 0, word: "zai_jian"},{from: 0, to: 0, word: "huan_ying"},{from: 0, to: 0, word: "xie_xie"},{from: 0, to: 0, word: "ming_tian_jian"}]};
      var grammars = [{title: "Chinese Greetings", g: grammarChineseGreetings}];
      var grammarIds = [];
	var newHypChinese;
    
