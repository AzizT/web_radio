
<?php
    require_once("../include/header.php");
    require_once("../include/init.php");
    extract($_POST);

    extract($_GET);

    // si l'internaute n'est pas connecté et n'est pas ADMIN, il n'a rien à faire ici, on le redirige vers la page connexion.php
    if (!internauteEstConnecteEstAdmin()) {

        header("Location:" . URL . "connexion_membre.php");
    }

    // ---------------SUPPRESSION D' ALBUM'-----------------------

if (isset($_GET['action']) && $_GET['action'] == 'suppression') {

    $album_delete = $bdd->prepare("DELETE FROM album WHERE id = :id");

    $album_delete->bindValue(':id', $id, PDO::PARAM_STR);

    $album_delete->execute();

    $_GET['action'] = 'affichage'; // on redirige vers l'affichage des produits

    $validate .= "<div class='alert-success col-md-6 offset-md-3 text-center'>l' album n° <strong>$id</strong>a bien été supprimé !</div>";
}






    ?>

    <!-- LIEN albums -->

<ul class="col-md-4 offset-md-4 list-group mt-4 text-center">

<li class="list-group-item bg-dark text-center text-white">BACK OFFICE</li>

<li class="list-group-item"><a href="?action=affichage" class="alert-link text-dark">AFFICHAGE ALBUMS</a></li>

<li class="list-group-item"><a href="?action=ajout" class="alert-link text-dark">AJOUT ALBUM</a></li>



</ul>

<!-- FIN LIENS albums -->

<!-- affichage albums -->

<?php if (isset($_GET['action']) && $_GET['action'] == 'affichage') : ?>

    <h1 class="display-4 text-center"> Liste des albums</h1>

    <?= $validate ?>

    <?php $resultat = $bdd->query("SELECT * FROM album"); ?>

    <?php $albums = $resultat->fetchAll(PDO::FETCH_ASSOC); ?>



    <table class="table table-bordered col-md-10 mx-auto bg-light text-center administration">
        <tr>

            <?php foreach ($albums[0] as $key => $value) : ?>

                <th> <?= strtoupper($key) ?></th>

            <?php endforeach; ?>

            <th>MODIFIER</th>

            <th>SUPPRIMER</th>

        </tr>

        <?php foreach ($albums as $key => $tab) : ?>

            <tr>

                <?php foreach ($tab as $key2 => $value) : ?>

                    <?php if ($key2 != 'photo') : ?>

                        <td><?= $value ?></td>

                    <?php else : ?>

                        <td><img src="<?= $value ?>" alt="" class="card-img-top"></td>

                    <?php endif; ?>

                <?php endforeach; ?>

                <td><a href="?action=modification&id=<?= $tab['id'] ?>" class="text-dark"><i class="fas fa-edit"></i></a></td>

                <td><a href="?action=suppression&id=<?= $tab['id'] ?>" class="text-danger" onclick="return(confirm('En êtes vous certain ?'))"><i class="fas fa-trash-alt"></i></a></td>



            </tr>

        <?php endforeach; ?>

    </table>



<?php endif; ?>



<!-- FIN AFFICHAGE albums -->

