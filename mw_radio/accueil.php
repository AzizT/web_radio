<!DOCTYPE HTML>
<html lang="fr">

<head>
        <title>Accueil Mad Wax Radio</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">

        <!-- link fontawesome -->
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css" integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous">

        <!-- le css, particulier pour la page d' accueil. La navigation interne possede un autre css -->
        <link href="css/style_accueil.css" rel="stylesheet" />
</head>

<body>

        <div id="container">

                <header>
                        <img src="images/logo_bandeau.png" alt="bandeau mw radio" class="responsive_logo" />
                </header>

                <nav>
                        <ul id="menu">

                                <li>

                                        <a href="50_60_tracks/Index_50_60.php">50' 60' Tracks</a>

                                </li>

                                <li>

                                        <a href="70_tracks/Index_70.php">70' Tracks</a>

                                </li>

                                <li>

                                        <a href="80_tracks/Index_80.php">80' Tracks</a>

                                </li>

                                <li>

                                        <a href="90_tracks/Index_90.php">90' Tracks</a>

                                </li>

                                <li>

                                        <a href="00_tracks/Index_00.php">00' Tracks</a>

                                </li>

                                <li>

                                        <a href="10_tracks/Index_10.php">10' Tracks</a>

                                </li>

                                <li>

                                        <a href="#">Web Radios</a>

                                        <ul>

                                                <li><a href="http://www.nova.fr/radionova/nova-la-nuit" target="_blank">Nova La Nuit</a></li>
                                                <li><a href="http://www.djamradio.com/?lang=fr" target="_blank">Djam Radio</a></li>
                                                <li><a href="http://player.radiomeuh.com/" target="_blank">Radio Meuh</a></li>
                                                <li><a href="http://www.sing-sing-bis.org/results.php?kbps=Infinity" target="_blank">Sing Sing</a></li>
                                                <li><a href="http://www.tsfjazz.com/accueil.php" target="_blank">TSF Jazz</a></li>

                                        </ul>

                                </li>


                                <li>

                                        <a href="inscription_membre.php">Inscription</a>
                                        <ul>
                                                <li>
                                                        <a href="track_insert.php">insertion</a>
                                                </li>
                                        </ul>

                                </li>



                                <!-- ma barre de recherche et son submit + une pop up pour aider l' utilisateur -->
                                <input class="recherche" type="search" placeholder="Search" title="Vouz recherchez un album, un musicien, une année ?" aria-label="Search">

                                <button class="soumettre" type="submit"><i class="fas fa-search"></i></button>



                        </ul>





                </nav>

                <img src="images/image_accueil.jpg" alt="image accueil mw radio" class="responsive" />

        </div>

        <footer id="piedPage">
                <p>
                        "Information is not knowledge. Knowledge is not wisdom. Wisdom is not truth. Truth is not beauty. Beauty is not love. Love is not music. Music is THE BEST."-FZ.<br />
                        © Powered by Mézigue & Fils - 2018</p>
        </footer>

        <!-- ***********************************************début du lecteur JS********************************** -->

        <div class="info">

        </div>

        <div class="radio-app">
                <div class="left-panel">
                        <div>
                                <img src="https://www.gsiamidis.com/projects/thewebradio/station-playing.svg" width="30px" height="auto" alt="Playing">
                        </div>
                        <div class="songs-titles">
                                <p class="highlighted">NOW PLAYING</p>
                                <p id="nowPlaying">...</p>
                        </div>
                </div>
                <div class="middle-panel">
                        <div class="volume-icon"><img src="images/icone_volume.png" alt=""></div>
                        <input type="range" id="radioVolume" min="0" max="1" step="0.01" value="0.5">
                </div>

                <!-- <i class="fas fa-volume-up"> </i>-->

                <div class="right-panel">
                        <div>
                                <p class="highlighted">Cliquer</p>
                                <p>Pour Ecouter</p>
                        </div>
                        <div class="select-station">
                                <div id="stationLoading">
                                        <div>Connecting</div>
                                        <div><img src="https://www.thewebradio.gr/wp-content/themes/child/assets/station-loading.svg" width="30px" height="auto" alt="Γίνεται Σύνδεση"></div>
                                </div>
                                <ul id="selectStation">
                                        <li id="authentiko" class="playing-station"><img src="images/disk2.png" width="70px" height="70px" alt="Σταθμός: Αυθεντικό"></li>
                                        <!-- <li id="greeks"><img src="https://www.thewebradio.gr/wp-content/themes/child/assets/greeks-station.png" width="70px" height="70px" alt="Σταθμός: Γκρικς"></li> -->
                                        <!-- <li id="fresh"><img src="https://www.thewebradio.gr/wp-content/themes/child/assets/fresh-station.png" width="70px" height="70px" alt="Σταθμός: Fresh"></li> -->
                                        <!-- <li id="coffee"><img src="https://www.thewebradio.gr/wp-content/themes/child/assets/coffee-station.png" width="70px" height="70px" alt="Σταθμός: Coffee"></li> -->
                                </ul>
                        </div>
                </div>
        </div>

        <!-- *******************************************fin du lecteur JS********************************************* -->

        <!-- bibliotheque necessaire pour le player -->

        <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js'></script>
        <script src='https://cdnjs.cloudflare.com/ajax/libs/howler/2.0.15/howler.min.js'></script>

        <!-- link pour le lecteur mp3 JS -->
        <script src="lecteurJs/lecteur-accueil.js"></script>

</body>

</html>