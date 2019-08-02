<?php
require_once("../include/init.php");

extract($_POST);


if (isset($_GET['action']) && $_GET['action'] == 'deconnexion')
// si l' indice [action] est définit dans l' url, et qu' il a comme valeur 'deconnexion', cela veut dire que l' on a cliqué sur deconnexion et du coup on supprime le fichier session
{
    unset($_SESSION);
    session_destroy();
    header('location:../index.php');
}


if (internauteEstConnecte())
// si' l 'utilisateur est déjà connecté, il n' a donc rien a faire n page connexion => on le redirige vers son profil
{
    header("location:profil.php");
}


if (isset($_GET['action']) && $_GET['action'] == 'validate') {
    $validate .= '<div class="col-md-6 offset-md-3 alert alert-success text-dark">Félicitations, vous etes inscrits sur le site. Vous pouvez dès a présent vous connecter</div>';
}

if ($_POST) {
    // on selectionne tout dans la table membre, a condition que la colonne pseudo/email ou similaire a celle saisie dans le formulaire

    $verif_pseudo_email = $bdd->prepare("SELECT*FROM membre WHERE pseudo = :pseudo || email = :email");
    $verif_pseudo_email->bindValue(':pseudo', $email_pseudo, PDO::PARAM_STR);
    $verif_pseudo_email->bindValue(':email', $email_pseudo, PDO::PARAM_STR);
    $verif_pseudo_email->execute();

    if ($verif_pseudo_email->rowCount() > 0) {
        // si le resultat de la requete de selection est supérieur a 0, cela veut dire que l'utilisateur a bien saisi son mail ou pseudo => on entre donc dans le if

        $membre = $verif_pseudo_email->fetch(PDO::FETCH_ASSOC);
        // on récupere les données de l' internaute, dans la bdd, une fois que son mail oupseudo soient validés, pour vérifier son mdp
        echo '<pre>';
        print_r($membre);
        echo '</pre>';
        // on crée donc un nouvel if else

        // if(password_verify($password, $membre['mdp']))
        // si on hash le mdp, nous aurons besoin de password_verify car il permet de comparer une clé de hashage a un string


        // on entre dans ce ifi seulement si l' utilisateur a entré les bonnes données ( email, pseudo, mdp)
        if ($membre['mdp'] == $password) {
            foreach ($membre as $key => $value) {
                if ($key != 'mdp')
                // on ejecte le mdp de la liste de vérif car c' est une donnée sensible
                {
                    $_SESSION['membre'][$key] = $value;
                    // pour chaque tour de boucle foreach, j' enregistre les données de l' utilisateur dans son fichier session
                }
            }
            // echo '<pre>'; print_r($_SESSION);  echo '</pre>';
            header("Location: profil.php");
            // après vérif de sa bonne connexion, on le redirige vers son profil (usage de header, comme precedemment dans inscription)
        } else {
            $error .= '<div class="col-md-6 offset-md-3 text-center alert alert-danger">Mot de passe erroné</div>';
        }

        echo 'pseudo / email valide';
    } else {
        // on entre dans le else si l' utilisateur a saisi un email ou pseudo erroné
        $error .= '<div class="col-md-6 offset-md-3 text-center alert alert-danger"> Le pseudo ou email : <strong>' . $email_pseudo . '</strong> est inconnu dans la base de données !!</div>';
    }
}
require_once("../include/header.php");
?>

<h1>Connexion</h1>

<?= $validate ?>
<?= $error ?>

<form class="text-center" method="post" action="">

    <div class="form-group col-md-4 mx-auto">
        <label for="email_pseudo">Email ou Pseudo</label>
        <input type="text" class="form-control" id="email_pseudo" name="email_pseudo" placeholder="Votre email ou votre pseudo">
    </div>

    <!-- mdp -->
    <div class="form-group col-md-2 mx-auto">
        <label for="mdp">Votre mot de passe</label>
        <input type="text" class="form-control" id="password" name="password" placeholder="Votre mdp">
    </div>

    <!-- le bouton submit -->
    <button type="submit" class="btn btn-dark btn-sm col-md-1 submit mt-4">Validez</button>

</form>

<?php
require_once("../include/footer.php");
?>