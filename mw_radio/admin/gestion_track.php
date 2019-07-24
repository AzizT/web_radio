<?php
require_once("../include/header2.php");
require_once("../include/init.php");
extract($_POST);

extract($_GET);

// si l'internaute n'est pas connecté et n'est pas ADMIN, il n'a rien à faire ici, on le redirige vers la page connexion.php
if (!internauteEstConnecteEstAdmin()) {

    header("Location:" . URL . "connexion_membre.php");
}

// ---------------SUPPRESSION DE Track'-----------------------

if (isset($_GET['action']) && $_GET['action'] == 'suppression') {

    $track_delete = $bdd->prepare("DELETE FROM track WHERE id = :id");

    $track_delete->bindValue(':id', $id, PDO::PARAM_STR);

    $track_delete->execute();

    $_GET['action'] = 'affichage';

    $validate .= "<div class='alert-success col-md-6 offset-md-3 text-center'>le track n° <strong>$id</strong>a bien été supprimé !</div>";
}

?>

<!-- LIEN Backs -->

<ul class="col-md-4 offset-md-4 list-group text-center mt-4 gestion_speciale">

    <li class="list-group-item bg-dark mt-4 text-white "><a href="gestion_globale.php">BACK OFFICE</a></li>

    <li class="list-group-item mt-4 "><a href="?action=affichage" class="alert-link text-dark">AFFICHAGE TRACKS</a></li>

    <li class="list-group-item mt-4 "><a href="?action=ajout" class="alert-link text-dark">AJOUT TRACK</a></li>



</ul>

<!-- FIN LIENS Back -->

<!-- affichage tracks -->

<?php if (isset($_GET['action']) && $_GET['action'] == 'affichage') : ?>

    <h1 class="display-4 text-center"> Liste des tracks</h1>

    <?= $validate ?>

    <?php $resultat = $bdd->query("SELECT * FROM track"); ?>

    <?php $tracks = $resultat->fetchAll(PDO::FETCH_ASSOC); ?>



    <table class="table table-bordered col-md-10 mx-auto bg-light text-center administration">
        <tr>

            <?php foreach ($tracks[0] as $key => $value) : ?>

                <th> <?= strtoupper($key) ?></th>

            <?php endforeach; ?>

            <th>MODIFIER</th>

            <th>SUPPRIMER</th>

        </tr>

        <?php foreach ($tracks as $key => $tab) : ?>

            <tr>

                <?php foreach ($tab as $key2 => $value) : ?>

                    <?php if ($key2 != 'mp3') : ?>

                        <td><?= $value ?></td>

                    <?php else : ?>

                        <td><audio src="../mp3/<?= $value ?>"></audio></td>

                    <?php endif; ?>

                <?php endforeach; ?>

                <td><a href="?action=modification&id=<?= $tab['id'] ?>" class="text-dark" onclick="return(confirm('En êtes vous certain ?'))"><i class="fas fa-edit"></i></a></td>

                <td><a href="?action=suppression&id=<?= $tab['id'] ?>" class="text-danger" onclick="return(confirm('En êtes vous certain ?'))"><i class="fas fa-trash-alt"></i></a></td>



            </tr>

        <?php endforeach; ?>

    </table>



<?php endif; ?>



<!-- FIN AFFICHAGE tracks -->

<?php if (isset($_GET['action']) && ($_GET['action'] == 'ajout' || $_GET['action'] == 'modification')) : ?>



    <h1 class="col-md-6 offset-md-4 text-center"> <?= $action ?> d'un track</h1>

    <?php

    if (isset($_GET['id'])) {

        $resultat = $bdd->prepare("SELECT * FROM track WHERE  id = :id");

        $resultat->bindValue(':id', $id, PDO::PARAM_INT);

        $resultat->execute();

        $track_actuel = $resultat->fetch(PDO::FETCH_ASSOC);
    }

    $title = (isset($track_actuel['title'])) ? $track_actuel['title'] : '';

    $idAlbum = (isset($track_actuel['idAlbum'])) ? $track_actuel['idAlbum'] : '';

    $mp3 = (isset($track_actuel['mp3'])) ? $track_actuel['mp3'] : '';

    $langue1 = (isset($track_actuel['langue1'])) ? $track_actuel['langue1'] : '';

    $langue2 = (isset($track_actuel['langue2'])) ? $track_actuel['langue2'] : '';

    ?>

    <!-- 

                    1.Réaliser un formulaire permettant d'inserer un produit dans la table 'produit(sauf le champs: id_produit'

                 -->



    <form class="col-md-6 offset-md-4 formulaire" method="post" action="" enctype="multipart/form-data">

        <!-- enctype: obligatoire en PHP pour recolter les informations d'1 fichier uploadé -->


        <div class="row">

            <div class="form-group col-md-6">

                <label for="title">Titre</label>

                <input type="text" class="form-control" id="title" placeholder="..." name="title" value="<?= $title ?>">



            </div>

            <div class="form-group col-md-6">

                <label for="idAlbum">Id Album (foreign key)</label>

                <input type="text" class="form-control" id="idAlbum" aria-describedby="" placeholder="..." name="idAlbum" value="<?= $idAlbum ?>">

            </div>

        </div>

        <div class="row">
            
            <div class="form-group col-md-6">

                <label for="mp3">MP3</label>

                <input type="file" class="form-control" id="mp3" aria-describedby="" placeholder="" name="mp3">

            </div>

            <?php if (!empty($mp3)) : ?>

                <em>Vous pouvez uploader un nouveau mp3 si vous souhaitez le changer</em><br>

                <audio src="<?= $mp3 ?>" alt="<? $titre ?>">

            <?php endif; ?>

            <input type="hidden" id="mp3_actuel" name="mp3_actuel" value="<?= $mp3 ?>">

        </div>



        <div class="row">

            <div class="form-group col-md-6">

                <label for="langue1">Langue 1</label>

                <input type="text" class="form-control" id="langue1" aria-describedby="" placeholder="..." name="langue1" value="<?= $langue1 ?>">

            </div>

            <div class="form-group col-md-6">

                <label for="langue2">Langue 2</label>

                <input type="text" class="form-control" id="langue2" aria-describedby="" placeholder="..." name="langue2" value="<?= $langue2 ?>">

            </div>

        </div>

        <button type="submit" class="btn btn-dark col-md-4 offset-md-4 mt-4"><?= $action ?></button>

    </form> <?php endif; ?>



<?php
require_once("../include/footer.php");?>
