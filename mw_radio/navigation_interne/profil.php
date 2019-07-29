
<?php
    require_once("../include/header.php");
    require_once("../include/init.php");
    extract($_POST);

    if(!internauteEstConnecte())
    // si l' internaute n' est pas connecté, il ne peut acceder a la page profil, et est redirigé vers connexion.php
    {
        header("Location: connexion_membre.php");
    }
    
    ?>
    
    <h1 class="display-4 text-center">Bonjour, <?= $_SESSION['membre']['pseudo'] ?></h1>
    <hr>
    
    <!-- realiser page profil avec toutes les données affichées dans le array, sauf id_membre et statut -->
    
    <table class="col-md-6 mx-auto table table-dark">
        <?php foreach($_SESSION['membre'] as $key => $value): ?>
        <tr>
    
        <?php if($key != 'id' && $key != 'statut'): ?>
    
        <th><?= $key ?></th><td><?= $value ?></td>
        
    <?php endif; ?>
        </tr>
    <?php endforeach; ?>
    
    <!-- les ':', endif et endforeach remplacent les accolades -->
    
    </table>
    
    <?php
    if($_SESSION['membre']['statut'] == 1)
        $statut = 'ADMIN';
    else
        $statut = 'MEMBRE';
    // pas besoin d' accolades pour ce if else car une seule condition dans le if
    ?>

    ?>



    <?php
require_once("../include/footer.php");
?>