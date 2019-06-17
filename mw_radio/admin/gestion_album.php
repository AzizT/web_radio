
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



    <table class="table table-bordered bg-light text-center mb-4">
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

    $reference = (isset($album_actuel['reference'])) ? $album_actuel['reference'] : '';

    $categorie = (isset($album_actuel['categorie'])) ? $album_actuel['categorie'] : '';

    $titre = (isset($album_actuel['titre'])) ? $album_actuel['titre'] : '';

    $description = (isset($album_actuel['description'])) ? $album_actuel['description'] : '';

    $couleur = (isset($album_actuel['couleur'])) ? $album_actuel['couleur'] : '';

    $public = (isset($album_actuel['public'])) ? $album_actuel['public'] : '';

    $prix = (isset($album_actuel['prix'])) ? $album_actuel['prix'] : '';

    $photo = (isset($album_actuel['photo'])) ? $album_actuel['photo'] : '';

    $taille = (isset($album_actuel['taille'])) ? $album_actuel['taille'] : '';

    $stock = (isset($album_actuel['stock'])) ? $album_actuel['stock'] : '';



    ?>

    <!-- 

        1.Réaliser un formulaire permettant d'inserer un produit dans la table 'produit(sauf le champs: id_produit'

     -->



    <form class="col-md-6 offset-md-4 formulaire" method="post" action="" enctype="multipart/form-data">

        <!-- enctype: obligatoire en PHP pour recolter les informations d'1 fichier uploadé -->



        <div class="form-group">

            <label for="reference">Référence</label>

            <input type="text" class="form-control" id="reference" placeholder="Enter reference" name="reference" value="<?= $reference ?>">



        </div>

        <div class="form-group">

            <label for="categorie">Catégorie</label>

            <input type="text" class="form-control" id="categorie" aria-describedby="" placeholder="Enter categorie" name="categorie" value="<?= $categorie ?>">

        </div>

        <div class="row">

            <div class="form-group col-md-6">

                <label for="titre">Titre</label>

                <input type="text" class="form-control" id="titre" aria-describedby="" placeholder="Enter titre" name="titre" value="<?= $titre ?>">



            </div>

            <div class="form-group col-md-6">

                <label for="description">Description</label>

                <input type="text" class="form-control" id="description" aria-describedby="" placeholder="enter description" name="description" value="<?= $description ?>">

            </div>

        </div>



        <div class="row">

            <div class="form-group col-md-6">

                <label for="couleur">Couleur</label>

                <input type="text" class="form-control" id="couleur" aria-describedby="" placeholder="couleur" name="couleur" value="<?= $couleur ?>">

            </div>





            <div class="form-group col-md-6">

                <label for="taille">Taille</label>

                <select class="form-control" id="taille" name="taille" value="">

                    <option>choose</option>

                    <option value="s" <?php if ($taille == 's') echo 'selected'; ?>>S</option>

                    <option value="m" <?php if ($taille == 'm') echo 'selected'; ?>>M</option>

                    <option value="l" <?php if ($taille == 'l') echo 'selected'; ?>>L</option>

                    <option value="xl" <?php if ($taille == 'xl') echo 'selected'; ?>>XL</option>



                </select>

            </div>

        </div>

        <div class="form-group">

            <label for="public">Public</label>

            <select class="form-control" id="public" name="public" value="">

                <option value="mixte" <?php if ($public == 'mixte') echo 'selected'; ?>>Mixte</option>

                <option value="f" <?php if ($public == 'f') echo 'selected'; ?>>Feminin</option>

                <option value="m" <?php if ($public == 'm') echo 'selected'; ?>>Masculin</option>

            </select>

        </div>



        <div class="row">

            <div class="form-group col-md-6">

                <label for="photo">Photo</label>

                <input type="file" class="form-control" id="photo" aria-describedby="" placeholder="" name="photo">

            </div>

            <?php if (!empty($photo)) : ?>

                <em>Vous pouvez uploader une nouvelle photo si vous souhaitez la changer</em><br>

                <img src="<?= $photo ?>" alt="<? $titre ?>" class="card-img-top">

            <?php endif; ?>

            <input type="hidden" id="photo_actuelle" name="photo_actuelle" value="<?= $photo ?>">



            <div class="form-group col-md-6">

                <label for="prix">Prix</label>

                <input type="text" class="form-control" id="prix" aria-describedby="" placeholder="Enter prix" name="prix" value="<?= $prix ?>">

            </div>

        </div>

        <div class="form-group">

            <label for="stock">Stock</label>

            <input type="text" class="form-control" id="stock" aria-describedby="" placeholder="Enter stock" name="stock" value="<?= $stock ?>">

        </div>

        <button type="submit" class="btn btn-danger col-md-4 offset-md-4"><?= $action ?></button>

    </form <?php endif; ?>





    <?php
require_once("../include/footer.php");
?>