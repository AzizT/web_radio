<?php
require_once("../include/init.php");
require_once("../include/header.php");






$resultat = $bdd->prepare("SELECT * FROM album as m, track as t WHERE m.id = t.idAlbum AND m.id= :id ");
// $resultat = $bdd->prepare("SELECT * FROM tracks WHERE id_tracks = :id_tracks");
$resultat->bindValue(':id', $_GET['id'], PDO::PARAM_STR);
$resultat->execute();
$album = $resultat->fetch(PDO::FETCH_ASSOC);



$resultat = $bdd->prepare("SELECT * FROM album as a, track as t WHERE a.id = t.idAlbum AND a.id= :id ");
// $resultat = $bdd->prepare("SELECT * FROM tracks WHERE id_tracks = :id_tracks");
$resultat->bindValue(':id', $_GET['id'], PDO::PARAM_STR);
$resultat->execute();


?>


<!-- ***********************************************les éléments random qui doivent apparaitrent après selection d' un album********************************* -->

<h1><?php echo $album['interprete']; ?></h1>

<p class="year"><?php echo $album['annee']; ?></p>

<p class="genre"><?php echo $album['genre1']; ?><?php echo $album['genre2']; ?></p>






<!-- la  section, qui va accueillir l' image de l' album random -->
<section class="container col-md-12">

    <div class="col-md-5">

        <p class="personnel"><?php echo $album['musicien1'] ?></p>
        <p class="personnel"><?php echo $album['musicien2'] ?></p>
        <p class="personnel"><?php echo $album['musicien3'] ?></p>
        <p class="personnel"><?php echo $album['musicien4'] ?></p>
        <p class="personnel"><?php echo $album['musicien5'] ?></p>
        <p class="personnel"><?php echo $album['musicien6'] ?></p>

    </div>

    <div class="col-md-5 mt-3">

        <img src="../img_lp/<?php echo $album['photo']; ?>" alt="" class="image-random" />
        <!--  <img src="<?= URL ?>dossier_photo/<?php echo $album['photo']; ?>" alt="" class="image-random" /> -->
    </div>

</section>

<!-- *******************************************fin de la section infos + image *********************************** -->
<?php while ($tracks = $resultat->fetch(PDO::FETCH_ASSOC)) : ?>

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
                <div class="song ui360 exclude button-exclude inline-exclude"><a href="../mp3/<?php echo $tracks['mp3'] ?>"><span class="titre_album"><?php echo $tracks['name']; ?></span></a></div>
            </div>

            <!-- troisieme colonne pour link vers les lyrics -->
            <!-- <div class="col-md-1 title_tracks">
                                                                                <span>lyrics</span>
                                                                            </div> -->

        </div>
        <!-- fermeture de row -->

    </section>
    <!-- ******************************************fin du lecteur mp3***************************** -->

<?php endwhile; ?>

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











<?php
require_once("../include/footer.php");
?>