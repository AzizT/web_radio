<?php
require_once("../include/init.php");
require_once("../include/header.php");


$resultat = $bdd->prepare("SELECT * FROM tracks WHERE id_tracks = :id_tracks");
// $resultat = $bdd->prepare("SELECT nom, prenom, instrument1, instrument2 FROM musicien as m, tracks as t WHERE t.id_tracks = m.fk_track1" );
// SELECT nom, prenom, instrument1, instrument2 FROM musicien AS m INNER JOIN tracks AS t WHERE m.fk_track1 = t.id_tracks;
$resultat->bindValue(':id_tracks', $_GET['id_tracks'], PDO::PARAM_STR);
$resultat->execute();



?>


<!-- ***********************************************les éléments random qui doivent apparaitrent après selection d' un album********************************* -->

<?php while ($tracks = $resultat->fetch(PDO::FETCH_ASSOC)) : ?>

    <h1><?php echo $tracks['interprete']; ?></h1>

    <p class="year"><?php echo $tracks['annee']; ?></p>

    <p class="genre"><?php echo $tracks['genre1']; ?> - <?php echo $tracks['genre2']; ?></p>

    <!-- la section qui va accueillir le lecteur mp3 -->
    <section class="col-md-6 offset-3 lecteur_mp3">

        <!-- une row par titre -->
        <div class="row">

            <!-- première colonne pour le titre -->
            <div class="col-md-6 ml-4 pt-1 title_tracks">
                <span><?php echo $tracks['title']; ?></span>
            </div>

            <!-- deuxieme colonne pour le lecteur -->
            <div class="">
                <div id="sm2-container"></div>
                <div class="song ui360 exclude button-exclude inline-exclude"><a href=<?php echo $tracks['fichier'] ?>><span class="titre_album"><?php echo $tracks['album']; ?></span></a></div>
            </div>

            <!-- troisieme colonne pour link vers les lyrics -->
            <!-- <div class="col-md-1 title_tracks">
                                                <span>lyrics</span>
                                            </div> -->

        </div>
        <!-- fermeture de row -->

    </section>
    <!-- ******************************************fin du lecteur mp3***************************** -->

    <!-- la  section, qui va accueillir l' image de l' album random -->
    <section class="container col-md-12">

        <div class="col-md-5">

            <p class="personnel"><?php echo $musician1; ?></p>
            <p class="personnel"><?php echo $musician2; ?></p>
            <p class="personnel"><?php echo $musician3; ?></p>
            <p class="personnel"><?php echo $musician4; ?></p>
            <p class="personnel"><?php echo $musician5; ?></p>
            <p class="personnel"><?php echo $musician6; ?></p>

        </div>

        <div class="col-md-5 mt-3">

            <img src="<?php echo $tracks['photo']; ?>" alt="" class="image-random" />

        </div>

    </section>

    <!-- *******************************************fin de la section infos + image *********************************** -->

    <!-- **********************************************début de la zone commentaire, qui n' apparait que si l' utilisateur est connecté************************************ -->

    <?php if (internauteEstConnecte()) : ?>

        <section class="container-fluid commentaire">
            <div class="form-group">
                <label for="comment" class="offset-md-3"><?= $_SESSION['membre']['pseudo'] ?> , laissez un commentaire !</label>
                <textarea class="form-control col-md-6 mx-auto comment" id="comment" rows="1" placeholder="..."></textarea>
            </div>
        </section>

    <?php else : ?>

        <section class="container-fluid commentaire">
            <div class="form-group">
                <label for="comment" class="offset-md-3">Connectez vous pour laissez un commentaire !</label>
                <textarea class="form-control col-md-6 mx-auto comment" id="comment" rows="1" placeholder="..."></textarea>
            </div>
        </section>

    <?php endif; ?>
    <!-- **********************************************fin de la zone commentaire*************************************** -->




    <!-- **************************************************************************fin de l' album aléatoire*************************************************************************** -->


<?php endwhile; ?>
<?php
require_once("../include/footer.php");
?>