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

// **********************AJOUT/ MODIFICATION MEMBRE*******************************


if(isset($_GET['action']) && $_GET['action'] == 'ajout')
{
$membre_insert = $bdd->prepare("INSERT into membre(nom, prenom ,pseudo, email, mdp, statut) VALUES(:nom, :prenom , :pseudo, :email, :mdp, :statut)");

$_GET['action'] = 'affichage';

$validate .= "<div class='alert alert-success col-md-6 offset-md-3 text-center'>Le membre <strong>$nom</strong> a bien été ajouté !!</div>";

}else{
$membre_insert = $bdd->prepare("UPDATE membre SET nom = :nom, prenom = :prenom, pseudo = :pseudo, email = :email, mdp = :mdp, statut = :statut WHERE id = $id ");

$_GET['action'] = 'affichage';

$validate .= "<div class='alert alert-success col-md-6 offset-md-3 text-center'>Le membre n° <strong>$id</strong> a bien été modifié !!</div>";
}
foreach ($_POST as $key => $value) {

if ($key != 'photo_actuelle') {

$produit_insert->bindValue(":$key", $value, PDO::PARAM_STR);
}
}

$produit_insert->bindValue(":photo", $photo_bdd, PDO::PARAM_STR);

$produit_insert->execute();

?>
<!-- LIEN membres -->

<ul class="col-md-4 offset-md-4 list-group text-center mt-4 gestion_speciale">

    <li class="list-group-item mt-4 bg-dark text-white"><a href="gestion_globale.php">BACK OFFICE</a></li>

    <li class="list-group-item mt-4"><a href="?action=affichage" class="alert-link text-dark">AFFICHAGE MEMBRES</a></li>

    <li class="list-group-item mt-4"><a href="?action=ajout" class="alert-link text-dark">AJOUT MEMBRE</a></li>



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

                <td><a href="?action=modification&id=<?= $tab['id'] ?>" class="text-dark" onclick="return(confirm('En êtes vous certain ?'))"><i class="fas fa-edit"></i></a></td>

                <td><a href="?action=suppression&id=<?= $tab['id'] ?>" class="text-danger" onclick="return(confirm('En êtes vous certain ?'))"><i class="fas fa-trash-alt"></i></a></td>



            </tr>

        <?php endforeach; ?>

    </table>



<?php endif; ?>

<!-- fin affichage des membres -->

<?php if (isset($_GET['action']) && ($_GET['action'] == 'ajout' || $_GET['action'] == 'modification')) : ?>



    <h1 class="col-md-6 offset-md-4 text-center"> <?= $action ?> d'un membre</h1>

    <?php

    if (isset($_GET['id'])) {

        $resultat = $bdd->prepare("SELECT * FROM membre WHERE  id = :id");

        $resultat->bindValue(':id', $id, PDO::PARAM_INT);

        $resultat->execute();

        $membre_actuel = $resultat->fetch(PDO::FETCH_ASSOC);
    }

    $nom = (isset($membre_actuel['nom'])) ? $membre_actuel['nom'] : '';

    $prenom = (isset($membre_actuel['prenom'])) ? $membre_actuel['prenom'] : '';

    $username = (isset($membre_actuel['username'])) ? $membre_actuel['username'] : '';

    $email = (isset($membre_actuel['email'])) ? $membre_actuel['email'] : '';

    $password = (isset($membre_actuel['password'])) ? $membre_actuel['password'] : '';

    $statut = (isset($membre_actuel['statut'])) ? $membre_actuel['statut'] : '';
    ?>

    <form class="text-center" method="post" action="">

        <div class="row">

            <!-- le nom -->
            <div class="form-group col-md-2 offset-md-4">
                <label for="nom">Nom</label>
                <input type="text" class="form-control" id="nom" name="nom" placeholder="...">
            </div>

            <!-- le prenom -->
            <div class="form-group col-md-2">
                <label for="prenom">Prenom</label>
                <input type="text" class="form-control" id="prenom" name="prenom" placeholder="...">
            </div>

        </div>

        <!-- le pseudo -->

        <div class="form-group col-md-2 mx-auto">
            <label for="username">Pseudo</label>
            <input type="text" class="form-control" id="username" name="username" placeholder="...">
        </div>

        <!-- le mail -->
        <div class="form-group col-md-4 mx-auto">
            <label for="email">Mail</label>
            <input type="text" class="form-control" id="email" name="email" placeholder="...">
            <!-- pour le type, mettre un text au lieu de email, pour pouvoir faire une vérification php sur le navigateur -->
        </div>

        <div class="row">

            <!-- mdp -->
            <div class="form-group col-md-2 offset-md-4">
                <label for="password">Mot De Passe</label>
                <input type="text" class="form-control" id="password" name="password" placeholder="...">
            </div>

        </div>

        <div class="row">

            <!-- statut -->
            <div class="form-group col-md-2 offset-md-4">
                <label for="statut">Statut</label>
                <input type="text" class="form-control" id="statut" name="statut" placeholder="...">
            </div>

        </div>

        <!-- le bouton submit -->
        <button type="submit" class="btn btn-dark btn-sm submit mt-4"><?= $action ?></button>

    </form>




<?php endif; ?>
<?php
require_once("../include/footer.php");
?>