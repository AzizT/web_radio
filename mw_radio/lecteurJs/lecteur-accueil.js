// Radio Player prototype for thewebradio.gr
//https:codepen.io/darkosxrc/pen/XyOEJP
// -------------------------------------------------------
// Dependencies:
// - HowlerJS: https://github.com/goldfire/howler.js#documentation
// - jQuery: https://jquery.com/
// -------------------------------------------------------

(function($) {
    // General Vars
    let player;
    let muted = false;
    // Stations Object List
    let stations = {
      authentiko: "http://localhost/web_radio/mw_radio/mp3/1Thing.mp3" || "http://localhost/web_radio/mw_radio/mp3/28_Butts.mp3" || "http://localhost/web_radio/mw_radio/mp3/1Thing.mp3",
    };
    // Cache Player Controls
    let $authentiko = $("#authentiko");
    let $greeks = $("#greeks");
    let $fresh = $("#fresh");
    let $coffee = $("#coffee");
    let $volumeControl = $("#radioVolume");
    let $selectStation = $("#selectStation li");
    let $volumeIcon = $(".volume-icon");
    let $stationLoading = $("#stationLoading");
  
    // Play A Station
    function playStation(link) {
      // Check if there is already a player instance and unload it
      if (typeof player !== "undefined") {
        player.unload();
      }
      $selectStation.each(function() {
        $(this).removeClass("playing-station");
      });
      // Create Player Instance
      player = new Howl({
        src: link,
        html5: true,
        autoplay: true,
        loop: false,
        volume: $volumeControl.val(),
        preload: false,
        onload: function() {
          $stationLoading.fadeOut();
        },
        onloaderror: function() {
          $stationLoading.fadeOut();
        },
        onplayerror: function() {
          $stationLoading.fadeOut();
        }
      });
      player.play();
    }
    // Mute/Unmute
    $volumeIcon.click(function() {
      if (typeof player !== "undefined") {
        if (muted == true) {
          unmutePlayer();
        } else {
          mutePlayer();
        }
      }
    });
    // Unmute Player
    function unmutePlayer() {
      player.mute(false);
      muted = false;
      player.volume($volumeControl.val());
      $volumeIcon.removeClass("isMuted");
    }
    // Mute Player
    function mutePlayer() {
      player.mute(true);
      muted = true;
      $volumeIcon.addClass("isMuted");
    }
  
    // INIT PLAYER
    playStation(stations.authentiko);
    $authentiko.addClass("playing-station");
  
    // Authentiko Station Button
    $authentiko.click(function() {
      if ($authentiko.hasClass("playing-station")) {
        player.unload();
        $authentiko.removeClass("playing-station");
      } else {
        $stationLoading.fadeIn();
        playStation(stations.authentiko);
        $authentiko.addClass("playing-station");
      }
      unmutePlayer();
    });
    // Greeks Station Button
    $greeks.click(function() {
      if ($greeks.hasClass("playing-station")) {
        player.unload();
        $greeks.removeClass("playing-station");
      } else {
        $stationLoading.fadeIn();
        playStation(stations.greeks);
        $greeks.addClass("playing-station");
      }
      unmutePlayer();
    });
    // Fresh Station Button
    $fresh.click(function() {
      if ($fresh.hasClass("playing-station")) {
        player.unload();
        $fresh.removeClass("playing-station");
      } else {
        $stationLoading.fadeIn();
        playStation(stations.fresh);
        $fresh.addClass("playing-station");
      }
      unmutePlayer();
    });
    // Coffee Station Button
    $coffee.click(function() {
      if ($coffee.hasClass("playing-station")) {
        player.unload();
        $coffee.removeClass("playing-station");
      } else {
        $stationLoading.fadeIn();
        playStation(stations.coffee);
        $coffee.addClass("playing-station");
      }
      unmutePlayer();
    });
    // Volume Control
    $volumeControl.on("input", function() {
      player.volume($(this).val());
    });
  })(jQuery);
  