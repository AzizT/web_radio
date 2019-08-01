<?php
require_once("../include/init.php");
extract($_POST);

if (internauteEstConnecte())
// si' l 'utilisateur est déjà connecté, il n' a donc rien a faire n page connexion => on le redirige vers l' accueil, en attendant de créer un profil vers lequel le diriger éventuellement, ou autre ???
{
    header("Location: profil.php");
}

if ($_POST) {

    if (strlen($_POST['nom']) < 3 || strlen($_POST['nom']) > 21) {
        $error2 .= '<div class="col-md-6 offset-md-3 text-center alert alert-danger">Votre Nom doit etre compris entre 4 et 20 caractères</div>';
    }

    if (strlen($_POST['prenom']) < 3 || strlen($_POST['prenom']) > 21) {
        $error3 .= '<div class="col-md-6 offset-md-3 text-center alert alert-danger">Votre Prenom doit etre compris entre 4 et 20 caractères</div>';
    }
    if (strlen($_POST['pseudo']) < 3 || strlen($_POST['pseudo']) > 11) {
        $error4 .= '<div class="col-md-6 offset-md-3 text-center alert alert-danger">Votre Pseudo doit etre compris entre 4 et 10 caractères</div>';
    }
    if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
        $error5 .= '<div class="col-md-6 offset-md-3 text-center alert alert-danger">Vous devez inserer une adresse mail valide</div>';
    }
    if (strlen($_POST['mdp']) < 3 || strlen($_POST['mdp']) > 11) {
        $error6 .= '<div class="col-md-6 offset-md-3 text-center alert alert-danger">Votre Mot de Passe doit etre compris entre 3 et 10 caracteres</div>';
        // ou pour un pregmatch + élaboré
        // (preg_match('#^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W)#', $password))
    }




    // on vérifie que le pseudo choisi n' est pas déjà pris par un autre membre
    $verif_pseudo = $bdd->prepare("SELECT*FROM membre WHERE pseudo = :pseudo");
    $verif_pseudo->bindvalue(':pseudo', $pseudo, PDO::PARAM_STR);
    $verif_pseudo->execute();
    if ($verif_pseudo->rowCount() > 0)
    // si le résultat de la requete est supérieur a 0, cela veut dire qu' un pseudo est bien existant en bdd, alors on affiche le mssage d' erreur
    {
        $error .= '<div class="col-md-6 offset-md-3 text-center alert alert-danger">Le pseudo <strong>' . $pseudo . '</strong> est déjà pris. Merci d\' en saisir un autre</div>';
    }
    $verif_mdp = $bdd->prepare("SELECT*FROM membre WHERE pseudo = :pseudo");
    $verif_mdp->bindvalue(':pseudo', $pseudo, PDO::PARAM_STR);
    $verif_mdp->execute();


    // vérification que la seconde saisie du mdp est conforme a la première
    if ($mdp !== $confirm_mdp) {
        $error1 .= '<div class="col-md-6 offset-md-3 text-center alert alert-danger">Ce mot de passe doit etre identique au premier entré.</div>';
    }

    if (empty($error || $error1 || $error2 || $error3 || $error4 || $error5 || $error6)) {
        // si notre variable $error est vide (empty), c' est a dire qu' elle n' a stocké aucune valeur, donc aucune erreur, alors c' est que tout est ok
        echo '<div class="alert alert-success text-dark">Félicitations, votre formulaire est valide et par conséquent transmis</div>';
    }

    if (empty($error) && empty($error1) && empty($error2) && empty($error3) && empty($error4) && empty($error5) && empty($error6)) {

        $_POST['mdp'] = password_hash($_POST['mdp'], PASSWORD_DEFAULT);
        // on ne conserve jamais de mdp en clair dans la bdd. password_hash permet de créer une clé de hashage ( cryptage)

        $data_insert = $bdd->prepare("INSERT INTO membre (nom, prenom, pseudo, email, mdp) VALUES (:nom, :prenom, :pseudo, :email, :mdp)");
        foreach ($_POST as $key => $value) {
            // cette boucle va nous permettre d' éviter de taper toutes les lignes bindValue une a une
            if ($key != 'confirm_mdp') {
                $data_insert->bindValue(":$key", $value, PDO::PARAM_STR);
            }
        }
        $data_insert->execute();

        header("Location: connexion_membre.php?action=validate");
    }
}
require_once("../include/header.php");

?>

<h1>Inscription</h1>

<?= $error ?>

<form class="text-center" method="post" action="">

    <div class="row">

        <?= $error2 ?>

        <!-- le nom -->
        <div class="form-group col-md-2 offset-md-4">
            <label for="nom">Votre nom</label>
            <input type="text" class="form-control" id="nom" name="nom" placeholder="...">
        </div>

        <?= $error3 ?>

        <!-- le prenom -->
        <div class="form-group col-md-2">
            <label for="prenom">Votre prenom</label>
            <input type="text" class="form-control" id="prenom" name="prenom" placeholder="...">
        </div>

    </div>

    <?= $error4 ?>

    <!-- le pseudo -->

    <div class="form-group col-md-2 mx-auto">
        <label for="pseudo">Votre pseudo</label>
        <input type="text" class="form-control" id="pseudo" name="pseudo" placeholder="...">
    </div>

    <?= $error5 ?>

    <!-- le mail -->
    <div class="form-group col-md-4 mx-auto">
        <label for="email">Votre adresse mail</label>
        <input type="text" class="form-control" id="email" name="email" placeholder="...">
        <!-- pour le type, mettre un text au lieu de email, pour pouvoir faire une vérification php sur le navigateur -->
    </div>

    <div class="row">

        <?= $error6 ?>

        <!-- mdp -->
        <div class="form-group col-md-2 offset-md-4">
            <label for="mdp">Votre mot de passe</label>
            <input type="text" class="form-control" id="mdp" name="mdp" placeholder="...">
        </div>

        <?= $error1 ?>

        <!-- confirmation mdp -->
        <div class="form-group col-md-2">
            <label for="confirm_mdp">Confirmez mot de passe</label>
            <input type="text" class="form-control" id="confirm_mdp" name="confirm_mdp" placeholder="...">
        </div>

    </div>

    <!-- le bouton submit -->
    <button type="submit" class="btn btn-dark btn-sm submit mt-4">Validez votre inscription</button>

</form>

<?php
require_once("../include/footer.php");
?>