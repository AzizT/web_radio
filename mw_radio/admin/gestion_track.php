<?php
    require_once("../include/header.php");
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

    <!-- LIEN PRODUITS -->

<ul class="col-md-4 offset-md-4 list-group mt-4 text-center">

<li class="list-group-item bg-dark text-center text-white">BACK OFFICE</li>

<li class="list-group-item"><a href="?action=affichage" class="alert-link text-dark">AFFICHAGE TRACKS</a></li>

<li class="list-group-item"><a href="?action=ajout" class="alert-link text-dark">AJOUT TRACK</a></li>



</ul>

<!-- FIN LIENS PRODUITS -->



    <?php
require_once("../include/footer.php");