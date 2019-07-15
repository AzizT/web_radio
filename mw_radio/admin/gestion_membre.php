<?php
require_once("../include/header2.php");
require_once("../include/init.php");
extract($_POST);

extract($_GET);

// si l'internaute n'est pas connecté et n'est pas ADMIN, il n'a rien à faire ici, on le redirige vers la page connexion.php
if (!internauteEstConnecteEstAdmin()) {

    header("Location:" . URL . "connexion_membre.php");
}

// ---------------SUPPRESSION DE Membre-----------------------

if (isset($_GET['action']) && $_GET['action'] == 'suppression') {

    $membre_delete = $bdd->prepare("DELETE FROM membre WHERE id = :id");

    $membre_delete->bindValue(':id', $id, PDO::PARAM_STR);

    $membre_delete->execute();

    $_GET['action'] = 'affichage';

    $validate .= "<div class='alert-success col-md-6 offset-md-3 text-center'>le membre n° <strong>$id</strong>a bien été supprimé !</div>";
}

?>

?>

<!-- LIEN membres -->

<ul class="col-md-4 offset-md-4 list-group mt-4 text-center">

    <li class="list-group-item bg-dark text-center text-white">BACK OFFICE</li>

    <li class="list-group-item"><a href="?action=affichage" class="alert-link text-dark">AFFICHAGE MEMBRES</a></li>

    <li class="list-group-item"><a href="?action=ajout" class="alert-link text-dark">AJOUT MEMBRE</a></li>



</ul>

<!-- FIN LIENS membres -->

<!-- affichage membres -->

<?php if (isset($_GET['action']) && $_GET['action'] == 'affichage') : ?>

    <h1 class="display-4 text-center"> Liste des membres</h1>

    <?= $validate ?>

    <?php $resultat = $bdd->query("SELECT * FROM membre"); ?>

    <?php $membres = $resultat->fetchAll(PDO::FETCH_ASSOC); ?>



    <table class="table table-bordered col-md-10 mx-auto bg-light text-center administration">
        <tr>

            <?php foreach ($membres[0] as $key => $value) : ?>

                <th> <?= strtoupper($key) ?></th>

            <?php endforeach; ?>

            <th>MODIFIER</th>

            <th>SUPPRIMER</th>

        </tr>

        <?php foreach ($membres as $key => $tab) : ?>

            <tr>

                <?php foreach ($tab as $key2 => $value) : ?>

                    <td><?= $value ?></td>

                <?php endforeach; ?>

                <td><a href="?action=modification&id=<?= $tab['id'] ?>" class="text-dark" onclick="return(confirm('En êtes vous certain ?'))"
                ><i class="fas fa-edit"></i></a></td>

                <td><a href="?action=suppression&id=<?= $tab['id'] ?>" class="text-danger" onclick="return(confirm('En êtes vous certain ?'))"><i class="fas fa-trash-alt"></i></a></td>



            </tr>

        <?php endforeach; ?>

    </table>



<?php endif; ?>





<?php
require_once("../include/footer.php");