<?php if (isset($_GET['action']) && ($_GET['action'] == 'ajout' || $_GET['action'] == 'modification')) : ?>



    <h1 class="col-md-6 offset-md-4 text-center"> <?= $action ?> d'un album</h1>

    <?php

    if (isset($_GET['id'])) {

            $resultat = $bdd->prepare("SELECT * FROM album WHERE  id = :id");

            $resultat->bindValue(':id', $id, PDO::PARAM_INT);

            $resultat->execute();

            $album_actuel = $resultat->fetch(PDO::FETCH_ASSOC);

        }

    $name = (isset($album_actuel['name'])) ? $album_actuel['name'] : '';

    $annee = (isset($album_actuel['annee'])) ? $album_actuel['annee'] : '';

    $interprete = (isset($album_actuel['interprete'])) ? $album_actuel['interprete'] : '';

    $photo = (isset($album_actuel['photo'])) ? $album_actuel['photo'] : '';

    $genre1 = (isset($album_actuel['genre1'])) ? $album_actuel['genre1'] : '';

    $genre2 = (isset($album_actuel['genre2'])) ? $album_actuel['genre2'] : '';

    $musicien1 = (isset($album_actuel['musicien1'])) ? $album_actuel['musicien1'] : '';

    $musicien2 = (isset($album_actuel['musicien2'])) ? $album_actuel['musicien2'] : '';

    $musicien3 = (isset($album_actuel['musicien3'])) ? $album_actuel['musicien3'] : '';

    $musicien4 = (isset($album_actuel['musicien4'])) ? $album_actuel['musicien4'] : '';

    $musicien5 = (isset($album_actuel['musicien5'])) ? $album_actuel['musicien5'] : '';

    $musicien6 = (isset($album_actuel['musicien6'])) ? $album_actuel['musicien6'] : '';



    ?>

    <!-- 

        1.Réaliser un formulaire permettant d'inserer un produit dans la table 'produit(sauf le champs: id_produit'

     -->



    <form class="col-md-6 offset-md-4 formulaire" method="post" action="" enctype="multipart/form-data">

        <!-- enctype: obligatoire en PHP pour recolter les informations d'1 fichier uploadé -->


        <div class="row">

            <div class="form-group col-md-6">

                <label for="name">Nom</label>

                <input type="text" class="form-control" id="reference" placeholder="..." name="name" value="<?= $name ?>">



            </div>

            <div class="form-group col-md-6">

                <label for="annee">Année</label>

                <input type="text" class="form-control" id="annee" aria-describedby="" placeholder="..." name="annee" value="<?= $annee ?>">

            </div>
    
        </div>

        <div class="row">

            <div class="form-group col-md-6">

                <label for="interprete">Interprete</label>

                <input type="text" class="form-control" id="interprete" aria-describedby="" placeholder="..." name="interprete" value="<?= $interprete ?>">



            </div>

            <div class="form-group col-md-6">

                <label for="photo">Photo</label>

                <input type="file" class="form-control" id="photo" aria-describedby="" placeholder="" name="photo">

            </div>

            <?php if (!empty($photo)) : ?>

                <em>Vous pouvez uploader une nouvelle photo si vous souhaitez la changer</em><br>

                <img src="<?= $photo ?>" alt="<? $titre ?>" class="card-img-top">

            <?php endif; ?>

            <input type="hidden" id="photo_actuelle" name="photo_actuelle" value="<?= $photo ?>">

        </div>



        <div class="row">

            <div class="form-group col-md-6">

                <label for="genre1">Genre 1</label>

                <input type="text" class="form-control" id="genre1" aria-describedby="" placeholder="..." name="genre1" value="<?= $genre1 ?>">

            </div>





            <div class="form-group col-md-6">

                <label for="genre2">Genre 2</label>

                <input type="text" class="form-control" id="genre2" aria-describedby="" placeholder="..." name="genre2" value="<?= $genre2 ?>">

            </div>

        </div>

        <div class="row">

            <div class="form-group col-md-6">

                <label for="musicien1">Musicien 1</label>

                <input type="text" class="form-control" id="musicien1" aria-describedby="" placeholder="..." name="musicien1" value="<?= $musicien1 ?>">

            </div>





            <div class="form-group col-md-6">

                <label for="musicien2">Musicien 2</label>

                <input type="text" class="form-control" id="musicien2" aria-describedby="" placeholder="..." name="musicien2" value="<?= $musicien2 ?>">

            </div>

        </div>

        <div class="row">

            <div class="form-group col-md-6">

                <label for="musicien3">Musicien 3</label>

                <input type="text" class="form-control" id="musicien3" aria-describedby="" placeholder="..." name="musicien3" value="<?= $musicien3 ?>">

            </div>





            <div class="form-group col-md-6">

                <label for="musicien4">Musicien 4</label>

                <input type="text" class="form-control" id="musicien4" aria-describedby="" placeholder="..." name="musicien4" value="<?= $musicien4 ?>">

            </div>

        </div>

        <div class="row">

            <div class="form-group col-md-6">

                <label for="musicien5">Musicien 5</label>

                <input type="text" class="form-control" id="musicien5" aria-describedby="" placeholder="..." name="musicien5" value="<?= $musicien5 ?>">

            </div>





            <div class="form-group col-md-6">

                <label for="musicien6">Musicien 6</label>

                <input type="text" class="form-control" id="musicien6" aria-describedby="" placeholder="..." name="musicien6" value="<?= $musicien6 ?>">

            </div>

        </div>

        <button type="submit" class="btn btn-dark col-md-4 offset-md-4 mt-4"><?= $action ?></button>

    </form <?php endif; ?>





    <?php
require_once("../include/footer.php");
?>