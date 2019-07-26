<?php
require_once("include/init.php");
?>

<!DOCTYPE HTML>
<html lang="fr">

<head>
        <title>Accueil Mad Wax Radio</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">

        <!-- link bootstrap -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

        <!-- link fontawesome -->
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css" integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous">

        <!-- link googlefonts -->
        <!-- <link href="https://fonts.googleapis.com/css?family=Satisfy" rel="stylesheet"> -->

        <!-- le css, particulier pour la page d' accueil. La navigation interne possede un autre css -->
        <link href="css/style_accueil.css" rel="stylesheet" />
</head>

<body>


        <section class="container-fluid">

                <?php
                $resultat = $bdd->prepare("SELECT * FROM track as t, album as a WHERE a.id = t.idAlbum ORDER BY RAND()");
                $resultat->execute();
                $tracks = $resultat->fetch(PDO::FETCH_ASSOC);
                ?>

                <!-- la section qui va accueillir le lecteur mp3 -->
                <section class="lecteur_mp3">

                        <!-- une row par titre -->
                        <div class="row col-md-12 ">

                                <!-- première colonne pour le titre -->
                                <div class="col-md-6 pt-3">
                                        <span><?php echo $tracks['interprete']; ?>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $tracks['title']; ?></span>
                                </div>

                                <!-- deuxieme colonne pour le lecteur -->
                                <div class="">
                                        <div id="sm2-container"></div>
                                        <div class="song ui360 exclude button-exclude inline-exclude"><a href="mp3/<?php echo $tracks['mp3'] ?>"><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $tracks['name']; ?> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- <?php echo $tracks['annee']; ?></span></a></div>
                                </div>


                        </div>
                        <!-- fermeture de row -->

                </section>
                <!-- ******************************************fin du lecteur mp3***************************** -->



                </div>

        </section>

        <div id="container">

                <header>



                        <div class="row">

                                <img src="images/logo_bandeau.png" alt="bandeau mw radio" class="responsive_logo" />

                        </div>

                        <!-- début de ma navbar, insérée dans une row -->

                        <div class="row">

                                <nav class="navbar navbar-expand-lg col-md-12 navbar-dark bg-transparent">

                                        <a class="navbar-brand" href="#"></a>
                                        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                                <span class="navbar-toggler-icon"></span>
                                        </button>

                                        <div class="collapse navbar-collapse" id="navbarSupportedContent">

                                                <ul class="navbar-nav mr-auto">

                                                        <?php if (internauteEstConnecte()) : ?>

                                                                <!-- je donne les autorisations a l' utilisateur connecté, et je lui retire le reste
                                                                                                                ici, je lui donne l' autorisation pour profil + se deconnecter , en plus de la biblioteheque tracks-->

                                                                <!-- d' abord les onglets tracks classés par decennies -->

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_50_60.php"><button class="btn btn-sm btn-outline-success" type="button">50' 60' Tracks</button></a>
                                                                </li>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_70.php"><button class="btn btn-sm btn-outline-success" type="button">70' Tracks</button></a>
                                                                </li>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_80.php"><button class="btn btn-sm btn-outline-success" type="button">80' Tracks</button></a>
                                                                </li>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_90.php"><button class="btn btn-sm btn-outline-success" type="button">90' Tracks</button></a>
                                                                </li>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_00.php"><button class="btn btn-sm btn-outline-success" type="button">00' Tracks</button></a>
                                                                </li>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_10.php"><button class="btn btn-sm btn-outline-success" type="button">10' Tracks</button></a>
                                                                </li>

                                                                <!-- onglet déroulant pour les Web Radios -->

                                                                <li class="nav-item dropdown">

                                                                        <a class="nav-link <!--dropdown-toggle-->" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                                                <button class="btn btn-sm btn-outline-success" type="button">Web Radios <i class="fas fa-arrow-alt-circle-down"></i></button>
                                                                        </a>

                                                                        <div class="dropdown-menu text text-center" aria-labelledby="navbarDropdown">

                                                                                <a class="dropdown-item" href="http://www.nova.fr/radionova/nova-la-nuit" target="_blank"><button class="btn btn-sm" type="button">Nova La Nuit</button></a>

                                                                                <a class="dropdown-item" href="http://player.radiomeuh.com/" target="_blank"><button class="btn btn-sm" type="button">Radio Meuh</button></a>

                                                                                <a class="dropdown-item" href="http://www.djamradio.com/?lang=fr" target="_blank"><button class="btn btn-sm" type="button">Djam Radio</button></a>

                                                                                <a class="dropdown-item" href="http://www.sing-sing-bis.org/results.php?kbps=Infinity" target="_blank"><button class="btn btn-sm" type="button">Sing Sing</button></a>

                                                                                <a class="dropdown-item" href="http://www.tsfjazz.com/accueil.php" target="_blank"><button class="btn btn-sm" type="button">TSF Jazz</button></a>

                                                                        </div>
                                                                </li>

                                                                <!-- les onglets fonctionnalités pour l' utilisateur connecté -->

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/profil.php"><button class="btn btn-sm btn-outline-success" type="button"><i class="fas fa-music"></i> <strong><?= $_SESSION['membre']['username'] ?></strong></button></a>
                                                                </li>
                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="<?= URL ?>navigation_interne/connexion_membre.php?action=deconnexion"><button class="btn btn-sm btn-outline-success" type="button"><i class="fas fa-power-off"></i> Deconnexion</button></a>
                                                                </li>

                                                                <!-- fin des onglets pour l' utilisateur connecté et début de ceux pour celui qui ne l' est pas encore -->

                                                        <?php else : ?>
                                                                <!-- les autorisations pour celui qui n' est pas connecté et je commence a nouveau avec les onglets tracks rangés par decennies -->

                                                                <li class="nav-item">

                                                                        <a class="nav-link" href="navigation_interne/Index_50_60.php"><button class="btn btn-sm btn-outline-success" type="button">50' 60' Tracks</button></a>
                                                                </li>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_70.php"><button class="btn btn-sm btn-outline-success" type="button">70' Tracks</button></a>
                                                                </li>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_80.php"><button class="btn btn-sm btn-outline-success" type="button">80' Tracks</button></a>
                                                                </li>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_90.php"><button class="btn btn-sm btn-outline-success" type="button">90' Tracks</button></a>
                                                                </li>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_00.php"><button class="btn btn-sm btn-outline-success" type="button">00' Tracks</button></a>
                                                                </li>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/Index_10.php"><button class="btn btn-sm btn-outline-success" type="button">10' Tracks</button></a>
                                                                </li>

                                                                <!-- puis le menu déroulant pour les web radios -->

                                                                <li class="nav-item dropdown">

                                                                        <a class="nav-link <!--dropdown-toggle-->" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                                                <button class="btn btn-sm btn-outline-success" type="button">Web Radios <i class="fas fa-arrow-alt-circle-down"></i></button>
                                                                        </a>

                                                                        <div class="dropdown-menu text text-center" aria-labelledby="navbarDropdown">

                                                                                <a class="dropdown-item" href="http://www.nova.fr/radionova/nova-la-nuit" target="_blank"><button class="btn btn-sm" type="button">Nova La Nuit</button></a>

                                                                                <a class="dropdown-item" href="http://player.radiomeuh.com/" target="_blank"><button class="btn btn-sm" type="button">Radio Meuh</button></a>

                                                                                <a class="dropdown-item" href="http://www.djamradio.com/?lang=fr" target="_blank"><button class="btn btn-sm" type="button">Djam Radio</button></a>

                                                                                <a class="dropdown-item" href="http://www.sing-sing-bis.org/results.php?kbps=Infinity" target="_blank"><button class="btn btn-sm" type="button">Sing Sing</button></a>

                                                                                <a class="dropdown-item" href="http://www.tsfjazz.com/accueil.php" target="_blank"><button class="btn btn-sm" type="button">TSF Jazz</button></a>

                                                                        </div>
                                                                </li>

                                                                <!-- et je termine avec les fonctionnalités pour s' inscrire ou se connecter -->

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/inscription_membre.php"><button class="btn btn-sm btn-outline-success" type="button"><i class="fas fa-sign-in-alt"></i> Inscription</button></a>
                                                                </li>
                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="navigation_interne/connexion_membre.php"><button class="btn btn-sm btn-outline-success" type="button"><i class="fas fa-power-off"></i> Connexion</button></a>
                                                                </li>

                                                        <?php endif; ?>

                                                        <!-- fin de la section qui concerne l' internaute non connecté et j' ajoute ci desssous un onglet supplémentaire, pour le connecté, avec statut d' administrateur
                                                        A nouveau un menu déroulant pour différents aspects de la bdd-->

                                                        <?php if (internauteEstConnecteEstAdmin()) : ?>

                                                                <li class="nav-item">
                                                                        <a class="nav-link" href="admin/gestion_globale.php"><button class="btn btn-sm btn-outline-success" type="button"><i class="fas fa-user-cog"></i> Administration</button></a>
                                                                </li>

                                                        <?php endif; ?>
                                                        <!-- fin du panneau administrateur -->

                                                </ul>


                                                <!-- la search bar ainsi que le bouton submit integrés dans ma nav-->
                                                <form class="form-inline my-2 my-lg-0 mr-3">
                                                        <input class="form-control mr-sm-2" type="search" placeholder="Search" title="Vous recherchez un album, un musicien, une année ?" aria-label="Search">
                                                        <button class="btn btn-outline-success my-2 my-sm-0" type="submit"><i class="fas fa-search"></i></button>
                                                </form>

                                        </div>

                                </nav>

                        </div>
                        <!-- fin de ma nav, et de la row par conséquent -->

                </header>

                <!-- l' image avec les différents musiciens =/ du background qui elle se loge directement dans le css -->
                <div class="row">

                        <img class="col-md-12 image_responsive" src="images/image_accueil.png" alt="image accueil mw radio" />

                </div>

                <!-- mon footer -->

                <footer id="piedPage">
                        <p>
                                "Information is not knowledge. Knowledge is not wisdom. Wisdom is not truth. Truth is not beauty. Beauty is not love. Love is not music. Music is THE BEST."-FZ.<br />
                                © Powered by Mézigue & Fils - 2018</p>
                </footer>

                <!-- fin du footer -->

        </div>


        <!-- librairie Bootstrap -->

        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

        <!-- *******************************************fin du lecteur JS********************************************* -->

        <!-- bibliotheque necessaire pour le player -->

        <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js'></script>
        <script src='https://cdnjs.cloudflare.com/ajax/libs/howler/2.0.15/howler.min.js'></script>


        <!-- link pour le lecteur mp3 JS -->
        <script src="lecteurJs/lecteur.js"></script>

</body>

</html>